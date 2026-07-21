import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App, { HiveNavigation } from './App'

describe('App', () => {
  it('renders the public landing page and primary actions', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Welcome to Sibhive' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Log In' })).toHaveLength(2)
  })

  it('hides or shows the Pollen Garden navigation entry with its flag', () => {
    const { rerender } = render(
      <MemoryRouter>
        <HiveNavigation pollenGardenEnabled={false} />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: 'Pollen Garden' })).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <HiveNavigation pollenGardenEnabled />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Pollen Garden' })).toBeInTheDocument()
  })
})
