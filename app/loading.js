export default function Loading() {
  return (
    <div className="container-brand py-24 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
        <p className="text-graytext text-sm">กำลังโหลด...</p>
      </div>
    </div>
  );
}
