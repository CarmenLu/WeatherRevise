// app.js
import regeneratorRuntime from './utils/third-party/runtime'
import { config } from './config' // eslint-disable-line
let Raven = require('./utils/third-party/raven')

App({
    onLaunch: async function () {
        // 展示本地存储能力
        let logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
        Raven.config('https://efa3290d01c24b46aa3d0adbae28cbf3@sentry.io/1385418', config.sentry).install()

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },
    globalData: {
        userInfo: null,
        oauthSession: {},   // 资源服务器session
        syllabusSession: {}, // 课程表业务后台session
    },

    onError(msg) {
        Raven.captureException(msg, {
            level: 'error'
        })
    }
})
