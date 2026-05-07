'use client'
import { useState } from 'react'
import type { RegistryLink } from '@prisma/client'

export default function RegistryEditor({ links: initial }: { links: RegistryLink[] }) {
  const [links, setLinks] = useState(initial)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function addLink() {
    if (!newTitle || !newUrl) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, url: newUrl, order: links.length }),
      })
      if (!res.ok) throw new Error(await res.text())
      const created: RegistryLink = await res.json()
      setLinks([...links, created])
      setNewTitle('')
      setNewUrl('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add link')
    } finally {
      setSaving(false)
    }
  }

  async function removeLink(id: string) {
    try {
      const res = await fetch(`/api/admin/registry?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      setLinks(links.filter((l) => l.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove link')
    }
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-gray-200">
        {links.map((link) => (
          <li key={link.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{link.title}</p>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                {link.url}
              </a>
            </div>
            <button
              onClick={() => removeLink(link.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="space-y-3 border-t pt-4">
        <h3 className="font-medium">Add Registry Link</h3>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="block w-full border rounded px-3 py-2 text-sm"
        />
        <input
          type="url"
          placeholder="URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="block w-full border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={addLink}
          disabled={saving || !newTitle || !newUrl}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {saving ? 'Adding…' : 'Add Link'}
        </button>
      </div>
    </div>
  )
}
