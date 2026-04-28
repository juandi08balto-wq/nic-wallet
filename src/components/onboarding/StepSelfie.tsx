"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Check, RefreshCw, AlertTriangle } from "lucide-react";
import { useSignup } from "./SignupProvider";
import { StepHeader } from "./StepHeader";
import { Button } from "@/components/ui/Button";

export function StepSelfie() {
  const router = useRouter();
  const { state, update, hydrated } = useSignup();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(state.selfieDataUrl);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (hydrated && !state.cedula) router.replace("/registrarse/2");
  }, [hydrated, state.cedula, router]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError("Tu navegador no soporta cámara. Podés saltar este paso.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
    } catch {
      setError(
        "No pudimos acceder a la cámara. Verificá los permisos o saltá este paso para la demo.",
      );
    }
  }, []);

  useEffect(() => {
    if (!captured) startCamera();
    return () => stopCamera();
  }, [captured, startCamera, stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror so the saved image matches the on-screen preview.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.78));
    stopCamera();
  };

  const retake = () => setCaptured(null);

  const next = () => {
    update({ selfieDataUrl: captured ?? null });
    router.push("/registrarse/7");
  };

  const skip = () => {
    update({ selfieDataUrl: null });
    router.push("/registrarse/7");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        current={6}
        backHref="/registrarse/5"
        title="Tomate una selfie"
        subtitle="Para esta demo no se verifica nada — quedará guardada en tu perfil."
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-1 flex-col gap-4 px-5"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-primary-900 ring-1 ring-border">
          {captured ? (
            <div
              role="img"
              aria-label="Tu selfie"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${captured})` }}
            />
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white/85">
              <AlertTriangle size={28} className="mb-3" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {!streaming && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
                  Encendiendo cámara…
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {captured ? (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={retake}
              className="flex-1"
              size="lg"
            >
              <RefreshCw size={18} /> Tomar otra
            </Button>
            <Button type="button" onClick={next} className="flex-1" size="lg">
              <Check size={18} /> Usar esta
            </Button>
          </div>
        ) : error ? (
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={startCamera}
              className="w-full"
              size="lg"
            >
              <RefreshCw size={18} /> Reintentar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={skip}
              className="w-full"
              size="lg"
            >
              Saltar para la demo
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={capture}
            disabled={!streaming}
            className="w-full"
            size="lg"
          >
            <Camera size={18} /> Tomar foto
          </Button>
        )}

        <div
          className="pt-2"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
        />
      </motion.div>
    </div>
  );
}
