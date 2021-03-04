# easy-axios
基于 axios 的二次封装，方便程序员开发

## 功能

- 取消重复请求，可关闭
- 请求数据缓存，可关闭
- 因网络波动导致的请求失败而自动发请求，可关闭
- 封装调用方式统一的 `REQUEST/GET/POST/PUT/DELETE/FORMDATA` 方法，其中 `REQUEST` 为通用方法，其他都是调用 `REQUEST`
- 可自定义状态码以及对应的方法
- 提供请求前和响应后的处理方法 `beforeRequestHook, afterResponseHook`，其中 `afterResponseHook` 的第二个参数是区分响应成功和失败的
- `getStatusFormResult, getMassageFormResult, getDataFormResult` 获取 `response.data` 内的状态码、信息以及数据的，需要开发人员进行修改，默认：状态码：status，信息：msg，数据：data
- loading相关的操作 `stratLoading, endLoading` ，其中 `endLoading` 操作是在请求数为 0 时才会调用
- `validateStatus` 用于校验接口状态是否成功的，可根据相关状态码进行自定义判断规则

## 目录

```
目录结构：
|--easy-axios
	|--cache                    # 缓存相关
		|--ItemCache.js
		|--OperationCache.js
	|--constant                 # 常量文件夹
		|--statusMsg.js
	|--utils                    # 工具文件夹
		|--utils.js
	|--validator                # EasyAxios 参数验证器相关
		|--claim.js             
		|--validator.js
	|--api.js                   # 通用 api 接口管理文件
	|--easy-axios.js            # 核心文件
	|--easyAxiosInstance.js     # EasyAxios 实例配置文件
```

## 使用

只需要修改 `easyAxiosInstance.js` 和 `api.js` 文件就可以了，其他文件不建议修改 

### 修改相关配置
在 `easyAxiosInstance.js` 文件内

#### 添加 axios 的配置
```
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
```

#### 自定义 EasyAxios 全局配置信息
将 `easy-axios` 文件夹下载放置你的项目中，之后自定义配置信息

```
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
```

#### 自定义 EasyAxios 相关操作

```
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
```

### 封装常用接口

在 `api.js` 文件内引入` easyAxiosInstance.js` ，然后调用实例 `easyAxiosInstance` 的相关方法封装常用接口 
例如： 
```
// 管理员相关接口
const login     = (param) => easyAxiosInstance.POST('/login', param)
const adminList = (param) => easyAxiosInstance.GET('/admin', param)

export { 
    login,
    adminList,
}
```
可调用方法： 
* `easyAxiosInstance.REQUEST(method, url, param, config)`
* `easyAxiosInstance.GET(url, param, config)`
* `easyAxiosInstance.POST(url, param, config)`
* `easyAxiosInstance.PUT(url, param, config)`
* `easyAxiosInstance.DELETE(url, param, config)`
* `easyAxiosInstance.FORMDATA(url, param, config)`

`method` 为请求类型

`url` 为请求路径

`param` 为请求携带参数

`config` 为单独接口的配置对象，可以对某个接口设置 `headers` ， `timeout` ， `baseURL` 等

`config` 的 `easyAxiosConfig` 属性可以对某个接口设置 `disableHooks` ， `disableTips` ， `disableCache` ，`disableCancelDuplicate` ， `requestKey`

```
// 禁用全部 hooks
easyAxiosInstance.GET(url, param, { easyAxiosConfig: { disableHooks: true } })

// 禁用相关 hooks
easyAxiosInstance.GET(url, param, { easyAxiosConfig: { disableHooks: { request: true } } })
easyAxiosInstance.GET(url, param, { easyAxiosConfig: { disableHooks: { response: true } } })

// 禁用缓存
easyAxiosInstance.GET(url, param, { easyAxiosConfig: { disableCache: true } })

// 禁用取消重复请求
easyAxiosInstance.GET(url, param, { easyAxiosConfig: { disableCancelDuplicate: true } })

// 为某个请求设置 key 标识，用于查找该请求是否正在发送
easyAxiosInstance.GET(url, param, { easyAxiosConfig: { requestKey: 'string' } })
```

清除所有 PendingRequest
```
// 路由切换时可以取消之前所有正在发送的请求，在路由跳转前调用
easyAxiosInstance.clearPendingRequest()
```
