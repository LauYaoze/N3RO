/*
; Update 2020.03.06 17:00, by Kai
; 球加速免费机场✈️注册：http://yaoqing03.com/auth/register?code=BNc9
; 球加速自动签到
[task_local]
6 9 * * * qiujiasu.js
*/

let Cookie = $prefs.valueForKey("N3ROCookie");

let Req = {
  url: "http://n3ro.fun/user/checkin",
  method: "POST",
  headers: {
    Cookie: Cookie,
    Origin: "http://n3ro.fun",
    Referer: "http://n3ro.fun/user",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"
  }
};

$task.fetch(Req).then(response => {
  try {
    let doc = JSON.parse(response.body);
    if (doc["ret"] == 1) {
      $notify(
        "N3RO✈️",
        "成功",
        `${doc["msg"]}\n已使用流量${doc["trafficInfo"]["lastUsedTraffic"]}\n剩余流量${doc["trafficInfo"]["unUsedTraffic"]}`
      );
    } else {
      $notify("N3RO✈️", "成功", doc["msg"]);
    }
  } catch (error) {
    $notify("N3RO✈️", "失败", error);
  }
});
