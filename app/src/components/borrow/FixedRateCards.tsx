import Image from "next/image";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface FixedRateAsset {
  ticker: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  duration: string;
  upsideCap: string;
}

const assets: FixedRateAsset[] = [
  {
    ticker: "SPY",
    tag: "Stable",
    tagColor: "text-secondary",
    tagBg: "bg-secondary/10",
    duration: "90 Days",
    upsideCap: "+12.0%",
  },
  {
    ticker: "QQQ",
    tag: "Growth",
    tagColor: "text-secondary",
    tagBg: "bg-secondary/10",
    duration: "180 Days",
    upsideCap: "+18.0%",
  },
  {
    ticker: "TSLA",
    tag: "High Vol",
    tagColor: "text-error",
    tagBg: "bg-error/10",
    duration: "30 Days",
    upsideCap: "+25.0%",
  },
  {
    ticker: "NVDA",
    tag: "High Vol",
    tagColor: "text-error",
    tagBg: "bg-error/10",
    duration: "60 Days",
    upsideCap: "+22.0%",
  },
];

export default function FixedRateCards() {
  return (
    <section>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-2">
            Zero Cost Borrow
          </h2>
          <p className="text-on-surface-variant max-w-xl">
            Borrow for free using a{" "}
            <span className="text-secondary font-medium">Collar Strategy</span>. Give up
            upside beyond the cap in exchange for zero borrowing cost.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/20 shrink-0">
          <Image src="/protocols/sts.jpg" alt="STS Digital" width={20} height={20} className="rounded-full" unoptimized />
          <span className="text-xs font-bold text-secondary uppercase tracking-widest font-label">
            Routed via STS Digital
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {assets.map((asset) => (
          <div
            key={asset.ticker}
            className="bg-surface-container p-6 rounded-xl border border-outline-variant/10 hover:border-secondary/30 transition-all group"
          >
            <div className="mb-6">
              <span className="font-label font-black text-xl text-on-surface">{asset.ticker}</span>
            </div>

            <div className="space-y-4 mb-8">
              <MetricRow label="Borrow Cost" value="0%" valueClassName="text-lg font-bold text-primary" />
              <MetricRow label="Upside Cap" value={asset.upsideCap} />
              <MetricRow label="Duration" value={asset.duration} />
            </div>

            <button className="w-full bg-surface-container-highest py-2.5 rounded-lg text-on-surface font-bold text-sm group-hover:bg-secondary group-hover:text-on-secondary transition-all">
              Select Strategy
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-xs text-outline font-label">{label}</span>
      <span className={`text-sm font-label ${valueClassName}`}>{value}</span>
    </div>
  );
}
