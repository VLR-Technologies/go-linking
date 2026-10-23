import { assetStorage } from '@/lib/product/providers';
import { failure, requireAdmin, sameOrigin } from '@/lib/product/http';
import { inspectImage, maxUpload } from '@/lib/product/local-assets';
import { ProductError } from '@/lib/product/validation';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const mime = request.headers.get('content-type') || '';
    const name = decodeURIComponent(request.headers.get('x-filename') || '');
    const reader = request.body?.getReader();
    if (!reader) throw new ProductError('Choose an image.');
    const chunks = [];
    let size = 0;
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > maxUpload) {
        await reader.cancel();
        throw new ProductError('Logo must be under 3 MB.', 413);
      }
      chunks.push(part.value);
    }
    const bytes = Buffer.concat(chunks);
    const extension = inspectImage(bytes, mime, name);
    return Response.json({ url: await assetStorage.save(bytes, extension) });
  } catch (e) {
    return failure(e);
  }
}
