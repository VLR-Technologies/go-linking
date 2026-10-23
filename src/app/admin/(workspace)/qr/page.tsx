import { requireAdminPage } from '@/lib/product/http';
import { brandService } from '@/lib/product/providers';
import { QRAssets } from '@/components/admin/QRAssets';
export default async function QR({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  await requireAdminPage();
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">FROM SCREEN TO CONNECTION</p>
          <h1>QR Assets.</h1>
          <p>Master destinations and individual channels, ready to review.</p>
        </div>
      </div>
      <QRAssets
        brands={await brandService.list()}
        selected={(await searchParams).brand}
      />
    </>
  );
}
