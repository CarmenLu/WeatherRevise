/**
 * 缓存类，封装小程序storage接口，缓存已经读取过的缓存
 */
class Cache {
    get(symbolKey) {
        const key = symbolKey.toString()
        if (this[key]) {
            return this[key]
        }
        this[key] = wx.getStorageSync(key) || null
        return this[key]
    }

    set(symbolKey, value) {
        const key = symbolKey.toString()
        this[key] = value
        wx.setStorage({ key, data: value })
    }
}

// 存放Cache key 的map
const cacheKeyMap = {
    loginKey: Symbol('login_key')
}

let cache = new Cache()
export {
    cache,
    cacheKeyMap
}
