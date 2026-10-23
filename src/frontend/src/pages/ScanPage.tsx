import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Camera, CameraOff, Keyboard, QrCode, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/** Extract a report id from a scanned URL or a raw numeric code. */
function parseReportId(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^\d+$/.test(value)) return value;
  const match = value.match(/\/items\/(\d+)/);
  if (match) return match[1];
  return null;
}

/** Minimal shape of the native BarcodeDetector API we rely on. */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}

function getBarcodeDetectorCtor(): BarcodeDetectorCtor | null {
  const ctor = (
    globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor }
  ).BarcodeDetector;
  return typeof ctor === "function" ? ctor : null;
}

export function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const handledRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [decodeUnsupported, setDecodeUnsupported] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    detectorRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    };
  }, []);

  const openReport = useCallback(
    (raw: string) => {
      const id = parseReportId(raw);
      if (!id) {
        toast.error("That doesn't look like a LostLink report code.");
        return;
      }
      stopCamera();
      void navigate({ to: "/items/$reportId", params: { reportId: id } });
    },
    [navigate, stopCamera],
  );

  const startCamera = async () => {
    setCameraError(null);
    setDecodeUnsupported(false);
    handledRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      const Detector = getBarcodeDetectorCtor();
      if (!Detector) {
        setDecodeUnsupported(true);
        return;
      }
      detectorRef.current = new Detector({ formats: ["qr_code"] });

      const tick = async () => {
        const video = videoRef.current;
        const detector = detectorRef.current;
        if (!video || !detector || handledRef.current) return;
        if (video.readyState >= 2) {
          try {
            const codes = await detector.detect(video);
            const raw = codes[0]?.rawValue;
            if (raw) {
              const id = parseReportId(raw);
              if (id) {
                handledRef.current = true;
                toast.success("QR code detected.");
                openReport(raw);
                return;
              }
            }
          } catch {
            // Transient decode failures are expected between frames.
          }
        }
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
      };
      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    } catch {
      setCameraError(
        "Camera access is unavailable. You can still open a report by entering its code below.",
      );
      setScanning(false);
    }
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    openReport(manualCode);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Scan QR
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Open a report by QR code
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Point your camera at a LostLink QR code to jump straight to that item,
          or type the report code if the camera isn't available.
        </p>
      </header>

      <Tabs defaultValue="camera" className="mt-8">
        <TabsList data-ocid="scan.tabs" className="rounded-lg">
          <TabsTrigger
            value="camera"
            data-ocid="scan.camera_tab"
            className="rounded-md"
          >
            <Camera className="size-4" aria-hidden="true" />
            Camera
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            data-ocid="scan.manual_tab"
            className="rounded-md"
          >
            <Keyboard className="size-4" aria-hidden="true" />
            Enter code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="mt-6">
          <Card className="rounded-xl border-border shadow-subtle">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Camera scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                <video
                  ref={videoRef}
                  data-ocid="scan.video"
                  className="size-full object-cover"
                  playsInline
                  muted
                  aria-label="Camera preview"
                />
                {!scanning ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    {cameraError ? (
                      <CameraOff className="size-8" aria-hidden="true" />
                    ) : (
                      <ScanLine className="size-8" aria-hidden="true" />
                    )}
                    <p className="max-w-xs px-4 text-sm">
                      {cameraError ??
                        "Start the camera, then hold a LostLink QR code in view."}
                    </p>
                  </div>
                ) : (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="size-48 rounded-xl border-2 border-primary-foreground/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {scanning ? (
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid="scan.stop_button"
                    className="rounded-lg"
                    onClick={stopCamera}
                  >
                    <CameraOff className="size-4" aria-hidden="true" />
                    Stop camera
                  </Button>
                ) : (
                  <Button
                    type="button"
                    data-ocid="scan.start_button"
                    className="rounded-lg shadow-elevated"
                    onClick={startCamera}
                  >
                    <Camera className="size-4" aria-hidden="true" />
                    Start camera
                  </Button>
                )}
              </div>

              <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                {decodeUnsupported
                  ? "This browser can't decode QR codes from the camera. Use the “Enter code” tab — every report QR encodes a link ending in its report number."
                  : "Camera scanning reads the code visually. If your device can't decode it, use the “Enter code” tab — every report QR encodes a link ending in its report number."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card className="rounded-xl border-border shadow-subtle">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Enter a report code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scan-code">Report code or link</Label>
                  <Input
                    id="scan-code"
                    data-ocid="scan.code_input"
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    placeholder="e.g. 42 or https://…/items/42"
                    className="rounded-lg"
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="scan.open_button"
                  className="rounded-lg shadow-elevated"
                >
                  <QrCode className="size-4" aria-hidden="true" />
                  Open report
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
