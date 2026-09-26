'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../api/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon } from '@/components/ui/icons';

export function CreateCategoryModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !slug.trim()) {
      setErrorMessage('Name and slug are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await adminApi.createCategory({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        displayOrder: parseInt(displayOrder, 10) || 0,
      });

      setIsOpen(false);
      setName('');
      setSlug('');
      setDescription('');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create category.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="font-semibold"
      >
        + Add Category
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Category
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close"
              >
                <XIcon size={16} />
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Category Name"
                required
                placeholder="e.g. Footwear & Accessories"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />

              <Input
                label="URL Slug"
                required
                placeholder="e.g. footwear-accessories"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <Input
                label="Description (Optional)"
                placeholder="Brief summary of category products..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Input
                label="Display Order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold"
                  isLoading={isSubmitting}
                >
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
