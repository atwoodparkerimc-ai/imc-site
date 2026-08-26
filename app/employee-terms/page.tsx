"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, FileText, AlertTriangle, Gift, DollarSign, UserX, Award } from "lucide-react";

export default function EmployeeTermsPage() {
  const lastUpdated = "August 2026";

  return (
    <div className="min-h-screen bg-[#030914] text-slate-200 font-sans selection:bg-[#ea1f27] selection:text-white relative">
      {/* Background Tactical Blueprint Grid */}
      <div className="absolute inset-0 z-0 tactical-graph-paper opacity-20 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#070a10]/80 backdrop-blur-md px-6 sm:px-12 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/imclogo.svg"
              alt="IMC Logo"
              width={140}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <Link 
            href="/dashboard" 
            className="font-mono text-xs uppercase font-bold tracking-widest text-[#0088ff] hover:text-white transition-colors"
          >
            ← Return to Portal
          </Link>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        
        {/* Document Header Lockup */}
        <div className="mb-12 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0088ff]/10 border border-[#0088ff]/40 text-[#0088ff] font-mono text-xs font-bold uppercase tracking-widest rounded-sm mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Internal Governance Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-mono">
            Employee Incentive Program & Terms of Use
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-mono mt-3 uppercase tracking-wider">
            Interwest Mechanical Contractors (IMC) &bull; Last Revised: {lastUpdated}
          </p>
        </div>

        {/* Tactical Document Section Content */}
        <div className="space-y-10 font-sans text-sm sm:text-base leading-relaxed text-slate-300">
          
          {/* Section 1 */}
          <section className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#0088ff]" />
            <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#0088ff]" /> 1. Program Scope & Purpose
            </h2>
            <p className="mb-3">
              The IMC Safety Point & Recognition Incentive Program is a discretionary employee wellness and job-site compliance reward system administered by Interwest Mechanical Contractors ("IMC", "Company", "we", "us").
            </p>
            <p>
              Participation in this program is granted exclusively to active employees. The primary objective is to promote verifiable safety compliance, proactive hazard reporting, and peer appreciation across all active shop and field work environments.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#ea1f27]" />
            <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-[#ea1f27]" /> 2. No Cash Value & Non-Transferability
            </h2>
            <ul className="space-y-3 list-disc list-inside text-slate-300 font-mono text-xs sm:text-sm">
              <li>
                <strong className="text-white">Zero Monetary Value:</strong> Safety points accrued within the portal hold strictly zero ($0.00) monetary cash value, cannot be redeemed for currency, and do not constitute earned wages or vested compensation.
              </li>
              <li>
                <strong className="text-white">Non-Transferable:</strong> Safety points cannot be sold, bartered, gifted, or transferred between employees or external third parties under any circumstances.
              </li>
              <li>
                <strong className="text-white">No Property Right:</strong> Points remain the administrative property of IMC until an order for physical merchandise is authorized, procured, and formally delivered.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#0088ff]" />
            <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider flex items-center gap-2 mb-4">
              <UserX className="w-5 h-5 text-[#0088ff]" /> 3. Employment Contingency & Forfeiture
            </h2>
            <p className="mb-3">
              To accrue points, initiate reward requisitions, and receive catalog items, an individual must maintain active, good-standing employment with IMC at both the time of requisition and the time of physical item distribution.
            </p>
            <div className="p-4 bg-red-950/20 border border-red-800/40 rounded-sm text-xs font-mono text-red-200 mt-4 leading-relaxed">
              <strong>TERMINATION / SEPARATION CLAUSE:</strong> In the event of employee separation—whether through voluntary resignation, termination for cause, termination without cause, retirement, or structural reduction in force / layoff—all accumulated, unfulfilled safety points are immediately rendered null and void. IMC is not liable for payout or merchandise compensation for forfeited point balances.
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00ff9d]" />
            <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-[#00ff9d]" /> 4. Reward Requisition, Procurement & Logistics
            </h2>
            <ul className="space-y-3 list-disc list-inside text-slate-300 font-mono text-xs sm:text-sm">
              <li>
                <strong className="text-white">Company Procurement:</strong> All catalog merchandise (including coolers, tools, branded gear, apparel, and electronics) is purchased by IMC on behalf of qualifying employees upon approved digital requisition.
              </li>
              <li>
                <strong className="text-white">Inventory & Substitutions:</strong> Catalog items are subject to manufacturer availability and supplier pricing changes. IMC reserves the right to substitute out-of-stock items with merchandise of equivalent tier or return point balances.
              </li>
              <li>
                <strong className="text-white">As-Is Fulfillment & Warranties:</strong> IMC provides all reward gifts "as-is" with no supplementary company warranties. Any product defect or warranty coverage must be processed directly through the original manufacturer.
              </li>
              <li>
                <strong className="text-white">Final Sales:</strong> Once an order is processed and delivered, exchanges or point refunds are not permitted except in cases of shipping damage verified upon receipt.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#fbbf24]" />
            <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#fbbf24]" /> 5. Program Integrity & Fraud Prevention
            </h2>
            <p className="mb-3">
              The safety incentive system relies upon strict honesty. The following behaviors constitute a direct violation of company policy:
            </p>
            <ul className="space-y-2 list-disc list-inside text-slate-300 font-mono text-xs sm:text-sm mb-4">
              <li>Signing off on daily pre-shift safety checklists without reviewing safety conditions or donning required PPE.</li>
              <li>Submitting fraudulent, fabricated, or collusive Peer Safe Act reports to artificially inflate points balances.</li>
              <li>Attempting to tamper with portal endpoints, databases, or API payloads.</li>
            </ul>
            <p className="text-xs font-mono text-amber-200">
              Violations will result in immediate cancellation of accrued points, removal from the incentive portal, and disciplinary action up to and including termination of employment.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-slate-600" />
            <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-slate-400" /> 6. Tax Obligations & Program Modifications
            </h2>
            <p className="mb-3">
              <strong className="text-white">Tax Liability:</strong> Under IRS guidelines, non-cash employer gifts or merchandise awards of certain values may be subject to payroll reporting or individual income taxation. Employees are solely responsible for understanding personal tax implications.
            </p>
            <p>
              <strong className="text-white">Right to Modify or Terminate:</strong> IMC reserves the right to adjust point allocations, alter catalog pricing, modify qualifying rules, or discontinue the program entirely at any time without prior notice.
            </p>
          </section>

        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Interwest Mechanical Contractors. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

      </main>
    </div>
  );
}