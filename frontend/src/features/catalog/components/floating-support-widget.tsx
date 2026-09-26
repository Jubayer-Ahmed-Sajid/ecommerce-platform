'use client';

import React, { useState } from 'react';
import { MessageCircleIcon, PhoneIcon, XIcon } from '@/components/ui/icons';

export function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5 print:hidden">
      {/* Quick popup tooltip when expanded */}
      {isOpen && (
        <div className="w-72 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-white shadow-xl backdrop-blur-xl animate-scaleIn">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-zinc-200">Store Specialist Online</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white text-xs p-1"
              aria-label="Close support dialog"
            >
              <XIcon size={14} />
            </button>
          </div>

          <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-normal">
            Need verification photos, battery health readings, or assistance trading in your older phone?
          </p>

          <div className="mt-3.5 space-y-2">
            <a
              href="https://wa.me/8801976478673?text=Hello%20iStoreBD!%20I%20have%20a%20question%20about%20a%20pre-owned%20iPhone."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold py-2 px-3 text-xs transition-colors shadow-xs"
            >
              <MessageCircleIcon size={14} className="text-emerald-600" />
              <span>Message on WhatsApp</span>
            </a>

            <a
              href="tel:+8801800478673"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-3 text-xs transition-colors"
            >
              <PhoneIcon size={13} className="text-zinc-400" />
              <span>Call Hotline (01800-478673)</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <div className="hidden sm:block rounded-full bg-zinc-900 text-zinc-200 text-xs font-medium px-3 py-1 shadow-md border border-zinc-800">
            Need assistance? Speak with our team
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Contact iPhone Support"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md hover:opacity-90 active:scale-95 transition-all border border-zinc-800 dark:border-zinc-200"
        >
          {isOpen ? (
            <XIcon size={18} />
          ) : (
            <MessageCircleIcon size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
