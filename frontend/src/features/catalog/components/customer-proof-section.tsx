import React from 'react';
import Image from 'next/image';
import { StarIcon, ShieldCheckIcon } from '@/components/ui/icons';

export function CustomerProofSection() {
  const REVIEWS = [
    {
      name: 'Tanvir Hossain',
      location: 'Dhanmondi, Dhaka',
      device: 'iPhone 15 Pro Max 256GB (Natural Titanium)',
      comment: 'Bought in-person from the Bashundhara City store. They ran 3uTools right in front of me: battery was 99%, display was 100% genuine OLED with True Tone intact. Hands down the most professional pre-owned store in Dhaka.',
      rating: 5,
      date: '2 days ago',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Dr. Nusrat Jahan',
      location: 'GEC Circle, Chittagong',
      device: 'iPhone 14 Pro 128GB (Deep Purple)',
      comment: 'Ordered through Cash on Delivery to Chittagong. The courier allowed me to open the parcel, inspect True Tone, camera lenses, and check IMEI with BTRC before paying. Extremely transparent service.',
      rating: 5,
      date: '5 days ago',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Sazzad Karim',
      location: 'Uttara, Dhaka',
      device: 'iPhone 13 128GB (Midnight)',
      comment: 'Exchanged my older phone for an iPhone 13. Used the online valuation calculator, got ৳27,000 for my device, and settled the difference. The staff at Jamuna Future Park was courteous and efficient.',
      rating: 5,
      date: '1 week ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
        <div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
            Customer Feedback
          </span>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl mt-0.5">
            Verified Customer Experiences
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} size={13} filled className="text-amber-500" />
            ))}
          </div>
          <span className="text-zinc-900 dark:text-white font-semibold ml-1">4.9 / 5</span>
          <span className="text-zinc-400">Rating Across 14,000+ Orders</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {REVIEWS.map((review) => (
          <div
            key={review.name}
            className="apple-card flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} size={12} filled className="text-amber-500" />
                  ))}
                </div>
                <span className="text-[11px] text-zinc-400">{review.date}</span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                &ldquo;{review.comment}&rdquo;
              </p>

              <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <ShieldCheckIcon size={12} className="text-emerald-500 shrink-0" />
                <span className="truncate">Purchased: {review.device}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                  {review.name}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {review.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
