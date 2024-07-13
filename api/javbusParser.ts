import bytes from 'bytes';
import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';
import probe from 'probe-image-size';
import client, { agent } from './client.js';
import { JAVBUS } from './constants.js';
import type {
  FilterType,
  ImageSize,
  Magnet,
  MagnetType,
  Movie,
  MovieDetail,
  MoviesPage,
  MovieType,
  Property,
  Sample,
  SearchMoviesPage,
  SimilarMovie,
  SortBy,
  SortOrder,
  StarInfo,
} from './types.js';
import { formatImageUrl, PAGE_REG } from './utils.js';

type StarInfoRequiredKey = 'avatar' | 'id' | 'name';

type StarInfoOptionalKey = Exclude<keyof StarInfo, StarInfoRequiredKey>;

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
    .filter((movie): movie is Movie => Boolean(movie.id))
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

export function parseFilterInfo(pageHTML: string, type: FilterType, value: string) {
  const doc = parse(pageHTML);
  const name =
    doc.querySelector('title')?.textContent.match(/^(?:第\d+?頁 - )?(.+?) - /)?.[1] ?? '';

  return { name, type, value };
}

export async function getMoviesByPage(
  page: string,
  magnet?: MagnetType,
  type?: MovieType,
  filerType?: FilterType,
  filteValue?: string,
) {
  let prefix = !type || type == 'normal' ? JAVBUS : `${JAVBUS}/${type}`;
  prefix = filerType ? `${prefix}/${filerType}` : prefix;
  const url =
    page === '1'
      ? filerType
        ? `${prefix}/${filteValue}`
        : prefix
      : filerType
        ? `${prefix}/${filteValue}/${page}`
        : `${prefix}/page/${page}`;

  const res = await client(url, {
    headers: { Cookie: `existmag=${magnet === 'exist' ? 'mag' : 'all'}` },
  }).text();

  const moviesPage = parseMoviesPage(res);
  const filterInfo =
    filerType && filteValue ? parseFilterInfo(res, filerType, filteValue) : undefined;

  return { ...moviesPage, filter: filterInfo };
}

export async function getMoviesByKeywordAndPage(
  keyword: string,
  page = '1',
  magnet?: MagnetType,
  type?: MovieType,
): Promise<SearchMoviesPage> {
  const prefix = !type || type === 'normal' ? `${JAVBUS}/search` : `${JAVBUS}/${type}/search`;
  const url = `${prefix}/${encodeURIComponent(keyword)}/${page}&type=1`;

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
      const firstAnchor = tr.querySelector('td a');
      const tagAnchors = firstAnchor?.querySelectorAll('a');

      const link = firstAnchor?.getAttribute('href') ?? '';
      const id = link?.match(/magnet:\?xt=urn:btih:(\w+)/)?.[1] ?? '';

      const isHD = Boolean(tagAnchors?.find((a) => a.textContent.includes('高清')));
      const hasSubtitle = Boolean(tagAnchors?.find((a) => a.textContent.includes('字幕')));

      if (tagAnchors?.length) {
        tagAnchors.forEach((a) => {
          a.remove();
        });
      }

      const title = firstAnchor?.textContent.trim() ?? '';
      const size = tr.querySelector('td:nth-child(2) a')?.textContent.trim() ?? null;
      const numberSize = size ? bytes(size) : null;
      const shareDate = tr.querySelector('td:nth-child(3) a')?.textContent.trim() ?? null;

      return { id, link, isHD, title, size, numberSize, shareDate, hasSubtitle };
    })
    .filter(({ id, link, title }) => id && link && title)
    .sort((a, b) => (a.numberSize && b.numberSize ? b.numberSize - a.numberSize : 0));

  return magnets;
}

export async function getMovieMagnets(params: {
  movieId: string;
  gid: string;
  uc: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
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

  const magnets = convertMagnetsHTML(magnetsRes);

  if (params.sortBy && params.sortOrder) {
    const { sortBy, sortOrder } = params;

    magnets.sort((a, b) => {
      if (sortBy === 'date') {
        if (a.shareDate && b.shareDate) {
          const aDate = new Date(a.shareDate).getTime();
          const bDate = new Date(b.shareDate).getTime();

          return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }
      } else if (sortBy === 'size') {
        if (a.numberSize && b.numberSize) {
          return sortOrder === 'asc' ? a.numberSize - b.numberSize : b.numberSize - a.numberSize;
        }
      }
      return 0;
    });
  }

  return magnets;
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
  prefix: string,
): { id: string; name: string } | null {
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
  const name = link.textContent.trim();

  if (!id || !name) {
    return null;
  }

  return { id, name };
}

function multipleInfoFinder<T>(
  infoNodes: HTMLElement[],
  type: string,
  genreFilter: (genre: HTMLElement) => boolean,
  infoNodeGetter: (genre: HTMLElement) => HTMLElement | null,
  mapper?: (info: { id: string; name: string }) => T,
) {
  const infos =
    infoNodes
      .find((info) => info.querySelectorAll('.genre').filter(genreFilter).length > 0)
      ?.querySelectorAll('.genre')
      ?.map<Property>((genre) => {
        const node = infoNodeGetter(genre);
        const href = node?.getAttribute('href');
        const isUncensored = href?.includes('uncensored') ?? false;
        const computedType = isUncensored ? `uncensored/${type}` : type;
        let id = node?.getAttribute('href')?.replace(`${JAVBUS}/${computedType}/`, '') ?? '';
        id = id && isUncensored ? `uncensored/${id}` : id;
        const name = node?.textContent ?? '';
        return { id, name };
      })
      .filter(({ id, name }) => Boolean(id) && Boolean(name)) ?? [];
  return mapper ? infos.map<T>(mapper) : infos;
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
    try {
      const { width, height } = await probe(img, {
        agent,
        headers: {
          Referer: 'https://www.javbus.com/',
        },
      });
      imageSize = { width, height };
    } catch (e) {
      //
    }
  }

  /* ----------------- 基本信息 ------------------ */
  const infoNodes = doc.querySelectorAll('.container .movie .info p');

  const date = textInfoFinder(infoNodes, '發行日期:');
  const videoLength = textInfoFinder(infoNodes, '長度:', '分鐘');
  const numberVideoLength = videoLength ? Number(videoLength) : null;
  const director = linkInfoFinder(infoNodes, '導演:', 'director');
  const producer = linkInfoFinder(infoNodes, '製作商:', 'studio');
  const publisher = linkInfoFinder(infoNodes, '發行商:', 'label');
  const series = linkInfoFinder(infoNodes, '系列:', 'series');
  const genres = multipleInfoFinder<Property>(
    infoNodes,
    'genre',
    (genre) => !genre.hasAttribute('onmouseover'),
    (genre) => genre.querySelector('label a'),
  );
  const stars = multipleInfoFinder<Property>(
    infoNodes,
    'star',
    (genre) => genre.hasAttribute('onmouseover'),
    (genre) => genre.querySelector('a'),
  );

  /* ----------------- 磁力链接 ------------------ */
  const gidReg = /var gid = (\d+);/;
  const ucReg = /var uc = (\d+);/;

  const gid = res.match(gidReg)?.[1] ?? null;
  const uc = res.match(ucReg)?.[1] ?? null;

  /* ----------------- 样品图片 ------------------ */
  const samples = doc
    .querySelectorAll('#sample-waterfall .sample-box')
    .map<Sample>((box) => {
      const img = box.querySelector('.photo-frame img');
      const thumbnail = formatImageUrl(img?.getAttribute('src')) ?? '';
      const filename = thumbnail.split('/').pop();
      const id = filename?.match(/(\S+)\.(jpe?g|png|webp|gif)$/i)?.[1] ?? '';
      const alt = img?.getAttribute('title') ?? null;
      const src = formatImageUrl(box.getAttribute('href')) ?? null;
      return {
        alt,
        id,
        src,
        thumbnail,
      };
    })
    .filter(({ id, thumbnail }) => Boolean(id) && Boolean(thumbnail));

  /* ----------------- 同类影片 ------------------ */
  const similarMovies =
    doc
      .querySelector('#related-waterfall')
      ?.querySelectorAll('a')
      .map((link) => {
        const href = link.getAttribute('href');

        const id = href?.split('/').pop();
        const title = link.getAttribute('title');
        const img = formatImageUrl(link.querySelector('img')?.getAttribute('src')) ?? null;

        return { id, title, img };
      })
      .filter((movie): movie is SimilarMovie => Boolean(id) && Boolean(title)) ?? [];

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
    genres,
    stars,
    samples,
    similarMovies,
    gid,
    uc,
  };
}

export async function getStarInfo(starId: string, type?: MovieType): Promise<StarInfo> {
  const prefix = !type || type === 'normal' ? JAVBUS : `${JAVBUS}/${type}`;
  const url = `${prefix}/star/${starId}`;

  const res = await client(url).text();

  const starInfo = parseStarInfo(res, starId);

  return starInfo;
}
