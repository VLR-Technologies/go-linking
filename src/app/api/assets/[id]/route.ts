import { assetStorage, brandService } from '@/lib/product/providers';
import { authorized } from '@/lib/product/http';
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (process.env.NODE_ENV !== 'development')
    return new Response(null, { status: 404 });
  if (
    !(await authorized()) &&
    !(await brandService.list()).some(
      (b) => b.status === 'published' && b.logo === `/api/assets/${id}`,
    )
  )
    return new Response(null, { status: 404 });
  const asset = await assetStorage.read(id);
  if (!asset) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(asset.bytes), {
    headers: {
      'Content-Type': asset.contentType,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
