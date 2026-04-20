"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Nav */}
      <nav className="backdrop-blur-md bg-white/70 border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Invoice<span className="text-indigo-600">AI</span>
            </span>
          </div>
          <Link
            href="/create"
            className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-200"
          >
            Create Invoice
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-20 w-60 h-60 bg-purple-100/40 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            No signup required — start instantly
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Beautiful invoices,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              zero effort
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Create professional PDF invoices in seconds. Fill in the details,
            download instantly. No accounts, no subscriptions, no nonsense.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-gray-300 flex items-center justify-center gap-2"
            >
              Create Free Invoice
              <svg
                className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <a
              href="#pricing"
              className="bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-semibold border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all flex items-center justify-center"
            >
              See Pricing
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex items-center justify-center gap-3 text-sm text-gray-400">
            <div className="flex -space-x-2">
              {["bg-indigo-400", "bg-purple-400", "bg-pink-400", "bg-blue-400"].map(
                (color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 ${color} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {["J", "M", "S", "A"][i]}
                  </div>
                )
              )}
            </div>
            <span>Trusted by freelancers worldwide</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-gray-500 mt-3 text-lg">
            Built for freelancers who&apos;d rather work than do paperwork.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              ),
              title: "Instant PDF",
              desc: "Fill in the form, click download. Professional invoice ready in under 30 seconds.",
              gradient: "from-amber-500 to-orange-600",
              shadow: "shadow-amber-200",
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              ),
              title: "No Signup",
              desc: "No account, no email, no tracking. Your data stays in your browser. Period.",
              gradient: "from-emerald-500 to-teal-600",
              shadow: "shadow-emerald-200",
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                />
              ),
              title: "Clean Design",
              desc: "Professional templates your clients will love. Look legit, feel legit, be legit.",
              gradient: "from-indigo-500 to-purple-600",
              shadow: "shadow-indigo-200",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 tracking-tight mb-14">
          Three steps. That&apos;s it.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Fill in details", desc: "Your info, client info, line items. Quick and simple." },
            { step: "02", title: "Preview & adjust", desc: "See totals calculated in real-time. Add tax, notes, whatever." },
            { step: "03", title: "Download PDF", desc: "One click. Clean, professional invoice. Done." },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-black text-indigo-100 mb-3">
                {item.step}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="text-gray-500 mt-3 text-lg">
            Free forever. Upgrade only if you want to.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-gray-900 mb-1">Free</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-gray-900">$0</span>
              <span className="text-gray-400">forever</span>
            </div>
            <ul className="space-y-3 text-gray-600 mb-8">
              {[
                "Unlimited invoices",
                "Instant PDF download",
                "Professional template",
                "All form fields",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
              <li className="flex items-center gap-3 text-gray-400">
                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                Includes small InvoiceAI footer
              </li>
            </ul>
            <Link
              href="/create"
              className="block text-center w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl shadow-gray-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
              BEST VALUE
            </div>
            <h3 className="font-bold mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-black">$4.99</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              one-time • lifetime access
            </p>
            <ul className="space-y-3 text-gray-300 mb-8">
              {[
                "Everything in Free",
                "No InvoiceAI branding",
                "Premium templates",
                "Add your own logo",
                "Priority support",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/api/checkout"
              className="block text-center w-full bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition"
            >
              Upgrade to Pro — $4.99
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-12 shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to create your first invoice?
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Takes less than 60 seconds. No signup, no credit card.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl transition-all"
          >
            Start Now — It&apos;s Free
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
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
          © 2026 InvoiceAI. Built with care.
        </div>
      </footer>
    </div>
  );
}
