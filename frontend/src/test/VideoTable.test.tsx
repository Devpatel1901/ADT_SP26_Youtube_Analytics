import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VideoTable from '@/components/VideoTable'
import type { Video } from '@/types/api'

const sample: Video = {
  snapshot_id: 1, video_id: 'v1', trending_date: '2024-11-15',
  title: 'Hello world', channel_title: 'Ch', channel_id: 'cid',
  views: 1234, likes: 100, dislikes: 1, comments: 10,
  publish_time: '2024-11-14T00:00:00Z', category_id: 10, category_name: 'Music',
  tags: 'a|b', description: null, is_deleted: false,
  created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-15T00:00:00Z',
}

describe('VideoTable', () => {
  it('renders rows and shows the title', () => {
    render(
      <MemoryRouter>
        <VideoTable rows={[sample]} onDelete={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('Music')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('invokes onDelete with snapshot_id when Delete clicked', () => {
    const fn = vi.fn()
    render(
      <MemoryRouter>
        <VideoTable rows={[sample]} onDelete={fn} />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('shows empty state when no rows', () => {
    render(
      <MemoryRouter>
        <VideoTable rows={[]} onDelete={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/no results/i)).toBeInTheDocument()
  })
})
