import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Appointment } from '@/lib/appointments'
import { MonthCalendar } from './MonthCalendar'

const mockAppt: Appointment = {
  _id:           'appt-1',
  patientId:     { _id: 'p-1', nome: 'João Silva', email: 'j@x.com' },
  nutritionistId: 'n-1',
  tipo:          'consulta',
  status:        'agendado',
  dataHora:      '2025-07-10T14:00:00.000Z',
  duracao:       60,
  createdAt:     '2025-01-01T00:00:00.000Z',
}

const defaultProps = {
  year:         2025,
  month:        7,
  appointments: [] as Appointment[],
  onPrev:       jest.fn(),
  onNext:       jest.fn(),
  onDayClick:   jest.fn(),
  onEventClick: jest.fn(),
}

afterEach(() => jest.clearAllMocks())

describe('MonthCalendar', () => {
  it('renders month name and year in header', () => {
    render(<MonthCalendar {...defaultProps} />)
    expect(screen.getByText('Julho 2025')).toBeInTheDocument()
  })

  it('renders all 7 weekday labels', () => {
    render(<MonthCalendar {...defaultProps} />)
    ;['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it('calls onPrev when left chevron is clicked', () => {
    render(<MonthCalendar {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0]) // first button = prev
    expect(defaultProps.onPrev).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when right chevron is clicked', () => {
    render(<MonthCalendar {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1]) // second button = next
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('renders appointment dot for day with appointment', () => {
    // Use a time that formats predictably regardless of timezone
    const apptLocal: Appointment = {
      ...mockAppt,
      dataHora: new Date(2025, 6, 10, 14, 0, 0).toISOString(), // local time July 10 14:00
    }
    render(<MonthCalendar {...defaultProps} appointments={[apptLocal]} />)
    // At least one time text should appear
    const timeTexts = screen.getAllByText(/\d{2}:\d{2}/)
    expect(timeTexts.length).toBeGreaterThan(0)
  })

  it('calls onEventClick when appointment dot is clicked', () => {
    const apptLocal: Appointment = {
      ...mockAppt,
      dataHora: new Date(2025, 6, 10, 14, 0, 0).toISOString(),
    }
    render(<MonthCalendar {...defaultProps} appointments={[apptLocal]} />)
    const timeTexts = screen.getAllByText(/\d{2}:\d{2}/)
    fireEvent.click(timeTexts[0])
    expect(defaultProps.onEventClick).toHaveBeenCalled()
  })

  it('renders "Consulta" in legend', () => {
    render(<MonthCalendar {...defaultProps} />)
    expect(screen.getByText('Consulta')).toBeInTheDocument()
  })

  it('renders "Retorno" in legend', () => {
    render(<MonthCalendar {...defaultProps} />)
    expect(screen.getByText('Retorno')).toBeInTheDocument()
  })

  it('renders status chips in legend', () => {
    render(<MonthCalendar {...defaultProps} />)
    expect(screen.getByText('Agendado')).toBeInTheDocument()
    expect(screen.getByText('Realizado')).toBeInTheDocument()
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })

  it('renders correct number of day cells for July 2025', () => {
    render(<MonthCalendar {...defaultProps} />)
    // July 2025: 31 days
    expect(screen.getByText('31')).toBeInTheDocument()
    expect(screen.queryByText('32')).not.toBeInTheDocument()
  })

  it('shows "+N mais" when day has more than 3 appointments', () => {
    const manyAppts: Appointment[] = Array.from({ length: 5 }, (_, i) => ({
      ...mockAppt,
      _id: `appt-${i}`,
      dataHora: '2025-07-10T14:00:00.000Z',
    }))
    render(<MonthCalendar {...defaultProps} appointments={manyAppts} />)
    expect(screen.getByText('+2 mais')).toBeInTheDocument()
  })
})
