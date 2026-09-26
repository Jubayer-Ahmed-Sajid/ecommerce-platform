import React from 'react';
import {
  SmartphoneIcon,
  EyeIcon,
  BatteryChargingIcon,
  RadioIcon,
  CameraIcon,
  WrenchIcon,
  ShieldCheckIcon,
  CheckIcon,
} from '@/components/ui/icons';

export function DiagnosticInspectionSection() {
  const CHECKPOINTS = [
    {
      category: '1. Display & True Tone',
      icon: SmartphoneIcon,
      checks: [
        'Original Super Retina XDR OLED verified (zero cheap TFT panels)',
        'True Tone calibration active and functional',
        '120Hz ProMotion high-refresh responsiveness verified',
        '3uTools original display serial number match (100%)',
      ],
    },
    {
      category: '2. Biometrics & Sensors',
      icon: EyeIcon,
      checks: [
        'Face ID dot projector & infrared camera 100% operational',
        'LiDAR 3D depth sensor operational on Pro models',
        'Proximity, ambient light, gyroscope & accelerometer calibrated',
        'Haptic Engine & vibration motor tested',
      ],
    },
    {
      category: '3. Battery Health & Cycles',
      icon: BatteryChargingIcon,
      checks: [
        'Minimum 85% to 100% genuine Apple health verified',
        'Original battery controller serials verified (No warning popups)',
        'Certified charge cycle count under standard threshold',
        'Fast charge 20W & MagSafe wireless charging validated',
      ],
    },
    {
      category: '4. Legitimacy & Network',
      icon: RadioIcon,
      checks: [
        'Clean BTRC database check & factory unlocked',
        '100% iCloud account removed & factory reset verified',
        'Dual Physical SIM or eSIM radio antenna testing on 4G/5G',
        'Clean IMEI with zero carrier blacklist or finance lock',
      ],
    },
    {
      category: '5. Cameras & Audio',
      icon: CameraIcon,
      checks: [
        '4K 60fps & Cinematic video recording tested',
        'Optical Image Stabilization (OIS) sensor shift verified',
        '0.5x Ultra-Wide, 1x Wide, and 3x/5x Telephoto clarity',
        'Stereo top/bottom speakers and dual noise-cancelling mics',
      ],
    },
    {
      category: '6. Hardware Integrity',
      icon: WrenchIcon,
      checks: [
        'Liquid Contact Indicator (LCI) white — zero water intrusion',
        'Motherboard untouched with zero jumper wire repairs',
        'Precision CNC physical buttons (Action button, Volume, Power)',
        'Grade A+ or A cosmetic chassis grade audit',
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-0.5 text-xs font-medium">
            <ShieldCheckIcon size={13} className="text-emerald-500" />
            <span>70-Point Hardware Lab Audit</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
            Why Every Used iPhone Here Is 100% Safe
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Unlike informal marketplaces where replaced LCDs, dead Face IDs, and bypassed batteries are rampant, every single device at iStoreBD passes our certified 70-point diagnostics workstation.
          </p>
        </div>

        {/* 6 Diagnostic Grids */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHECKPOINTS.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.category}
                className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/40 space-y-3"
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    <Icon size={14} />
                  </div>
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    {cat.category}
                  </h3>
                </div>

                <ul className="space-y-2">
                  {cat.checks.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      <CheckIcon size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
