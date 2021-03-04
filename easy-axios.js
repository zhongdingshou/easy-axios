import axios from 'axios'
import merge from 'lodash/merge'
import { validator } from './validator/validator.js'
import { claim } from './validator/claim.js'
import { toRawType, dataToFormData } from './utils/utils.js'
import { statusMsg } from './constant/statusMsg.js'
import OperationCache from './cache/OperationCache.js'

// EasyAxios 默认的 axios 配置
const defaultAxiosConfig = {
    timeout: 10000,
    responseType: 'json',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'X-Requested-With': 'XMLHttpRequest'
    },
}

// 如果需要兼容旧的逻辑
export const primevalAxios = axios

export default class EasyAxios {
    constructor(options = {}, axiosConfig = {}) {
        // 验证 options 属性是否合法
        const result = validator(options, claim)
        if (result.illegal) {
            console.error(result.errorMsg)
            return new Error(result.errorMsg)
        }

        // 请求数
        this.requestCount = 0 

        // 正在发送中的请求
        this.PendingRequestMap = new Map()

        // 是否开启提示
        this.isOpenTips = toRawType.isBoolean(options.easyAxiosConfig.isOpenTips) ? options.easyAxiosConfig.isOpenTips : false
        
        // 是否开启取消重复请求
        this.isOpenCancelDuplicateRequest = toRawType.isBoolean(options.easyAxiosConfig.isOpenCancelDuplicateRequest) ? options.easyAxiosConfig.isOpenCancelDuplicateRequest : false
        
        // 是否开启缓存
        this.isOpenRequestCache = toRawType.isBoolean(options.easyAxiosConfig.isOpenRequestCache) ? options.easyAxiosConfig.isOpenRequestCache : false
        
        // 缓存时间
        this.cacheEffectiveTime = toRawType.isNumber(options.easyAxiosConfig.cacheEffectiveTime) && options.easyAxiosConfig.cacheEffectiveTime > 1000 * 60 * 5 ? options.easyAxiosConfig.cacheEffectiveTime : 0
        
        // 最大重连次数
        this.maxReconnectionTimes = toRawType.isNumber(options.easyAxiosConfig.maxReconnectionTimes) ? options.easyAxiosConfig.maxReconnectionTimes : 0
        
        // 状态码及操作函数的对象
        this.statusHandlers = toRawType.isObject(options.easyAxiosConfig.statusHandlers) ? options.easyAxiosConfig.statusHandlers : {}

        // 发送前和响应后的处理
        this.beforeRequestHook = toRawType.isFunction(options.beforeRequestHook) ? options.beforeRequestHook : () => {}
        this.afterResponseHook = toRawType.isFunction(options.afterResponseHook) ? options.afterResponseHook : () => {}
        
        // 提示信息处理方法
        this.tipsFunction = toRawType.isFunction(options.tipsFunction) ? options.tipsFunction : () => {}
        
        // loading 相关
        this.stratLoading = toRawType.isFunction(options.stratLoading) ? options.stratLoading : () => {}
        this.endLoading   = toRawType.isFunction(options.endLoading)   ? options.endLoading   : () => {}

        // 获取 response.data 对象里的相关属性（数据、信息码、信息）
        this.getDataFormResult    = toRawType.isFunction(options.getDataFormResult)    ? options.getDataFormResult    : () => null
        this.getStatusFormResult  = toRawType.isFunction(options.getStatusFormResult)  ? options.getStatusFormResult  : () => null
        this.getMassageFormResult = toRawType.isFunction(options.getMassageFormResult) ? options.getMassageFormResult : () => null

        // 请求是否成功的验证器
        this.validateResultStatus = toRawType.isFunction(options.validateResultStatus) ? options.validateResultStatus : (status) => status >= 200 && status < 300

        // 合并 axios 配置
        this.config = merge(defaultAxiosConfig, axiosConfig)

        // 创建 axios
        this.createAxios()

        // 加载拦截器
        this.interceptors()
    }

    // 创建
    createAxios() {
        this.easyAxios = axios.create(this.config)
    }

    // 拦截器
    interceptors() {
        // 请求拦截器
        this.easyAxios.interceptors.request.use(
            config => {
                // 请求数自增
                this.requestCount++

                // 调用加载动画方法
                this.stratLoading()

                // 赋值某一接口是否禁用 hook、tips、cache 的配置
                const { easyAxiosConfig: { disableHooks, disableTips, disableCache } = {} } = config

                // 是否开启请求缓存
                if (this.isOpenRequestCache && !disableCache) {
                    // 获取缓存
                    const cacheData = EasyAxios.getDataCache(config.method, config.url, config[['get','delete'].includes(config.method.toLocaleLowerCase()) ? 'params' : 'data'])
                    if (cacheData) { // 是否存在
                        return Promise.reject({isOpenRequestCache: true, data: cacheData})
                    }
                }

                // 移除 PendingRequest
                this.removePendingRequest(config)

                // 添加最新的 PendingRequest
                this.addPendingRequest(config)

                // 是否调用 beforeRequestHook
                if (!(disableHooks === true || (disableHooks && disableHooks.request))) {
                    try {
                        this.beforeRequestHook(config)
                    }
                    catch (error) {
                        // 调用提示方法
                        (this.isOpenTips && !disableTips) && this.tipsFunction(`beforeRequestHook 内部出现错误：${error.message}，请检查`)
                    }
                }

                return config
            },
            error => {
                // 请求发送失败
                (--this.requestCount === 0) && this.endLoading()

                return Promise.reject(error)
            }
        )

        // 响应拦截器
        this.easyAxios.interceptors.response.use(
            response => {
                // 去掉加载动画
                (--this.requestCount === 0) && this.endLoading()

                // 移除 PendingRequest
                this.removePendingRequest(response.config)

                // 赋值某一接口是否禁用 hook、tips、cache 的配置
                const { config: { easyAxiosConfig: { disableHooks, disableTips, disableCache } = {} } } = response

                // 是否调用 afterResponseHook
                if (!(disableHooks === true || (disableHooks && disableHooks.response))) {
                    try {
                        this.afterResponseHook(response, false)
                    }
                    catch (error) {
                        const message = `afterResponseHook 内部出现错误：${error.message}，请检查`
                        
                        // 调用提示方法
                        (this.isOpenTips && !disableTips) && this.tipsFunction(message)

                        return Promise.reject(message)
                    }
                }

                // 返回响应对象
                return new Promise((resolve, reject) => {
                    if (!response || !response.data) resolve(null)

                    const resultData = response.data
                    const status = this.getStatusFormResult(resultData) || response.status

                    if (!this.validateResultStatus(status)) {
                        const message = this.getMassageFormResult(resultData) || statusMsg[status]
                        
                        // 调用提示方法
                        (this.isOpenTips && !disableTips) && this.tipsFunction(message)

                        const statusHandler = this.statusHandlers[status]

                        toRawType.isFunction(statusHandler) && statusHandler()

                        reject(message)
                    }

                    // 获取服务端返回数据
                    const data = this.getDataFormResult(resultData)

                    // 设置缓存相关
                    this.isOpenRequestCache 
                    && !disableCache 
                    && EasyAxios.setDataCache(response.config.method, response.config.url, response.config[['get','delete'].includes(response.config.method.toLocaleLowerCase()) ? 'params' : 'data'], data)
          
                    resolve(data)
                })
            },
            error => {
                // 去掉加载动画
                (--this.requestCount === 0) && this.endLoading()

                // 是否取消重复请求
                if (axios.isCancel(error)) return Promise.reject(null)

                // 从缓存中来的，返回获取到的缓存
                if (toRawType.isBoolean(error.isOpenRequestCache) && error.isOpenRequestCache) return Promise.resolve(error.data)

                // 移除 PendingRequest
                this.removePendingRequest(error.config)

                // 赋值某一接口是否禁用 hook、tips、cache 的配置
                const { config: { easyAxiosConfig: { disableHooks, disableTips } = {} } } = error
                
                // 是否调用 afterResponseHook
                if (!(disableHooks === true || (disableHooks && disableHooks.response))) {
                    try {
                        this.afterResponseHook(error, true)
                    } 
                    catch (error) {
                        const message = `afterResponseHook 内部出现错误：${error.message}，请检查`

                        (this.isOpenTips && !disableTips) && this.tipsFunction(message)

                        return Promise.reject(message)
                    }
                }

                if (error.response // 仅对超时(无响应)请求进行重试
                || !error.config 
                || this.maxReconnectionTimes < 1 // 重连次数小于 1 ，则不需要重连
                || (error.config.times && error.config.times >= this.maxReconnectionTimes)
                ) {

                    let message = '连接到服务器失败'

                    if (error.response) { // 服务端响应
                        const { status } = error.response
    
                        message = statusMsg[status] || error.message
    
                        const statusHandler = this.statusHandlers[status]
                        
                        toRawType.isFunction(statusHandler) && statusHandler()

                    } else message = error.message
                   
                    // 调用提示方法
                    (this.isOpenTips && !disableTips) && this.tipsFunction(message)
    
                    // 向上抛出异常
                    return Promise.reject(message)
                }

                // 屏蔽重试请求的baseURL项
                error.config.baseURL = null

                // 设定已重试次数
                error.config.times = (error.config.times || 0) + 1

                // 重新发起请求
                return this.easyAxios(error.config)
            },
        )
    }

    // 通用
    REQUEST(method, url, param = {}, config = {}) {
        return new Promise((resolve, reject) => {
            this.easyAxios({
                method: method,
                url: url,
                [['get','delete'].includes(method.toLocaleLowerCase()) ? 'params' : 'data']: param,
                ...config
              })
            .then(response => resolve(response))
            .catch(error => error && reject(error)) // error 为 null 时为取消掉的重复请求返回的错误，不用提示
        })
    }
    
    // GET
    GET(url, param = {}, config = {}) {
        return this.REQUEST('get', url, param, config)
    }
    
    // POST
    POST(url, param = {}, config = {}) {
        return this.REQUEST('post', url, param, config)
    }
    
    // PUT
    PUT(url, param = {}, config = {}) {
        return this.REQUEST('put', url, param, config)
    }
    
    // DELETE
    DELETE(url, param = {}, config = {}) {
        return this.REQUEST('delete', url, param, config)
    }
    
    // FORMDATA
    FORMDATA(url, params, config = {}) {
        return this.REQUEST('post', url, dataToFormData(params), merge({
            headers: {
                'content-type': 'multipart/form-data;charset=UTF-8',
            },
        }, config))
    }

    // 添加正在请求的
    addPendingRequest(config) {
        if (!this.isOpenCancelDuplicateRequest) return

        // 赋值某一接口是否禁用取消重复请求和设置 requestKey 的配置
        const { easyAxiosConfig: { disableCancelDuplicate, requestKey } = {} } = config

        if (!disableCancelDuplicate) {

            const cncelDuplicateKey = toRawType.isUndefined(requestKey) ? [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&') : requestKey 

            config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
                if (cncelDuplicateKey && !this.PendingRequestMap.has(cncelDuplicateKey)) {
                    this.PendingRequestMap.set(cncelDuplicateKey, cancel)
                }
            })
        }
    }

    // 移除正在请求的
    removePendingRequest(config) {
        if (!this.isOpenCancelDuplicateRequest) return
        
        // 赋值某一接口是否禁用取消重复请求和设置 requestKey 的配置
        const { easyAxiosConfig: { disableCancelDuplicate, requestKey } = {} } = config

        if (!disableCancelDuplicate) {
            
            const cncelDuplicateKey = toRawType.isUndefined(requestKey) ? [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&') : requestKey 

            if (cncelDuplicateKey && this.PendingRequestMap.has(cncelDuplicateKey)) {
                const cancel = this.PendingRequestMap.get(cncelDuplicateKey)
                cancel(cncelDuplicateKey)
                this.PendingRequestMap.delete(cncelDuplicateKey)
            }
        }
    }

    // 路由切换，清除所有 PendingRequest ，在路由跳转前调用
    clearPendingRequest() {
        for (const [cncelDuplicateKey, cancel] of this.PendingRequestMap) cancel(cncelDuplicateKey)
        this.PendingRequestMap.clear()
    }

    // 根据url和params对象获取缓存
    static getDataCache(method, url, params) {
        // 生成 key
        const key = `${method}-${url}:${JSON.stringify(params)}`
        // 获得请求对象
        return OperationCache.get(key)
    }

    // 根据url和params对象设置缓存
    static setDataCache(method, url, params, data) {
        // 生成 key
        const key = `${method}-${url}:${JSON.stringify(params)}`
        // 设置
        OperationCache.set(key, data, this.cacheEffectiveTime)
    }
}