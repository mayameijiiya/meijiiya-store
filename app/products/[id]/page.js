import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getPublishedProducts, getSettings } from "@/lib/db";
import { StatusBadge, TagBadge, FreeShipBadge, SoldOutBadge, ConditionBadge, SizeBadge, DiscountBadge } from "@/components/Badge";
import LineButton from "@/components/LineButton";
import ProductGallery from "@/components/ProductGallery";
import NoticeBox from "@/components/NoticeBox";
import ProductCard from "@/components/ProductCard";
import Accordion from "@/components/Accordion";
import { buildOrderMessage } from "@/lib/line";

// ดึงข้อมูลสินค้าจาก Supabase ตรงๆ ทุกครั้ง ไม่ cache เด็ดขาด (ดู lib/supabase.js)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductDetailPage({ params }) {
  const settings = await getSettings();

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
    <div className="pb-28 md:pb-14">
      <div className="container-brand pt-4 md:pt-10">
        {/* Breadcrumb — ซ่อนบนมือถือเพื่อประหยัดพื้นที่ */}
        <div className="text-xs text-graytext mb-4 gap-2 flex-wrap hidden md:flex">
          <Link href="/" className="hover:text-ink">หน้าแรก</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-ink">สินค้าทั้งหมด</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="relative">
            <ProductGallery images={product.images} name={product.name} />
            {!isSoldOut && (
              <div className="absolute top-3 right-3 md:hidden">
                <DiscountBadge price={product.price} originalPrice={product.originalPrice} />
              </div>
            )}
          </div>

          {/* Product info card */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <FreeShipBadge />
              {isSoldOut ? <SoldOutBadge /> : <StatusBadge status={product.status} />}
              {product.condition && <ConditionBadge condition={product.condition} />}
              {product.tags?.slice(0, 3).map((t) => (
                <TagBadge key={t} tag={t} />
              ))}
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-ink leading-snug">{product.name}</h1>
              {product.brand && <p className="text-graytext text-sm mt-1">แบรนด์: {product.brand}</p>}
              {categories.length > 0 && <p className="text-graytext text-xs mt-1">{categories.join(" · ")}</p>}
            </div>

            <div className="flex items-baseline gap-3 border-y border-bordergray py-3">
              <p className={`text-2xl md:text-3xl font-semibold ${hasSale ? "text-salered" : "text-ink"}`}>
                ฿{Number(product.price).toLocaleString()}
              </p>
              {hasSale && (
                <>
                  <p className="text-graytext text-base line-through">
                    ฿{Number(product.originalPrice).toLocaleString()}
                  </p>
                  <DiscountBadge price={product.price} originalPrice={product.originalPrice} />
                </>
              )}
            </div>

            {/* ไซซ์ / สี / สภาพ / จำนวน */}
            <div className="flex flex-col gap-3 text-sm">
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
              <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                <DetailRow label="สีที่มี" value={product.colors?.join(", ") || "-"} />
                <DetailRow label="เนื้อผ้า" value={product.fabric || "-"} />
                {product.stock !== "" && product.stock !== null && product.stock !== undefined && (
                  <DetailRow label="จำนวนคงเหลือ" value={String(product.stock)} />
                )}
              </div>
            </div>

            {/* คำอธิบายสินค้า — Accordion */}
            <div className="border-t border-bordergray">
              <Accordion title="รายละเอียดสินค้า" defaultOpen>
                <p className="whitespace-pre-line">{product.description || "-"}</p>
              </Accordion>
              {product.measurements && (
                <Accordion title="สัดส่วนสินค้า / Measurements">
                  <p className="whitespace-pre-line">{product.measurements}</p>
                </Accordion>
              )}
              <Accordion title="วิธีสั่งซื้อ">
                <p>แคปรูปสินค้าที่ต้องการ แล้วส่งมาทาง LINE ร้าน พร้อมแจ้งสี/ไซซ์/จำนวนที่ต้องการ ร้านจะเช็กสินค้าและคอนเฟิร์มยอดให้ในแชท จัดส่งผ่านขนส่ง Shopee ส่งฟรีทุกออเดอร์</p>
              </Accordion>
            </div>

            <NoticeBox text="สีของสินค้าอาจแตกต่างจากรูปเล็กน้อยตามแสงและหน้าจอที่ใช้ดู" />

            {/* ปุ่มสั่งซื้อ — เดสก์ท็อปแสดงในหน้าปกติ, มือถือใช้ sticky bar ด้านล่างแทน */}
            <div className="hidden md:flex flex-col gap-2">
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
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14 md:mt-20">
            <h2 className="text-base md:text-xl font-semibold text-ink mb-4 md:mb-6">สินค้าใกล้เคียง</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} lineLink={settings.lineLink} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom buy bar — มือถือเท่านั้น รองรับ iPhone safe area */}
      <div className="sticky-bottom-bar md:hidden flex items-center gap-2 px-4 py-2.5">
        <LineButton
          lineLink={settings.lineLink}
          label="แชท"
          variant="outline"
          className="!px-4 !py-0 !min-h-[48px] shrink-0"
        />
        <LineButton
          lineLink={settings.lineLink}
          message={buildOrderMessage(product)}
          label={isSoldOut ? "สินค้าหมดแล้ว" : "สั่งซื้อทาง LINE"}
          variant="primary"
          fullWidth
          disabled={isSoldOut}
          className="!min-h-[48px]"
        />
      </div>
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
