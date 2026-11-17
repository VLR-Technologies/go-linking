import { brandService } from '@/lib/product/providers';
import {
  failure,
  jsonInput,
  requireAdmin,
  sameOrigin,
} from '@/lib/product/http';
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await brandService.list(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    return Response.json(await brandService.save(await jsonInput(request)), {
      status: 201,
    });
  } catch (e) {
    return failure(e);
  }
}
