import { Variants } from 'framer-motion';

/**
 * Animation Variants Library
 * 
 * Reusable Framer Motion animation variants for consistent animations
 * throughout the application.
 */

/**
 * Fade In Animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

/**
 * Slide In from Right
 */
export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    x: '100%', 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide In from Left
 */
export const slideInLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    x: '-100%', 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide In from Top
 */
export const slideInTop: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide In from Bottom
 */
export const slideInBottom: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Scale In Animation
 */
export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Stagger Children Animation
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

/**
 * Stagger Item Animation
 */
export const staggerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

/**
 * Button Hover Animation
 */
export const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

/**
 * Button Tap Animation
 */
export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

/**
 * Card Hover Animation
 */
export const cardHover = {
  y: -5,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  transition: { duration: 0.3 }
};

/**
 * Pulse Animation (for loading states)
 */
export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Rotate Animation (for loading spinners)
 */
export const rotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Bounce Animation
 */
export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Modal Backdrop Animation
 */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Modal Content Animation
 */
export const modalContent: Variants = {
  hidden: { 
    scale: 0.95, 
    opacity: 0,
    y: 20
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 }
  }
};

/**
 * Toast Notification Animation
 */
export const toastSlideIn: Variants = {
  hidden: { 
    x: 400,
    opacity: 0
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    x: 400,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Page Transition Animation
 */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Skeleton Loading Animation
 */
export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Expand/Collapse Animation
 */
export const expandCollapse: Variants = {
  collapsed: { 
    height: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  },
  expanded: { 
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Made with Bob
