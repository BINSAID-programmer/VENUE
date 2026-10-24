import React from 'react';
import { HelpCircle, Mail, MessageCircle, Phone, ShieldCheck, ExternalLink } from 'lucide-react';
import {
  PRIVACY_POLICY_PATH,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_E164,
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_URL,
} from '../../config/contact';

const row =
  'w-full py-2.5 px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between gap-3 transition-colors';

export const HelpSupport: React.FC = () => (
  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
    <div className="flex items-center gap-2">
      <HelpCircle className="w-4 h-4 text-indigo-400" />
      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Help & Support</h3>
    </div>
    <p className="text-[11px] text-slate-400 leading-relaxed">
      Have a problem or a question about VENUE? Contact us and we will help you quickly.
    </p>

    <a href={`tel:+${SUPPORT_PHONE_E164}`} className={row}>
      <span className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-emerald-400" /> Call
      </span>
      <span className="text-slate-400 font-mono">{SUPPORT_PHONE_DISPLAY}</span>
    </a>
    <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={row}>
      <span className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp
      </span>
      <span className="text-slate-400 font-mono">{SUPPORT_WHATSAPP_DISPLAY}</span>
    </a>
    <a
      href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('VENUE - Support')}`}
      className={row}
    >
      <span className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-sky-400" /> Email
      </span>
      <span className="text-slate-400 truncate">{SUPPORT_EMAIL}</span>
    </a>
    <a href={PRIVACY_POLICY_PATH} target="_blank" rel="noopener noreferrer" className={row}>
      <span className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-400" /> Privacy Policy
      </span>
      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
    </a>
  </div>
);
