import Image from "next/image";

const insights = [
  {
    category: "Market Report",
    title: "The Case for Tech-Buffered Yield",
    description:
      "Why current volatility makes buffer strategies ideal for NASDAQ-heavy portfolios.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAY3boh8VpFmV5ksGsYooK716HA84fgtcGqAOaROtwLNvDJBJPq7sIjRYgJjFHNgGYyQJ3eLt-nyD9GWeF-AbPMJVsHObSQMYxi_nG1DGSKFcMetIqhTklIAexYlo8SNkkNi5pxdZ5Yp1az2l9aN5-0Na_1VMxQ8ptRh4Q9BNhwq0WlhcZJBeVe87gd_HHnsQgrDMQEQD6VcioTVzqGvORe37M8Bm9_WzT9tb4klAmRw1hfOGkXvBqi9T5_gRGhxiGWqFTcZoGbC5QL",
  },
  {
    category: "Product News",
    title: "Introducing S&P 500 Leveraged Delta",
    description:
      "Capture 2x upside with a fixed max loss floor. New vault opening in 48 hours.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAzto1f_BilkYs-BQw9r_l7z0J8dFz4umwIPEUhdT5-G7B-7emqLUmjqArvcN57B2aTWaOxmEJOlIhpX77eD0bMXfvRFndu-IdMvfXE9klz4ouslBt4pbMua-xU4I5IJFN1nleVpjWLT5bbAM9NChc_L4IOBf8TVnhASm4VOYZrdvkDc6m7b8SnrZPATQQDtUO1popQeqKs9N84SFHguLurUnQ9hwrHZvPdx1o6PDZ9UIrutg5ReMtFRMH7o_QJZo4XMrF5qjX8d5jJ",
  },
  {
    category: "Vault Education",
    title: "Demystifying Iron Condor Vaults",
    description:
      "How our automated agent manages range-bound trades during earnings season.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnzyvPfvmso9tNSb27ZT1tHkXmpgCArlWvHjpB0cN9G2MAbV1Kpm83Fdtm4O1PSwZyjo4NtT6laX0Q57CsAJBUzIY12Bfv3P46YdIMrJCrNyplkEmd--A5yGZWtsQeA2BFvIuaxMqzeqWKYAsE7Fs1XZ8GZMvsKMDhPSCYhOY6hvs5OtCy1NYCHs5u0n2EKBQxn3Tq3M3p2tVA2V2772oduMFr8TrVfwFLlbSUH1LOe6yffQAfLgdss5nGZV953Dx9ggQV2aWLEvRd",
  },
];

export default function StrategyInsights() {
  return (
    <section className="max-w-[1440px] mx-auto px-8 mt-32">
      <h2 className="font-headline text-3xl font-bold mb-12">
        Latest Strategy Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {insights.map((insight) => (
          <div key={insight.title} className="group cursor-pointer">
            <div className="h-64 rounded-xl overflow-hidden mb-6 bg-surface-container relative">
              <Image
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                alt={insight.title}
                src={insight.image}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <span className="font-label text-[10px] text-primary uppercase tracking-[0.2em] mb-3 block">
              {insight.category}
            </span>
            <h3 className="font-headline text-xl font-bold group-hover:text-primary transition-colors mb-2">
              {insight.title}
            </h3>
            <p className="font-body text-sm text-on-surface-variant">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
