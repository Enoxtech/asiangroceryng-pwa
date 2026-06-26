'use client';

import { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { Category } from '@/types';
import { slugify } from '@/lib/utils';

const categoryIcons: Record<string, string> = {
  boba: '☕', chopsticks: '🥢', cookwares: '👨‍🍳', drinks: '🥤',
  'fresh-produce': '🌿', 'frozen-products': '❄️', grains: '🌾',
  molds: '📦', 'noodles-ramen': '🍜', 'pantry-staples': '🧺',
  'sauces-condiments': '🧪', snacks: '🍪',
};

function CategoryRow({ category, canWrite }: { category: Category; canWrite: boolean }) {
  const { updateCategory, deleteCategory, products } = useAdminStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(category);
  const [deleting, setDeleting] = useState(false);

  const actualCount = products.filter((p) => p.categorySlug === category.slug).length;

  function save() {
    updateCategory(category.id, draft);
    setEditing(false);
  }

  async function handleDelete() {
    if (actualCount > 0) {
      alert(`Can't delete — ${actualCount} product(s) still use this category. Reassign them first.`);
      return;
    }
    if (!confirm(`Delete category "${category.name}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await deleteCategory(category.id);
    } finally {
      setDeleting(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)]';

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: '#0f0e0b' }}>
          {category.emoji || categoryIcons[category.slug] || '📦'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm font-display">{category.name}</p>
          <p className="text-xs text-gray-500 font-display truncate max-w-xs">{category.description}</p>
          <p className="text-[10px] text-gray-600 font-label mt-0.5">/{category.slug} · {actualCount} products</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canWrite ? (
            <>
              <button onClick={() => setEditing(!editing)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-display">
                Edit
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <span className="text-[10px] text-gray-600 font-label uppercase">View only</span>
          )}
        </div>
      </div>

      {editing && canWrite && (
        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0e0b' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Category Name</label>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Emoji</label>
              <input value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} className={inputCls} maxLength={4} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Slug (read-only)</label>
              <input value={category.slug} readOnly className={`${inputCls} opacity-40 cursor-not-allowed`} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Description</label>
              <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer">
              <Save className="h-3.5 w-3.5" /> Save
            </button>
            <button onClick={() => { setDraft(category); setEditing(false); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = { name: '', emoji: '📦', description: '' };

function AddCategoryForm({ onClose }: { onClose: () => void }) {
  const { categories, addCategory } = useAdminStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const slug = slugify(form.name);
  const inputCls = 'w-full px-3 py-2 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)]';

  async function handleSave() {
    setError('');
    if (!form.name.trim()) { setError('Category name is required'); return; }
    if (categories.some((c) => c.slug === slug)) { setError('A category with this name/slug already exists'); return; }

    setSaving(true);
    try {
      await addCategory({
        id: `cat-${slug}`,
        name: form.name.trim(),
        slug,
        emoji: form.emoji || '📦',
        description: form.description.trim() || `${form.name.trim()} products.`,
        image: `https://placehold.co/300x300/e8e0f4/3a1a6a?text=${encodeURIComponent(form.name.trim())}`,
        productCount: 0,
      });
      onClose();
    } catch {
      setError('Could not create category. Try a different name.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#0f0e0b', borderColor: 'rgba(196,30,58,0.3)' }}>
      {error && <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-display">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Category Name *</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Healthcare" className={inputCls} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Emoji</label>
          <input value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} className={inputCls} maxLength={4} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Description</label>
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Shown on the category page" className={inputCls} />
        </div>
        {form.name && (
          <p className="sm:col-span-2 text-[10px] text-gray-600 font-label">Slug will be: /{slug}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
          <Save className="h-3.5 w-3.5" /> {saving ? 'Creating…' : 'Create Category'}
        </button>
        <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const { categories } = useAdminStore();
  const { session } = useAdminAuthStore();
  const canWrite = session?.role !== 'support';
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">{categories.length} categories</p>
        </div>
        {canWrite && !adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer shrink-0">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {adding && <AddCategoryForm onClose={() => setAdding(false)} />}

      <div className="space-y-3">
        {categories.map((cat) => (
          <CategoryRow key={cat.id} category={cat} canWrite={canWrite} />
        ))}
      </div>
    </div>
  );
}
