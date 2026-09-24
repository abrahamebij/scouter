import MaterialIcon from "@/components/ui/MaterialIcon";

const features = [
  {
    icon: "security",
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
    title: "Institutional Security",
    description:
      "Multi-sig custody and smart contract audits by top-tier firms ensure your xStocks are protected.",
  },
  {
    icon: "bolt",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    title: "Instant Liquidity",
    description:
      "Unlike traditional structured notes, our vaults offer weekly redemption cycles with no lock-ins.",
  },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 hover:bg-surface-container transition-colors"
        >
          <div
            className={`w-12 h-12 rounded-lg ${feature.iconBg} flex items-center justify-center mb-6`}
          >
            <MaterialIcon icon={feature.icon} className={feature.iconColor} />
          </div>
          <h4 className="font-headline text-lg font-bold mb-2">
            {feature.title}
          </h4>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
