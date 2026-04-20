"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  taxRate: number;
  notes: string;
  isPro: boolean;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function CreateInvoice() {
  const [invoice, setInvoice] = useState<InvoiceData>({
    fromName: "",
    fromEmail: "",
    fromAddress: "",
    toName: "",
    toEmail: "",
    toAddress: "",
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: [{ id: generateId(), description: "", quantity: 1, rate: 0 }],
    taxRate: 0,
    notes: "",
    isPro: false,
  });

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const pro = localStorage.getItem("invoiceai_pro");
    if (pro) {
      setInvoice((prev) => ({ ...prev, isPro: true }));
    }
  }, []);

  const updateField = (
    field: keyof InvoiceData,
    value: string | number | boolean
  ) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
    setGenerated(false);
  };

  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: generateId(), description: "", quantity: 1, rate: 0 },
      ],
    }));
    setGenerated(false);
  };

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    setGenerated(false);
  };

  const updateItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
    setGenerated(false);
  };

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;

  const generatePDF = useCallback(async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header bar
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 20, 27);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`#${invoice.invoiceNumber}`, pageWidth - 20, 27, {
        align: "right",
      });

      // From / To
      let y = 55;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text("FROM", 20, y);
      doc.text("BILL TO", pageWidth / 2 + 10, y);

      y += 7;
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(invoice.fromName || "Your Name", 20, y);
      doc.text(invoice.toName || "Client Name", pageWidth / 2 + 10, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      if (invoice.fromEmail) doc.text(invoice.fromEmail, 20, y);
      if (invoice.toEmail)
        doc.text(invoice.toEmail, pageWidth / 2 + 10, y);

      y += 5;
      if (invoice.fromAddress) {
        const fromLines = doc.splitTextToSize(invoice.fromAddress, 70);
        doc.text(fromLines, 20, y);
      }
      if (invoice.toAddress) {
        const toLines = doc.splitTextToSize(invoice.toAddress, 70);
        doc.text(toLines, pageWidth / 2 + 10, y);
      }

      // Dates
      y += 20;
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(20, y - 5, pageWidth - 40, 20, 3, 3, "F");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Invoice Date", 30, y + 2);
      doc.text("Due Date", pageWidth / 2, y + 2);
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.text(invoice.invoiceDate, 30, y + 10);
      doc.text(invoice.dueDate, pageWidth / 2, y + 10);

      // Table
      y += 25;
      autoTable(doc, {
        startY: y,
        head: [["Description", "Qty", "Rate", "Amount"]],
        body: invoice.items.map((item) => [
          item.description || "—",
          item.quantity.toString(),
          `$${item.rate.toFixed(2)}`,
          `$${(item.quantity * item.rate).toFixed(2)}`,
        ]),
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
        },
        bodyStyles: { fontSize: 10, textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 35, halign: "right" },
        },
        margin: { left: 20, right: 20 },
        theme: "plain",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 10;
      const totalsX = pageWidth - 80;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Subtotal:", totalsX, y);
      doc.setTextColor(30, 30, 30);
      doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 20, y, {
        align: "right",
      });

      if (invoice.taxRate > 0) {
        y += 7;
        doc.setTextColor(100, 100, 100);
        doc.text(`Tax (${invoice.taxRate}%):`, totalsX, y);
        doc.setTextColor(30, 30, 30);
        doc.text(`$${tax.toFixed(2)}`, pageWidth - 20, y, { align: "right" });
      }

      y += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(totalsX - 5, y - 3, pageWidth - 15, y - 3);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text("Total:", totalsX, y + 3);
      doc.text(`$${total.toFixed(2)}`, pageWidth - 20, y + 3, {
        align: "right",
      });

      if (invoice.notes) {
        y += 20;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "bold");
        doc.text("NOTES", 20, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
        doc.text(noteLines, 20, y);
      }

      // Watermark
      if (!invoice.isPro) {
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(
          "Made with InvoiceAI — invoiceai.vercel.app",
          pageWidth / 2,
          footerY,
          { align: "center" }
        );
      }

      doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
      setGenerated(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [invoice, subtotal, tax, total]);

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      {/* Nav */}
      <nav className="backdrop-blur-md bg-white/80 border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              Invoice<span className="text-indigo-600">AI</span>
            </span>
          </Link>
          <button
            onClick={generatePDF}
            disabled={generating}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 ${
              generated
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-200"
            }`}
          >
            {generating ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : generated ? (
              <>
                <svg
                  className="w-4 h-4"
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
                Downloaded!
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form — 3 cols */}
          <div className="lg:col-span-3 space-y-5">
            {/* From */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">From</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name or business"
                  value={invoice.fromName}
                  onChange={(e) => updateField("fromName", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={invoice.fromEmail}
                  onChange={(e) => updateField("fromEmail", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                />
                <textarea
                  placeholder="Address (optional)"
                  value={invoice.fromAddress}
                  onChange={(e) => updateField("fromAddress", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition resize-none"
                />
              </div>
            </div>

            {/* To */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                    />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">Bill To</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Client name or business"
                  value={invoice.toName}
                  onChange={(e) => updateField("toName", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                />
                <input
                  type="email"
                  placeholder="client@email.com"
                  value={invoice.toEmail}
                  onChange={(e) => updateField("toEmail", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                />
                <textarea
                  placeholder="Address (optional)"
                  value={invoice.toAddress}
                  onChange={(e) => updateField("toAddress", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">Details</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) =>
                      updateField("invoiceNumber", e.target.value)
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={invoice.invoiceDate}
                    onChange={(e) =>
                      updateField("invoiceDate", e.target.value)
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="font-semibold text-gray-900">Line Items</h2>
                </div>
                <button
                  onClick={addItem}
                  className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Add Item
                </button>
              </div>

              {/* Header */}
              <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                <span className="col-span-5 text-xs font-medium text-gray-400">
                  Description
                </span>
                <span className="col-span-2 text-xs font-medium text-gray-400 text-center">
                  Qty
                </span>
                <span className="col-span-2 text-xs font-medium text-gray-400 text-right">
                  Rate
                </span>
                <span className="col-span-2 text-xs font-medium text-gray-400 text-right">
                  Amount
                </span>
                <span className="col-span-1" />
              </div>

              <div className="space-y-2">
                {invoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      className="col-span-5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                    />
                    <input
                      type="number"
                      placeholder="1"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", Number(e.target.value))
                      }
                      className="col-span-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                    />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={item.rate || ""}
                      onChange={(e) =>
                        updateItem(item.id, "rate", Number(e.target.value))
                      }
                      className="col-span-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                    />
                    <div className="col-span-2 text-sm text-right font-medium text-gray-700 pr-1">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {invoice.items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax & Notes */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">Tax & Notes</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={invoice.taxRate || ""}
                    onChange={(e) =>
                      updateField("taxRate", Number(e.target.value))
                    }
                    className="w-32 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Notes / Payment Instructions
                  </label>
                  <textarea
                    placeholder="Payment terms, bank details, thank you note..."
                    value={invoice.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — 2 cols */}
          <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-20 h-fit">
            {/* Totals */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Tax ({invoice.taxRate}%)
                    </span>
                    <span className="font-medium text-gray-900">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-black text-indigo-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={generatePDF}
                disabled={generating}
                className={`mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold transition-all disabled:opacity-50 ${
                  generated
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg"
                }`}
              >
                {generating ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Generating...
                  </>
                ) : generated ? (
                  <>
                    <svg
                      className="w-5 h-5"
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
                    Downloaded! Click again to re-download
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>

              {!invoice.isPro && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Free invoices include a small InvoiceAI footer
                </p>
              )}
            </div>

            {/* Pro upsell */}
            {!invoice.isPro && (
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                  PRO
                </div>
                <h3 className="font-bold mb-1">Remove branding</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Clean invoices with no footer. Premium templates + your logo.
                  One-time $4.99.
                </p>
                <a
                  href="/api/checkout"
                  className="block text-center w-full bg-white text-gray-900 px-4 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition"
                >
                  Upgrade — $4.99
                </a>
              </div>
            )}

            {invoice.isPro && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">⚡</span>
                  <h3 className="font-bold text-gray-900">Pro Active</h3>
                </div>
                <p className="text-sm text-gray-600">
                  No branding on your invoices. You&apos;re looking professional.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
