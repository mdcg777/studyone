# studyone
本测试demo仅限于学习研究，严禁用于任何非法活动。

本测试demo只是学习研究逆向方法测试用例，严禁用于爬虫和任何非法活动！

本测试demo核心学习文件为 sign.js 加密算法文件，此文件经学习研究将加密算法逆向为js算法。

comment.log 为test.js运行测试后生成的目标数据文件。

cookies.txt 为test.js运行时获取cookie的文件，此文件存放cookie字符串，也可以直接将cookie字符串在test.js中固定写死，cookie可长期使用，非必要不更换。

uri.js 为 test.js 运行时读取目标url的文件，此文件存放目标url数据。

keys.txt 为筛选关键字文件，此处写关键字，以中文逗号或英文逗号隔开关键字。

getKey.js 读取 keys.txt 文件获取关键字，逐行读取 comment.log 文件，筛选是否与关键字匹配，若关键字匹配则写入csv文件。

本测试demo运行需要 nodejs 环境。

nodejs环境搭好后，运行 npm init 命令初始化项目依赖。

在windows或linux命令行，输入 node ./test.js 命令即可运行，根据uri.js生成对应的comment.log

在windows或linux命令行，输入 node ./getKey.js 命令即可运行，根据keys.txt和comment.log生成对应的csv

