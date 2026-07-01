export default function NoticeBox({ text, className = "" }) {
  return (
    <div className={`brand-border bg-beige/40 px-5 py-4 text-sm text-ink/80 leading-relaxed ${className}`}>
      <span className="font-medium text-ink">หมายเหตุ: </span>
      {text}
    </div>
  );
}
