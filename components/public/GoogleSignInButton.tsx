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
  }
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  label = 'CONTINUE WITH GOOGLE // ONE-CLICK AUTOFILL',
  className = '',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gsiReady, setGsiReady] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '63130357409-hi1hfqt1ofc94pup9fm60ck46okmshhb.apps.googleusercontent.com';

  useEffect(() => {
    setIsConfigured(Boolean(clientId && clientId !== ''));

    if (!clientId) {
      return;
    }

    const scriptId = 'google-gsi-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeGsi = () => {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            const token = response?.credential;
            if (!token) {
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
                body: JSON.stringify({
                  credential: token,
                  idToken: token,
                }),
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
                token: token,
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

        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            theme: 'filled_black',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left',
            width: 320,
          });
          setGsiReady(true);
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

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Google GSI Official Button Container */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div
          ref={buttonContainerRef}
          className="min-h-[44px] flex items-center justify-start overflow-hidden border border-line p-1 bg-[#0c223f] shadow-hard-sm"
        />

        {loading && (
          <span className="font-mono text-xs text-yellow animate-pulse">
            [VERIFYING CREDENTIALS...]
          </span>
        )}
      </div>

      {/* Notice if Google Client ID is missing */}
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
