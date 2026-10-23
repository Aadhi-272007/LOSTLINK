import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

interface QrCardProps {
  value: string;
  title: string;
  caption?: string;
  filename?: string;
}

export function QrCard({
  value,
  title,
  caption,
  filename = "lostlink-qr",
}: QrCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank", "width=480,height=640");
    if (!printWindow) return;
    printWindow.document.write(
      `<!doctype html><html><head><title>${title}</title></head><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;gap:16px"><img src="${dataUrl}" alt="QR code" style="width:280px;height:280px"/><h1 style="font-size:18px;margin:0">${title}</h1><p style="font-size:13px;color:#555;margin:0">${caption ?? ""}</p></body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Card
      data-ocid="qr_card"
      className="rounded-xl border-border shadow-subtle"
    >
      <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
        <div
          ref={wrapperRef}
          className="rounded-lg border border-border bg-card p-4"
        >
          <QRCodeCanvas
            value={value}
            size={176}
            level="M"
            marginSize={1}
            aria-label={`QR code for ${title}`}
          />
        </div>
        <div className="space-y-1">
          <p className="font-display text-sm font-semibold text-foreground">
            {title}
          </p>
          {caption ? (
            <p className="text-xs text-muted-foreground">{caption}</p>
          ) : null}
        </div>
        <div className="flex w-full gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="qr.download_button"
            className="flex-1 rounded-lg"
            onClick={handleDownload}
          >
            <Download className="size-4" aria-hidden="true" />
            Download
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="qr.print_button"
            className="flex-1 rounded-lg"
            onClick={handlePrint}
          >
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
