/*
    本作品用于QuantumultX和Surge之间js执行方法的转换
    您只需书写其中任一软件的js,然后在您的js最【前面】追加上此段js即可
    无需担心影响执行问题,具体原理是将QX和Surge的方法转换为互相可调用的方法
    尚未测试是否支持import的方式进行使用,因此暂未export
    如有问题或您有更好的改进方案,请前往 https://github.com/sazs34/TaskConfig/issues 提交内容,或直接进行pull request
    您也可直接在tg中联系@wechatu
*/
// #region 固定头部
let isQuantumultX = $task != undefined; //判断当前运行环境是否是qx
let isSurge = $httpClient != undefined; //判断当前运行环境是否是surge
// 判断request还是respons
// down方法重写
var $done = (obj={}) => {
    var isRequest = typeof $request != "undefined";
    if (isQuantumultX) {
        return isRequest ? $done({}) : ""
    }
    if (isSurge) {
        return isRequest ? $done({}) : $done()
    }
}
// http请求
var $task = isQuantumultX ? $task : {};
var $httpClient = isSurge ? $httpClient : {};
// cookie读写
var $prefs = isQuantumultX ? $prefs : {};
var $persistentStore = isSurge ? $persistentStore : {};
// 消息通知
var $notify = isQuantumultX ? $notify : {};
var $notification = isSurge ? $notification : {};
// #endregion 固定头部

// #region 网络请求专用转换
if (isQuantumultX) {
    var errorInfo = {
        error: ''
    };
    $httpClient = {
        get: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
                if (urlObj.body && typeof (urlObj.body) != 'string') {
                    urlObj.body = JSON.stringify(urlObj.body);
                    if (urlObj.headers) {
                        urlObj.headers['Content-type'] = 'application/json; charset=utf-8';
                    } else {
                        urlObj.headers = {'Content-type' : 'application/json; charset=utf-8'};
                    }
                }
            }
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        },
        post: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
                if (urlObj.body && typeof (urlObj.body) != 'string') {
                    urlObj.body = JSON.stringify(urlObj.body);
                    if (urlObj.headers) {
                        urlObj.headers['Content-type'] = 'application/json; charset=utf-8';
                    } else {
                        urlObj.headers = {'Content-type' : 'application/json; charset=utf-8'};
                    }
                }
            }
            urlObj.method = 'POST';
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        }
    }
}
if (isSurge) {
    $task = {
        fetch: url => {
            //为了兼容qx中fetch的写法,所以永不reject
            return new Promise((resolve, reject) => {
                if (url.method == 'POST') {
                    $httpClient.post(url, (error, response, data) => {
                        if (response) {
                            response.body = data;
                            resolve(response, {
                                error: error
                            });
                        } else {
                            resolve(null, {
                                error: error
                            })
                        }
                    })
                } else {
                    $httpClient.get(url, (error, response, data) => {
                        if (response) {
                            response.body = data;
                            resolve(response, {
                                error: error
                            });
                        } else {
                            resolve(null, {
                                error: error
                            })
                        }
                    })
                }
            })

        }
    }
}
// #endregion 网络请求专用转换

// #region cookie操作
if (isQuantumultX) {
    $persistentStore = {
        read: key => {
            return $prefs.valueForKey(key);
        },
        write: (val, key) => {
            return $prefs.setValueForKey(val, key);
        }
    }
}
if (isSurge) {
    $prefs = {
        valueForKey: key => {
            return $persistentStore.read(key);
        },
        setValueForKey: (val, key) => {
            return $persistentStore.write(val, key);
        }
    }
}
// #endregion

// #region 消息通知
if (isQuantumultX) {
    $notification = {
        post: (title, subTitle, detail) => {
            $notify(title, subTitle, detail);
        }
    }
}
if (isSurge) {
    $notify = function (title, subTitle, detail) {
        $notification.post(title, subTitle, detail);
    }
}
// #endregion

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

function checkin(url, title, cookies) {
    var checkinPath = url.indexOf("auth/login") != -1 ? "user/checkin" : "user/_checkin.php";
    var checkin_url = url.replace(/(auth|user)\/login(.php)*/g, "") + checkinPath;
    var options = {
        'method': 'post',
        'headers': {
            'Cookie': cookies
        }
    };
    var checkin = UrlFetchApp.fetch(checkin_url, options);
    if (!checkin) originalData(title + ' 签到失败');
    else {
        var data = JSON.parse(checkin.getContentText());
        dataResults(url, data.msg, title, cookies)
    }
}

function 
    var dataResults = UrlFetchApp.fetch(data_url, options1);
    data = dataResults.getContentText();
    var restData = data.match(/(id="remain">)[^B]+/)
    restData = restData[0].replace("id =\"remain\”>", "")
    var deadline = data.match(/(700;">)[^</p>]+/)
    var restData = data.match(/(id="remain">)[^B]+/)
    restData = restData[0].replace("id=\"remain\">", "")
    var deadline = data.match(/(等级到期时间 )[^</p>]+/)
    deadline = deadline[0].replace("等级到期时间 ", "")
    var todaydata = data.match(/(tag-red)[^B]+/)
    todaydata = todaydata[0].replace("tag-red\">", "")
    var pastdata = data.match(/(<code class="card-tag tag-orange)[^B]+/)
    pastdata = pastdata[0].replace("<code class=\"card-tag tag-orange\">", "")
    Logger.log(checkinMsg)
    if (todaydata || pastdata) {
        originalData("*" + title + "*\n" + checkinMsg + "\n今日已用：" + todaydata + "B" + "\n过去已用：" + pastdata + "B" + "\n剩余流量：" + restData + "B" + "\n到期时间: " + deadline);
    } else {
        originalData("*" + title + "*\n获取流量信息失败");
    }
}
