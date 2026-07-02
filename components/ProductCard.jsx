import Link from "next/link";
import { FreeShipBadge, SoldOutBadge, DiscountBadge, FeaturedBadge, ConditionBadge } from "./Badge";

// Product Card สไตล์ Shopee (กริด 2 คอลัมน์บนมือถือ) + Zara/COS/Apple (คลีน มินิมอล พรีเมียม)
// หมายเหตุ: ไม่มี rating/ยอดขายบนการ์ด เพราะระบบยังไม่มีข้อมูลรีวิว/ยอดขายจริงในฐานข้อมูล
// (ไม่ใส่ตัวเลขปลอมเพื่อความน่าเชื่อถือของร้าน)
export default function ProductCard({ product, lineLink }) {
  const cover = product.images?.[0] || "/uploads/sample/placeholder.svg";
  const isSoldOut = product.status === "soldout";
  const hasSale = Boolean(product.originalPrice) && Number(product.originalPrice) > Number(product.price);

  return (
    <div className="product-card group flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-lightgray">
        <img
          src={cover}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105 ${
            isSoldOut ? "grayscale opacity-70" : ""
          }`}
        />

        {/* ป้ายมุมซ้ายบน: ร้านแนะนำ / ส่งฟรี */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {product.featured && !isSoldOut && <FeaturedBadge />}
          <FreeShipBadge />
        </div>

        {/* ป้ายส่วนลด มุมขวาบน — สีแดงตาม spec */}
        {!isSoldOut && (
          <div className="absolute top-2 right-2">
            <DiscountBadge price={product.price} originalPrice={product.originalPrice} />
          </div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <SoldOutBadge />
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-1.5 p-2.5 sm:p-3.5 flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-[13px] sm:text-sm text-ink leading-snug line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>

        {product.condition && (
          <div>
            <ConditionBadge condition={product.condition} />
          </div>
        )}

        <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
          <p className={`font-semibold text-base sm:text-lg ${hasSale ? "text-salered" : "text-ink"}`}>
            ฿{Number(product.price).toLocaleString()}
          </p>
          {hasSale && (
            <p className="text-graytext text-xs line-through">
              ฿{Number(product.originalPrice).toLocaleString()}
            </p>
          )}
        </div>

        <Link
          href={`/products/${product.id}`}
          className="mt-1.5 inline-flex items-center justify-center min-h-touch w-full border border-ink text-ink text-xs font-medium rounded-lg py-2 transition-colors hover:bg-ink hover:text-white active:scale-[0.98]"
        >
          ดูสินค้า
        </Link>
      </div>
    </div>
  );
}
