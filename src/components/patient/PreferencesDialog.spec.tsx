import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PreferencesDialog } from './PreferencesDialog'

const mockPrefs = { modoSemNumeros: false as boolean | null, loading: false, error: false, reload: jest.fn(), save: jest.fn() }
jest.mock('@/lib/usePatientPreferences', () => ({ usePatientPreferences: () => mockPrefs }))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

import { toast } from 'sonner'

beforeEach(() => {
  Object.assign(mockPrefs, { modoSemNumeros: false, loading: false, error: false })
  mockPrefs.save.mockResolvedValue(undefined)
})
afterEach(() => jest.clearAllMocks())

describe('PreferencesDialog', () => {
  it('shows the switch with the current value', () => {
    mockPrefs.modoSemNumeros = true
    render(<PreferencesDialog open onClose={jest.fn()} />)
    expect(screen.getByRole('switch', { name: 'Modo sem números' })).toBeChecked()
  })

  it('saves when toggled and confirms with a toast', async () => {
    render(<PreferencesDialog open onClose={jest.fn()} />)

    await userEvent.click(screen.getByRole('switch', { name: 'Modo sem números' }))

    await waitFor(() => expect(mockPrefs.save).toHaveBeenCalledWith(true))
    expect(toast.success).toHaveBeenCalledWith('Modo sem números ativado.')
  })

  it('shows an error toast when saving fails', async () => {
    mockPrefs.save.mockRejectedValueOnce(new Error('falhou'))
    render(<PreferencesDialog open onClose={jest.fn()} />)

    await userEvent.click(screen.getByRole('switch', { name: 'Modo sem números' }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('falhou'))
  })

  it('disables the switch while loading', () => {
    mockPrefs.modoSemNumeros = null
    mockPrefs.loading = true
    render(<PreferencesDialog open onClose={jest.fn()} />)
    expect(screen.getByRole('switch', { name: 'Modo sem números' })).toBeDisabled()
  })

  it('offers a retry instead of a misleading switch when preferences failed to load', async () => {
    mockPrefs.modoSemNumeros = null
    mockPrefs.error = true
    render(<PreferencesDialog open onClose={jest.fn()} />)

    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(mockPrefs.reload).toHaveBeenCalled()
  })
})
