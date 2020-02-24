// 统一 Surge、QuanX、Node 相关脚本 API, 方便开发、调试
// 包括 Node（request 模块）、Surge（$httpClient，$notification，$persistentStore 模块）、QuanX（$task，$notify，$prefs 模块）

const $tool = new Tool()
// notify
$tool.notify("title", "subtitle", "message")
// cache
$tool.write("value", "key")
$tool.read("key")
// get
$tool.get("http://www.baidu.com", function (error, response, body) {
    // response.status response.statusCode response.headers
    if (!error) {
        if (response.statusCode == 200) {
            console.log(body)
        }
    } else {
        console.log(error)
    }
})
// post
const request = {
    url: "https://www.baidu.com",
    body: ""
    //...
}
$tool.post(request, function (error, response, body) {
    // response.status response.statusCode response.headers
    if (!error) {
        if (response.statusCode == 200) {
            console.log(body)
        }
    } else {
        console.log(error)
    }
})

function Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    _isSurge = typeof $httpClient != "undefined"
    _isQuanX = typeof $task != "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
    }
    this.get = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.get(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    this.post = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.post(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request.post(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    _status = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
}

function tool() {
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const isResponse = typeof $response != "undefined"
    const node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
        if (node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
    }
    const adapterStatus = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
    const get = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.get(options, (error, response, body) => {
            callback(error, adapterStatus(response), body)
        })
        if (node) {
            node.request(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
    }
    const post = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) {
            $httpClient.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
        if (node) {
            node.request.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
    }
    return { isQuanX, isSurge, isResponse, notify, write, read, get, post }
}


/*
Check in for Surge by Neurogram

 - 站点签到脚本
 - 流量详情显示
 - 多站签到支持
 - 多类站点支持

使用说明：https://www.notion.so/neurogram/Check-in-0797ec9f9f3f445aae241d7762cf9d8b

关于作者
Telegram: Neurogram
GitHub: Neurogram-R
*/

const accounts = [
    ["N3RO", "https://n3ro.fun/auth/login", "386727754@qq.com", "always007"]
]

async function launch() {
    for (var i in accounts) {
        let title = accounts[i][0]
        let url = accounts[i][1]
        let email = accounts[i][2]
        let password = accounts[i][3]
        await login(url, email, password, title)
    }
    $done();
}

launch()

function login(url, email, password, title) {
    let loginPath = url.indexOf("auth/login") != -1 ? "auth/login" : "user/_login.php"
    let table = {
        url: url.replace(/(auth|user)\/login(.php)*/g, "") + loginPath,
        header: {

        },
        body: {
            "email": email,
            "passwd": password,
            "rumber-me": "week"
        }
    }
    $httpClient.post(table, async function (error, response, data) {
        if (error) {
            console.log(error);
            $notification.post(title + '登录失败', error, "");
        } else {
            await checkin(url, title)
        }
    }
    );
}

function checkin(url, title) {
    let checkinPath = url.indexOf("auth/login") != -1 ? "user/checkin" : "user/_checkin.php"
    $httpClient.post(url.replace(/(auth|user)\/login(.php)*/g, "") + checkinPath, async function (error, response, data) {
        if (error) {
            console.log(error);
            $notification.post(title + '签到失败', error, "");
        } else {
            await dataResults(url, JSON.parse(data).msg, title)
        }
    });
}

function dataResults(url, checkinMsg, title) {
    let userPath = url.indexOf("auth/login") != -1 ? "user" : "user/index.php"
    $httpClient.get(url.replace(/(auth|user)\/login(.php)*/g, "") + userPath, function (error, response, data) {
        var usedData = data.match(/[0-9\.]*? CNY/) 
        if (usedData) {
            var restData = data.match(/"card-tag tag-green" id="remain">(.*)<\/code>/)
            var usrvip = data.match(/<dd>VIP ([0-9])<\/dd>/)
            var device = data.match(/([0-9\.]*?) \/ 不限制/)
            var nextdata = data.match(/等级到期时间 (.*)<\/div>/)
            var todayuse = data.match(/card-tag tag-red">(.*)<\/code>/)
            var totaluse = data.match(/"card-tag tag-orange">(.*)<\/code>/)
            $notification.post("尊敬的"+title+ "-VIP"+usrvip[1]+"会员", checkinMsg, "账户余额：" + usedData +"\n今日已用："+ todayuse[1]+"\n总共使用："+ totaluse[1]+"\n剩余流量：" + restData[1] +"\n在线设备："+device[1]+"\n等级到期："+nextdata[1]);
        } else {
            $notification.post(title + '获取流量信息失败', "", "");
        }
    });
}
