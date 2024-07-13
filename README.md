# JavBus API <!-- omit in toc -->

一个自我托管的 [JavBus](https://www.javbus.com) API 服务

## 目录 <!-- omit in toc -->

- [用途](#用途)
- [部署与启动](#部署与启动)
  - [Docker 部署（推荐）](#docker-部署推荐)
    - [使用 Docker Compose 配合 NGINX 部署](#使用-docker-compose-配合-nginx-部署)
    - [启用 https 服务器](#启用-https-服务器)
    - [使用代理](#使用代理)
  - [Node.js 部署](#nodejs-部署)
    - [启用 https 服务器](#启用-https-服务器-1)
    - [使用代理](#使用代理-1)
    - [使用 PM2 保持服务后台常驻](#使用-pm2-保持服务后台常驻)
  - [Vercel 部署](#vercel-部署)
- [权限校验](#权限校验)
  - [1. 使用用户名密码](#1-使用用户名密码)
  - [2. 使用 Token](#2-使用-token)
- [API 文档](#api-文档)
  - [/api/movies](#apimovies)
    - [method](#method)
    - [参数](#参数)
    - [请求举例](#请求举例)
    - [返回举例](#返回举例)
  - [/api/movies/search](#apimoviessearch)
    - [method](#method-1)
    - [参数](#参数-1)
    - [请求举例](#请求举例-1)
    - [返回举例](#返回举例-1)
  - [/api/movies/{movieId}](#apimoviesmovieid)
    - [method](#method-2)
    - [请求举例](#请求举例-2)
    - [返回举例](#返回举例-2)
  - [/api/magnets/{movieId}](#apimagnetsmovieid)
    - [method](#method-3)
    - [参数](#参数-2)
    - [请求举例](#请求举例-3)
    - [返回举例](#返回举例-3)
  - [/api/stars/{starId}](#apistarsstarid)
    - [method](#method-4)
    - [参数](#参数-3)
    - [请求举例](#请求举例-4)
    - [返回举例](#返回举例-4)

## 用途

- 可以用来搭建自己的视频信息网站
- 可以作为 App 的 API 服务
- 可以作为爬虫的数据源
- 可以用来制作 iOS/macOS 快捷指令
- 可以用来开发 Telegram 机器人
- 等等...

## 部署与启动

注意：本程序仅仅是 JavBus 的一个在线转换服务，因此不依赖数据库服务，每个请求会实时请求 JavBus 对应的网页，解析之后返回对应的 json 数据。因此，如果 JavBus 网站无法访问，本程序也无法正常工作

> **Note**
>
> **目前使用美国 IP 代理或者部署在美国地区 VPS 上，JavBus 会跳转到登录页面，导致本程序无法获取数据，请使用其他地区的 IP 代理或者 VPS**

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

#### 使用 Docker Compose 配合 NGINX 部署

_以下配置仅为示例，具体配置请根据自己的实际情况进行修改_

docker-compose.yml:

```yaml
version: '3.8'

services:
  api:
    image: ovnrain/javbus-api
    restart: unless-stopped
    # 端口可选，不配置端口时，NGINX 依然可以通过容器内部网络访问 API
    # ports:
    #   - '3000:3000'

  nginx:
    image: nginx:stable-alpine
    ports:
      - '8922:80'
    depends_on:
      - api
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./logs:/var/log/nginx
    restart: unless-stopped
```

nginx.conf:

```nginx
# 其他配置省略...

http {
  # 其他配置省略...

  server {
    listen 80;
    server_name example.com;

    location /api {
      proxy_pass http://api:3000;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_hide_header Cache-Control;

      proxy_cache_bypass $http_upgrade;
      proxy_http_version 1.1;
      proxy_redirect off;

      add_header Cache-Control no-cache;
    }

    location / {
      root /usr/share/nginx/html;
      index index.html;
    }
  }
}
```

启动容器:

```shell
$ docker-compose up -d
```

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

### Vercel 部署

使用 Vercel 部署的优势在于：

- 无需自己购买服务器
- 无需配置环境依赖
- 无需配置代理
- 无需配置 https 证书
- 公网访问，即开即用

点击下方按钮，即可将本项目一键部署到 Vercel 上

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fovnrain%2Fjavbus-api&project-name=javbus-api&repository-name=javbus-api-from-ovnrain)

> **Note**
>
> **部署在美国地区的 Vercel 上，JavBus 会跳转到登录页面，导致本程序无法获取数据，请使用其他地区的 Vercel。设置方法：在 Vercel 项目的 `Settings` -> `Functions` 中选择除美国以外的地区，如日本、香港等**

## 权限校验

> **Note**
>
> **本项目默认不开启权限校验，即任何人都可以访问。如果项目部署在公网上，建议开启权限校验，以防止被恶意访问**

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
$ curl -H "j-auth-token: your_token" http://localhost:8922/api/stars/okq
```

使用 `Wget`

```shell
$ wget --header="j-auth-token: your_token" http://localhost:8922/api/stars/okq
```

使用 [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

```http
GET http://localhost:8922/api/stars/okq HTTP/1.1
j-auth-token: your_token
```

关于 Docker、Node.js 的环境变量设置方式，请参考上面的部署方法。Vercel 设置环境变量可以在项目的 `Settings` -> `Environment Variables` 中设置

> **Note**
>
> **只设置 `JAVBUS_AUTH_TOKEN` 环境变量是不安全的，用户依然可以通过不加 `j-auth-token` 请求头，或者在浏览器中直接访问 API。因此，应该同时设置 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 环境变量，以达到双重校验的目的**

## API 文档

### /api/movies

获取影片列表

#### method

GET

#### 参数

| 参数        | 是否必须 | 可选值                                                                       | 默认值   | 说明                                                                                                                                                              |
| ----------- | -------- | ---------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| page        | 否       |                                                                              | `1`      | 页码                                                                                                                                                              |
| magnet      | 否       | `exist`<br />`all`                                                           | `exist`  | `exist`: 只返回有磁力链接的影片<br />`all`: 返回全部影片                                                                                                          |
| filterType  | 否       | `star`<br />`genre`<br />`director`<br />`studio`<br />`label`<br />`series` |          | 筛选类型，必须与 `filterValue` 一起使用<br />`star`: 演员<br />`genre`: 类别<br />`director`: 导演<br />`studio`: 制作商<br />`label`: 发行商<br />`series`: 系列 |
| filterValue | 否       |                                                                              |          | 筛选值，必须与 `filterType` 一起使用                                                                                                                              |
| type        | 否       | `normal`<br />`uncensored`                                                   | `normal` | `normal`: 有码影片<br />`uncensored`: 无码影片                                                                                                                    |

#### 请求举例

    /api/movies

返回有磁力链接的第一页影片

    /api/movies?filterType=star&filterValue=rsv&magnet=all

返回演员 ID 为 `rsv` 的影片的第一页，包含有磁力链接和无磁力链接的影片

    /api/movies?page=2&filterType=genre&filterValue=4

返回类别 ID 为 `4` 的影片的第二页，只返回有磁力链接的影片

    /api/movies?type=uncensored

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

### /api/movies/search

搜索影片

#### method

GET

#### 参数

| 参数    | 是否必须 | 可选值                     | 默认值   | 说明                                                     |
| ------- | -------- | -------------------------- | -------- | -------------------------------------------------------- |
| keyword | 是       |                            |          | 搜索关键字                                               |
| page    | 否       |                            | `1`      | 页码                                                     |
| magnet  | 否       | `exist`<br />`all`         | `exist`  | `exist`: 只返回有磁力链接的影片<br />`all`: 返回全部影片 |
| type    | 否       | `normal`<br />`uncensored` | `normal` | `normal`: 有码影片<br />`uncensored`: 无码影片           |

#### 请求举例

    /api/movies/search?keyword=三上

搜索关键词为 `三上` 的影片的第一页，只返回有磁力链接的影片

    /api/movies/search?keyword=三上&magnet=all

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

### /api/movies/{movieId}

获取影片详情

#### method

GET

#### 请求举例

    /api/movies/SSIS-406

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
  ],
  // 同类影片
  "similarMovies": [
    {
      "id": "SNIS-477",
      "title": "クレーム処理会社の女社長 土下座とカラダで解決します 夢乃あいか",
      "img": "https://www.javbus.com/pics/thumb/4wml.jpg"
    }
    // ...
  ],
  "gid": "50217160940",
  "uc": "0"
}
```

</details>

### /api/magnets/{movieId}

获取影片磁力链接

#### method

GET

#### 参数

| 参数      | 是否必须 | 可选值             | 默认值 | 说明                                            |
| --------- | -------- | ------------------ | ------ | ----------------------------------------------- |
| gid       | 是       |                    |        | 从影片详情获取到的 `gid`                        |
| uc        | 是       |                    |        | 从影片详情获取到的 `uc`                         |
| sortBy    | 否       | `date`<br />`size` | `size` | 按照日期或大小排序，必须与 `sortOrder` 一起使用 |
| sortOrder | 否       | `asc`<br />`desc`  | `desc` | 升序或降序，必须与 `sortBy` 一起使用            |

#### 请求举例

    /api/magnets/SSNI-730?gid=42785257471&uc=0

返回番号为 `SSNI-730` 的影片的磁力链接

    /api/magnets/SSNI-730?gid=42785257471&uc=0&sortBy=size&sortOrder=asc

返回番号为 `SSNI-730` 的影片的磁力链接，并按照大小升序排序

    /api/magnets/SSNI-730?gid=42785257471&uc=0&sortBy=date&sortOrder=desc

返回番号为 `SSNI-730` 的影片的磁力链接，并按照日期降序排序

#### 返回举例

<details>
<summary>点击展开</summary>

```jsonc
[
  {
    "id": "17508BF5C17CBDF7C77E12DAAD1BDAB325116585",
    "link": "magnet:?xt=urn:btih:17508BF5C17CBDF7C77E12DAAD1BDAB325116585&dn=SSNI-730-C",
    // 是否高清
    "isHD": true,
    "title": "SSNI-730-C",
    "size": "6.57GB",
    // bytes
    "numberSize": 7054483783,
    "shareDate": "2021-03-14",
    // 是否包含字幕
    "hasSubtitle": true
  }
  // ...
]
```

</details>

### /api/stars/{starId}

获取演员详情

#### method

GET

#### 参数

| 参数 | 是否必须 | 可选值                     | 默认值   | 说明                                                           |
| ---- | -------- | -------------------------- | -------- | -------------------------------------------------------------- |
| type | 否       | `normal`<br />`uncensored` | `normal` | `normal`: 有码影片演员详情<br />`uncensored`: 无码影片演员详情 |

#### 请求举例

    /api/stars/2xi

返回演员 `葵つかさ` 的详情

    /api/stars/2jd?type=uncensored

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

## Star 趋势 <!-- omit in toc -->

[![Stargazers over time](https://starchart.cc/ovnrain/javbus-api.svg?variant=adaptive)](https://starchart.cc/ovnrain/javbus-api)
