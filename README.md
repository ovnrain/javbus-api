# JavBus API <!-- omit in toc -->

一个自我托管的 [JavBus](https://www.javbus.com) API 服务

## 目录 <!-- omit in toc -->

- [用途](#用途)
- [部署与启动](#部署与启动)
  - [Docker 部署（推荐）](#docker-部署推荐)
    - [启用 https 服务器](#启用-https-服务器)
    - [使用代理](#使用代理)
  - [Node.js 部署](#nodejs-部署)
    - [启用 https 服务器](#启用-https-服务器-1)
    - [使用代理](#使用代理-1)
    - [使用 PM2 保持服务后台常驻](#使用-pm2-保持服务后台常驻)
  - [配合 web 服务器](#配合-web-服务器)
  - [Vercel 部署](#vercel-部署)
- [权限校验](#权限校验)
  - [1. 使用用户名密码](#1-使用用户名密码)
  - [2. 使用 Token](#2-使用-token)
- [API 文档](#api-文档)
  - [/api/v1/movies](#apiv1movies)
    - [method](#method)
    - [参数](#参数)
    - [请求举例](#请求举例)
    - [返回举例](#返回举例)
  - [/api/v1/movies/search](#apiv1moviessearch)
    - [method](#method-1)
    - [参数](#参数-1)
    - [请求举例](#请求举例-1)
    - [返回举例](#返回举例-1)
  - [/api/v1/movies/{id}](#apiv1moviesid)
    - [method](#method-2)
    - [请求举例](#请求举例-2)
    - [返回举例](#返回举例-2)
  - [/api/v1/stars/{id}](#apiv1starsid)
    - [method](#method-3)
    - [参数](#参数-2)
    - [请求举例](#请求举例-3)
    - [返回举例](#返回举例-3)

## 用途

- 可以用来搭建自己的视频信息网站
- 可以作为 App 的 API 服务
- 可以作为爬虫的数据源
- 可以用来制作 iOS/macOS 快捷指令
- 可以用来开发 Telegram 机器人
- 等等...

## 部署与启动

注意：本程序仅仅是 JavBus 的一个在线转换服务，因此不依赖数据库服务，每个请求会实时请求 JavBus 对应的网页，解析之后返回对应的 json 数据。因此，如果 JavBus 网站无法访问，本程序也无法正常工作

### Docker 部署（推荐）

[Docker Hub 地址](https://hub.docker.com/r/ovnrain/javbus-api)

```shell
$ docker pull ovnrain/javbus-api
$ docker run -d \
    --name=javbus-api \
    --restart=unless-stopped \
    -p 8922:3000 \
    ovnrain/javbus-api
```

启动一个 Docker 容器，将其名称设置为 `javbus-api`，端口设置为 `8922`，并且自动重启

#### 启用 https 服务器

```shell
$ docker run -d \
    --name=javbus-api \
    --restart=unless-stopped \
    -p 8922:3000 \
    -v /path/to/your/cert:/certs \
    -e SSL_CERT=/certs/ssl.crt \
    -e SSL_KEY=/certs/ssl.key \
    ovnrain/javbus-api
```

注意：`-v` 和 `-e SSL_CERT`、`-e SSL_KEY` 这三个参数必须同时使用，否则无法启用 https 服务器

#### 使用代理

```shell
$ docker run -d \
    --name=javbus-api \
    --restart=unless-stopped \
    -p 8922:3000 \
    -e HTTP_PROXY=http://192.168.5.123:1082 \
    ovnrain/javbus-api
```

`HTTP_PROXY` 可以设置为 `http`、`https`、`socks`、 `socks5` 等代理地址

### Node.js 部署

```shell
$ git clone https://github.com/ovnrain/javbus-api.git
$ cd javbus-api
$ nvm use # 可选，使用 .nvmrc 中指定的 Node.js 版本，关于 nvm 的安装与使用，请参考 https://github.com/nvm-sh/nvm
$ pnpm install # 或者 npm install 或者 yarn install
$ npm run build
$ echo "PORT=8922" > .env # 可选，默认端口为 `3000`
$ npm start
```

#### 启用 https 服务器

```shell
$ SSL_CERT=/path/to/your/cert/ssl.crt SSL_KEY=/path/to/your/cert/ssl.key npm start
```

或者编辑 `.env` 文件，添加以下环境变量：

```env
SSL_CERT=/path/to/your/cert/ssl.crt
SSL_KEY=/path/to/your/cert/ssl.key
```

#### 使用代理

```shell
$ HTTP_PROXY=http://192.168.5.123:1082 npm start
```

或者编辑 `.env` 文件，添加以下环境变量：

```env
HTTP_PROXY=http://192.168.5.123:1082
```

`HTTP_PROXY` 可以设置为 `http`、`https`、`socks`、 `socks5` 等代理地址

#### 使用 PM2 保持服务后台常驻

```shell
$ npm install -g pm2
$ pm2 start npm --name javbus-api -- start
```

_关于 PM2 的详细使用方法，请参考 [PM2 官方文档](https://pm2.keymetrics.io/docs/usage/quick-start/)_

服务启动后，在浏览器中访问 [http://localhost:8922](http://localhost:8922) 即可获取结果

### 配合 web 服务器

以上两种方式都可以配合 `NGINX`、`Caddy` 等一起使用，例如 NGINX 配置如下：

```nginx
location /api {
  proxy_pass http://localhost:8922;
  proxy_http_version 1.1;
  proxy_set_header Host $host;

  add_header cache-control "no-cache";
}
```

### Vercel 部署

使用 Vercel 部署的优势在于：

- 无需自己购买服务器
- 无需配置环境依赖
- 无需配置代理
- 无需配置 https 证书
- 公网访问，即开即用

点击下方按钮，即可将本项目一键部署到 Vercel 上

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fovnrain%2Fjavbus-api&project-name=javbus-api&repository-name=javbus-api-from-ovnrain)

## 权限校验

本项目默认不开启权限校验，即任何人都可以访问。如果项目部署在公网上，建议开启权限校验，以防止被恶意访问

权限校验目前有两种方式：

### 1. 使用用户名密码

设置以下环境变量：

```env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
# 可选，用于加密 session
JAVBUS_SESSION_SECRET=your_session_secret
```

重新部署项目，首页会出现登录按钮，点击进入登录页面，输入用户名密码即可。如果在未登录的情况下访问 API，会跳转到登录页面。这种方式适合在浏览器中访问，如果是在 App 中访问，建议使用第二种方式

### 2. 使用 Token

这种方式需要在请求头中添加 `j-auth-token` 字段，值为 `your_token`

设置以下环境变量：

```env
JAVBUS_AUTH_TOKEN=your_token
```

重新部署项目，即可使用 Token 访问 API

下面是几个例子：

使用 `curl`

```shell
$ curl -H "j-auth-token: your_token" http://localhost:8922/api/v1/stars/okq
```

使用 `Wget`

```shell
$ wget --header="j-auth-token: your_token" http://localhost:8922/api/v1/stars/okq
```

使用 [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

```http
GET http://localhost:8922/api/v1/stars/okq HTTP/1.1
j-auth-token: your_token
```

关于 Docker、Node.js 的环境变量设置方式，请参考上面的部署方法。Vercel 设置环境变量可以在项目的 `Settings` -> `Environment Variables` 中设置

**注意：只设置 `JAVBUS_AUTH_TOKEN` 环境变量是不安全的，用户依然可以通过不加 `j-auth-token` 请求头，或者在浏览器中直接访问 API**。因此，应该同时设置 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 环境变量，以达到双重校验的目的

## API 文档

### /api/v1/movies

获取影片列表

#### method

GET

#### 参数

| 参数        | 是否必须 | 可选值                                                                       | 默认值   | 说明                                                                                                                                                              |
| ----------- | -------- | ---------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| page        | 是       |                                                                              |          | 页码                                                                                                                                                              |
| magnet      | 是       | `exist`<br />`all`                                                           |          | `exist`: 只返回有磁力链接的影片<br />`all`: 返回全部影片                                                                                                          |
| filterType  | 否       | `star`<br />`genre`<br />`director`<br />`studio`<br />`label`<br />`series` |          | 筛选类型，必须与 `filterValue` 一起使用<br />`star`: 演员<br />`genre`: 类别<br />`director`: 导演<br />`studio`: 制作商<br />`label`: 发行商<br />`series`: 系列 |
| filterValue | 否       |                                                                              |          | 筛选值，必须与 `filterType` 一起使用                                                                                                                              |
| type        | 否       | `normal`<br />`uncensored`                                                   | `normal` | `normal`: 有码影片<br />`uncensored`: 无码影片                                                                                                                    |

#### 请求举例

    /api/v1/movies?page=1&magnet=exist

返回有磁力链接的第一页影片

    /api/v1/movies?page=1&filterType=star&filterValue=rsv&magnet=all

返回演员 ID 为 `rsv` 的影片的第一页，包含有磁力链接和无磁力链接的影片

    /api/v1/movies?page=2&filterType=genre&filterValue=4&magnet=exist

返回类别 ID 为 `4` 的影片的第二页，只返回有磁力链接的影片

    /api/v1/movies?page=1&magnet=exist&type=uncensored

返回无码影片的第一页，只返回有磁力链接的影片

#### 返回举例

<details>
<summary>点击展开</summary>

```jsonc
{
  // 影片列表
  "movies": [
    {
      "date": "2023-04-28",
      "id": "YUJ-003",
      "img": "https://www.javbus.com/pics/thumb/9n0d.jpg",
      "title": "夫には言えない三日間。 セックスレスで欲求不満な私は甥っ子に中出しさせています。 岬ななみ",
      "tags": ["高清", "字幕", "3天前新種"]
    }
    // ...
  ],
  // 分页信息
  "pagination": {
    "currentPage": 1,
    "hasNextPage": true,
    "nextPage": 2,
    "pages": [1, 2, 3]
  },
  // 筛选信息，注意：只有在请求参数包含 filterType 和 filterValue 时才会返回
  "filter": {
    "name": "岬ななみ",
    "type": "star",
    "value": "rsv"
  }
}
```

</details>

### /api/v1/movies/search

搜索影片

#### method

GET

#### 参数

| 参数    | 是否必须 | 可选值                     | 默认值   | 说明                                                     |
| ------- | -------- | -------------------------- | -------- | -------------------------------------------------------- |
| keyword | 是       |                            |          | 搜索关键字                                               |
| page    | 是       |                            |          | 页码                                                     |
| magnet  | 是       | `exist`<br />`all`         |          | `exist`: 只返回有磁力链接的影片<br />`all`: 返回全部影片 |
| type    | 否       | `normal`<br />`uncensored` | `normal` | `normal`: 有码影片<br />`uncensored`: 无码影片           |

#### 请求举例

    /api/v1/movies/search?keyword=三上&page=1&magnet=exist

搜索关键词为 `三上` 的影片的第一页，只返回有磁力链接的影片

    /api/v1/movies/search?keyword=三上&page=1&magnet=all

搜索关键词为 `三上` 的影片的第一页，包含有磁力链接和无磁力链接的影片

#### 返回举例

<details>
<summary>点击展开</summary>

```jsonc
{
  // 影片列表
  "movies": [
    {
      "date": "2020-08-15",
      "id": "SSNI-845",
      "img": "https://www.javbus.com/pics/thumb/7t44.jpg",
      "title": "彼女の姉は美人で巨乳しかもドS！大胆M性感プレイでなす術もなくヌキまくられるドMな僕。 三上悠亜",
      "tags": ["高清", "字幕"]
    }
    // ...
  ],
  // 分页信息
  "pagination": {
    "currentPage": 2,
    "hasNextPage": true,
    "nextPage": 3,
    "pages": [1, 2, 3, 4, 5]
  },
  "keyword": "三上"
}
```

</details>

### /api/v1/movies/{id}

获取影片详情

#### method

GET

#### 请求举例

    /api/v1/movies/SSIS-406

返回番号为 `SSIS-406` 的影片详情

#### 返回举例

<details>
<summary>点击展开</summary>

```jsonc
{
  "id": "SSIS-406",
  "title": "SSIS-406 才色兼備な女上司が思う存分に羽目を外し僕を連れ回す【週末限定】裏顔デート 葵つかさ",
  "img": "https://www.javbus.com/pics/cover/8xnc_b.jpg",
  // 封面大图尺寸
  "imageSize": {
    "width": 800,
    "height": 538
  },
  "date": "2022-05-20",
  // 影片时长
  "videoLength": 120,
  "director": {
    "id": "hh",
    "name": "五右衛門"
  },
  "producer": {
    "id": "7q",
    "name": "エスワン ナンバーワンスタイル"
  },
  "publisher": {
    "id": "9x",
    "name": "S1 NO.1 STYLE"
  },
  "series": {
    "id": "xx",
    "name": "xx"
  },
  "genres": [
    {
      "id": "e",
      "name": "巨乳"
    }
    // ...
  ],
  // 演员信息，一部影片可能包含多个演员
  "stars": [
    {
      "id": "2xi",
      "name": "葵つかさ"
    }
  ],
  // 磁力链接列表
  "magnets": [
    {
      "link": "magnet:?xt=urn:btih:A6D7C90FAB7E4223C61425A2E4CDF9E503CEDAA2&dn=SSIS-406-C",
      // 是否高清
      "isHD": true,
      "title": "SSIS-406-C",
      "size": "5.46GB",
      // bytes
      "numberSize": 5862630359,
      "shareDate": "2022-05-20",
      // 是否包含字幕
      "hasSubtitle": true
    }
    // ...
  ],
  // 影片预览图
  "samples": [
    {
      "alt": "SSIS-406 才色兼備な女上司が思う存分に羽目を外し僕を連れ回す【週末限定】裏顔デート 葵つかさ - 樣品圖像 - 1",
      "id": "8xnc_1",
      // 大图
      "src": "https://pics.dmm.co.jp/digital/video/ssis00406/ssis00406jp-1.jpg",
      // 缩略图
      "thumbnail": "https://www.javbus.com/pics/sample/8xnc_1.jpg"
    }
    // ...
  ]
}
```

</details>

### /api/v1/stars/{id}

获取演员详情

#### method

GET

#### 参数

| 参数 | 是否必须 | 可选值                     | 默认值   | 说明                                                           |
| ---- | -------- | -------------------------- | -------- | -------------------------------------------------------------- |
| type | 否       | `normal`<br />`uncensored` | `normal` | `normal`: 有码影片演员详情<br />`uncensored`: 无码影片演员详情 |

#### 请求举例

    /api/v1/stars/2xi

返回演员 `葵つかさ` 的详情

    /api/v1/stars/2jd?type=uncensored

返回演员 `波多野結衣` 的详情

#### 返回举例

<details>
<summary>点击展开</summary>

```jsonc
{
  "avatar": "https://www.javbus.com/pics/actress/2xi_a.jpg",
  "id": "2xi",
  "name": "葵つかさ",
  "birthday": "1990-08-14",
  "age": "32",
  "height": "163cm",
  "bust": "88cm",
  "waistline": "58cm",
  "hipline": "86cm",
  "birthplace": "大阪府",
  "hobby": "ジョギング、ジャズ鑑賞、アルトサックス、ピアノ、一輪車"
}
```

</details>
