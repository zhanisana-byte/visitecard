"use client";

import { useEffect, useRef } from "react";

type TurnstileAPI = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

type TurnstileWindow = Window & { turnstile?: TurnstileAPI };

export default function Turnstile({ value, onChange }: { value: string; onChange: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const widgetRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!siteKey) return;
    let disposed = false;
    const win = window as TurnstileWindow;

    function renderWidget() {
      if (disposed || !containerRef.current || !win.turnstile || widgetRef.current) return;
      widgetRef.current = win.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        appearance: "always",
        callback: (token: string) => onChangeRef.current(token),
        "expired-callback": () => onChangeRef.current(""),
        "error-callback": () => onChangeRef.current(""),
        "timeout-callback": () => onChangeRef.current(""),
      });
    }

    const scriptId = "vc-cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", renderWidget);
    renderWidget();
    const wait = window.setInterval(renderWidget, 250);

    return () => {
      disposed = true;
      window.clearInterval(wait);
      script?.removeEventListener("load", renderWidget);
      if (widgetRef.current && win.turnstile) win.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (!value && widgetRef.current) {
      (window as TurnstileWindow).turnstile?.reset(widgetRef.current);
    }
  }, [value]);

  if (!siteKey) return <p role="alert" style={{ color: "#b42318", fontSize: 13 }}>Configuration CAPTCHA manquante.</p>;
  return <div ref={containerRef} aria-label="Vérification anti-robot" style={{ maxWidth: "100%" }} />;
}
