import {
  getSelfUnreadCount,
  getUnreadCount,
  listMessages,
  listSelfMessages,
  markMessagesRead,
  markSelfMessagesRead,
  sendMessageToPatient,
  sendSelfMessage,
} from './messages'

const TOKEN = 'test-token'
const BASE  = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

const mockMsg = {
  _id:            'msg-1',
  patientId:      'patient-1',
  nutritionistId: 'nutri-1',
  senderId:       'nutri-1',
  senderRole:     'nutritionist' as const,
  texto:          'Olá',
  lida:           false,
  createdAt:      '2025-01-01T00:00:00.000Z',
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

describe('listMessages', () => {
  it('should GET /messages with patientId query param', async () => {
    mockFetch([mockMsg])
    const result = await listMessages(TOKEN, 'patient-1')
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/messages?patientId=patient-1`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    )
    expect(result).toEqual([mockMsg])
  })

  it('should throw on HTTP error', async () => {
    mockFetch({ message: 'Acesso negado.' }, false, 403)
    await expect(listMessages(TOKEN, 'patient-1')).rejects.toThrow('Acesso negado.')
  })
})

describe('sendMessageToPatient', () => {
  it('should POST /messages with patientId and texto', async () => {
    mockFetch(mockMsg)
    const result = await sendMessageToPatient(TOKEN, 'patient-1', 'Olá')
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/messages`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ patientId: 'patient-1', texto: 'Olá' }) }),
    )
    expect(result).toEqual(mockMsg)
  })

  it('should throw when patient not linked', async () => {
    mockFetch({ message: 'Este paciente não está vinculado ao seu perfil.' }, false, 403)
    await expect(sendMessageToPatient(TOKEN, 'patient-1', 'Oi')).rejects.toThrow(
      'Este paciente não está vinculado ao seu perfil.',
    )
  })
})

describe('getUnreadCount', () => {
  it('should GET /messages/unread-count', async () => {
    mockFetch({ count: 4 })
    const result = await getUnreadCount(TOKEN)
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/messages/unread-count`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    )
    expect(result).toEqual({ count: 4 })
  })
})

describe('markMessagesRead', () => {
  it('should PATCH /messages/:patientId/read', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, status: 204 } as any)
    const result = await markMessagesRead(TOKEN, 'patient-1')
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/messages/patient-1/read`,
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(result).toBeUndefined()
  })
})

// ─── Patient self ─────────────────────────────────────────────────────────────

describe('listSelfMessages', () => {
  it('should GET /me/messages', async () => {
    mockFetch([mockMsg])
    const result = await listSelfMessages(TOKEN)
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/me/messages`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    )
    expect(result).toEqual([mockMsg])
  })
})

describe('sendSelfMessage', () => {
  it('should POST /me/messages with texto', async () => {
    mockFetch(mockMsg)
    const result = await sendSelfMessage(TOKEN, 'Dúvida')
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/me/messages`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ texto: 'Dúvida' }) }),
    )
    expect(result).toEqual(mockMsg)
  })

  it('should throw when no nutritionist linked', async () => {
    mockFetch({ message: 'Nenhum nutricionista vinculado ao seu perfil.' }, false, 404)
    await expect(sendSelfMessage(TOKEN, 'Oi')).rejects.toThrow('Nenhum nutricionista vinculado ao seu perfil.')
  })
})

describe('getSelfUnreadCount', () => {
  it('should GET /me/messages/unread-count', async () => {
    mockFetch({ count: 2 })
    const result = await getSelfUnreadCount(TOKEN)
    expect(result).toEqual({ count: 2 })
  })
})

describe('markSelfMessagesRead', () => {
  it('should PATCH /me/messages/read', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, status: 204 } as any)
    const result = await markSelfMessagesRead(TOKEN)
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/me/messages/read`,
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(result).toBeUndefined()
  })
})
