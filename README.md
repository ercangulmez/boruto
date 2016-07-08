# Web开发工具2.0.6-alpha

[![Travis](https://img.shields.io/travis/cntanglijun/boruto-cli.svg?maxAge=2592000?style=flat-square)](https://travis-ci.org/cntanglijun/boruto-cli)
[![npm](https://img.shields.io/npm/v/boruto.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/boruto)
[![npm](https://img.shields.io/npm/dm/boruto.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/boruto)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/cntanglijun/boruto-cli/master/LICENSE)

## 安装(Installation)

``` bash
npm i boruto -g
```

## 使用(Usage)

### 初始化
``` bash
boruto init <directory> --html pug --amd pug --css stylus
```

|参数             |说明            |
|:---------------:|:--------------:|
|&lt;directory&gt;|需要初始化的目录  |
|--html           |可选html模板(pug, ejs)默认为pug|
|--css            |可选样式模板(stylus, less)默认为stylus|
|--amd            |可选amd模板(pug, ejs)默认为pug|


> 注:一般情况html模板与amd模板为相同类型

### 调试
```bash
boruto server <directory> --port 8080 --basedir .,.tmp
```

|参数             |说明            |
|:---------------:|:--------------:|
|&lt;directory&gt;|设置服务器目录(初始化的目录)|
|--port           |设置服务器端口号|
|--basedir        |设置服务器根目录(可选多个文件夹,使用','分割)|

> 注:目录之间逗号分割没有空格

### 发布

```bash
boruto dist <directory> --output <directory> --config <path>
```

|参数             |说明            |
|:---------------:|:--------------:|
|&lt;directory&gt;|设置需要发布的资源目录(初始化的目录)|
|--output         |设置输出目录(默认为初始化的目录下的dist文件夹)|
|--config         |设置指定requirejs配置文件路劲 

## license

MIT
