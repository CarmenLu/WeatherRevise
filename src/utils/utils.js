/*
* create by candychuang on 2019/1/27
*/
import regeneratorRuntime from './third-party/runtime' // eslint-disable-line
import { wxRequest } from './wxApi'
import { cache, cacheKeyMap } from './Cache'
import { config } from '../config'
import { api, errCode } from '../api'

let Raven = require('./third-party/raven')

function throwError(msg) {
    let err = new Error(msg)
    // 删除本层函数的错误栈信息
    err.stack = err.stack.replace(/\n.*\n/, '\n')
    Raven.captureException(msg, {
        level: 'error'
    })
    throw err
}

const request = async function (options) {

    // 校验登录态
    async function _validateLoginState() {
        // 检查skey
        let loginState = cache.get(cacheKeyMap.loginState)
        if (!loginState) {
            console.warn('登录秘钥不存在，需要重新登录')
            return false
        }

        let { skey, skeyExpiresAt, refresh_key, refreshKeyExpiresAt } = loginState
        if (!skey || new Date(skeyExpiresAt) < new Date()) {
            console.warn('skey无效，检查refreshKey')
            if (!refresh_key || new Date(refreshKeyExpiresAt) < new Date()) {
                console.warn('refresh_key无效，需要重新登录')
                return false
            } else {
                // 刷新skey，重新请求，并更新登录态
                await _refreshLoginState(refresh_key)
            }
        }
        return true
    }

    async function _refreshLoginState(refresh_key) {
        console.log('_refreshLoginState')
        let res = await request({
            url: api.refresh_login_state,
            needLogin: false,
            header: { refresh_key }
        })
        if (res.data.code !== '0') {
            await logout()
            throwError(`刷新skey失败，错误码: ${res.data.code}`)
        }
        // 更新登录秘钥
        let loginState = {
            skey: res.data.skey,
            skeyExpiresAt: res.data.skeyExpiresAt,
            refresh_key: res.data.refresh_key,
            refreshKeyExpiresAt: res.data.refreshKeyExpiresAt
        }
        cache.set(cacheKeyMap.loginState, loginState)
        console.log('刷新登录态成功')
        return loginState
    }

    async function _req(_options) {

        // 请求附带的登录态
        if (_options.needLogin) {
            _options.header['skey'] = cache.get(cacheKeyMap.loginState).skey
        }
        _options.data['r_time'] = new Date().getTime()

        let res
        try {
            res = await wxRequest(_options)
        } catch (e) {
            throwError(`发送请求出错 ${e}`)
        }

        // 检验登录态是否有效
        if (_options.needLogin && (
            res.data.code === errCode.validateLoginState.no_skey ||
            res.data.code === errCode.validateLoginState.not_find_session ||
            res.data.code === errCode.validateLoginState.invalid_skey)
        ) {
            if (!hasRetry) {
                hasRetry = true
                // 登录态失效，刷新后重试
                await _refreshLoginState(cache.get(cacheKeyMap.loginState).refresh_key)
                beginTime = Date.now()
                res = await _req(_options)
            } else {
                // 刷新后重试失败，抛出异常
                await logout()
                throwError('登录态失效，刷新后重试仍失败')
            }
        }
        console.log(`url: ${_options.url} time: ${Date.now() - beginTime}ms`, res)
        return res
    }

    // 请求部分
    let hasRetry = false
    let _options = Object.assign({
        method: 'POST',
        showLoading: true,
        needLogin: true,
        data: {},
        header: {}
    }, options)

    // 请求附带的额外信息
    _options.data['from'] = 'mini-pro'
    _options.data['app_id'] = config.app_id
    _options.data['release'] = config.release
    let currentPage = getCurrentPages()
    _options.data['page'] = currentPage.length > 0 && currentPage[currentPage.length - 1] ? currentPage[currentPage.length - 1].route : 'no page'

    if (_options.needLogin) {
        let isLogin = await _validateLoginState()
        if (!isLogin) {
            // 登录态过期，注销
            await logout()
            return
        }
    } else {
        console.log('needLogin: false')
    }

    // 发起请求
    let beginTime = Date.now()
    const res = await _req(_options)
    return res
}

/**
 * 注销
 */
const logout = async function () {
    console.log('logout')
    cache.remove(cacheKeyMap.loginState)
}


export {
    request,
    throwError
}
