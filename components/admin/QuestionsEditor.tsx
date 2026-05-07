'use client'

import { useState } from 'react'
import type { CustomQuestion } from '@prisma/client'

export default function QuestionsEditor({ questions: initial }: { questions: CustomQuestion[] }) {
  const [questions, setQuestions] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState('text')
  const [newRequired, setNewRequired] = useState(false)
  const [newOptions, setNewOptions] = useState('')

  async function addQuestion() {
    const options = newOptions.split(',').map(s => s.trim()).filter(Boolean)
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: newLabel,
        type: newType,
        required: newRequired,
        options: options,
        order: questions.length,
      }),
    })
    if (res.ok) {
      const q = await res.json()
      setQuestions(prev => [...prev, q])
      setNewLabel('')
      setNewType('text')
      setNewRequired(false)
      setNewOptions('')
      setAdding(false)
    }
  }

  async function deleteQuestion(id: string) {
    const res = await fetch(`/api/admin/questions?questionId=${id}`, { method: 'DELETE' })
    if (res.ok) setQuestions(prev => prev.filter(q => q.id !== id))
  }

  async function toggleRequired(q: CustomQuestion) {
    const res = await fetch(`/api/admin/questions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: q.id, required: !q.required }),
    })
    if (res.ok) {
      const updated = await res.json()
      setQuestions(prev => prev.map(x => x.id === updated.id ? updated : x))
    }
  }

  return (
    <div className='space-y-4'>
      <ul className='space-y-2'>
        {questions.map(q => (
          <li key={q.id} className='flex items-center justify-between border border-stone-200 rounded px-4 py-3'>
            <div>
              <span className='font-medium text-stone-800'>{q.label}</span>
              <span className='ml-2 text-xs text-stone-500'>{q.type}</span>
              {q.required && <span className='ml-2 text-xs text-red-500'>required</span>}
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => toggleRequired(q)}
                className='text-xs text-stone-500 hover:text-stone-800 border border-stone-300 rounded px-2 py-1'
              >
                {q.required ? 'Make optional' : 'Make required'}
              </button>
              <button
                onClick={() => deleteQuestion(q.id)}
                className='text-xs text-red-500 hover:text-red-700 border border-red-300 rounded px-2 py-1'
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className='border border-stone-200 rounded p-4 space-y-3'>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>Question Label</label>
            <input
              type='text'
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className='w-full border border-stone-300 rounded px-3 py-2 text-sm'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>Type</label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className='border border-stone-300 rounded px-3 py-2 text-sm'
            >
              <option value='text'>Text</option>
              <option value='select'>Select</option>
              <option value='radio'>Radio</option>
              <option value='checkbox'>Checkbox</option>
            </select>
          </div>
          {(newType === 'select' || newType === 'radio') && (
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>Options (comma-separated)</label>
              <input
                type='text'
                value={newOptions}
                onChange={e => setNewOptions(e.target.value)}
                className='w-full border border-stone-300 rounded px-3 py-2 text-sm'
                placeholder='Option 1, Option 2'
              />
            </div>
          )}
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={newRequired} onChange={e => setNewRequired(e.target.checked)} />
            Required
          </label>
          <div className='flex gap-2'>
            <button
              onClick={addQuestion}
              disabled={!newLabel.trim()}
              className='bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50'
            >
              Add
            </button>
            <button
              onClick={() => setAdding(false)}
              className='border border-stone-300 px-4 py-2 rounded text-sm'
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className='bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm'
        >
          Add Question
        </button>
      )}
    </div>
  )
}
