import { Crown, Clock, Mail } from "lucide-react";

export const MAINTENANCE_MODE = true;

const CONTACT_EMAIL = "akitikori.wellington2031@gmail.com";

export default function MaintenanceGate() {
  return (
    <div className="fixed inset-0 z-[999] bg-gray-950 flex items-center justify-center px-5 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full bg-gold-500/10 blur-3xl"
          style={{ top: "-10%", left: "-10%" }}
        />
        <div
          className="absolute w-96 h-96 rounded-full bg-gold-500/5 blur-3xl"
          style={{ bottom: "-10%", right: "-5%" }}
        />
      </div>

      <div className="relative w-full max-w-md text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 flex items-center justify-center shadow-gold mx-auto mb-8">
          <Crown size={28} className="text-white" strokeWidth={2.25} />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/10 border border-gold-500/25 rounded-full text-gold-300 text-xs font-bold tracking-widest uppercase mb-6">
          <Clock size={12} />
          Under Maintenance
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-snug mb-4">
          Improving your experience
        </h1>

        <p className="text-gray-400 text-sm sm:text-[15px] leading-relaxed mb-4 max-w-sm mx-auto">
          We are currently performing routine maintenance and fixing minor bugs
          on the platform to ensure everything runs smoothly.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          Please hold on and check back shortly. We sincerely apologize for any
          inconvenience this temporary downtime may cause and appreciate your
          patience!
        </p>

        {CONTACT_EMAIL && (
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-800 text-gray-300 text-sm font-medium hover:border-gold-500/40 hover:text-gold-300 transition-colors"
          >
            <Mail size={15} />
            {CONTACT_EMAIL}
          </a>
        )}

        <p className="text-gray-600 text-xs mt-10">
          TASA 2026 · University of Benin
        </p>
      </div>
    </div>
  );
}
