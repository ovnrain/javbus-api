export interface MoviesPageQuery {
  [key: string]: string;
  magnet: 'all' | 'exist';
  page: string;
}

export interface MoviesStarAndPageQuery extends MoviesPageQuery {
  starId: string;
}

export interface MoviesTagAndPageQuery extends MoviesPageQuery {
  tagId: string;
}

export interface MoviesSearchQuery {
  [key: string]: string;
  keyword: string;
  magnet: 'all' | 'exist';
  page: string;
}

export interface Movie {
  date: string | null;
  title: string;
  id: string;
  img: string | null;
  tags: string[];
}

export interface MovieTag {
  tagId: string;
  tagName: string;
}

export interface MovieStar {
  starId: string;
  starName: string;
}

export interface Magnet {
  link: string;
  isHD: boolean;
  title: string;
  size: string | null;
  numberSize: number | null;
  shareDate: string | null;
  hasSubtitle: boolean;
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface Sample {
  alt: string | null;
  id: string;
  thumbnail: string;
  src: string | null;
}

export interface MovieDetail {
  id: string;
  title: string;
  img: string | null;
  date: string | null;
  videoLength: number | null;
  director: { directorId: string; directorName: string } | null;
  producer: { producerId: string; producerName: string } | null;
  publisher: { publisherId: string; publisherName: string } | null;
  series: { seriesId: string; seriesName: string } | null;
  tags: MovieTag[];
  stars: MovieStar[];
  magnets: Magnet[];
  imageSize: ImageSize | null;
  samples: Sample[];
}

export interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  nextPage: number | null;
  pages: number[];
}

export interface MoviesPage {
  movies: Movie[];
  pagination: Pagination;
}

export interface StarInfo {
  avatar: string | null;
  id: string;
  name: string;
  birthday: string | null;
  age: number | null;
  height: number | null;
  /* 胸围 */
  bust: string | null;
  /* 腰围 */
  waistline: string | null;
  /* 臀围 */
  hipline: string | null;
  birthplace: string | null;
  hobby: string | null;
}

export interface StarMoviesPage extends MoviesPage {
  starInfo: StarInfo;
}

export interface TagMoviesPage extends MoviesPage {
  tagInfo: MovieTag;
}

export interface SearchMoviesPage extends MoviesPage {
  keyword: string;
}
