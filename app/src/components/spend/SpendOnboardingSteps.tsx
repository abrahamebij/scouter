"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";

interface Step {
  number: number;
  label: string;
  completed?: boolean;
  disabled?: boolean;
}

const steps: Step[] = [
  { number: 1, label: "Connect wallet", completed: true },
  { number: 2, label: "Verify identity" },
  { number: 3, label: "Create card", disabled: true },
  { number: 4, label: "Spend", disabled: true },
];

export default function SpendOnboardingSteps() {
  return (
    <div className="md:w-1/2 p-12 flex flex-col">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight mb-2">
          Spend your portfolio
        </h1>
        <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">
          Create your xPrime card
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8 mb-12">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex items-center space-x-4 ${step.disabled ? "opacity-40" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-label ${
                step.completed
                  ? "border border-primary text-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {step.number}
            </div>
            <div
              className={
                step.completed ? "text-on-surface font-medium" : "text-on-surface-variant"
              }
            >
              {step.label}
            </div>
            {step.completed ? (
              <MaterialIcon icon="check_circle" fill size="sm" className="text-primary ml-auto" />
            ) : null}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <button className="w-full primary-gradient text-on-primary font-headline font-extrabold py-5 rounded-full text-lg shadow-[0_12px_48px_rgba(78,242,180,0.3)] hover:shadow-[0_12px_64px_rgba(78,242,180,0.5)] transition-all duration-300 active:scale-95">
          Create xPrime Card
        </button>
        <p className="text-center text-on-surface-variant text-[10px] mt-6 px-4 font-label leading-relaxed">
          By continuing, you agree to the Sovereign Vault Terms of Service and Privacy Policy.
          Credit lines are subject to collateral ratios.
        </p>
      </div>
    </div>
  );
}
