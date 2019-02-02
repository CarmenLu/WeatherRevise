/*
* create by candychuang on 2019/1/27
*/
import regeneratorRuntime from './third-party/runtime' // eslint-disable-line
import { wxRequest } from './wxApi'
let Raven = require('./third-party/raven')

const request = async function (options) {
    let res
    try {
        res = await wxRequest(options)
    } catch (e) {
        console.error('请求错误，', e)
        throw e
    }
    return res
}

function throwError(msg) {
    let err = new Error(msg)
    // 删除本层函数的错误栈信息
    err.stack = err.stack.replace(/\n.*\n/, '\n')
    Raven.captureException(msg, {
        level: 'error'
    })
    throw err
}



export {
    request,
    throwError
}
