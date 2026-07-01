import Link from "next/link";
import { StatusBadge, TagBadge, FreeShipBadge, SoldOutBadge, ConditionBadge, SizeBadge } from "./Badge";
import LineButton from "./LineButton";
import { buildOrderMessage } from "@/lib/line";

export default function ProductCard({ product, lineLink }) {
  const cover = product.images?.[0] || "/uploads/sample/placeholder.svg";
  const isSoldOut = product.status === "soldout";
  const hasSale = Boolean(product.originalPrice) && Number(product.originalPrice) > Number(product.price);

  return (
    <div className="group flex flex-col bg-card rounded-xl2 brand-border overflow-hidden hover:shadow-soft hover:border-gold/40 transition-all duration-300">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-ivory">
        <img
          src={cover}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ${
            isSoldOut ? "grayscale opacity-70" : ""
          }`}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <FreeShipBadge />
          {hasSale && !isSoldOut && (
            <span className="text-[11px] tracking-wide2 uppercase px-2.5 py-1 bg-salered text-white rounded-sm">
              Sale
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          {isSoldOut ? <SoldOutBadge /> : <StatusBadge status={product.status} />}
        </div>
      </Link>

      <div className="flex flex-col gap-2 p-4 flex-1">
        {(product.tags?.length > 0 || product.condition) && (
          <div className="flex flex-wrap gap-1.5">
            {product.condition && <ConditionBadge condition={product.condition} />}
            {product.tags?.slice(0, 2).map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
        )}

        <Link href={`/products/${product.id}`}>
          <h3 className="text-ink font-medium leading-snug hover:text-gold transition-colors">{product.name}</h3>
        </Link>
        {product.brand && <p className="text-graytext text-xs -mt-1">{product.brand}</p>}
        <p className="text-graytext text-sm line-clamp-2">{product.shortDescription}</p>

        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-ink font-semibold">{Number(product.price).toLocaleString()} บาท</p>
          {hasSale && (
            <p className="text-graytext text-xs line-through">
              {Number(product.originalPrice).toLocaleString()} บาท
            </p>
          )}
        </div>

        {product.sizes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.slice(0, 4).map((s) => (
              <SizeBadge key={s} size={s} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <Link href={`/products/${product.id}`} className="btn-outline text-xs py-2.5">
            ดูรายละเอียด
          </Link>
          <LineButton
            lineLink={lineLink}
            message={buildOrderMessage(product)}
            label="สั่งซื้อทาง LINE"
            className="text-xs py-2.5"
            disabled={isSoldOut}
          />
        </div>
      </div>
    </div>
  );
}
