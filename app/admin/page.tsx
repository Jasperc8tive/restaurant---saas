"use client";

import { useEffect, useState } from "react";
import { Table } from "@/lib/types";
import QRGenerator from "@/components/QRGenerator";
import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";

export default function AdminPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data) => { setTables(data); setLoading(false); });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex items-center gap-2">
          <QrCode className="text-orange-500" size={24} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">QR Codes</h1>
            <p className="text-sm text-gray-400">Print and place on each table</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-2">No tables found.</p>
          <p className="text-sm">Run the seed SQL in your Supabase dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {tables.map((table) => (
            <QRGenerator key={table.id} table={table} appUrl={appUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
