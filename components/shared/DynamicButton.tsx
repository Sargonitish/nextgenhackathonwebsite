'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/helpers/classname-helper';

export type DynamicButtonState = 'idle' | 'loading' | 'success' | 'error';

export interface DynamicButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  state: DynamicButtonState;
  idleLabel: ReactNode;
  loadingLabel?: ReactNode;
  successLabel?: ReactNode;
  errorLabel?: ReactNode;
}

/**
 * Stateful button that smoothly morphs label and dimensions across idle/loading/success/error states
 * with physical press-down depth.
 */
export default function DynamicButton({
  state,
  idleLabel,
  loadingLabel = 'PROCESSING...',
  successLabel = 'CONFIRMED',
  errorLabel = 'TRY AGAIN',
  className,
  disabled,
  type = 'button',
  ...props
}: DynamicButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const isBusy = state === 'loading';

  const contentMap: Record<DynamicButtonState, ReactNode> = {
    idle: idleLabel,
    loading: (
      <span className="inline-flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>{loadingLabel}</span>
      </span>
    ),
    success: (
      <span className="inline-flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        <span>{successLabel}</span>
      </span>
    ),
    error: (
      <span className="inline-flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>{errorLabel}</span>
      </span>
    ),
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || isBusy}
      layout={!prefersReducedMotion}
      whileTap={prefersReducedMotion || disabled || isBusy ? undefined : { y: 2 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
      className={cn(
        'relative overflow-hidden transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center justify-center gap-2"
        >
          {contentMap[state]}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
