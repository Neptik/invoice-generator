"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [proToken, setProToken] = useState<string | null>(null);

  useEffect(() => {
    // Generate a simple pro token and store in localStorage
    const token = `pro_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem("invoiceai_pro", token);
    setProToken(token);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          You&apos;re Pro now! 🎉
        </h1>
        <p className="text-gray-600 mb-2">
          Thanks for upgrading. Your invoices will now be generated without any
          InvoiceAI branding.
        </p>
        {proToken && (
          <p className="text-xs text-gray-400 mb-6">
            Pro license saved to this browser.
          </p>
        )}
        <Link
          href="/create"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Create Your First Pro Invoice →
        </Link>
      </div>
    </div>
  );
}
