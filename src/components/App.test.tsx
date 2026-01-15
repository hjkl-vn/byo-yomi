import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App desktop layout', () => {
  it('renders outer wrapper with desktop centering classes', () => {
    const { container } = render(<App />)
    const outerWrapper = container.firstChild as HTMLElement

    expect(outerWrapper).toHaveClass('bg-neutral-950')
    expect(outerWrapper).toHaveClass('xl:flex')
    expect(outerWrapper).toHaveClass('xl:items-center')
    expect(outerWrapper).toHaveClass('xl:justify-center')
  })

  it('renders phone frame container with desktop constraints', () => {
    const { container } = render(<App />)
    const outerWrapper = container.firstChild as HTMLElement
    const phoneFrame = outerWrapper.firstChild as HTMLElement

    // Desktop frame constraints
    expect(phoneFrame).toHaveClass('xl:h-[90vh]')
    expect(phoneFrame).toHaveClass('xl:max-h-[844px]')
    expect(phoneFrame).toHaveClass('xl:w-[390px]')
  })

  it('renders phone frame with visual styling on desktop', () => {
    const { container } = render(<App />)
    const outerWrapper = container.firstChild as HTMLElement
    const phoneFrame = outerWrapper.firstChild as HTMLElement

    // Visual frame styling
    expect(phoneFrame).toHaveClass('xl:rounded-[3rem]')
    expect(phoneFrame).toHaveClass('xl:border-4')
    expect(phoneFrame).toHaveClass('xl:border-neutral-700')
    expect(phoneFrame).toHaveClass('xl:shadow-2xl')
    expect(phoneFrame).toHaveClass('xl:overflow-hidden')
  })

  it('renders full-width on mobile (base classes without lg: prefix)', () => {
    const { container } = render(<App />)
    const outerWrapper = container.firstChild as HTMLElement
    const phoneFrame = outerWrapper.firstChild as HTMLElement

    // Mobile base classes (full screen)
    expect(phoneFrame).toHaveClass('h-full')
    expect(phoneFrame).toHaveClass('w-full')
  })

  it('renders ConfigScreen by default', () => {
    render(<App />)
    expect(screen.getByText('Byoyomi Clock Online')).toBeInTheDocument()
  })
})
