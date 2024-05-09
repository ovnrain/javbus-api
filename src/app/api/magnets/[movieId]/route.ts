import type { NextRequest } from 'next/server';
import { magnetsSchema } from '../../../lib/schemas';
import { getMovieMagnets } from '../../../lib/javbusParser';
import { handleRouteError } from '../../../lib/utils';

export async function GET(
  request: NextRequest,
  { params: { movieId } }: { params: { movieId: string } },
) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const { gid, uc, sortBy, sortOrder } = magnetsSchema.parse(Object.fromEntries(searchParams));

    return Response.json(await getMovieMagnets({ movieId, gid, uc, sortBy, sortOrder }));
  } catch (e) {
    const { errorResponse, status } = handleRouteError(e);

    return Response.json(errorResponse, { status });
  }
}
