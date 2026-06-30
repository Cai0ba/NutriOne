import {
  getPatientProfile,
  upsertPatientProfile,
  getLatestAssessment,
  createAssessment,
  listAssessments,
  updateAssessment,
  type PatientProfile,
  type PhysicalAssessment,
} from './patients'

const mockFetch = jest.fn()
global.fetch = mockFetch

function mockOk(body: unknown, text?: string) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    text: () => Promise.resolve(text ?? JSON.stringify(body)),
  })
}

function mockEmpty() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    text: () => Promise.resolve(''),
  })
}

function mockError(status: number, body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

function mockNetworkError() {
  mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
}

beforeEach(() => mockFetch.mockClear())

const TOKEN = 'test-token'
const PATIENT_ID = 'patient-1'

const sampleProfile: PatientProfile = {
  _id: 'prof-1',
  userId: PATIENT_ID,
  objetivo: 'Emagrecer',
  peso: 80,
  altura: 175,
}

const sampleAssessment: PhysicalAssessment = {
  _id: 'aval-1',
  patientId: PATIENT_ID,
  nutritionistId: 'nutri-1',
  peso: 80,
  altura: 175,
  imc: 26.1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('getPatientProfile', () => {
  it('returns profile on success', async () => {
    mockOk(sampleProfile)
    const result = await getPatientProfile(TOKEN, PATIENT_ID)
    expect(result).toEqual(sampleProfile)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/profile`),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    )
  })

  it('returns null when response text is empty', async () => {
    mockEmpty()
    const result = await getPatientProfile(TOKEN, PATIENT_ID)
    expect(result).toBeNull()
  })

  it('throws on API error', async () => {
    mockError(404, { message: 'Not found' })
    await expect(getPatientProfile(TOKEN, PATIENT_ID)).rejects.toThrow('Not found')
  })

  it('throws on network error', async () => {
    mockNetworkError()
    await expect(getPatientProfile(TOKEN, PATIENT_ID)).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining('Não foi possível conectar') }),
    )
  })
})

describe('upsertPatientProfile', () => {
  it('sends PUT and returns updated profile', async () => {
    mockOk(sampleProfile)
    const result = await upsertPatientProfile(TOKEN, PATIENT_ID, { objetivo: 'Emagrecer', peso: 80, altura: 175 })
    expect(result).toEqual(sampleProfile)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/profile`),
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})

describe('getLatestAssessment', () => {
  it('returns assessment on success', async () => {
    mockOk(sampleAssessment)
    const result = await getLatestAssessment(TOKEN, PATIENT_ID)
    expect(result).toEqual(sampleAssessment)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/assessments/latest`),
      expect.any(Object),
    )
  })

  it('returns null when no assessment', async () => {
    mockEmpty()
    const result = await getLatestAssessment(TOKEN, PATIENT_ID)
    expect(result).toBeNull()
  })
})

describe('createAssessment', () => {
  it('sends POST and returns created assessment', async () => {
    mockOk(sampleAssessment)
    const result = await createAssessment(TOKEN, PATIENT_ID, { peso: 80, altura: 175 })
    expect(result).toEqual(sampleAssessment)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/assessments`),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws with joined array messages', async () => {
    mockError(400, { message: ['Peso inválido', 'Altura inválida'] })
    await expect(createAssessment(TOKEN, PATIENT_ID, { peso: -1, altura: 0 })).rejects.toThrow(
      'Peso inválido, Altura inválida',
    )
  })

  it('uses fallback message on empty error body', async () => {
    mockError(500, {})
    await expect(createAssessment(TOKEN, PATIENT_ID, { peso: 80, altura: 175 })).rejects.toThrow('Erro inesperado.')
  })
})

describe('listAssessments', () => {
  it('returns array of assessments', async () => {
    mockOk([sampleAssessment])
    const result = await listAssessments(TOKEN, PATIENT_ID)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(sampleAssessment)
  })
})

describe('updateAssessment', () => {
  it('sends PUT to correct endpoint', async () => {
    const updated = { ...sampleAssessment, peso: 78 }
    mockOk(updated)
    const result = await updateAssessment(TOKEN, PATIENT_ID, 'aval-1', { peso: 78, altura: 175 })
    expect(result.peso).toBe(78)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/assessments/aval-1`),
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})
