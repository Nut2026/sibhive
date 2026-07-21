import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { getSweetnessBand, HoneyJarScore } from './HoneyJarScore'
it('names every score boundary accessibly', () => { expect(getSweetnessBand(20).name).toBe('Honey Drop'); expect(getSweetnessBand(21).name).toBe('Honeycomb'); expect(getSweetnessBand(100).name).toBe('Golden Hive'); render(<HoneyJarScore score={61} />); expect(screen.getByLabelText(/Honey Harvest/)).toBeInTheDocument() })
