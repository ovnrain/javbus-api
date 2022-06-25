import got from 'got';
import bytes from 'bytes';
import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';
import probe from 'probe-image-size';
import { JAVBUS_TIMEOUT, JAVBUS } from './constants';
import type {
  ImageSize,
  Magnet,
  Movie,
  MovieDetail,
  MoviesPage,
  MovieStar,
  MovieTag,
  Sample,
  SearchMoviesPage,
  StarInfo,
  StarMoviesPage,
  TagMoviesPage,
} from './types';
import { formatImageUrl, PAGE_REG } from './utils';

type StarInfoRequiredKey = 'avatar' | 'id' | 'name';

type StarInfoOptionalKey = Exclude<keyof StarInfo, StarInfoRequiredKey>;

const client = got.extend({
  timeout: {
    request: JAVBUS_TIMEOUT,
  },
});

const starInfoMap: Record<StarInfoOptionalKey, string> = {
  birthday: '生日: ',
  age: '年齡: ',
  height: '身高: ',
  bust: '胸圍: ',
  waistline: '腰圍: ',
  hipline: '臀圍: ',
  birthplace: '出生地: ',
  hobby: '愛好: ',
};

function parseMoviesPage(pageHTML: string, filter?: (movie: Movie) => boolean): MoviesPage {
  const doc = parse(pageHTML);

  const movies = doc
    .querySelectorAll('#waterfall #waterfall .item')
    .map((item) => {
      const img =
        formatImageUrl(item.querySelector('.photo-frame img')?.getAttribute('src')) ?? null;
      const title = item.querySelector('.photo-frame img')?.getAttribute('title') ?? '';
      const info = item.querySelectorAll('.photo-info date');
      const id = info[0]?.textContent;
      const date = info[1]?.textContent ?? null;
      const tags = item.querySelectorAll('.item-tag button').map((item) => item.textContent);

      return { date, id, img, title, tags };
    })
    .filter(({ id }) => Boolean(id))
    .filter((movie) => filter?.(movie) ?? true);

  const currentPage = Number(doc.querySelector('.pagination .active a')?.textContent ?? '1');
  const pages = doc
    .querySelectorAll('.pagination li a')
    .map((item) => item.textContent)
    .filter((n) => PAGE_REG.test(n))
    .map(Number);

  const hasNextPage = doc.querySelector('.pagination li #next') !== null;
  const nextPage = hasNextPage ? currentPage + 1 : null;

  return { movies, pagination: { currentPage, hasNextPage, nextPage, pages } };
}

export function parseStarInfo(pageHTML: string, starId: string): StarInfo {
  const doc = parse(pageHTML).querySelector('#waterfall .item .avatar-box');

  const avatar =
    formatImageUrl(doc?.querySelector('.photo-frame img')?.getAttribute('src')) ?? null;
  const name = doc?.querySelector('.photo-info .pb10')?.textContent ?? '';

  const infos = doc?.querySelectorAll('.photo-info p');

  const mapKeys = Object.keys(starInfoMap) as StarInfoOptionalKey[];

  const rest = mapKeys.reduce<Record<string, string | null>>((info, key) => {
    const mapValue = starInfoMap[key];
    const value =
      infos?.find((p) => p.textContent.includes(mapValue))?.textContent.replace(mapValue, '') ??
      null;

    info[key] = value;

    return info;
  }, {}) as Omit<StarInfo, StarInfoRequiredKey>;

  return {
    avatar,
    id: starId,
    name,
    ...rest,
  };
}

export function parseTagInfo(pageHTML: string, tagId: string): MovieTag {
  const doc = parse(pageHTML);
  const tagName =
    doc.querySelector('title')?.textContent.match(/^(?:第\d+?頁 - )?(.+?) - /)?.[1] ?? '';

  return { tagId, tagName };
}

export async function getMoviesByPage(page: string, magnet?: 'all' | 'exist'): Promise<MoviesPage> {
  const url = page === '1' ? JAVBUS : `${JAVBUS}/page/${page}`;

  const res = await client(url, {
    headers: { Cookie: `existmag=${magnet === 'exist' ? 'mag' : 'all'}` },
  }).text();

  return parseMoviesPage(res);
}

export async function getMoviesByStarAndPage(
  starId: string,
  page = '1',
  magnet?: 'all' | 'exist',
  isViewSingle?: boolean
): Promise<StarMoviesPage> {
  const url = page === '1' ? `${JAVBUS}/star/${starId}` : `${JAVBUS}/star/${starId}/${page}`;

  const res = await client(url, {
    headers: { Cookie: `existmag=${magnet === 'exist' ? 'mag' : 'all'}` },
  }).text();

  const starInfo = parseStarInfo(res, starId);
  const moviesPage = parseMoviesPage(res, (movie) =>
    isViewSingle ? movie.title.includes(starInfo.name) : true
  );

  return { ...moviesPage, starInfo };
}

export async function getMoviesByTagAndPage(
  tagId: string,
  page = '1',
  magnet?: 'all' | 'exist'
): Promise<TagMoviesPage> {
  const url = page === '1' ? `${JAVBUS}/genre/${tagId}` : `${JAVBUS}/genre/${tagId}/${page}`;

  const res = await client(url, {
    headers: { Cookie: `existmag=${magnet === 'exist' ? 'mag' : 'all'}` },
  }).text();

  const moviesPage = parseMoviesPage(res);
  const tagInfo = parseTagInfo(res, tagId);

  return { ...moviesPage, tagInfo };
}

export async function getMoviesByKeywordAndPage(
  keyword: string,
  page = '1',
  magnet?: 'all' | 'exist'
): Promise<SearchMoviesPage> {
  const url = `${JAVBUS}/search/${encodeURIComponent(keyword)}/${page}&type=1`;

  const res = await client(url, {
    headers: { Cookie: `existmag=${magnet === 'exist' ? 'mag' : 'all'}` },
  }).text();

  const moviesPage = parseMoviesPage(res);

  return { ...moviesPage, keyword };
}

export function convertMagnetsHTML(html: string) {
  const doc = parse(html);

  const magnets = doc
    .querySelectorAll('tr')
    .map<Magnet>((tr) => {
      const link = tr.querySelector('td a')?.getAttribute('href') ?? '';
      const isHD = Boolean(
        tr
          .querySelector('td')
          ?.querySelectorAll('a')
          .find((a) => a.textContent.includes('高清'))
      );
      const hasSubtitle = Boolean(
        tr
          .querySelector('td')
          ?.querySelectorAll('a')
          .find((a) => a.textContent.includes('字幕'))
      );
      const title = tr.querySelector('td a')?.textContent.trim() ?? '';
      const size = tr.querySelector('td:nth-child(2) a')?.textContent.trim() ?? null;
      const numberSize = size ? bytes(size) : null;
      const shareDate = tr.querySelector('td:nth-child(3) a')?.textContent.trim() ?? null;

      return { link, isHD, title, size, numberSize, shareDate, hasSubtitle };
    })
    .filter(({ link, title }) => link && title)
    .sort((a, b) => bytes.parse(b.size ?? '') - bytes.parse(a.size ?? ''));

  return magnets;
}

export async function getMovieMagnets(params: {
  movieId: string;
  gid: string;
  uc: string;
}): Promise<Magnet[]> {
  const { movieId, gid, uc } = params;

  const magnetsRes = await client(`${JAVBUS}/ajax/uncledatoolsbyajax.php`, {
    searchParams: {
      lang: 'zh',
      gid,
      uc,
    },
    headers: {
      referer: `${JAVBUS}/${movieId}`,
    },
  }).text();

  return convertMagnetsHTML(magnetsRes);
}

function textInfoFinder(infos: HTMLElement[], text: string, excludeText?: string): string | null {
  const info =
    infos
      .find((info) => info.querySelector('.header')?.textContent.includes(text))
      ?.lastChild?.textContent.trim() ?? null;
  if (excludeText) {
    return info?.replace(excludeText, '') ?? null;
  }
  return info;
}

function linkInfoFinder(
  infos: HTMLElement[],
  text: string,
  prefix: string
): { id: string; title: string } | null {
  const link = infos
    .find((info) => info.querySelector('.header')?.textContent.includes(text))
    ?.querySelector('a');

  if (!link) {
    return null;
  }

  const href = link.getAttribute('href');
  const isUncensored = href?.includes('uncensored') ?? false;
  const computedPrefix = isUncensored ? `uncensored/${prefix}` : prefix;
  let id = link.getAttribute('href')?.replace(`${JAVBUS}/${computedPrefix}/`, '') ?? '';
  id = id && isUncensored ? `uncensored/${id}` : id;
  const title = link.textContent.trim();

  if (!id || !title) {
    return null;
  }

  return { id, title };
}

function multipleInfoFinder<T>(
  infos: HTMLElement[],
  type: string,
  genreFilter: (genre: HTMLElement) => boolean,
  infoNodeGetter: (genre: HTMLElement) => HTMLElement | null,
  mapper: (info: { infoId: string; infoName: string }) => T
): T[] {
  return (
    infos
      .find((info) => info.querySelectorAll('.genre').filter(genreFilter).length > 0)
      ?.querySelectorAll('.genre')
      ?.map((genre) => {
        const node = infoNodeGetter(genre);
        const href = node?.getAttribute('href');
        const isUncensored = href?.includes('uncensored') ?? false;
        const computedType = isUncensored ? `uncensored/${type}` : type;
        let infoId = node?.getAttribute('href')?.replace(`${JAVBUS}/${computedType}/`, '') ?? '';
        infoId = infoId && isUncensored ? `uncensored/${infoId}` : infoId;
        const infoName = node?.textContent ?? '';
        return { infoId, infoName };
      })
      .filter(({ infoId, infoName }) => Boolean(infoId) && Boolean(infoName)) ?? []
  ).map(mapper);
}

export async function getMovieDetail(id: string): Promise<MovieDetail> {
  const res = await client(`${JAVBUS}/${id}`).text();
  const doc = parse(res);

  /* ----------------- 标题、图片 ------------------ */
  const title = doc.querySelector('.container h3')?.textContent ?? '';
  const img =
    formatImageUrl(doc.querySelector('.container .movie .bigImage img')?.getAttribute('src')) ??
    null;

  let imageSize: ImageSize | null = null;

  if (img) {
    const { width, height } = await probe(img);
    imageSize = { width, height };
  }

  /* ----------------- 基本信息 ------------------ */
  const infos = doc.querySelectorAll('.container .movie .info p');

  const date = textInfoFinder(infos, '發行日期:');
  const videoLength = textInfoFinder(infos, '長度:', '分鐘');
  const numberVideoLength = videoLength ? Number(videoLength) : null;
  const directorInfo = linkInfoFinder(infos, '導演:', 'director');
  const director = directorInfo && {
    directorId: directorInfo.id,
    directorName: directorInfo.title,
  };
  const producerInfo = linkInfoFinder(infos, '製作商:', 'studio');
  const producer = producerInfo && {
    producerId: producerInfo.id,
    producerName: producerInfo.title,
  };
  const publisherInfo = linkInfoFinder(infos, '發行商:', 'label');
  const publisher = publisherInfo && {
    publisherId: publisherInfo.id,
    publisherName: publisherInfo.title,
  };
  const seriesInfo = linkInfoFinder(infos, '系列:', 'series');
  const series = seriesInfo && {
    seriesId: seriesInfo.id,
    seriesName: seriesInfo.title,
  };
  const tags = multipleInfoFinder<MovieTag>(
    infos,
    'genre',
    (genre) => !genre.hasAttribute('onmouseover'),
    (genre) => genre.querySelector('label a'),
    ({ infoId, infoName }) => ({
      tagId: infoId,
      tagName: infoName,
    })
  );
  const stars = multipleInfoFinder<MovieStar>(
    infos,
    'star',
    (genre) => genre.hasAttribute('onmouseover'),
    (genre) => genre.querySelector('a'),
    ({ infoId, infoName }) => ({
      starId: infoId,
      starName: infoName,
    })
  );

  /* ----------------- 磁力链接 ------------------ */
  const gidReg = /var gid = (\d+);/;
  const ucReg = /var uc = (\d+);/;

  const gid = res.match(gidReg)?.[1] ?? null;
  const uc = res.match(ucReg)?.[1] ?? null;

  const magnets = gid && uc ? await getMovieMagnets({ movieId: id, gid, uc }) : [];

  /* ----------------- 样品图片 ------------------ */
  const samples = doc
    .querySelectorAll('#sample-waterfall .sample-box')
    .map<Sample>((box) => {
      const img = box.querySelector('.photo-frame img');
      const thumbnail = formatImageUrl(img?.getAttribute('src')) ?? '';
      const id = thumbnail.match(/\/(?:pics|imgs)\/sample\/(.+)\.[a-z]+$/)?.[1] ?? '';
      const alt = img?.getAttribute('title') ?? null;
      const src = formatImageUrl(box.getAttribute('href')) ?? null;
      return {
        alt,
        id,
        src,
        thumbnail,
      };
    })
    .filter(({ id, src, thumbnail }) => Boolean(id) && Boolean(thumbnail));

  return {
    id,
    title,
    img,
    imageSize,
    date,
    videoLength: numberVideoLength,
    director,
    producer,
    publisher,
    series,
    tags,
    stars,
    magnets,
    samples,
  };
}
