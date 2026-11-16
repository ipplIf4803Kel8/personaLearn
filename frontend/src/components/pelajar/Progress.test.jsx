import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProgressBar, ProgressRing } from '@/components/pelajar/Progress'

afterEach(cleanup)

describe('ProgressRing', () => {
  it('menampilkan persen dan nilai aksesibel', () => {
    render(<ProgressRing value={40} />)
    expect(screen.getByText('40%')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('40')
  })

  it('membatasi nilai di luar 0 sampai 100 dan membulatkan', () => {
    const { rerender } = render(<ProgressRing value={140} />)
    expect(screen.getByText('100%')).toBeTruthy()
    rerender(<ProgressRing value={-5} />)
    expect(screen.getByText('0%')).toBeTruthy()
    rerender(<ProgressRing value={33.6} />)
    expect(screen.getByText('34%')).toBeTruthy()
  })

  it('lingkaran terisi sesuai persen', () => {
    const { container } = render(<ProgressRing value={25} size={100} stroke={10} />)
    const arc = container.querySelectorAll('circle')[1]
    const keliling = 2 * Math.PI * 45
    expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(keliling * 0.75)
  })
})

describe('ProgressBar', () => {
  it('lebar mengikuti nilai', () => {
    render(<ProgressBar value={60} />)
    expect(screen.getByRole('progressbar').firstElementChild.style.width).toBe('60%')
  })
})
