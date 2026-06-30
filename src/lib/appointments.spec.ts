import {
  cancelAppointmentNutritionist,
  cancelSelfAppointment,
  createAppointment,
  deleteAppointment,
  listAppointments,
  listSelfAppointments,
  updateAppointment,
} from './appointments'

const TOKEN = 'test-token'
const BASE  = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

const mockAppt = {
  _id:           'appt-1',
  patientId:     'patient-1',
  nutritionistId: 'nutri-1',
  tipo:          'consulta' as const,
  status:        'agendado' as const,
  dataHora:      '2025-07-10T14:00:00.000Z',
  duracao:       60,
  createdAt:     '2025-01-01T00:00:00.000Z',
}

function mockFetch(data: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    json: jest.fn().mockResolvedValueOnce(data),
  } as any)
}

afterEach(() => jest.restoreAllMocks())

// ─── Nutritionist ─────────────────────────────────────────────────────────────

describe('listAppointments', () => {
  it('should GET /appointments with year and month query params', async () => {
    mockFetch([mockAppt])
    const result = await listAppointments(TOKEN, 2025, 7)
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/appointments?year=2025&month=7`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    )
    expect(result).toEqual([mockAppt])
  })

  it('should throw on HTTP error', async () => {
    mockFetch({ message: 'Unauthorized' }, false, 401)
    await expect(listAppointments(TOKEN, 2025, 7)).rejects.toThrow('Unauthorized')
  })
})

describe('createAppointment', () => {
  it('should POST /appointments with payload', async () => {
    mockFetch(mockAppt)
    const payload = { patientId: 'patient-1', tipo: 'consulta' as const, dataHora: '2025-07-10T14:00:00Z' }
    const result = await createAppointment(TOKEN, payload)
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/appointments`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
    )
    expect(result).toEqual(mockAppt)
  })

  it('should throw when patient not found', async () => {
    mockFetch({ message: 'Paciente não encontrado' }, false, 404)
    await expect(createAppointment(TOKEN, { patientId: 'x', tipo: 'consulta', dataHora: '' })).rejects.toThrow('Paciente não encontrado')
  })
})

describe('updateAppointment', () => {
  it('should PUT /appointments/:id', async () => {
    const updated = { ...mockAppt, tipo: 'retorno' as const }
    mockFetch(updated)
    const result = await updateAppointment(TOKEN, 'appt-1', { tipo: 'retorno' })
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/appointments/appt-1`,
      expect.objectContaining({ method: 'PUT' }),
    )
    expect(result).toEqual(updated)
  })

  it('should throw on not found', async () => {
    mockFetch({ message: 'Consulta não encontrada.' }, false, 404)
    await expect(updateAppointment(TOKEN, 'missing', {})).rejects.toThrow('Consulta não encontrada.')
  })
})

describe('cancelAppointmentNutritionist', () => {
  it('should PATCH /appointments/:id/cancel', async () => {
    const cancelled = { ...mockAppt, status: 'cancelado' as const }
    mockFetch(cancelled)
    const result = await cancelAppointmentNutritionist(TOKEN, 'appt-1', 'Reagendamento')
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/appointments/appt-1/cancel`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ motivoCancelamento: 'Reagendamento' }) }),
    )
    expect(result).toEqual(cancelled)
  })

  it('should send undefined motivo when not provided', async () => {
    mockFetch({ ...mockAppt, status: 'cancelado' })
    await cancelAppointmentNutritionist(TOKEN, 'appt-1')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ motivoCancelamento: undefined }) }),
    )
  })
})

describe('deleteAppointment', () => {
  it('should DELETE /appointments/:id and return undefined for 204', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, status: 204 } as any)
    const result = await deleteAppointment(TOKEN, 'appt-1')
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/appointments/appt-1`,
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(result).toBeUndefined()
  })

  it('should throw on forbidden', async () => {
    mockFetch({ message: 'Acesso negado.' }, false, 403)
    await expect(deleteAppointment(TOKEN, 'appt-1')).rejects.toThrow('Acesso negado.')
  })
})

// ─── Patient self ─────────────────────────────────────────────────────────────

describe('listSelfAppointments', () => {
  it('should GET /me/appointments with year/month params', async () => {
    mockFetch([mockAppt])
    const result = await listSelfAppointments(TOKEN, 2025, 7)
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/me/appointments?year=2025&month=7`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    )
    expect(result).toEqual([mockAppt])
  })
})

describe('cancelSelfAppointment', () => {
  it('should PATCH /me/appointments/:id/cancel', async () => {
    const cancelled = { ...mockAppt, status: 'cancelado' as const }
    mockFetch(cancelled)
    const result = await cancelSelfAppointment(TOKEN, 'appt-1', 'Viagem')
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/me/appointments/appt-1/cancel`,
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(result).toEqual(cancelled)
  })

  it('should throw when appointment is not agendado', async () => {
    mockFetch({ message: 'Apenas consultas agendadas podem ser canceladas.' }, false, 403)
    await expect(cancelSelfAppointment(TOKEN, 'appt-1')).rejects.toThrow('Apenas consultas agendadas podem ser canceladas.')
  })
})
