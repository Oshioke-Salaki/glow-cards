"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Gift,
  Zap,
  Users,
  ChevronRight,
  MousePointer2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  const glowOpacity = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.4, 0.8, 0.4],
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as any,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="w-full relative min-h-screen bg-[#050505] overflow-x-hidden selection:bg-emerald-500/30 text-white font-sans"
    >
      {/* Liquid Mesh Background SCULPTED IN CSS */}
      <motion.div
        style={{ y: backgroundY }}
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      >
        <motion.div
          style={{ opacity: glowOpacity }}
          className="absolute top-[-20%] left-[-10%] w-[100vw] h-[100vw] bg-radial-gradient from-indigo-500/10 via-transparent to-transparent blur-[120px]"
        />
        <div className="absolute top-[20%] right-[-10%] w-[80vw] h-[80vw] bg-radial-gradient from-emerald-500/5 via-transparent to-transparent blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-radial-gradient from-blue-500/5 via-transparent to-transparent blur-[130px]" />

        {/* Architectural Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:100px_100px]" />
      </motion.div>

      <main className="relative z-10">
        {/* Ultra-Minimalist Navigation */}
        <header className="fixed top-0 w-full px-6 md:px-12 py-8 flex justify-between items-center z-50 mix-blend-difference">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4"
          >
            <div className="text-lg font-black tracking-tighter uppercase">
              Glow<span className="text-emerald-400 font-medium">Cards</span>
            </div>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex items-center gap-8"
          >
            <Link href="/wallet" className="group flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">
                Portal
              </span>
              <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-emerald-400 transition-colors" />
            </Link>
          </motion.div> */}
        </header>

        {/* Hero Section: The Architectural Statement */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-[1px] w-8 bg-emerald-500/50" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">
                Next-Generation Gifting
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-[clamp(2.5rem,8vw,5.5rem)] font-black tracking-[-0.04em] leading-[0.9] mb-10"
            >
              THE GIFT THAT <br />
              <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-white/20">
                GROWS FOREVER.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-lg text-lg md:text-xl text-white/40 leading-tight font-medium mb-12 text-pretty"
            >
              Send meaningful digital gifts on the Flow blockchain. While your
              recipient waits to discover it, their GlowCard accumulates real
              compound yield.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-5"
            >
              <Link href="/app">
                <Button className="h-16 px-10 bg-white text-black hover:bg-emerald-50 transition-all rounded-full font-black text-base group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    START CREATING{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </Link>

              <Link href="/wallet" className="group">
                <div className="flex items-center gap-3 py-4 px-6 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all">
                  <MousePointer2 className="w-4 h-4 text-white/30 group-hover:text-emerald-400 rotate-12" />
                  <span className="text-xs font-bold tracking-[0.1em] text-white/50">
                    ACCESS LEDGER
                  </span>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Glassmorphism 2.0 Feature Section */}
        <section className="py-60 px-8 md:px-24 max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as any }}
              className="space-y-12"
            >
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                BUILT FOR <br />
                <span className="text-emerald-400">LONGEVITY.</span>
              </h2>
              <p className="text-lg md:text-xl text-white/50 leading-relaxed font-medium">
                Standard gifts lose value instantly. GlowCards grow. By
                leveraging Increment Fi's yield protocols, your gift earns ~5%
                APR, compounding in real-time within an immutable Flow escrow.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 pt-8">
                {[
                  { label: "PROTOCOL", value: "FLOW + INCREMENT" },
                  { label: "BASE APR", value: "5.00%" },
                  { label: "LATENCY", value: "RELIANT" },
                  { label: "SECURITY", value: "IMMUTABLE" },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                      {stat.label}
                    </p>
                    <p className="text-lg font-mono font-medium text-white/90">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* The Code-Sculpted Material Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] as any }}
              className="relative aspect-square w-full max-w-lg mx-auto lg:mr-4 xl:mr-8"
            >
              {/* Layered Glass Cards Effect */}
              <div className="absolute inset-0 flex items-center justify-center lg:justify-end">
                {[30, 20, 10, 0].map((offset, i) => (
                  <motion.div
                    key={i}
                    style={{
                      x: offset * -1.5,
                      y: offset * -1.5,
                      zIndex: 10 - i,
                      backdropFilter: `blur(${10 + i * 5}px)`,
                    }}
                    className="absolute w-[85%] sm:w-full max-w-[420px] aspect-[1.586/1] rounded-[32px] sm:rounded-[40px] border border-white/10 bg-white/5 shadow-2xl overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-50" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />

                    {i === 0 && (
                      <div className="p-8 sm:p-10 h-full flex flex-col justify-between relative z-10 w-full">
                        <div className="flex justify-between items-start w-full">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] sm:text-[10px] font-black text-white/20 tracking-[0.4em]">
                              LEDGER ID
                            </p>
                            <p className="font-mono text-xs sm:text-sm text-white/60 mt-1">
                              0x829...F4A
                            </p>
                          </div>
                        </div>

                        <div className="w-full">
                          <p className="text-[9px] sm:text-[10px] font-black text-emerald-400 tracking-[0.4em] mb-2 sm:mb-4">
                            ACTIVE BALANCE
                          </p>
                          <div className="text-4xl sm:text-5xl lg:text-5xl font-black tracking-tighter tabular-nums text-white">
                            ₣ 842.<span className="text-white/20">92</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Closing Architecture */}
        <section className="py-40 px-8 text-center relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as any }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-5xl md:text-8xl font-black tracking-tightest leading-[0.9] mb-16 cursor-default selection:text-emerald-400 uppercase">
              Secure <br /> the <br /> Future.
            </h2>

            <Link href="/app">
              <Button className="h-20 px-16 bg-emerald-500 text-black hover:bg-emerald-400 transition-all rounded-full font-black text-xl shadow-[0_40px_100px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 duration-500">
                LOCKED & LIVE
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Footer: Precise & Quiet */}
        <footer className="py-20 px-8 md:px-24 border-t border-white/5 bg-black/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-2 space-y-8">
              <div className="text-xl font-black uppercase tracking-tighter">
                GLOW<span className="text-emerald-400">CARDS</span>
              </div>
              <p className="text-white/30 text-sm max-w-xs leading-relaxed">
                A high-fidelity digital gifting protocol designed for longevity
                and growth. Built on the Flow blockchain.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/20">
                Ecosystem
              </p>
              <div className="flex flex-col gap-4 text-sm font-medium text-white/40">
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  FLOW NETWORK
                </a>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  INCREMENT FI
                </a>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  MAGIC AUTH
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/20">
                Legal
              </p>
              <div className="flex flex-col gap-4 text-sm font-medium text-white/40">
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  PRIVACY
                </a>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  TERMS
                </a>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  AUDITS
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8 items-center text-[10px] font-bold uppercase tracking-[0.5em] text-white/10">
            <p>© 2026 GLOWCARDS PROTOCOL</p>
            <p>DESIGNED IN ARCHITECTURE</p>
          </div>
        </footer>
      </main>

      {/* Dynamic Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] contrast-150 brightness-150 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-soft-light" />
    </div>
  );
}
