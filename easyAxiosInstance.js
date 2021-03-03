import EasyAxios, { primevalAxios as axios } from './easy-axios.js'

// axios 的配置
const axiosConfig = {
    baseURL: '/api',
    timeout: 10000,
    responseType: 'json', 
    headers: { 
        'Content-Type': 'application/json;charset=utf-8',
        'X-Requested-With': 'XMLHttpRequest'
    },
}

// 暴露EasyAxios实例
export default new EasyAxios({
    // EasyAxios 全局配置信息
    easyAxiosConfig: {
        // 是否开启提示
        isOpenTips: true,

        // 是否开启取消重复请求
        isOpenCancelDuplicateRequest: true,

        // 是否开启请求缓存
        isOpenRequestCache: false,

        // 缓存时间，单位毫秒
        cacheEffectiveTime: 20 * 60 * 1000,

        // 网络超时连接失败后重连次数
        maxReconnectionTimes: 0,

        // 错误码（tttp的或者自定义的）和对应方法
        statusHandlers: {
            '401': (...param) => {},
            '403': (...param) => {},
        },
    },

    // 请求前的处理
    beforeRequestHook: (config) => {
        // 处理数据，或者添加token
        console.log('请求前的处理')
       
    },

    // 响应后的处理
    afterResponseHook: (result, isError) => {
        // isError 为 true 则响应失败，反之成功

        if (isError) console.log('响应失败后的处理')
        else console.log('响应成功后的处理')
    },

    // 提示信息的处理
    tipsFunction: (message) => {
        // 可以添加提示框
        console.log('提示信息的处理')
    },
    
    // 添加加载动画
    stratLoading: () => {
        console.log('loading...')
    },

    // 去掉加载动画
    endLoading: () => {
        console.log('End of loading.')
    },

    // 获取服务端返回状态码，默认属性名 status
    getStatusFormResult: (data) => data.status,

    // 获取服务端返回信息，默认属性名 msg
    getMassageFormResult: (data) => data.msg,

    // 获取服务端返回数据，默认属性名 data
    getDataFormResult: (data) => data.data,

    // 验证器，验证请求是否成功
    validateResultStatus: (status) => {
        return status === 0 || (status >= 200 && status < 300)
    }
  }, axiosConfig)
