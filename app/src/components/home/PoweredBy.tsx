import Image from "next/image";

export default function PoweredBy() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
      <p className="text-[10px] font-label font-bold uppercase tracking-[0.3em] text-on-surface-variant">
        Powered By
      </p>
      <Image
        alt="xStocks Logo"
        className="h-8 md:h-10 w-auto"
        src="/xstocks-logo.png"
        width={200}
        height={40}
        unoptimized
      />
    </div>
  );
}
