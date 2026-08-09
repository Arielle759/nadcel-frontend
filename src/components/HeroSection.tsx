"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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
      className="relative flex min-h-[520px] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center sm:min-h-[600px] sm:px-16 sm:py-32"
    >
      <Image
        src="/images/services/soin.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />

      <motion.h1
        variants={itemVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-2xl text-4xl font-semibold tracking-tight text-beige sm:text-5xl"
      >
        Trouvez votre salon de beauté parfait
      </motion.h1>
      <motion.p
        variants={itemVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-xl text-lg text-beige/90"
      >
        Réservez en quelques clics dans les meilleurs salons près de chez vous.
      </motion.p>
      <motion.div
        variants={itemVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="relative"
      >
        <Link
          href="/salons"
          className="inline-flex rounded-full bg-dark-sage px-8 py-3 text-base font-medium text-beige"
        >
          Découvrir les salons
        </Link>
      </motion.div>
    </motion.section>
  );
}
