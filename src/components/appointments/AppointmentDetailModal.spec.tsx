import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Appointment } from '@/lib/appointments'
import { AppointmentDetailModal } from './AppointmentDetailModal'

jest.mock('@/lib/auth', () => ({
  getStoredToken: jest.fn(() => 'mock-token'),
}))

jest.mock('@/lib/appointments', () => ({
  cancelAppointmentNutritionist: jest.fn(),
  cancelSelfAppointment:         jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

import { cancelAppointmentNutritionist, cancelSelfAppointment } from '@/lib/appointments'
import { toast } from 'sonner'

const mockCancelNutri   = cancelAppointmentNutritionist as jest.MockedFunction<typeof cancelAppointmentNutritionist>
const mockCancelPatient = cancelSelfAppointment         as jest.MockedFunction<typeof cancelSelfAppointment>

const agendadoAppt: Appointment = {
  _id:            'appt-1',
  patientId:      { _id: 'p-1', nome: 'Ana Lima', email: 'a@x.com' },
  nutritionistId: 'n-1',
  tipo:           'consulta',
  status:         'agendado',
  dataHora:       '2025-07-10T14:00:00.000Z',
  duracao:        60,
  createdAt:      '2025-01-01T00:00:00.000Z',
}

const canceladoAppt: Appointment = { ...agendadoAppt, status: 'cancelado', motivoCancelamento: 'Imprevisto' }

const defaultProps = {
  open:        true,
  appointment: agendadoAppt,
  role:        'nutritionist' as const,
  onClose:     jest.fn(),
  onEdit:      jest.fn(),
  onCancelled: jest.fn(),
}

afterEach(() => jest.clearAllMocks())

describe('AppointmentDetailModal', () => {
  it('renders null when appointment is null', () => {
    const { container } = render(<AppointmentDetailModal {...defaultProps} appointment={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders tipo label (Consulta)', () => {
    render(<AppointmentDetailModal {...defaultProps} />)
    expect(screen.getByText('Consulta')).toBeInTheDocument()
  })

  it('renders patient name for nutritionist role', () => {
    render(<AppointmentDetailModal {...defaultProps} />)
    expect(screen.getByText('Ana Lima')).toBeInTheDocument()
  })

  it('renders status chip', () => {
    render(<AppointmentDetailModal {...defaultProps} />)
    expect(screen.getByText('Agendado')).toBeInTheDocument()
  })

  it('shows Editar button for nutritionist on agendado appointment', () => {
    render(<AppointmentDetailModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  it('hides Editar button for patient role', () => {
    render(<AppointmentDetailModal {...defaultProps} role="patient" onEdit={undefined} />)
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('shows cancelar button for agendado appointment', () => {
    render(<AppointmentDetailModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Cancelar consulta' })).toBeInTheDocument()
  })

  it('hides cancel button for non-agendado appointments', () => {
    render(<AppointmentDetailModal {...defaultProps} appointment={canceladoAppt} />)
    expect(screen.queryByRole('button', { name: 'Cancelar consulta' })).not.toBeInTheDocument()
  })

  it('shows motivo field after clicking cancel button', async () => {
    render(<AppointmentDetailModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar consulta' }))
    expect(screen.getByLabelText(/Motivo/i)).toBeInTheDocument()
  })

  it('calls cancelAppointmentNutritionist and onCancelled on confirm', async () => {
    const cancelled = { ...agendadoAppt, status: 'cancelado' as const }
    mockCancelNutri.mockResolvedValueOnce(cancelled)

    render(<AppointmentDetailModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar consulta' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar cancelamento' }))

    await waitFor(() => {
      expect(mockCancelNutri).toHaveBeenCalledWith('mock-token', 'appt-1', undefined)
      expect(defaultProps.onCancelled).toHaveBeenCalledWith(cancelled)
    })
  })

  it('calls cancelSelfAppointment for patient role', async () => {
    const cancelled = { ...agendadoAppt, status: 'cancelado' as const }
    mockCancelPatient.mockResolvedValueOnce(cancelled)

    render(<AppointmentDetailModal {...defaultProps} role="patient" onEdit={undefined} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar consulta' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar cancelamento' }))

    await waitFor(() => {
      expect(mockCancelPatient).toHaveBeenCalledWith('mock-token', 'appt-1', undefined)
    })
  })

  it('shows toast.error when cancellation fails', async () => {
    mockCancelNutri.mockRejectedValueOnce(new Error('Erro de rede'))

    render(<AppointmentDetailModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar consulta' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar cancelamento' }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Erro de rede'))
  })

  it('shows motivoCancelamento box for cancelled appointments', () => {
    render(<AppointmentDetailModal {...defaultProps} appointment={canceladoAppt} />)
    expect(screen.getByText('Imprevisto')).toBeInTheDocument()
  })

  it('calls onClose when Fechar is clicked', async () => {
    render(<AppointmentDetailModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onEdit and closes when Editar is clicked', async () => {
    render(<AppointmentDetailModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(defaultProps.onEdit).toHaveBeenCalledWith(agendadoAppt)
  })
})
