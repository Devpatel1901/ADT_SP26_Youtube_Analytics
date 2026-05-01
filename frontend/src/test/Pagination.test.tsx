import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '@/components/Pagination'

describe('Pagination', () => {
  it('disables Prev on page 1', () => {
    render(<Pagination total={50} page={1} pageSize={10} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
  })

  it('advances on Next click', () => {
    const fn = vi.fn()
    render(<Pagination total={50} page={2} pageSize={10} onChange={fn} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(fn).toHaveBeenCalledWith(3)
  })

  it('reports zero results when empty', () => {
    render(<Pagination total={0} page={1} pageSize={10} onChange={() => {}} />)
    expect(screen.getByText(/0 results/i)).toBeInTheDocument()
  })
})
