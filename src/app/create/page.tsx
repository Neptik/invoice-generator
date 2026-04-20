"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  // From
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  // To
  toName: string;
  toEmail: string;
  toAddress: string;
  // Invoice details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  // Items
  items: LineItem[];
  // Tax & notes
  taxRate: number;
  notes: string;
  // Pro
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
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: [{ id: generateId(), description: "", quantity: 1, rate: 0 }],
    taxRate: 0,
    notes: "",
    isPro: false,
  });

  const [generating, setGenerating] = useState(false);

  const updateField = (field: keyof InvoiceData, value: string | number | boolean) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { id: generateId(), description: "", quantity: 1, rate: 0 }],
    }));
  };

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
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

      // Header
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 20, 27);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`#${invoice.invoiceNumber}`, pageWidth - 20, 27, { align: "right" });

      // From / To section
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
      if (invoice.toEmail) doc.text(invoice.toEmail, pageWidth / 2 + 10, y);

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
        bodyStyles: {
          fontSize: 10,
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 35, halign: "right" },
        },
        margin: { left: 20, right: 20 },
        theme: "plain",
      });

      // Totals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 10;
      const totalsX = pageWidth - 80;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Subtotal:", totalsX, y);
      doc.setTextColor(30, 30, 30);
      doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 20, y, { align: "right" });

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
      doc.text(`$${total.toFixed(2)}`, pageWidth - 20, y + 3, { align: "right" });

      // Notes
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

      // Watermark for free tier
      if (!invoice.isPro) {
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text("Made with InvoiceAI — invoiceai.vercel.app", pageWidth / 2, footerY, {
          align: "center",
        });
      }

      doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [invoice, subtotal, tax, total]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-xl text-gray-900">InvoiceAI</span>
          </Link>
          <button
            onClick={generatePDF}
            disabled={generating}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {generating ? "Generating..." : "Download PDF ↓"}
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* From */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">From (Your Details)</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name or business"
                  value={invoice.fromName}
                  onChange={(e) => updateField("fromName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={invoice.fromEmail}
                  onChange={(e) => updateField("fromEmail", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <textarea
                  placeholder="Address (optional)"
                  value={invoice.fromAddress}
                  onChange={(e) => updateField("fromAddress", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            {/* To */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Bill To (Client)</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Client name or business"
                  value={invoice.toName}
                  onChange={(e) => updateField("toName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <input
                  type="email"
                  placeholder="client@email.com"
                  value={invoice.toEmail}
                  onChange={(e) => updateField("toEmail", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <textarea
                  placeholder="Address (optional)"
                  value={invoice.toAddress}
                  onChange={(e) => updateField("toAddress", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Invoice Details</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateField("invoiceNumber", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={invoice.invoiceDate}
                    onChange={(e) => updateField("invoiceDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Line Items</h2>
              <div className="space-y-3">
                {invoice.items.map((item, idx) => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate || ""}
                      onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <div className="w-20 py-2 text-sm text-right text-gray-600 font-medium">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </div>
                    {invoice.items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-800 transition"
              >
                + Add line item
              </button>
            </div>

            {/* Tax & Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Tax & Notes</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={invoice.taxRate || ""}
                    onChange={(e) => updateField("taxRate", Number(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notes / Payment Instructions</label>
                  <textarea
                    placeholder="Payment terms, bank details, thank you note..."
                    value={invoice.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary / Preview sidebar */}
          <div className="lg:sticky lg:top-8 h-fit space-y-6">
            {/* Totals card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax ({invoice.taxRate}%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={generatePDF}
                disabled={generating}
                className="mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {generating ? "Generating..." : "Download PDF ↓"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Free invoices include a small InvoiceAI footer
              </p>
            </div>

            {/* Pro upsell */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">⚡ Upgrade to Pro</h3>
              <p className="text-sm text-gray-600 mb-4">
                Remove the InvoiceAI branding, unlock premium templates, and add your own logo. One-time payment.
              </p>
              <a
                href="/api/checkout"
                className="block text-center w-full bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Get Pro — $4.99
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
