"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Check, RefreshCw, AlertTriangle } from "lucide-react";
import { useSignup } from "./SignupProvider";
import { StepHeader } from "./StepHeader";
import { Button } from "@/components/ui/Button";

type Side = "front" | "back";

const SIDE_LABEL: Record<Side, string> = {
  front: "Frente de la cédula",
  back: "Reverso de la cédula",
};

const SIDE_HINT: Record<Side, string> = {
  front: "Apuntá tu cédula dentro del marco. Cuidado con los reflejos.",
  back: "Ahora dale vuelta y volvé a apuntar dentro del marco.",
};

export function StepCedulaPhotos() {
  const router = useRouter();
  const { state, update, hydrated } = useSignup();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [side, setSide] = useState<Side>(
    state.cedula_front_url ? "back" : "front",
  );
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(
    side === "front" ? state.cedula_front_url : state.cedula_back_url,
  );

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
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setError("Tu navegador no soporta cámara. Podés saltar este paso.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
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
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.78));
    stopCamera();
  };

  const retake = () => setCaptured(null);

  const advance = (dataUrl: string | null) => {
    if (side === "front") {
      update({ cedula_front_url: dataUrl });
      setSide("back");
      setCaptured(state.cedula_back_url);
    } else {
      update({ cedula_back_url: dataUrl });
      router.push("/registrarse/6");
    }
  };

  const useThis = () => advance(captured);
  const skip = () => advance(null);

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        current={5}
        backHref="/registrarse/4"
        title="Foto de tu cédula"
        subtitle={`${SIDE_LABEL[side]}. Para esta demo no se verifica nada.`}
      />
      <motion.div
        key={side}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-1 flex-col gap-4 px-5"
      >
        <div className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {side === "front" ? "1 de 2 · Frente" : "2 de 2 · Reverso"}
        </div>

        <div
          className="relative aspect-[1.585/1] w-full overflow-hidden rounded-3xl bg-primary-900 ring-1 ring-border"
        >
          {captured ? (
            <div
              role="img"
              aria-label={SIDE_LABEL[side]}
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
              />
              {/* Cédula outline guide */}
              <div className="pointer-events-none absolute inset-3 rounded-2xl border-2 border-dashed border-gold/80" />
              {!streaming && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                  Encendiendo cámara…
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {SIDE_HINT[side]}
        </p>

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
            <Button type="button" onClick={useThis} className="flex-1" size="lg">
              <Check size={18} />{" "}
              {side === "front" ? "Continuar" : "Listo"}
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
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={capture}
              disabled={!streaming}
              className="w-full"
              size="lg"
            >
              <Camera size={18} /> Tomar foto
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
        )}

        <div
          className="pt-2"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
        />
      </motion.div>
    </div>
  );
}
