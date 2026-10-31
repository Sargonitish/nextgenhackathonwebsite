'use client';

import { useEffect, useState, useRef } from 'react';

export interface GoogleVerifiedUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  token?: string;
}

interface GoogleSignInButtonProps {
  onSuccess: (user: GoogleVerifiedUser) => void;
  onError?: (errMessage: string) => void;
  label?: string;
  className?: string;
}

declare global {
  interface Window {
    google?: any;
    handleGoogleSignInCallback?: (response: any) => void;
  }
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  label = 'AUTOFILL WITH GOOGLE // VERIFIED ID',
  className = '',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    setIsConfigured(Boolean(clientId && clientId !== ''));

    if (!clientId) {
      return;
    }

    // Load Google Identity Services script if not already present
    const scriptId = 'google-gsi-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeGsi = () => {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (!response.credential) {
              const err = 'No credentials received from Google';
              setErrorMessage(err);
              onError?.(err);
              return;
            }

            setLoading(true);
            setErrorMessage(null);
            try {
              const res = await fetch('/api/auth/google/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: response.credential }),
              });

              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || 'Failed to verify Google token');
              }

              onSuccess({
                googleId: data.user.googleId,
                email: data.user.email,
                name: data.user.name,
                avatar: data.user.avatar,
                token: response.credential,
              });
            } catch (err: any) {
              const msg = err.message || 'Google verification failed';
              setErrorMessage(msg);
              onError?.(msg);
            } finally {
              setLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render native hidden/overlay prompt trigger if container is ready
        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            width: 280,
          });
        }
      } catch (err) {
        console.error('Google GSI initialization error:', err);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGsi;
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initializeGsi();
    }
  }, [clientId, onSuccess, onError]);

  const handleManualClick = () => {
    if (!clientId) {
      setErrorMessage(
        'Google Client ID is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local to enable real Google authentication.'
      );
      return;
    }

    if (window.google?.accounts?.id) {
      // Trigger Google One-Tap or Prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: If One Tap is suppressed by browser, trigger standard flow
          const gsiButton = buttonContainerRef.current?.querySelector('div[role="button"]') as HTMLElement;
          if (gsiButton) {
            gsiButton.click();
          }
        }
      });
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Custom Blueprint Button */}
        <button
          type="button"
          onClick={handleManualClick}
          disabled={loading}
          className="flex-1 px-4 py-3 border border-line bg-[#0c223f] hover:border-yellow hover:bg-[#102a4e] text-offwhite transition-all duration-150 flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-wider group cursor-pointer shadow-hard-sm"
        >
          {/* Google G Logo SVG */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>

          {loading ? (
            <span className="text-yellow animate-pulse">VERIFYING WITH GOOGLE SECURE AUTH...</span>
          ) : (
            <span className="group-hover:text-yellow transition-colors font-bold">{label}</span>
          )}
        </button>

        {/* Hidden Container for GSI native rendering fallback */}
        <div ref={buttonContainerRef} className="hidden" aria-hidden="true" />
      </div>

      {/* Notice if Google Client ID is not configured yet */}
      {isConfigured === false && (
        <div className="p-3 border border-yellow/30 bg-yellow/5 font-mono text-[11px] text-offwhite/80 flex items-start gap-2">
          <span className="text-yellow font-bold">[INFO]</span>
          <div>
            <span>Google Sign-In is ready. To enable live Google popups in production, provide </span>
            <code className="text-yellow px-1 bg-white/5 border border-line">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
            <span> in your </span>
            <code className="text-yellow px-1 bg-white/5 border border-line">.env.local</code>
            <span> file. Manual registration is active below.</span>
          </div>
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="p-2 border border-red-500/50 bg-red-500/10 font-mono text-[11px] text-red-400 flex items-center justify-between">
          <span>[!] {errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-300 underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
