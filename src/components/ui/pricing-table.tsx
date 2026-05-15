"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingTableFeature {
  id: string;
  name: string;
  included: boolean;
}

export interface TablePricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: PricingTableFeature[];
  isRecommended?: boolean;
  buttonText: string;
  disabled?: boolean;
}

export type BillingCycle = "monthly" | "annually";

export interface PricingTableProps extends React.ComponentPropsWithoutRef<"div"> {
  plans: TablePricingPlan[];
  billingCycle: BillingCycle;
  onPlanSelect: (planId: string) => void;
  cycleToggleLabel?: string;
  onCycleChange?: (cycle: BillingCycle) => void;
  activePlanId?: string;
}

interface BillingCycleToggleProps {
  billingCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  label?: string;
}

const BillingCycleToggle: React.FC<BillingCycleToggleProps> = ({
  billingCycle,
  onCycleChange,
  label = "Billing cycle",
}) => {
  const isMonthly = billingCycle === "monthly";

  const toggleCycle = () => {
    onCycleChange(isMonthly ? "annually" : "monthly");
  };

  return (
    <div className="flex items-center justify-center gap-3 p-4">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          isMonthly ? "text-primary" : "text-muted-foreground"
        )}
      >
        Monthly
      </span>
      <button
        type="button"
        onClick={toggleCycle}
        aria-label={label}
        aria-checked={!isMonthly}
        role="switch"
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          !isMonthly ? "bg-primary" : "bg-input"
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
            !isMonthly ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          !isMonthly ? "text-primary" : "text-muted-foreground"
        )}
      >
        Annually (Save 20%)
      </span>
    </div>
  );
};

interface PlanCardProps {
  plan: TablePricingPlan;
  billingCycle: BillingCycle;
  onPlanSelect: (planId: string) => void;
  isActive: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, billingCycle, onPlanSelect, isActive }) => {
  const price =
    billingCycle === "annually" ? Math.round(plan.price * 0.8) : plan.price;
  const cycleLabel = billingCycle === "annually" ? "/yr" : "/mo";

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border p-6 shadow-md transition-all duration-300 backdrop-blur-xl",
        "hover:shadow-lg hover:shadow-tv-pink-500/10",
        isActive
          ? "border-primary bg-white/10 ring-2 ring-primary/60"
          : "border-white/10 bg-white/5",
        plan.isRecommended && !isActive && "border-tv-pink-500/50 ring-1 ring-tv-pink-500/30"
      )}
    >
      {plan.isRecommended && (
        <div className="mb-4 self-start rounded-full bg-gradient-to-r from-tv-pink-500 to-neon-pink px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-glow-pink">
          Recommended
        </div>
      )}
      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
      <p className="mt-2 text-sm text-tv-blue-200/70">{plan.description}</p>
      <div className="my-6">
        <span className="text-4xl font-extrabold text-white">${price}</span>
        <span className="text-lg font-medium text-muted-foreground">{cycleLabel}</span>
        {billingCycle === "annually" && plan.price !== price && (
          <p className="mt-1 text-xs text-muted-foreground line-through">
            ${plan.price * 12} billed annually
          </p>
        )}
      </div>

      <ul className="mb-8 flex-grow space-y-3">
        {plan.features.map((feature) => (
          <li key={feature.id} className="flex items-center">
            {feature.included ? (
              <Check className="mr-3 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <X className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <span
              className={cn(
                "text-sm",
                feature.included ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => !plan.disabled && onPlanSelect(plan.id)}
        className={cn(
          "mt-auto w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-300",
          isActive || plan.isRecommended
            ? "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          plan.disabled && "cursor-not-allowed opacity-50"
        )}
        disabled={plan.disabled}
        aria-label={`Select ${plan.name} plan`}
      >
        {plan.buttonText}
      </button>
    </div>
  );
};

export function PricingTable({
  plans,
  billingCycle,
  onPlanSelect,
  onCycleChange,
  cycleToggleLabel,
  activePlanId,
  className,
  ...props
}: PricingTableProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl py-4 md:py-8", className)} {...props}>
      {onCycleChange && (
        <BillingCycleToggle
          billingCycle={billingCycle}
          onCycleChange={onCycleChange}
          label={cycleToggleLabel}
        />
      )}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            onPlanSelect={onPlanSelect}
            isActive={plan.id === activePlanId}
          />
        ))}
      </div>
    </div>
  );
}

// Made with Bob
