"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { PricingTable } from "@/components/ui/pricing-table";
import type { BillingCycle } from "@/components/ui/pricing-table";
import { PRICING_TABLE_PLANS } from "@/config/pricing-table-plans";

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [activePlanId, setActivePlanId] = useState<string | undefined>("pro");

  const handleSelectPlan = (planId: string) => {
    setActivePlanId(planId);
    if (planId === "enterprise") {
      window.location.href = "mailto:sales@nullrift.dev";
      return;
    }
    router.push("/builder");
  };

  return (
    <main className="relative min-h-screen bg-deep-space">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-tv-pink-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-tv-blue-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-foreground">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </motion.div>

          <PricingTable
            className="text-foreground"
            plans={PRICING_TABLE_PLANS}
            billingCycle={billingCycle}
            onCycleChange={setBillingCycle}
            onPlanSelect={handleSelectPlan}
            activePlanId={activePlanId}
            cycleToggleLabel="Toggle annual billing"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Made with Bob
