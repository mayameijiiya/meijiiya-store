import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getPublishedProducts, getSettings } from "@/lib/db";
import { StatusBadge, TagBadge, FreeShipBadge, SoldOutBadge, ConditionBadge, SizeBadge } from "@/components/Badge";
import LineButton from "@/components/LineButton";
import ProductGallery from "@/components/ProductGallery";
import NoticeBox from "@/components/NoticeBox";
import ProductCard from "@/components/ProductCard";
import { buildOrderMessage } from "@/lib/line";

// ดึงข้อมูลสินค้าจาก Supabase ตรงๆ ทุกครั้ง ไม่ cache เด็ดขาด (ดู lib/supabase.js)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductDetailPage({ params }) {
  const settings = getSettings();

  let product;
  try {
    product = await getProductById(params.id);
  } catch (err) {
    console.error("[ProductDetailPage] getProductById failed:", err);
    throw new Error("ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
  }

  if (!product || product.published === false) {
    notFound();
  }

  const isSoldOut = product.status === "soldout";
  const hasSale = Boolean(product.originalPrice) && Number(product.originalPrice) > Number(product.price);
  const categories = product.categories?.length ? product.categories : product.category ? [product.category] : [];

  let related = [];
  try {
    const published = await getPublishedProducts();
    related = published
      .filter((p) => p.id !== product.id && p.categories?.some((c) => categories.includes(c)))
      .slice(0, 4);
  } catch (err) {
    console.error("[ProductDetailPage] getPublishedProducts (related) failed:", err);
  }

  return (
    <div className="container-brand py-12">
      {/* Breadcrumb */}
      <div className="text-xs text-graytext mb-6 flex gap-2 flex-wrap">
        <Link href="/" className="hover:text-ink">หน้าแรก</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-ink">สินค้าทั้งหมด</Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 flex-wrap">
            <FreeShipBadge />
            {isSoldOut ? <SoldOutBadge /> : <StatusBadge status={product.status} />}
            {product.condition && <ConditionBadge condition={product.condition} />}
            {product.tags?.map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-medium text-ink">{product.name}</h1>
            {product.brand && <p className="text-graytext text-sm mt-1">แบรนด์: {product.brand}</p>}
            {categories.length > 0 && (
              <p className="text-graytext text-xs mt-1">{categories.join(" · ")}</p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <p className="text-2xl text-ink font-medium">{Number(product.price).toLocaleString()} บาท</p>
            {hasSale && (
              <p className="text-graytext text-base line-through">
                {Number(product.originalPrice).toLocaleString()} บาท
              </p>
            )}
          </div>

          <p className="text-ink/80 leading-relaxed text-sm">{product.description}</p>

          {/* LINE ordering block — วางใกล้ราคาและรายละเอียดสินค้า */}
          <div className="brand-border bg-beige/30 p-5 flex flex-col gap-3 rounded-xl2">
            <p className="text-sm text-ink/80 leading-relaxed">
              {isSoldOut
                ? "สินค้าชิ้นนี้หมดแล้วค่ะ ทัก LINE สอบถามรอบผลิตใหม่หรือสินค้าใกล้เคียงได้เลย"
                : "ชอบสินค้าชิ้นนี้ แคปรูปแล้วส่งมาทาง LINE ได้เลยค่ะ ร้านจะเช็กสี ไซซ์ และคอนเฟิร์มยอดให้ในแชท จัดส่งผ่านขนส่ง Shopee ส่งฟรีทุกออเดอร์"}
            </p>
            <LineButton
              lineLink={settings.lineLink}
              message={buildOrderMessage(product)}
              label="สั่งซื้อทาง LINE"
              variant="primary"
              fullWidth
              disabled={isSoldOut}
            />
            {!isSoldOut && (
              <p className="text-xs text-graytext text-center">
                กดปุ่มนี้จะคัดลอกข้อความสั่งซื้อไว้ให้ วางในแชท LINE ได้เลย
              </p>
            )}
          </div>

          {/* รายละเอียดเชิงเทคนิค */}
          <div className="flex flex-col gap-4 text-sm border-t border-hairline pt-5">
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <DetailRow label="สีที่มี" value={product.colors?.join(", ") || "-"} />
              <DetailRow label="เนื้อผ้า" value={product.fabric || "-"} />
            </div>

            {product.sizes?.length > 0 && (
              <div>
                <span className="text-graytext text-xs block mb-1.5">ไซซ์ที่มี</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <SizeBadge key={s} size={s} />
                  ))}
                </div>
              </div>
            )}

            {product.measurements && (
              <div>
                <span className="text-graytext text-xs block mb-1.5">สัดส่วนสินค้า</span>
                <p className="text-ink whitespace-pre-line leading-relaxed">{product.measurements}</p>
              </div>
            )}
          </div>

          <NoticeBox text="สีของสินค้าอาจแตกต่างจากรูปเล็กน้อยตามแสงและหน้าจอที่ใช้ดู" />

          <p className="text-xs text-graytext">
            วิธีสั่งซื้อ: แคปรูปสินค้าที่ต้องการ แล้วส่งมาทาง LINE ร้าน พร้อมแจ้งสี/ไซซ์/จำนวนที่ต้องการ
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-light tracking-wide2 text-ink mb-6">สินค้าใกล้เคียง</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} lineLink={settings.lineLink} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-graytext text-xs">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
