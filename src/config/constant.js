import { config } from './config'

const constant = {
    environment: Symbol(config.environment)
}

// 存放Cache key 的map
const cacheKeyMap = {
    loginState: Symbol('login_key')
}

export { constant, cacheKeyMap }
