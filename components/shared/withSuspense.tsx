'use client';

import React, { Suspense, ComponentType } from 'react';

export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallbackMessage: string = 'Loading...'
) {
  return function WithSuspenseWrapper(props: P) {
    return (
      <Suspense
        fallback={
          <div className="py-20 flex items-center justify-center text-cyan-400 font-mono text-xs">
            {fallbackMessage}
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}
