"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        scrolled ? "top-2" : "top-4"
      )}
    >
      <div
        className={cn(
          "glass rounded-full px-6 py-3 flex items-center gap-8 transition-all duration-300",
          scrolled && "shadow-glass"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-tv-pink-500 to-neon-pink blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            <span className="relative text-xl font-bold font-mono text-gradient-pink">
              NullRift
            </span>
          </div>
        </Link>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-mono text-white/70 hover:text-white transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-tv-pink-500 to-neon-pink group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          variant="glass-pink"
          size="sm"
          className="ml-2"
          asChild
        >
          <Link href="/builder">
            Try Free
          </Link>
        </Button>
      </div>
    </motion.nav>
  );
};

// Made with Bob