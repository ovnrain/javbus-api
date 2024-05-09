import type { NextRequest } from 'next/server';
import { getMoviesByPage } from '../../lib/javbusParser';
import { moviesPageSchema } from '../../lib/schemas';
import { handleRouteError } from '../../lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const { page, magnet, type, filterType, filterValue } = moviesPageSchema.parse(
      Object.fromEntries(searchParams),
    );

    return Response.json(await getMoviesByPage(page, magnet, type, filterType, filterValue));
  } catch (e) {
    const { errorResponse, status } = handleRouteError(e);

    return Response.json(errorResponse, { status });
  }
}
