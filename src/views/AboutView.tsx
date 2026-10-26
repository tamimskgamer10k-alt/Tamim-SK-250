import React from 'react';
import {
  Info,
  ShieldCheck,
  Sparkles,
  Code2,
  Heart,
  Globe2,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../translations';

interface AboutViewProps {
  language: Language;
}

export const AboutView: React.FC<AboutViewProps> = ({ language }) => {
  const t = getTranslation(language);

  return (
    <div className="max-w-4xl space-y-6 pb-20 text-neutral-300">
      {/* Brand Hero */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-[#14161F] to-[#0B0C10] border border-neutral-800 text-center relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 to-[#99000A] text-white flex items-center justify-center font-extrabold text-2xl mx-auto mb-4 shadow-xl shadow-red-900/40">
          T
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Tamimmate</h1>
        <p className="text-base text-red-400 font-semibold mb-4">{t.tagline}</p>
        <p className="text-xs md:text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          {t.about.story}
        </p>
      </div>

      {/* Technical Architecture Highlights */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-red-500" />
          Technical Stack & Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">Frontend UI</span>
            <strong className="text-white text-sm block mt-0.5">React 19 + TypeScript</strong>
            <span className="text-neutral-400 text-[11px]">Tailwind CSS 4 + Lucide Icons</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">Backend Server</span>
            <strong className="text-white text-sm block mt-0.5">Express + Node.js</strong>
            <span className="text-neutral-400 text-[11px]">SSRF Protection & Media Inspector</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">AI Integration</span>
            <strong className="text-white text-sm block mt-0.5">Google Gemini 3.8 Flash</strong>
            <span className="text-neutral-400 text-[11px]">@google/genai SDK (Server-Side)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">Mobile & Desktop</span>
            <strong className="text-white text-sm block mt-0.5">Progressive Web App (PWA)</strong>
            <span className="text-neutral-400 text-[11px]">Installable shell with offline cache</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">Languages</span>
            <strong className="text-white text-sm block mt-0.5">English & বাংলা (Bengali)</strong>
            <span className="text-neutral-400 text-[11px]">Dynamic bidirectional localization</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">Security Engine</span>
            <strong className="text-white text-sm block mt-0.5">Zero-Trust Media Proxy</strong>
            <span className="text-neutral-400 text-[11px]">Loopback & private IP blocking</span>
          </div>
        </div>
      </div>

      {/* Legal & Copyright Compliance Notice */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Legal & Intellectual Property Policy
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          {t.about.legalNotice}
        </p>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Tamimmate provides tools for downloading direct open-source files, public-domain media, Creative Commons creations, and user-owned content. It explicitly does not download DRM-protected video on demand or bypass third-party subscription paywalls.
        </p>
      </div>

      {/* Open Source Acknowledgements */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          Open Source & Creative Commons Acknowledgements
        </h3>
        <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
          <li>Blender Foundation: Open movie projects (Big Buck Bunny, Tears of Steel, Sintel).</li>
          <li>SoundHelix & Free Music Archive: Royalty-free audio test fixtures.</li>
          <li>Public Domain Cinema Archives: Historical films (Night of the Living Dead, Metropolis, A Trip to the Moon).</li>
          <li>F-Droid & VideoLAN Project: Open-source application references.</li>
          <li>Lucide Icons & Tailwind CSS: Open UI engineering frameworks.</li>
        </ul>
      </div>

      {/* Build Info */}
      <div className="text-center text-xs text-neutral-500 pt-4">
        Tamimmate Universal Web App • Version 1.0.0 Production Release
      </div>
    </div>
  );
};
