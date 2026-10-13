import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import type { Patient } from '@/lib/auth'
import { PatientProfileModal } from './PatientProfileModal'

jest.mock('@/lib/auth', () => ({ getStoredToken: jest.fn(() => 'tok') }))
jest.mock('@/lib/patients', () => ({
  getPatientProfile: jest.fn(),
  getLatestAssessment: jest.fn(),
  upsertPatientProfile: jest.fn(),
  createAssessment: jest.fn(),
  updateAssessment: jest.fn(),
}))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

import { getLatestAssessment, getPatientProfile, upsertPatientProfile } from '@/lib/patients'
import { toast } from 'sonner'

const mockProfile = getPatientProfile as jest.MockedFunction<typeof getPatientProfile>
const mockAssessment = getLatestAssessment as jest.MockedFunction<typeof getLatestAssessment>
const mockUpsert = upsertPatientProfile as jest.MockedFunction<typeof upsertPatientProfile>

const patient: Patient = { id: 'p1', nome: 'Ana Lima', email: 'ana@x.com', role: 'client' }

afterEach(() => jest.clearAllMocks())

describe('PatientProfileModal', () => {
  it('shows the eating disorder history of the loaded profile', async () => {
    mockProfile.mockResolvedValue({ userId: 'p1', historicoTranstornoAlimentar: 'com_historico' })
    mockAssessment.mockResolvedValue(null)

    render(<PatientProfileModal open patient={patient} onClose={jest.fn()} />)

    const label = await screen.findByText('Histórico de transtorno alimentar')
    expect(label.parentElement).toHaveTextContent('Com histórico')
  })

  it('shows "Não informado" for a patient without history information', async () => {
    mockProfile.mockResolvedValue(null)
    mockAssessment.mockResolvedValue(null)

    render(<PatientProfileModal open patient={patient} onClose={jest.fn()} />)

    const label = await screen.findByText('Histórico de transtorno alimentar')
    expect(label.parentElement).toHaveTextContent('Não informado')
  })

  it('blocks editing and saving when the profile fails to load (protects the clinical flag)', async () => {
    mockProfile.mockRejectedValue(new Error('offline'))
    mockAssessment.mockResolvedValue(null)

    render(<PatientProfileModal open patient={patient} onClose={jest.fn()} />)

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Não foi possível carregar a ficha')),
    )
    expect(screen.getByRole('button', { name: /Editar/ })).toBeDisabled()
    expect(mockUpsert).not.toHaveBeenCalled()
  })
})
