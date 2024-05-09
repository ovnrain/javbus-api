import type { NextRequest } from 'next/server';
import { getMovieDetail } from '../../../lib/javbusParser';
import { handleRouteError } from '../../../lib/utils';

export async function GET(_: NextRequest, { params }: { params: { movieId: string } }) {
  try {
    return Response.json(await getMovieDetail(params.movieId));
  } catch (e) {
    const { errorResponse, status } = handleRouteError(e);

    return Response.json(errorResponse, { status });
  }
}
