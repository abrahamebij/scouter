export default function SpendCardVisual() {
  return (
    <div className="md:w-1/2 bg-surface-container p-12 flex flex-col items-center justify-center space-y-12 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none card-texture" />

      {/* Card */}
      <div className="relative w-80 h-48 bg-surface-container-lowest rounded-2xl shadow-2xl p-6 flex flex-col justify-between border border-outline-variant/20 group hover:scale-105 transition-transform duration-500 cursor-default">
        <div className="flex justify-between items-start">
          <div className="text-primary-fixed-dim font-headline font-black text-xl tracking-tighter">
            xPrime
          </div>
          <div className="w-10 h-6 bg-surface-container-high rounded flex items-center justify-center">
            <svg viewBox="0 0 24 12" className="w-6 h-3 text-on-surface-variant/60" fill="currentColor">
              <rect x="0" y="2" width="8" height="8" rx="1" opacity="0.6" />
              <rect x="6" y="2" width="8" height="8" rx="1" opacity="0.4" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <div className="w-10 h-8 bg-gradient-to-br from-tertiary-fixed-dim to-outline rounded-md opacity-30" />
          <div className="text-on-surface font-label tracking-widest text-lg pt-4">
            &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8892
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[8px] uppercase font-label text-on-surface-variant tracking-widest">
              Card Holder
            </div>
            <div className="text-xs font-semibold tracking-wide text-on-surface">
              INSTITUTIONAL PARTNER
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] uppercase font-label text-on-surface-variant tracking-widest">
              Expires
            </div>
            <div className="text-xs font-semibold text-on-surface">12/28</div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="space-y-4 text-center relative z-10">
        <h3 className="font-headline text-2xl font-bold">Unrivaled Liquid Power</h3>
        <p className="text-on-surface-variant text-sm max-w-xs mx-auto leading-relaxed">
          Spend your portfolio instantly at over 100M+ merchants worldwide with sovereign credit
          lines.
        </p>
      </div>
    </div>
  );
}
