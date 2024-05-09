import type { NextRequest } from 'next/server';
import { searchMoviesPageSchema } from '../../../lib/schemas';
import { getMoviesByKeywordAndPage } from '../../../lib/javbusParser';
import { handleRouteError } from '../../../lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const { page, magnet, type, keyword } = searchMoviesPageSchema.parse(
      Object.fromEntries(searchParams),
    );

    return Response.json(await getMoviesByKeywordAndPage(keyword, page, magnet, type));
  } catch (e) {
    const { errorResponse, status } = handleRouteError(e);

    return Response.json(errorResponse, { status });
  }
}
