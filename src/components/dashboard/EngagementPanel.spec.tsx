import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EngagementPatient, EngagementResponse } from '@/lib/engagement'
import { EngagementPanel } from './EngagementPanel'

const patient = (over: Partial<EngagementPatient> = {}): EngagementPatient => ({
  patientId: 'p1',
  nome: 'Ana Lima',
  email: 'ana@x.com',
  monitoramentoAtivo: true,
  ultimaAtividadeEm: null,
  proximaConsultaEm: null,
  nivelRisco: 'alto',
  motivos: [{ codigo: 'inativo', nivel: 'alto', texto: 'Sem usar o app há 20 dias' }],
  ...over,
})

const data = (patients: EngagementPatient[]): EngagementResponse => ({
  resumo: {
    total: patients.length,
    alto: patients.filter((p) => p.nivelRisco === 'alto').length,
    atencao: patients.filter((p) => p.nivelRisco === 'atencao').length,
    ok: patients.filter((p) => p.nivelRisco === 'ok').length,
  },
  patients,
})

const handlers = () => ({
  onRetry: jest.fn(),
  onMessage: jest.fn(),
  onScheduleReturn: jest.fn(),
  onEvolution: jest.fn(),
})

describe('EngagementPanel', () => {
  it('shows a spinner while loading the first time', () => {
    render(<EngagementPanel data={null} loading error={false} {...handlers()} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows an error with retry when loading fails', async () => {
    const h = handlers()
    render(<EngagementPanel data={null} loading={false} error {...h} />)

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(h.onRetry).toHaveBeenCalled()
  })

  it('renders nothing when the nutritionist has no patients', () => {
    const { container } = render(
      <EngagementPanel data={data([])} loading={false} error={false} {...handlers()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the positive state when everyone is on track', () => {
    render(
      <EngagementPanel
        data={data([patient({ nivelRisco: 'ok', motivos: [] })])}
        loading={false}
        error={false}
        {...handlers()}
      />,
    )
    expect(screen.getByText('Todos os pacientes estão em dia.')).toBeInTheDocument()
  })

  it('lists only patients that need attention, with their reasons', () => {
    render(
      <EngagementPanel
        data={data([
          patient(),
          patient({ patientId: 'p2', nome: 'Bia Souza', nivelRisco: 'ok', motivos: [] }),
        ])}
        loading={false}
        error={false}
        {...handlers()}
      />,
    )

    expect(screen.getByText('Ana Lima')).toBeInTheDocument()
    expect(screen.getByText('Sem usar o app há 20 dias')).toBeInTheDocument()
    expect(screen.queryByText('Bia Souza')).not.toBeInTheDocument()
  })

  it('shows the summary counts', () => {
    render(
      <EngagementPanel
        data={data([patient(), patient({ patientId: 'p2', nome: 'Bia', nivelRisco: 'atencao' })])}
        loading={false}
        error={false}
        {...handlers()}
      />,
    )
    expect(screen.getByText('1 atenção urgente')).toBeInTheDocument()
    expect(screen.getByText('1 acompanhar')).toBeInTheDocument()
  })

  it('fires the quick actions with the patient id', async () => {
    const h = handlers()
    render(<EngagementPanel data={data([patient()])} loading={false} error={false} {...h} />)

    await userEvent.click(screen.getByRole('button', { name: /Mensagem/ }))
    await userEvent.click(screen.getByRole('button', { name: /Agendar retorno/ }))
    await userEvent.click(screen.getByRole('button', { name: /Evolução/ }))

    expect(h.onMessage).toHaveBeenCalledWith('p1')
    expect(h.onScheduleReturn).toHaveBeenCalledWith('p1')
    expect(h.onEvolution).toHaveBeenCalledWith('p1')
  })

  it('collapses long lists and expands on demand', async () => {
    const many = Array.from({ length: 7 }, (_, i) =>
      patient({ patientId: `p${i}`, nome: `Paciente ${i}` }),
    )
    render(<EngagementPanel data={data(many)} loading={false} error={false} {...handlers()} />)

    expect(screen.getAllByText(/^Paciente \d$/)).toHaveLength(5)
    await userEvent.click(screen.getByRole('button', { name: 'Ver mais 2' }))
    expect(screen.getAllByText(/^Paciente \d$/)).toHaveLength(7)
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar menos' }))
    expect(screen.getAllByText(/^Paciente \d$/)).toHaveLength(5)
  })
})
