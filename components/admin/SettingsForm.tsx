'use client'
import { useState } from 'react'
import type { SiteSettings } from '@prisma/client'

export default function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [title, setTitle] = useState(settings?.siteTitle ?? '')
  const [weddingDate, setWeddingDate] = useState(
    settings?.weddingDate ? new Date(settings.weddingDate).toISOString().split('T')[0] : ''
  )
  const [coupleNames, setCoupleNames] = useState(settings?.coupleNames ?? '')
  const [rsvpCutoff, setRsvpCutoff] = useState(
    settings?.rsvpCutoff ? new Date(settings.rsvpCutoff).toISOString().split('T')[0] : ''
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle: title,
          weddingDate: weddingDate || null,
          coupleNames,
          rsvpCutoff: rsvpCutoff || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setMessage('Saved!')
    } catch {
      setMessage('Error saving settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Site Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border border-stone-300 rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Couple Names</label>
        <input
          type="text"
          value={coupleNames}
          onChange={e => setCoupleNames(e.target.value)}
          className="w-full border border-stone-300 rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Wedding Date</label>
        <input
          type="date"
          value={weddingDate}
          onChange={e => setWeddingDate(e.target.value)}
          className="w-full border border-stone-300 rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">RSVP Cutoff Date</label>
        <input
          type="date"
          value={rsvpCutoff}
          onChange={e => setRsvpCutoff(e.target.value)}
          className="w-full border border-stone-300 rounded px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-stone-800 text-white px-4 py-2 rounded text-sm hover:bg-stone-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {message && <span className="text-sm text-stone-600">{message}</span>}
      </div>
    </form>
  )
}
