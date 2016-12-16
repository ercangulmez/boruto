# The tool for web development

> pug + stylus + es6

[![npm](https://img.shields.io/npm/v/boruto.svg)](https://www.npmjs.com/package/boruto)
[![node](https://img.shields.io/node/v/boruto.svg)](https://github.com/cntanglijun/boruto)
[![GitHub tag](https://img.shields.io/github/tag/cntanglijun/boruto.svg)](https://github.com/cntanglijun/boruto/tags)
[![GitHub release](https://img.shields.io/github/release/cntanglijun/boruto.svg)](https://github.com/cntanglijun/boruto/releases)
[![npm](https://img.shields.io/npm/dm/boruto.svg)](https://www.npmjs.com/package/boruto)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/cntanglijun/boruto-cli/master/LICENSE)

## Workflow

![Workflow](./workflow.png)

## Installation

``` bash
npm i boruto -g
```

## Usage

##### Initialization

``` bash
boruto init [directory]
```

| param | desc |
|:---:|:---:|
| [directory] | Set the dir for initialization |


##### Debug

```bash
boruto server [directory]
```

| param | desc |
|:---:|:---:|
| [directory]| Set the dir for server |

##### Dist

```bash
boruto dist [directory]
```

| 参数 | 说明 |
|:---:|:---:|
| [directory] | Set the dir for dist |

## .borutorc

The config file for boruto

```json
{
  "server": {
    "extDirs": [],
    "serveStatic": [],
    "port": 8080,
    "open": false
  },
  "dist": {
    "distDir": "dist",
    "compress": true,
    "requirejsConfig": "app/scripts/config.js",
    "amdOptimizationDir": [
      "app/scripts"
    ],
    "templateDir": [
      "app/scripts/_template"
    ],
    "moduleDir": []
  }
}
```

Boruto's server use browsersync, so you can find more options in [https://browsersync.io/docs/options/](https://browsersync.io/docs/options/)

## License

MIT
