import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App, { HiveNavigation } from './App'

describe('App', () => {
  it('renders the Sibhive heading and primary actions', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Sibhive' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create your hive' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
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
