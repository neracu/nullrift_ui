import type { TablePricingPlan } from "@/components/ui/pricing-table";

export const PRICING_TABLE_PLANS: TablePricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for trying out NullRift UI",
    buttonText: "Start Free",
    features: [
      { id: "free-f1", name: "5 components per month", included: true },
      { id: "free-f2", name: "Basic AI generation", included: true },
      { id: "free-f3", name: "React export only", included: true },
      { id: "free-f4", name: "Community support", included: true },
      { id: "free-f5", name: "Public projects", included: true },
      { id: "free-f6", name: "Private projects", included: false },
      { id: "free-f7", name: "Team collaboration", included: false },
      { id: "free-f8", name: "SSO & SAML", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "For professional developers",
    buttonText: "Start Pro Trial",
    isRecommended: true,
    features: [
      { id: "pro-f1", name: "Unlimited components", included: true },
      { id: "pro-f2", name: "Advanced AI generation", included: true },
      { id: "pro-f3", name: "React, Vue & HTML export", included: true },
      { id: "pro-f4", name: "Priority support", included: true },
      { id: "pro-f5", name: "Private projects", included: true },
      { id: "pro-f6", name: "Custom themes", included: true },
      { id: "pro-f7", name: "Team collaboration", included: true },
      { id: "pro-f8", name: "SSO & SAML", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "For teams and organizations",
    buttonText: "Contact Sales",
    features: [
      { id: "ent-f1", name: "Everything in Pro", included: true },
      { id: "ent-f2", name: "Dedicated support", included: true },
      { id: "ent-f3", name: "Custom AI training", included: true },
      { id: "ent-f4", name: "SSO & SAML", included: true },
      { id: "ent-f5", name: "White-label option", included: true },
      { id: "ent-f6", name: "SLA guarantee", included: true },
      { id: "ent-f7", name: "Custom integrations", included: true },
      { id: "ent-f8", name: "On-premise deployment", included: true },
    ],
  },
];

// Made with Bob
