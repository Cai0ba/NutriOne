import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConsentGate } from './ConsentGate'

const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}))

jest.mock('@/lib/auth', () => ({ clearSession: jest.fn() }))

jest.mock('@/lib/consents', () => ({
  getConsents: jest.fn(),
  acceptConsent: jest.fn(),
}))

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

import { clearSession } from '@/lib/auth'
import { acceptConsent, getConsents, type ConsentStatus } from '@/lib/consents'
import { toast } from 'sonner'

const mockGet = getConsents as jest.MockedFunction<typeof getConsents>
const mockAccept = acceptConsent as jest.MockedFunction<typeof acceptConsent>

const consent = (tipo: ConsentStatus['tipo'], pendente = true): ConsentStatus => ({
  tipo,
  versaoAtual: 'v1',
  aceitaVersao: pendente ? null : 'v1',
  aceitoEm: pendente ? null : '2026-01-01T00:00:00.000Z',
  pendente,
})

const bothPending = [consent('dados_saude'), consent('monitoramento_atividade')]

beforeEach(() => {
  localStorage.clear()
  mockAccept.mockResolvedValue({ consents: [] })
})
afterEach(() => jest.clearAllMocks())

describe('ConsentGate', () => {
  it('shows nothing when no consent is pending', async () => {
    mockGet.mockResolvedValue({ consents: [consent('dados_saude', false), consent('monitoramento_atividade', false)] })
    render(<ConsentGate token="t" userId="u1" />)

    await waitFor(() => expect(mockGet).toHaveBeenCalled())
    expect(screen.queryByText('Antes de continuar')).not.toBeInTheDocument()
  })

  it('asks for both terms and blocks until the required one is checked', async () => {
    mockGet.mockResolvedValue({ consents: bothPending })
    render(<ConsentGate token="t" userId="u1" />)

    expect(await screen.findByText('Antes de continuar')).toBeInTheDocument()
    expect(screen.getByText(/Meus dados de saúde/)).toBeInTheDocument()
    expect(screen.getByText(/Acompanhamento do uso do app/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('does not allow continuing with only the optional term checked', async () => {
    mockGet.mockResolvedValue({ consents: bothPending })
    render(<ConsentGate token="t" userId="u1" />)
    await screen.findByText('Antes de continuar')

    await userEvent.click(screen.getByRole('checkbox', { name: /Acompanhamento do uso do app/ }))

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('accepts only the checked terms using the version from the API', async () => {
    mockGet.mockResolvedValue({ consents: bothPending })
    render(<ConsentGate token="t" userId="u1" />)
    await screen.findByText('Antes de continuar')

    await userEvent.click(screen.getByRole('checkbox', { name: /Meus dados de saúde/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => expect(mockAccept).toHaveBeenCalledTimes(1))
    expect(mockAccept).toHaveBeenCalledWith('t', 'dados_saude', 'v1')
    await waitFor(() => expect(screen.queryByText('Antes de continuar')).not.toBeInTheDocument())
  })

  it('accepts both terms when both are checked', async () => {
    mockGet.mockResolvedValue({ consents: bothPending })
    render(<ConsentGate token="t" userId="u1" />)
    await screen.findByText('Antes de continuar')

    await userEvent.click(screen.getByRole('checkbox', { name: /Meus dados de saúde/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Acompanhamento do uso do app/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => expect(mockAccept).toHaveBeenCalledTimes(2))
    expect(mockAccept).toHaveBeenCalledWith('t', 'monitoramento_atividade', 'v1')
  })

  it('does not ask again for an optional term the patient declined on this device', async () => {
    mockGet.mockResolvedValue({ consents: bothPending })
    const { unmount } = render(<ConsentGate token="t" userId="u1" />)
    await screen.findByText('Antes de continuar')
    await userEvent.click(screen.getByRole('checkbox', { name: /Meus dados de saúde/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    await waitFor(() => expect(screen.queryByText('Antes de continuar')).not.toBeInTheDocument())
    unmount()

    // próximo acesso: dados_saude já aceito, monitoramento recusado antes
    mockGet.mockResolvedValue({ consents: [consent('dados_saude', false), consent('monitoramento_atividade')] })
    render(<ConsentGate token="t" userId="u1" />)

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2))
    expect(screen.queryByText('Antes de continuar')).not.toBeInTheDocument()
  })

  it('asks again when the term version changes', async () => {
    localStorage.setItem('nutrione.consent.declined.u1.monitoramento_atividade.v0', '1')
    mockGet.mockResolvedValue({ consents: [consent('dados_saude', false), consent('monitoramento_atividade')] })
    render(<ConsentGate token="t" userId="u1" />)

    expect(await screen.findByText('Antes de continuar')).toBeInTheDocument()
  })

  it('always asks for the required term even if declined before', async () => {
    localStorage.setItem('nutrione.consent.declined.u1.dados_saude.v1', '1')
    mockGet.mockResolvedValue({ consents: [consent('dados_saude')] })
    render(<ConsentGate token="t" userId="u1" />)

    expect(await screen.findByText('Antes de continuar')).toBeInTheDocument()
  })

  it('shows an error and keeps the modal open when saving fails', async () => {
    mockGet.mockResolvedValue({ consents: bothPending })
    mockAccept.mockRejectedValueOnce(new Error('falhou'))
    render(<ConsentGate token="t" userId="u1" />)
    await screen.findByText('Antes de continuar')

    await userEvent.click(screen.getByRole('checkbox', { name: /Meus dados de saúde/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('falhou'))
    expect(screen.getByText('Antes de continuar')).toBeInTheDocument()
  })

  it('logs out when the patient chooses to leave', async () => {
    mockGet.mockResolvedValue({ consents: bothPending })
    render(<ConsentGate token="t" userId="u1" />)
    await screen.findByText('Antes de continuar')

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(clearSession).toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('does not block the app when the consents cannot be loaded', async () => {
    mockGet.mockRejectedValue(new Error('offline'))
    render(<ConsentGate token="t" userId="u1" />)

    await waitFor(() => expect(mockGet).toHaveBeenCalled())
    expect(screen.queryByText('Antes de continuar')).not.toBeInTheDocument()
  })
})
