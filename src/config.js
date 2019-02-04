// const environment = 'production'
const environment = 'development'
const release = '1.0.0'

let config = {
    environment,
    release,
    app_id: 'wx560f8ff50bb29424',
    sentry: {
        dsn: 'https://efa3290d01c24b46aa3d0adbae28cbf3@sentry.io/1385418',
        options: {
            environment,
            release,
            allowDuplicates: true, // 允许相同错误重复上报
            sampleRate: 0.5 // 采样率
        }
    }
}

export { config }
