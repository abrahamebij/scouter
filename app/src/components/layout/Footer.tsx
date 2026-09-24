import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { href: "/trade", label: "Terminal" },
  { href: "/strategies", label: "Lending" },
  { href: "/strategies", label: "Strategies" },
];

const supportLinks = [
  { href: "#", label: "Documentation" },
  { href: "#", label: "Security Audit" },
  { href: "#", label: "System Status" },
];

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Risk Disclosure" },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant/10 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start px-12 w-full max-w-screen-2xl mx-auto gap-12">
        <div className="max-w-xs">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/xprime-logo.svg"
              alt="xPrime"
              width={120}
              height={30}
              className="h-6 w-auto"
              unoptimized
            />
          </Link>
          <p className="text-on-surface-variant/60 text-sm leading-relaxed mb-6 font-light">
            Unlock yield, leverage, and liquidity from your stock portfolio.
          </p>
          <p className="text-on-surface/40 font-label uppercase tracking-widest text-[10px]">
            &copy; 2026 xPrime. Powered by xStocks.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
          <div>
            <h4 className="text-on-surface font-bold text-xs uppercase tracking-widest mb-6 font-label">
              Product
            </h4>
            <div className="flex flex-col gap-4 text-sm text-on-surface-variant/60">
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-on-surface font-bold text-xs uppercase tracking-widest mb-6 font-label">
              Support
            </h4>
            <div className="flex flex-col gap-4 text-sm text-on-surface-variant/60">
              {supportLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-on-surface font-bold text-xs uppercase tracking-widest mb-6 font-label">
              Legal
            </h4>
            <div className="flex flex-col gap-4 text-sm text-on-surface-variant/60">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
