import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="absolute bg-background left-0 right-0 z-10 flex items-center justify-center w-full top-0 bottom-0 overflow-hidden">
      <motion.div
        className="w-16 h-16 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#ff3333]"
        style={{
          maskImage:
            "radial-gradient(farthest-side, transparent 86%, black 88%)",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent 86%, black 88%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default LoadingSpinner;
