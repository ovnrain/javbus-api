import type { NextRequest } from 'next/server';
import { typeSchema } from '../../../lib/schemas';
import { getStarInfo } from '../../../lib/javbusParser';
import { handleRouteError } from '../../../lib/utils';

export async function GET(request: NextRequest, { params }: { params: { starId: string } }) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const { type } = typeSchema.parse(Object.fromEntries(searchParams));

    return Response.json(await getStarInfo(params.starId, type));
  } catch (e) {
    const { errorResponse, status } = handleRouteError(e);

    return Response.json(errorResponse, { status });
  }
}
