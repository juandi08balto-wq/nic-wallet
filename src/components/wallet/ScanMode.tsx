"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { ScanFrame } from "./ScanFrame";
import { DEMO_MERCHANTS, type DemoMerchant } from "@/lib/demo/merchants";
import { cn } from "@/lib/utils";

export interface ScanModeProps {
  onMerchantSelect: (merchant: DemoMerchant) => void;
}

export function ScanMode({ onMerchantSelect }: ScanModeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices?.getUserMedia
        ) {
          setError("Tu navegador no soporta cámara.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStreaming(true);
      } catch {
        setError(
          "La cámara no está disponible. Tocá un comercio abajo para simular un pago.",
        );
      }
    };
    void start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-6"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-primary-900 ring-1 ring-border">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white/85">
            <Camera size={28} className="mb-3" aria-hidden />
            <p className="text-sm font-medium text-white">
              Cámara no disponible
            </p>
            <p className="mt-1 text-xs text-white/70">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {!streaming && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                Encendiendo cámara…
              </div>
            )}
            <ScanFrame />
            <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-medium text-white/85">
              Apuntá al QR del comercio
            </p>
          </>
        )}
      </div>

      <div>
        <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Comercios cercanos
        </p>
        <div className="-mx-4 mt-2 overflow-x-auto px-4 pb-2">
          <div className="flex gap-2.5">
            {DEMO_MERCHANTS.map((m) => (
              <MerchantTile
                key={m.id}
                merchant={m}
                onClick={() => onMerchantSelect(m)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MerchantTile({
  merchant,
  onClick,
}: {
  merchant: DemoMerchant;
  onClick: () => void;
}) {
  const Icon = merchant.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[120px] max-w-[120px] shrink-0 flex-col items-center gap-2 rounded-2xl bg-surface p-3 ring-1 ring-border transition-all",
        "hover:ring-primary-300 active:scale-95",
      )}
    >
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
      >
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight">
        {merchant.name}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {merchant.category}
      </span>
    </button>
  );
}
