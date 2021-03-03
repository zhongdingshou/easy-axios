import ItemCache from './ItemCache'

export default class OperationCache {
    // 缓存池
    static cachePool =  new Map()
 
    // 数据是否过期
    static isOverTime(keyName) {
        const data = OperationCache.cachePool.get(keyName)
        // 没有数据
        if (!data) return true
        // 已过期
        if ((new Date()).getTime() > data.Deadline) {
            OperationCache.cachePool.delete(keyName)
            return true
        }
        // 不过期
        return false
    }
 
    // ItemCache 是否合法
    static has(keyName) {
        return !OperationCache.isOverTime(keyName)
    }
 
    // 删除 cachePool 中的 ItemCache
    static delete(keyName) {
        return OperationCache.cachePool.delete(keyName) 
    }
 
    // 获取
    static get(keyName) {
        // 如果 ItemCache 合法，返回 data 数据对象，否则返回 null
        return OperationCache.has(keyName) ? OperationCache.cachePool.get(keyName).data : null
    }
 
    // 默认存储20分钟
    static set(keyName, data, timeOut = (20 * 60 * 1000)) {
        // 放入缓存池中
        OperationCache.cachePool.set(keyName, new ItemCache(data, timeOut))
    }
}