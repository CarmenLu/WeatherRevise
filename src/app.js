// app.js
import regeneratorRuntime from './utils/third-party/runtime'
import { config } from './config'
import { constant } from './constant' // eslint-disable-line
let Raven = require('./utils/third-party/raven')

App({
    onLaunch: async function () {
        console.log(`environment ${config.environment} release: ${config.release}`)
        if (config.environment === constant.environment) {
            Raven.config(config.sentry.dsn, config.sentry.options).install()
        }
    },
    globalData: {
        oauthSession: {},   // 资源服务器session
        syllabusSession: {}, // 课程表业务后台session
    },

    onError(msg) {
        Raven.captureException(msg, {
            level: 'error'
        })
    }
})
