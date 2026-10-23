import { brandService } from '@/lib/product/providers';
import {
  failure,
  jsonInput,
  requireAdmin,
  sameOrigin,
} from '@/lib/product/http';
import { ProductError } from '@/lib/product/validation';
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    const brand = await brandService.get((await params).id);
    if (!brand) throw new ProductError('Brand not found.', 404);
    return Response.json(brand, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const data = await jsonInput(request);
    return Response.json(
      await brandService.save(
        data.brand,
        (await params).id,
        data.confirmSlug === true,
      ),
    );
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const data = await jsonInput(request);
    return Response.json(
      await brandService.transition((await params).id, data.status),
    );
  } catch (e) {
    return failure(e);
  }
}
