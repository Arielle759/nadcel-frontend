"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck2, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative flex min-h-[650px] overflow-hidden px-6 py-24 sm:px-10 lg:min-h-[720px] lg:px-16"
    >
      <Image
        src="/images/services/soin.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/45 via-transparent to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl items-center">
        <div className="max-w-3xl">
          <motion.span variants={itemVariants} transition={{ duration: 0.5 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-beige/20 bg-beige/10 px-4 py-2 text-sm font-medium text-beige backdrop-blur-sm">
            <Sparkles size={16} className="text-champagne" />
            La beauté à portée de clic
          </motion.span>
          <motion.h1 variants={itemVariants} transition={{ duration: 0.6, ease: "easeOut" }} className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-beige sm:text-6xl lg:text-7xl">
            Le bon salon, au bon moment, près de chez vous.
          </motion.h1>
          <motion.p variants={itemVariants} transition={{ duration: 0.6, ease: "easeOut" }} className="mt-6 max-w-2xl text-lg leading-8 text-beige/80 sm:text-xl">
            Découvrez des professionnels vérifiés et réservez votre prochain moment beauté simplement.
          </motion.p>
          <motion.div variants={itemVariants} transition={{ duration: 0.6, ease: "easeOut" }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/salons" className="inline-flex items-center justify-center gap-2 rounded-full bg-champagne px-7 py-3.5 font-semibold text-forest shadow-lg transition-all hover:-translate-y-0.5 hover:bg-beige">
              Trouver un salon
              <ArrowRight size={18} />
            </Link>
            <Link href="/devenir-partenaire" className="inline-flex items-center justify-center rounded-full border border-beige/35 bg-beige/10 px-7 py-3.5 font-semibold text-beige backdrop-blur-sm transition-colors hover:bg-beige/20">
              Je suis un professionnel
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} transition={{ duration: 0.6 }} className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-beige/75">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-champagne" />Salons vérifiés</span>
            <span className="inline-flex items-center gap-2"><CalendarCheck2 size={17} className="text-champagne" />Réservation simple</span>
            <span className="inline-flex items-center gap-2"><MapPin size={17} className="text-champagne" />Partout au Sénégal</span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
