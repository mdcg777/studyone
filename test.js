const {sign_datail, sign_reply, get_ms_token, getRandomInt} = require("./sign.js");
var config = require("./config.js");
var vedio_uri = require("./uri.js"); // 此处从 uri.js文件中加载目标视频链接

var requestSync = require("sync-request");
var queryFunc = require("querystring");

var fs = require("fs");
var cookie = require("cookie");

var cookie_str = "";
var err_msg = "";

try {
	
	var url = "https://www.douyin.com/aweme/v1/web/comment/list/?";

	var headers = {
	    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
	    "sec-fetch-site": "same-origin",
	    "sec-fetch-mode": "cors",
	    "sec-fetch-dest": "empty",
	    "sec-ch-ua-platform": "Windows",
	    "sec-ch-ua-mobile": "?0",
	    "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
	    'referer': "https://www.douyin.com/?recommend=1",
	    'priority': "u=1, i",
	    'pragma': "no-cache",
	    "cache-control": "no-cache",
	    'accept-language': "zh-CN,zh;q=0.9,en;q=0.8",
	    'accept': "application/json, text/plain, */*",
	    'dnt': "1",
	    'Cookie':"",
	}

	var params = {
		'device_platform': 'webapp','aid': '6383','channel': 'channel_pc_web', "aweme_id":"", "cursor": 0, 
		"count": 50, "item_type": 0,'update_version_code': '170400',
		'pc_client_type': '1','version_code': '190500','version_name': '19.5.0','cookie_enabled': 'true',
	    'screen_width': '2560', //from cookie dy_swidth
	    'screen_height': '1440', //from cookie dy_sheight
	    'browser_language': 'zh-CN','browser_platform': 'Win32','browser_name': 'Chrome',
	    'browser_version': '126.0.0.0','browser_online': 'true','engine_name': 'Blink',
	    'engine_version': '126.0.0.0','os_name': 'Windows','os_version': '10',
	    'cpu_core_num': '24',   // device_web_cpu_core
	    'device_memory': '8',   // device_web_memory_size
	    'platform': 'PC','downlink': '10','effective_type': '4g','round_trip_time': '50','webid':'',
	    'uifid':'', 'verifyFp':'', 'fp':'', 'msToken':'', 
	};
	var test_str = "";

	// 获取webid
	function get_webid(header) {
	    header['sec-fetch-dest'] = 'document'
	   

	    // console.log(html);
	    try {
	    	var res = requestSync('GET', 'https://www.douyin.com/?recommend=1', {headers:header});
		    // console.log(res.statusCode);
		    // console.log(res.headers);
		    var html = res.getBody("utf8");
	    	// fs.writeFileSync('./log.txt', res.getBody("utf8"));

	    	if (res.statusCode != 200) {
		    	return "";
		    } else {
		    	// var html = fs.readFileSync('./log.txt', 'utf8');
		    	// console.log(html);
		    	var match_id = html.match(/\\"user_unique_id\\":\\"(\d+)\\"/);
		    	// console.log(match_id);
		    	if (!!match_id) {
		    		return match_id[1];
		    	} else {
		    		return "";
		    	}
		    }
	    } catch (err) {
	    	console.log("web_id获取失败");
	    	return "";
	    }
	}

	function getComment(url, params, header) {
		// console.log(html);
	    try {
			// 将数据转为url字符串
	    	var query = queryFunc.stringify(params);
	    	// console.log(query);
			// 核心功能，生成a_bogus加密参数
	    	if (url.includes('reply')) {
				params["a_bogus"] = sign_reply(query, header["User-Agent"]);
			} else {
				params["a_bogus"] = sign_datail(query, header["User-Agent"]);
			}

			// console.log(params);
	    	var res =  requestSync('GET', url + queryFunc.stringify(params), {headers:header});
	    	// console.log(res);
	    	if ('a_bogus' in params) {
	    		delete params.a_bogus;
	    	}
	    	return res;
	    } catch (err) {
	    	console.log("评论采集失败");
	    	return {"statusCode":400};
	    }
	}

	if (fs.existsSync("./cookies.txt")) {
		try {
			// 从 cookies.txt 文件中读取 cookie
			cookie_str = fs.readFileSync("./cookies.txt", "utf8"); // 读取cookie
			if (cookie_str.length > 0 && cookie_str.indexOf("UIFID") != -1) {

				headers["Cookie"] = cookie_str.trim();  // 去除cookie字符串首尾的空格、制表符、换行符
				var cookie_json = cookie.parse(headers["Cookie"]);

				if ("UIFID" in cookie_json && cookie_json["UIFID"].length > 0) {
				    params['screen_width'] = cookie_json.dy_swidth || 2560;
				    params['screen_height'] = cookie_json.dy_sheight || 1440;
				    params['cpu_core_num'] = cookie_json.device_web_cpu_core || 24;
				    params['device_memory'] = cookie_json.device_web_memory_size || 8;
				    params["uifid"] = cookie_json.UIFID;
				    params['verifyFp'] = cookie_json.s_v_web_id || "";
				    params['fp'] = cookie_json.s_v_web_id || "";
					params['msToken'] = get_ms_token();
				    params['webid'] = get_webid(headers); // 此处可从url或cookie中获取固定值，省略网络请求，加快处理速度
				    // get_webid(headers);
				    // console.log(get_webid(headers));
				    // 获取 vedio ID
					var ids = [];
					for (var i = 0; i <= (vedio_uri.length - 1); i++) {
						var index_num = vedio_uri[i].indexOf("video");
						if (index_num != -1) {
							ids.push(vedio_uri[i].substring(index_num + 6));
						}
					}

					if (ids.length > 0 ) {
						console.log("将要执行的视频：" + ids.join(","));
						ids.forEach(function(id){
							params['cursor'] = 0;
							params["aweme_id"] = id;
							// var query = queryFunc.stringify(params);
							var res = getComment(url, params, headers);
							if (res.statusCode != 200) {
						    	console.log("视频：" + id + "，评论采集失败");
						    } else {
						    	// console.log(res.getBody("utf8"));
						    	res_json = JSON.parse(res.getBody("utf8"));
						    	// console.log(res_json);
						    	var log = '';
						    	res_json['comments'].forEach(function(comm){
						    		// console.log(comm);
						    		log = '';
						    		log += '{"ip":"'+comm.ip_label+'","text":"' + comm.text.replace(/\s+/g, '') + '","uid":"' + comm.user.uid + '","unique_id":"' + comm.user.unique_id + '","nickname":"'+ comm.user.nickname + '","secuid":"' + comm.user.sec_uid + '"}\r\n';
						    		fs.appendFileSync('./comment.log', log);
						    		// console.log(log);
						    	});
						    	// console.log(log);
						    	
						    	var has_more = res_json.has_more;
						    	// console.log('是否还有更多' + has_more);
						    	while (params['cursor'] < res_json.total && has_more) {
						    		log = '';
						    		params['cursor'] += params.count;
						    		var res_a = getComment(url, params, headers);
						    		if (res_a.statusCode != 200) {
								    	console.log("视频：" + id + "，评论采集失败");
								    } else {
								    	var text = res_a.getBody("utf8");
								    	if (text != '') {
											var res_json_a = JSON.parse(text);
											has_more = res_json_a.has_more;
											// console.log('222是否还有更多' + has_more);
									    	res_json_a['comments'].forEach(function(comm){
									    		log += '{"ip":"'+comm.ip_label+'","text":"' + comm.text.replace(/\s+/g, '') + '","uid":"' + comm.user.uid + '","unique_id":"' + comm.user.unique_id + '","nickname":"'+ comm.user.nickname + '","secuid":"' + comm.user.sec_uid + '"}\r\n';
									    	});
									    	console.log(log);
									    	fs.appendFileSync('./comment.log', log);
								    	} else {
								    		break;
								    	}
								    }
								    // sleep(2000);
						    	}
						    }
						    // logger.info(
						    //     f'url: {url}, request {url}, params={params}, headers={headers}')
						    // response = await requests.get(url, params=params, headers=headers)

						});
					} else {
						err_msg = "请添加视频uri";
					}
				} else {
					err_msg = "cookie字符串中没有UIFID，请检查";
				}
			} else {
				err_msg = "cookies.txt文件种的cookie字符串无效，请检查";
			}
		} catch(err) {
			err_msg= "cookies.txt文件读取失败";
			console.error(err);
		}
	} else {
		err_msg = "cookies.txt文件不存在，请检查";
	}
} catch (err) {
	console.error(err);
}

console.log(err_msg);