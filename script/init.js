let fs = require('fs')
let exec = require('child_process').exec

function command(cmdStr) {
    exec(cmdStr, function (err, stdout, stderr) {
        if (err) {
            console.log('command error:' + stderr)
        } else {
            console.log(stdout)
        }
    })
}

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
// function copyDir(src, dist, callback) {
//     fs.access(dist, function (err) {
//         if (err) {
//             // 目录不存在时创建目录
//             fs.mkdirSync(dist)
//         }
//         _copy(null, src, dist)
//     })
//
//     function _copy(err, src, dist) {
//         if (err) {
//             callback(err)
//         } else {
//             fs.readdir(src, function (err, paths) {
//                 if (err) {
//                     callback(err)
//                 } else {
//                     paths.forEach(function (path) {
//                         let _src = src + '/' + path
//                         let _dist = dist + '/' + path
//                         fs.stat(_src, function (err, stat) {
//                             if (err) {
//                                 callback(err)
//                             } else {
//                                 // 判断是文件还是目录
//                                 if (stat.isFile()) {
//                                     switch (true) {
//                                         case /.scss$/.test(_src):
//                                             console.log(`sass ${_src} ${_dist.replace(/.scss$/, '.wxss')}`)
//                                             command(`sass ${_src} ${_dist.replace(/.scss$/, '.wxss')} --sourcemap=none`)
//                                             break
//                                     }
//                                 } else if (stat.isDirectory()) {
//                                     // 当是目录是，递归复制
//                                     // copyDir(_src, _dist, callback)
//                                 }
//                             }
//                         })
//                     })
//                 }
//             })
//         }
//     }
// }

sass('./src', './src')

function sass(src) {
    fs.readdir(src, function (err, paths) {
        if (err) {
            console.error(err)
        } else {
            paths.forEach(function (path) {
                let _src = src + '/' + path
                fs.stat(_src, function (err, stat) {
                    if (err) {
                        console.error(err)
                    } else {
                        // 判断是文件还是目录
                        if (stat.isFile()) {
                            switch (true) {
                                case /.scss$/.test(_src):
                                    console.log(`sass ${_src} ${_src.replace(/.scss$/, '.wxss')}`)
                                    command(`sass ${_src} ${_src.replace(/.scss$/, '.wxss')} --sourcemap=none`)
                                    break
                            }
                        } else if (stat.isDirectory()) {
                            // 当是目录是，递归复制
                            sass(_src)
                        }
                    }
                })
            })
        }
    })
}

