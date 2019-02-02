const oauthHost = 'http://localhost:7001'
const syllabusHost = 'http://localhost:7002'

let api = {
    login: oauthHost + '/oauth/login',
    authorize: oauthHost + '/oauth/authorize',
    stu_login: syllabusHost + '/user/stu_login',
    mini_pro_login: syllabusHost + '/user/mini_pro_login',
}

export { api }
