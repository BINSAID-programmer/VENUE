import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { VenueLogo } from '../common/VenueLogo';
import { CAMPUS_BG } from '../../assets_campusBg';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2600);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      onClick={onContinue}
      className="min-h-full min-h-screen sm:min-h-full flex-1 flex flex-col items-center justify-between relative overflow-hidden text-center cursor-pointer select-none bg-[#070b14]"
    >
      {/* Campus photo + dark blue tint so text stays readable */}
      <img
        src={CAMPUS_BG}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(7,11,20,0.10), rgba(11,19,41,0.35) 50%, rgba(7,11,20,0.90))' }}
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-16">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="drop-shadow-[0_0_28px_rgba(59,130,246,0.55)]"
        >
          <VenueLogo size={96} />
        </motion.div>

        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 text-5xl font-extrabold text-white tracking-wide uppercase font-['Space_Grotesk']"
        >
          VENUE
        </motion.h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base sm:text-lg font-medium text-sky-300 mt-1 tracking-wide"
        >
          Your Academic Space
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 pb-10 px-6 space-y-1"
      >
        <p className="text-sm font-medium text-white/90">Built for Students</p>
        <p className="text-sm font-medium text-white/90">Designed for Your Future</p>
      </motion.div>
    </div>
  );
};
