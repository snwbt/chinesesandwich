'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Page } from '@prisma/client'

export default function PageEditor({ page, defaultSlug }: { page: Page | null; defaultSlug: string }) {
  const router = useRouter()
  const [slug, setSlug] = useState(page?.slug ?? defaultSlug)
  const [title, setTitle] = useState(page?.title ?? '')
  const [content, setContent] = useState(page?.content ?? '')
  const [published, setPublished] = useState(page?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const method = page ? 'PATCH' : 'POST'
    const url = page ? `/api/admin/pages/${page.id}` : '/api/admin/pages'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, title, content, published }),
    })
    setSaving(false)
    if (res.ok) {
      router.push('/admin/pages')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to save page.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-2xl'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-stone-700 mb-1'>Slug</label>
          <input
            type='text'
            value={slug}
            onChange={e => setSlug(e.target.value)}
            disabled={!!page}
            className='w-full border border-stone-300 rounded px-3 py-2 text-sm disabled:bg-stone-100'
            placeholder='about'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-stone-700 mb-1'>Title</label>
          <input
            type='text'
            value={title}
            onChange={e => setTitle(e.target.value)}
            className='w-full border border-stone-300 rounded px-3 py-2 text-sm'
          />
        </div>
      </div>
      <div>
        <label className='block text-sm font-medium text-stone-700 mb-1'>Content (HTML)</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={20}
          className='w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono'
        />
      </div>
      <label className='flex items-center gap-2 text-sm'>
        <input type='checkbox' checked={published} onChange={e => setPublished(e.target.checked)} />
        Published
      </label>
      {error && <p className='text-sm text-red-600'>{error}</p>}
      <div className='flex gap-3'>
        <button
          type='submit'
          disabled={saving || !slug.trim() || !title.trim()}
          className='bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50'
        >
          {saving ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
        </button>
        <button
          type='button'
          onClick={() => router.push('/admin/pages')}
          className='border border-stone-300 px-4 py-2 rounded text-sm'
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
