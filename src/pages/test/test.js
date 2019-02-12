// pages/test/test.js
import regeneratorRuntime from '../../utils/third-party/runtime' // eslint-disable-line
import { api } from '../../api'
import { throwError, request } from '../../utils/utils'
import { miniLogin } from '../../utils/login'

let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        account: '15cthuang',
        password: 'Candy123'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },

    bindInput(e) {
        console.log(e)
        this.setData({
            [e.currentTarget.dataset.key]: e.detail.value
        })
    },

    /**
     * 校园网登录方法
     */
    async login() {
        let account = this.data.account
        let password = this.data.password
        // TODO 迟点需要用包装好的请求方法
        let res
        try {
            res = await request({
                url: api.login,
                method: 'POST',
                needLogin: false,
                data: { account, password }
            })
        } catch (e) {
            console.error('请求错误，', e)
            return
        }
        let oauthSessionKey
        let oauthSessionValue
        try {
            [oauthSessionKey, oauthSessionValue] = res.header['set-cookie'].split(';')[0].split('=')
            console.log('login success')
        } catch (e) {
            throwError(`获取session失败: ${e}`)
        }
        // 存储资源服务器session
        app.globalData.oauthSession = { oauthSessionKey, oauthSessionValue }
    },

    /**
     * Oauth授权方法
     */
    async authorize() {
        let { oauthSessionKey, oauthSessionValue } = app.globalData.oauthSession
        if (!oauthSessionKey || !oauthSessionValue) {
            throwError('no oauthSession')
        }
        let res
        let syllabusSessionKey
        let syllabusSessionValue

        // Oauth授权
        try {
            res = await request({
                url: api.authorize,
                method: 'GET',
                header: { cookie: `${oauthSessionKey}=${oauthSessionValue}` },
                needLogin: false,
                data: {
                    response_type: 'code',
                    client_id: 'stu',
                    redirect_uri: api.stu_login,
                    state: 'test_state',
                    scope: '*',
                }
            })
            if (res.data.code !== '0') {
                throwError(`Oauth认证错误，状态码: ${res.data.code}`)
            }
            [syllabusSessionKey, syllabusSessionValue] = res.header['set-cookie'].split(';')[0].split('=')
            if (!syllabusSessionKey || !syllabusSessionValue) {
                throwError('获取syllabusSession失败')
            }
            // 存储业务后台session
            app.globalData.syllabusSession = { syllabusSessionKey, syllabusSessionValue }
            console.log('Oauth 授权成功')
        } catch (e) {
            throwError(`Oauth授权错误, ${e} `)
        }

        // 微信授权
        try {
            await miniLogin()
        } catch (e) {
            throwError(`微信授权失败 ${e}`)
        }
    },

    req() {
        request({
            url: api.skey_test
        })
    },

    getUserInfo() {
        request({
            url: api.user_info
        })
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
