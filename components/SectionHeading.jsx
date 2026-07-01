export default function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const alignClass = align === "left" ? "text-left items-start" : "text-center items-center";
  return (
    <div className={`flex flex-col ${alignClass} gap-3 mb-10`}>
      {eyebrow && (
        <span className="text-xs tracking-wide3 uppercase text-graytext">{eyebrow}</span>
      )}
      {title && (
        <h2 className="text-2xl md:text-3xl font-light tracking-wide2 text-ink">{title}</h2>
      )}
      {subtitle && <p className="text-graytext text-sm md:text-base max-w-xl">{subtitle}</p>}
    </div>
  );
}
