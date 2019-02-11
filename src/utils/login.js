import regeneratorRuntime from './third-party/runtime' // eslint-disable-line
import { cache, cacheKeyMap } from './Cache'
import { request, throwError } from './utils'
import { wxGetUserInfo, wxLogin } from './wxApi'
import { api } from '../api'

const app = getApp()

/**
 * 微信登录，获取 code 和 encryptData
 * @returns {Promise<{userInfo: wx.UserInfo | data.userInfo | {} | * | ((options?: {encoding: string}) => {username: string; uid: number; gid: number; shell: any; homedir: string}), code: *, encryptedData: string, iv: string | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer}>}
 */
const getWxLoginResult = async function () {

    let loginResult = await wxLogin()
    let userResult = await wxGetUserInfo()
    return {
        code: loginResult.code,
        encryptedData: userResult.encryptedData,
        iv: userResult.iv,
        userInfo: userResult.userInfo,
    }
}

/**
 * 微信小程序登录授权
 * @returns {Promise<void>}
 */
const miniLogin = async function () {

    let wxLoginResult = await getWxLoginResult()

    // 构造请求头，包含 code、encryptedData 和 iv
    let code = wxLoginResult.code
    let encryptedData = wxLoginResult.encryptedData
    let iv = wxLoginResult.iv
    let header = {}

    let { syllabusSessionKey, syllabusSessionValue } = app.globalData.syllabusSession
    header['cookie'] = `${syllabusSessionKey}=${syllabusSessionValue}`
    header['X-WX-Code'] = code
    header['X-WX-Encrypted-Data'] = encryptedData
    header['X-WX-IV'] = iv

    // TODO 需要换成统一请求函数
    // 请求服务器登录地址，获得会话信息
    let res = await request({
        url: api.mini_pro_login,
        method: 'GET',
        header: header,
        needLogin: false
    })

    let data = res.data

    if (data.code !== '0') {
        throwError(`小程序微信登录出现错误，错误码: ${data.code}`)
    }
    let loginState = {
        skey: data.skey,
        skeyExpiresAt: data.skeyExpiresAt,
        refresh_key: data.refresh_key,
        refreshKeyExpiresAt: data.refreshKeyExpiresAt
    }
    cache.set(cacheKeyMap.loginState, loginState)
    console.log('小程序授权成功')
}


export { miniLogin }
