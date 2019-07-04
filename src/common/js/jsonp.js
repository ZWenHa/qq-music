//1. 引用了jsonp库
import originJSONP from 'jsonp'

//2.定义一个函数， url：服务路径，data: 要传的参数， option:回调函数
export default function jsonp(url, data, option) {

    //4.判断url是否存在“?”,如果存在的话，要在前面增加’&‘,否则增加’?‘
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

    //5.通过异步请求，拿到数据，和jsonp函数相互运用
    return new Promise((resolve, reject) => {
        originJSONP(url, option, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}

//3. 先将要传的参数循环遍历出来加在url上
function param(data) {
    let url = ''
    for (var k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        url += `&${k}=${encodeURIComponent(value)}`
    }
    //判断：如果url是否有存在，如果有就去掉头部的&符号，否则返回空值
    return url ? url.substring(1) : ""
}