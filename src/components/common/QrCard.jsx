import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer } from "lucide-react";

export default function QrCard({ value, title, caption, filename = "lostlink-qr" }) {
  const wrapperRef = useRef(null);

  const getCanvas = () => wrapperRef.current?.querySelector("canvas");

  const download = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const print = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank", "width=480,height=640");
    if (!win) return;
    win.document.write(
      `<!doctype html><html><head><title>${title}</title></head><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;gap:16px"><img src="${dataUrl}" alt="QR code" style="width:280px;height:280px"/><h1 style="font-size:18px;margin:0">${title}</h1><p style="font-size:13px;color:#555;margin:0">${caption ?? ""}</p></body></html>`
    );
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center shadow-subtle">
      <div ref={wrapperRef} className="rounded-lg bg-white p-3">
        <QRCodeCanvas value={value} size={168} level="M" includeMargin={false} />
      </div>
      <div>
        <p className="font-heading text-sm font-semibold tracking-tight">{title}</p>
        {caption && <p className="mt-1 text-xs text-muted-foreground">{caption}</p>}
      </div>
      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={download}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-fast hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Download
        </button>
        <button
          type="button"
          onClick={print}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-fast hover:bg-muted"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
          Print
        </button>
      </div>
    </div>
  );
}