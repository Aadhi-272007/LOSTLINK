import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, Loader2 } from "lucide-react";

export default function Scanner({ onDetect }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const handledRef = useRef(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => stop, [stop]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || handledRef.current) return;

    if (video.readyState >= 2 && video.videoWidth) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(video, 0, 0, width, height);
      const frame = context.getImageData(0, 0, width, height);
      const found = jsQR(frame.data, frame.width, frame.height, {
        inversionAttempts: "dontInvert",
      });
      if (found?.data) {
        handledRef.current = true;
        stop();
        onDetect(found.data);
        return;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [onDetect, stop]);

  const start = async () => {
    setMessage(null);
    handledRef.current = false;
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("scanning");
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setStatus("error");
      setMessage(
        "Camera access is unavailable on this device or was blocked. Enter the report code below instead."
      );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-foreground/90">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover ${status === "scanning" ? "opacity-100" : "opacity-0"}`}
        />
        {status !== "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-background/80">
            <Camera className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">
              {status === "starting" ? "Starting camera…" : "Point your camera at a LostLink QR code"}
            </p>
          </div>
        )}
        {status === "scanning" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-44 w-44 rounded-xl border-2 border-background/80 shadow-[0_0_0_9999px_rgba(2,6,23,0.35)]" />
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <div className="mt-4">
        {status === "scanning" ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-fast hover:bg-muted"
          >
            <CameraOff className="h-4 w-4" aria-hidden="true" />
            Stop camera
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={status === "starting"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {status === "starting" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Camera className="h-4 w-4" aria-hidden="true" />
            )}
            {status === "starting" ? "Starting…" : "Start camera"}
          </button>
        )}
        {message && <p className="mt-3 text-xs text-destructive">{message}</p>}
      </div>
    </div>
  );
}