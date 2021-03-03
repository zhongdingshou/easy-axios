export default class ItemCache {
    constructor(data, timeOut) {
        // Promise 请求结果 data 数据
        this.data = data
        // 设定有效时间（时间戳），单位毫秒
        this.Deadline = (new Date()).getTime() + timeOut
    }
}