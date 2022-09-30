# JavBus API <!-- omit in toc -->

一个自我托管的 [JavBus](https://www.javbus.com) API 服务

## 目录 <!-- omit in toc -->

- [用途](#用途)
- [使用](#使用)
  - [Docker 部署（推荐）](#docker-部署推荐)
  - [node.js 部署](#nodejs-部署)
- [API 文档](#api-文档)
  - [/api/v1/movies](#apiv1movies)
    - [参数](#参数)
    - [请求举例](#请求举例)
    - [返回举例](#返回举例)
  - [/api/v1/movies/search](#apiv1moviessearch)
    - [参数](#参数-1)
    - [请求举例](#请求举例-1)
    - [返回举例](#返回举例-1)
  - [/api/v1/movies/{id}](#apiv1moviesid)
    - [请求举例](#请求举例-2)
    - [返回举例](#返回举例-2)
  - [/api/v1/stars/{id}](#apiv1starsid)
    - [请求举例](#请求举例-3)
    - [返回举例](#返回举例-3)

## 用途

- 可以用来搭建自己的视频信息网站
- 可以作为移动端 App 的 API 服务
- 可以作为爬虫的数据源
- 可以用来制作 iOS/macOS 快捷指令
- 等等...

## 使用

**注意：本程序仅仅是 JavBus 的一个在线转换服务，因此不依赖数据库服务，每个请求会实时请求 JavBus 对应的网页，解析之后返回对应的 json 数据**

所以需要您保证部署的机器有访问 JavBus 的能力，否则请求会失败

### Docker 部署（推荐）

```shell
$ docker pull ovnrain/javbus-api
$ docker run --name javbus-api -d --restart unless-stopped -p 8080:3000 ovnrain/javbus-api
```

启动一个 Docker 容器，并将其名称设置为 `javbus-api`，端口设置为 `8080`，并且自动重启

### node.js 部署

```shell
$ git clone https://github.com/ovnrain/javbus-api.git
$ cd javbus-api
$ npm install
$ npm run build
$ echo "PORT=8080" > .env # 可选，默认端口为 `3000`
$ npm start
```

在浏览器中访问 [http://localhost:8080/api/v1/movies?page=1&magnet=exist](http://localhost:8080/api/v1/movies?page=1&magnet=exist) 即可获取结果

以上两种方式都可以配合 nginx 代理一起使用，以实现 https 访问等，例如

```nginx
location /api {
  proxy_pass http://localhost:8080;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
  add_header cache-control "no-cache";
}
```

## API 文档

### /api/v1/movies

获取影片列表

#### 参数

| 参数   | 是否必须 | 可选值             | 说明                                                     |
| ------ | -------- | ------------------ | -------------------------------------------------------- |
| page   | 是       |                    | 页码                                                     |
| magnet | 是       | `exist`<br />`all` | `exist`: 只返回有磁力链接的影片<br />`all`: 返回全部影片 |
| starId | 否       |                    | 演员 ID，不可以与 `tagId` 同时使用                       |
| tagId  | 否       |                    | 标签 ID，不可以与 `starId` 同时使用                      |

#### 请求举例

    /api/v1/movies?page=1&magnet=exist

返回有磁力链接的第一页影片

    /api/v1/movies?page=1&starId=2xi&magnet=all

返回 starId 为 `2xi` 的影片的第一页，包含有磁力链接和无磁力链接的影片

    /api/v1/movies?page=2&tagId=2t&magnet=exist

返回 tagId 为 `2t` 的影片的第二页，只返回有磁力链接的影片

#### 返回举例

<details>
<summary>json</summary>

```json
{
  // 影片列表
  "movies": [
    {
      "date": "2022-07-21",
      "id": "DLDSS-097",
      "img": "https://www.javbus.com/pics/thumb/915m.jpg",
      "title": "谷間を魅せつけ視線で誘惑。僕の思春期、毎日セックスをしてくれた姉が今…",
      "tags": ["高清", "昨日新種"]
    }
    // ...
  ],
  // 分页信息
  "pagination": {
    "currentPage": 1,
    "hasNextPage": true,
    "nextPage": 2,
    "pages": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  // 演员信息，注意：只有在请求参数包含 starId 时才会返回
  "star": {
    "avatar": "https://www.javbus.com/pics/actress/2xi_a.jpg",
    "id": "2xi",
    "name": "葵つかさ",
    "birthday": "1990-08-14",
    "age": "31",
    "height": "163cm",
    "bust": "88cm",
    "waistline": "58cm",
    "hipline": "86cm",
    "birthplace": "大阪府",
    "hobby": "ジョギング、ジャズ鑑賞、アルトサックス、ピアノ、一輪車"
  },
  // 标签信息，注意：只有在请求参数包含 tagId 时才会返回
  "tag": {
    "tagId": "2t",
    "tagName": "花癡"
  }
}
```

</details>

### /api/v1/movies/search

搜索影片

#### 参数

| 参数    | 是否必须 | 可选值             | 说明                                                     |
| ------- | -------- | ------------------ | -------------------------------------------------------- |
| keyword | 是       |                    | 搜索关键字                                               |
| page    | 是       |                    | 页码                                                     |
| magnet  | 是       | `exist`<br />`all` | `exist`: 只返回有磁力链接的影片<br />`all`: 返回全部影片 |

#### 请求举例

    /api/v1/movies/search?keyword=三上&page=1&magnet=exist

搜索关键词为 `三上` 的影片的第一页，只返回有磁力链接的影片

    /api/v1/movies/search?keyword=三上&page=1&magnet=all

搜索关键词为 `三上` 的影片的第一页，包含有磁力链接和无磁力链接的影片

#### 返回举例

<details>
<summary>json</summary>

```json
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

#### 请求举例

    /api/v1/movies/SSIS-406

返回番号为 `SSIS-406` 的影片详情

#### 返回举例

<details>
<summary>json</summary>

```json
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
    "directorId": "hh",
    "directorName": "五右衛門"
  },
  "producer": {
    "producerId": "7q",
    "producerName": "エスワン ナンバーワンスタイル"
  },
  "publisher": {
    "publisherId": "9x",
    "publisherName": "S1 NO.1 STYLE"
  },
  "series": {
    "seriesId": "xx",
    "seriesName": "xx"
  },
  "tags": [
    {
      "tagId": "e",
      "tagName": "巨乳"
    }
    // ...
  ],
  // 演员信息，一部影片可能包含多个演员
  "stars": [
    {
      "starId": "2xi",
      "starName": "葵つかさ"
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

#### 请求举例

    /api/v1/stars/2xi

返回演员 `葵つかさ` 的详情

#### 返回举例

<details>
<summary>json</summary>

```json
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
