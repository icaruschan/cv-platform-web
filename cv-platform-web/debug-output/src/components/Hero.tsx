import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="h-screen flex items-center justify-center">
      <motion.h1 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="text-6xl font-bold"
      >
        Creative Developer
      </motion.h1>
    </section>
  );
}