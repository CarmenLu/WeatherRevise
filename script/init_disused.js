let fs = require('fs')
let exec = require('child_process').exec
let ignoreList = [
    // /.scss$/,
    /.wxss$/,
    /.js$/,
    /.map$/,
    /.sass-cache$/
]

copyDir('./src', './dist')
command('npx babel ./src -d ./dist')

// TODO 该函数需要优化，嵌套太严重
/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist, callback) {
    fs.access(dist, function (err) {
        if (err) {
            // 目录不存在时创建目录
            fs.mkdirSync(dist)
        }
        _copy(null, src, dist)
    })

    function _copy(err, src, dist) {
        if (err) {
            callback(err)
        } else {
            fs.readdir(src, function (err, paths) {
                if (err) {
                    callback(err)
                } else {
                    paths.forEach(function (path) {
                        let _src = src + '/' + path
                        let _dist = dist + '/' + path
                        // 忽略部分文件或文件夹
                        if (ignoreList.some(val => val.test(_src))) {
                            return
                        }
                        fs.stat(_src, function (err, stat) {
                            if (err) {
                                callback(err)
                            } else {
                                // 判断是文件还是目录
                                if (stat.isFile()) {
                                    switch (true) {
                                        case /.scss$/.test(_src):
                                            console.log(`sass ${_src} ${_dist.replace(/.scss$/, '.wxss')}`)
                                            command(`sass ${_src} ${_dist.replace(/.scss$/, '.wxss')} --sourcemap=none`)
                                            break
                                        default:
                                            fs.writeFileSync(_dist, fs.readFileSync(_src))
                                    }
                                } else if (stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    copyDir(_src, _dist, callback)
                                }
                            }
                        })
                    })
                }
            })
        }
    }
}

function command(cmdStr) {
    exec(cmdStr, function (err, stdout, stderr) {
        if (err) {
            console.log('command error:' + stderr)
        } else {
            console.log(stdout)
        }
    })
}
// command('babel ./src -d ./dist')

