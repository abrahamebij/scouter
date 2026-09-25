import { Metadata } from "next";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Authentication | Scouter Developer Documentation",
  description:
    "Learn how to authenticate requests to Scouter REST API and SDK using secret keys.",
};

export default function DocsAuthenticationPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-label uppercase tracking-widest text-accent font-semibold">
          Developer Platform
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
          API Authentication
        </h1>
        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
          Secure your API calls using wallet-generated secret tokens.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
        <h2 className="text-base font-headline font-semibold text-on-surface">
          API Keys Overview
        </h2>
        <p>
          Scouter uses secret API keys prefixed with <code className="font-mono text-accent">scouter_live_</code> to authenticate requests. Each key is cryptographically tied to your verified Solana wallet identity and can be revoked instantly from the Dashboard.
        </p>

        <h2 className="text-base font-headline font-semibold text-on-surface pt-2">
          HTTP Request Authentication
        </h2>
        <p>
          Authenticate HTTP requests by sending your key in the <code className="font-mono text-on-surface">Authorization</code> header with the <code className="font-mono text-accent">Bearer</code> scheme:
        </p>
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 font-mono text-xs text-on-surface">
          Authorization: Bearer scouter_live_abcdef0123456789...
        </div>

        <h2 className="text-base font-headline font-semibold text-on-surface pt-2">
          cURL Example
        </h2>
        <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 font-mono text-xs text-on-surface overflow-x-auto">
{`curl -X GET "https://scouter-tool.vercel.app/api/markets/openai" \\
     -H "Authorization: Bearer scouter_live_..." \\
     -H "Accept: application/json"`}
        </pre>

        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 space-y-2">
          <div className="flex items-center gap-2 font-headline font-semibold text-xs text-on-surface">
            <MaterialIcon icon="shield" size="sm" className="text-accent" />
            <span>Key Handling Best Practices</span>
          </div>
          <ul className="space-y-1.5 text-xs text-on-surface-variant list-disc pl-4">
            <li>Keep secret keys on backend servers or serverless functions only.</li>
            <li>Do not commit keys to Git or public code repositories.</li>
            <li>Do not store keys in <code className="font-mono text-on-surface">localStorage</code> or client-side bundles.</li>
            <li>If a key is accidentally exposed, revoke it immediately from <Link href="/dashboard/settings/api-keys" className="text-accent underline">API Keys Settings</Link>.</li>
          </ul>
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/15 flex justify-between items-center text-xs">
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center gap-1.5 font-headline text-on-surface-variant hover:text-on-surface"
        >
          <MaterialIcon icon="arrow_back" size="sm" />
          <span>Quickstart</span>
        </Link>
        <Link
          href="/docs/api"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold hover:brightness-95 transition-all shadow-sm"
        >
          <span>Next: REST API Reference</span>
          <MaterialIcon icon="arrow_forward" size="sm" />
        </Link>
      </div>
    </div>
  );
}
