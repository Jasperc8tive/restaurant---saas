"use client";

import { useEffect, useRef, useState } from "react";
import { Table } from "@/lib/types";
import QRCode from "qrcode";
import { Download } from "lucide-react";

interface Props {
  table: Table;
  appUrl: string;
}

export default function QRGenerator({ table, appUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const url = `${appUrl}/menu/${table.id}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 }, () => {
      setReady(true);
    });
  }, [url]);

  function download() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `table-${table.table_number}-qr.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-3 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <p className="font-semibold text-gray-800">Table {table.table_number}</p>
      <canvas ref={canvasRef} className="rounded-lg" />
      <p className="text-xs text-gray-400 text-center break-all max-w-[200px]">{url}</p>
      {ready && (
        <button
          onClick={download}
          className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          <Download size={14} />
          Download
        </button>
      )}
    </div>
  );
}
