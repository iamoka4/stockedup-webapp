"use client";

import { useEffect, useState } from "react";
import { Smartphone, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
  "https://play.google.com/store/apps/details?id=com.africa.stockedup&pcampaignid=web_share";

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-leaf/30 bg-leaf-tint px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-leaf">
          <Smartphone size={22} />
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-ink">Get the StockedUp app</p>
          <p className="text-xs text-ink-soft">Faster checkout, order tracking, deals</p>
        </div>
      </div>

      {deferredPrompt ? (
        <button
          type="button"
          onClick={handleInstall}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-leaf px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Download size={16} />
          Download now
        </button>
      ) : (
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-leaf px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Download size={16} />
          Download now
        </a>
      )}
    </div>
  );
}