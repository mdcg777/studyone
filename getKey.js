var fs = require("fs");
var readline = require('readline');
var csv = require('fast-csv');

// 从 keys.txt 文件读取关键字
var keys_str = fs.readFileSync('./keys.txt', 'utf8');

var err_msg = '';
var csv_path = './output.csv';

try {
	

	var arr = keys_str.replace(/[，,]/g, ',').split(',');
	// console.log(keys);
	if (arr.length = 0) {
		err_msg = '请正确设置关键字';
	} else {
		// 打开日志文件
		var readStream = fs.createReadStream('./comment.log', {encoding : 'utf8'});
		var rl = readline.createInterface({input:readStream, crlfDelay: Infinity});
		var writeStream = fs.createWriteStream(csv_path, { flags: 'a' }); // 创建写入流，使用 'a' 模式以追加方式打开文件
		var csvStream = csv.format({headers:false, eol: '\r\n' }); // 创建一个CSV写入器
		csvStream.pipe(writeStream);// 将CSV写入器管道到写入流

		if (!fs.existsSync(csv_path)) {
		    fs.writeFileSync(csv_path, ''); // 创建空文件以便写入
		}
		// 逐行读取日志进行关键字匹配处理
		rl.on('line', (line)=>{
			if (line.length > 0) {
				var keys_arr = keys_str.replace(/[，,]/g, ',').split(',');
				var obj = JSON.parse(line.replace(/\\+/g, ''));
				if (obj && typeof(obj) === 'object') {
					keys_arr.forEach(function(k){
						// console.log(ii);
						if (obj['text'].includes(k)) {
							obj['secuid'] = 'https://www.douyin.com/user/'+obj['secuid'];
							obj['key'] = k;
							console.log(obj);
							// 将匹配关键字的数据写入csv文件
							csvStream.write(Object.values(obj));
						}
					});
				} else {
					// console.log(111);
					err_msg = '数据格式错误，请检查comment.log';
				}
			} else {
				err_msg = '请先采集评论';
			}
		});

		rl.on('close', () => {
			writeStream.end();
			console.log('关键字匹配完成，请查看getKeyComment.csv表格');
		});

		writeStream.on('finish', () => {
		    console.log('日志分析结束');
		});
	}
} catch (err) {
	err_msg = '请检查keys.txt或comment.log文件';
	console.error(err);
}

console.log(err_msg);