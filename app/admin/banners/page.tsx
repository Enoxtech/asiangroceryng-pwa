'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Save, X } from 'lucide-react';
import { useAdminStore, BannerSlide, SlideTransition, SlideAlign } from '@/store/adminStore';

const emptyBanner = (): BannerSlide => ({
  id: `banner-${Date.now()}`,
  image: '/banners/hero.png',
  headline: 'New Banner',
  subtitle: 'Enter a subtitle here',
  ctaLabel: 'Shop Now',
  ctaHref: '/shop',
  transition: 'fade',
  align: 'left',
  enabled: true,
});

function BannerRow({ banner, index, total }: { banner: BannerSlide; index: number; total: number }) {
  const { updateBanner, deleteBanner, moveBanner } = useAdminStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(banner);

  function save() {
    updateBanner(banner.id, draft);
    setEditing(false);
  }

  function cancel() {
    setDraft(banner);
    setEditing(false);
  }

  const inputCls = 'w-full px-3 py-2 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)]';

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Preview thumbnail */}
        <div className="relative h-14 w-24 rounded-lg overflow-hidden shrink-0 bg-[#0f0e0b]">
          <Image src={banner.image} alt={banner.headline} fill className="object-cover" sizes="96px"
            onError={(e) => { (e.target as HTMLImageElement).src = '/banners/hero.png'; }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm font-display truncate">{banner.headline}</p>
          <p className="text-xs text-gray-500 font-display truncate">{banner.subtitle}</p>
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-label uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{ background: banner.enabled ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: banner.enabled ? '#10B981' : '#6B7280' }}>
            {banner.enabled ? 'Active' : 'Hidden'}
          </span>
          <span className="ml-2 text-[10px] font-label text-gray-600 capitalize">{banner.transition} · {banner.align}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => moveBanner(banner.id, 'up')} disabled={index === 0}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-25 transition-colors cursor-pointer">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button onClick={() => moveBanner(banner.id, 'down')} disabled={index === total - 1}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-25 transition-colors cursor-pointer">
            <ChevronDown className="h-4 w-4" />
          </button>
          <button onClick={() => updateBanner(banner.id, { enabled: !banner.enabled })}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            {banner.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button onClick={() => setEditing(!editing)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-display">
            Edit
          </button>
          <button onClick={() => deleteBanner(banner.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0e0b' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Image URL</label>
              <input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className={inputCls} placeholder="/banners/hero.png" />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Headline</label>
              <input value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Subtitle</label>
              <input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">CTA Button Text</label>
              <input value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">CTA Link</label>
              <input value={draft.ctaHref} onChange={(e) => setDraft({ ...draft, ctaHref: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Transition Style</label>
              <select value={draft.transition} onChange={(e) => setDraft({ ...draft, transition: e.target.value as SlideTransition })}
                className={`${inputCls} bg-[#0f0e0b]`}>
                <option value="fade">Fade</option>
                <option value="slide">Slide In</option>
                <option value="zoom">Zoom In</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Text Alignment</label>
              <select value={draft.align} onChange={(e) => setDraft({ ...draft, align: e.target.value as SlideAlign })}
                className={`${inputCls} bg-[#0f0e0b]`}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer">
              <Save className="h-3.5 w-3.5" /> Save
            </button>
            <button onClick={cancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBannersPage() {
  const { banners, addBanner } = useAdminStore();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Hero Banners</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">Manage the homepage slider — changes reflect immediately.</p>
        </div>
        <button
          onClick={() => addBanner(emptyBanner())}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <div className="space-y-3">
        {banners.map((banner, i) => (
          <BannerRow key={banner.id} banner={banner} index={i} total={banners.length} />
        ))}
        {banners.length === 0 && (
          <div className="rounded-2xl border py-12 text-center" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-gray-500 font-display text-sm">No banners yet. Add one above.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-4" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-xs text-gray-500 font-display">
          <span className="text-gray-300 font-semibold">Tip:</span> Banners are saved to your browser. For persistent changes across devices, connect Supabase in Phase 2.
          Use the arrows to reorder, the eye icon to show/hide, and Edit to change content.
        </p>
      </div>
    </div>
  );
}
