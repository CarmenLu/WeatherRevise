import regeneratorRuntime from './third-party/runtime' // eslint-disable-line
import { cache, cacheKeyMap } from './Cache'
import { throwError } from './utils'
import { wxGetUserInfo, wxLogin, wxRequest } from './wxApi'
import { api } from '../api'
const app = getApp()

/**
 * 微信登录，获取 code 和 encryptData
 */
const getWxLoginResult = async function (callback) {

    let loginResult = await wxLogin()
    let userResult = await wxGetUserInfo()
    return {
        code: loginResult.code,
        encryptedData: userResult.encryptedData,
        iv: userResult.iv,
        userInfo: userResult.userInfo,
    }
}

let login = async function (options) {

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
    let res = await wxRequest({
        url: api.mini_pro_login,
        header: header
    })

    let data = res.data

    if (data.code !== '0') {
        throwError(`小程序微信登录出现错误，错误码: ${data.code}`)
    }
    let loginKey = {
        skey: data.skey,
        skeyExpiresAt: data.skeyExpiresAt,
        refresh_key: data.refresh_key,
        refreshKeyExpiresAt: data.refreshKeyExpiresAt
    }
    cache.set(cacheKeyMap.loginKey, loginKey)
    console.log('小程序授权成功')

    // // 成功地响应会话信息
    // if (data && data[constants.WX_SESSION_MAGIC_ID]) {
    //     if (data.session) {
    //         data.session.userInfo = userInfo;
    //         Session.set(data.session);
    //         options.success(userInfo);
    //     } else {
    //         let errorMessage = '登录失败(' + data.error + ')：' + (data.message || '未知错误');
    //         let noSessionError = new LoginError(constants.ERR_LOGIN_SESSION_NOT_RECEIVED, errorMessage);
    //         options.fail(noSessionError);
    //     }
    //
    //     // 没有正确响应会话信息
    // } else {
    //     let errorMessage = '登录请求没有包含会话响应，请确保服务器处理 `' + options.loginUrl + '` 的时候正确使用了 SDK 输出登录结果';
    //     let noSessionError = new LoginError(constants.ERR_LOGIN_SESSION_NOT_RECEIVED, errorMessage);
    //     options.fail(noSessionError);
    // }
}

export { login }
