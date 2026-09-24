import Image from "next/image";
import MaterialIcon from "@/components/ui/MaterialIcon";

const benefits = [
  "Zero borrowing cost — no interest payments at all.",
  "You give up upside beyond the cap in exchange for free borrowing.",
  "Fixed duration matches your liquidity needs perfectly.",
];

export default function CollarExplainer() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-container-low rounded-xl p-10 border border-outline-variant/10">
      {/* Text Content */}
      <div className="lg:col-span-7">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-2xl font-headline font-bold text-on-surface">
            How Zero Cost Borrow Works
          </h3>
          <Image src="/protocols/sts.jpg" alt="STS Digital" width={28} height={28} className="rounded-full" unoptimized />
        </div>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
          Borrow at <span className="text-on-surface font-semibold">zero cost</span> by giving up
          some <span className="text-on-surface font-semibold italic">upside</span> (capping gains).
          Routed through <span className="text-secondary font-semibold">STS Digital</span> collar
          infrastructure.
        </p>
        <ul className="space-y-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <MaterialIcon icon="check_circle" className="text-primary shrink-0" />
              <span className="text-on-surface-variant">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Payoff Diagram */}
      <div className="lg:col-span-5 bg-surface-container p-8 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs text-outline uppercase tracking-widest font-label block mb-6 text-center">
            Collar Payoff Diagram
          </span>
          <div className="h-48 w-full relative">
            {/* Axes */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-outline-variant" />
            <div className="absolute bottom-0 left-0 h-full w-px bg-outline-variant" />

            {/* Payoff Line */}
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <line
                stroke="#3c4a42"
                strokeDasharray="2"
                strokeWidth="0.5"
                x1="0" x2="100" y1="80" y2="20"
              />
              <polyline
                fill="none"
                points="0,70 30,70 70,30 100,30"
                stroke="#66d4f6"
                strokeWidth="2"
              />
            </svg>

            {/* Labels */}
            <div className="absolute left-0 top-[65%] -translate-y-1/2 bg-surface-container px-2 py-1 border border-secondary/30 rounded text-[10px] text-secondary font-label">
              PUT FLOOR
            </div>
            <div className="absolute right-0 top-[35%] -translate-y-1/2 bg-surface-container px-2 py-1 border border-primary/30 rounded text-[10px] text-primary font-label">
              CALL CAP
            </div>
          </div>

          <div className="flex justify-between mt-4 text-[10px] font-label text-outline uppercase tracking-widest">
            <span>Price Down</span>
            <span>Price Up</span>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[60px] rounded-full" />
      </div>
    </div>
  );
}
