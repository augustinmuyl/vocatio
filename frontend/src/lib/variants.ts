import { Variants } from "framer-motion";

export const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.42, 0, 0.58, 1],
      duration: 0.6,
    },
  },
};

export const menuVariants: Variants = {
  hidden: {
    x: "100%",
  },
  visible: {
    x: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      type: "tween",
    },
  },
  exit: {
    x: "100%",
    transition: {
      when: "afterChildren",
      type: "tween",
    },
  },
};
