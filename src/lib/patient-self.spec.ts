import {
  getSelfProfile,
  listSelfAssessments,
  listSelfMealPlans,
  getSelfMealPlan,
} from './patient-self'
import type { PatientProfile, PhysicalAssessment } from './patients'
import type { MealPlanSummary, MealPlanDetail } from './diet'

const mockFetch = jest.fn()
global.fetch = mockFetch

function mockOk(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
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
  })
}

function mockNetworkError() {
  mockFetch.mockRejectedValueOnce(new TypeError('Network failure'))
}

beforeEach(() => mockFetch.mockClear())

const TOKEN = 'patient-token'

const profile: PatientProfile = {
  _id: 'prof-1',
  userId: 'user-1',
  objetivo: 'Manter peso',
  peso: 70,
  altura: 170,
}

const assessment: PhysicalAssessment = {
  _id: 'aval-1',
  patientId: 'user-1',
  nutritionistId: 'nutri-1',
  peso: 70,
  altura: 170,
  imc: 24.2,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const planSummary: MealPlanSummary = {
  _id: 'plan-1',
  patientId: 'user-1',
  nutritionistId: 'nutri-1',
  nome: 'Plano Setembro',
  status: 'ativo',
  createdAt: '2024-09-01T00:00:00.000Z',
  updatedAt: '2024-09-01T00:00:00.000Z',
}

const planDetail: MealPlanDetail = { ...planSummary, refeicoes: [] }

describe('getSelfProfile', () => {
  it('fetches /me/profile with token and returns profile', async () => {
    mockOk(profile)
    const result = await getSelfProfile(TOKEN)
    expect(result).toEqual(profile)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/me/profile'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    )
  })

  it('returns undefined on empty response body', async () => {
    mockEmpty()
    const result = await getSelfProfile(TOKEN)
    expect(result).toBeUndefined()
  })

  it('throws on API error', async () => {
    mockError(401, { message: 'Não autorizado' })
    await expect(getSelfProfile(TOKEN)).rejects.toThrow('Não autorizado')
  })

  it('throws on network failure', async () => {
    mockNetworkError()
    await expect(getSelfProfile(TOKEN)).rejects.toThrow('Não foi possível conectar na API.')
  })

  it('uses fallback message when error body has no message', async () => {
    mockError(500, {})
    await expect(getSelfProfile(TOKEN)).rejects.toThrow('Erro inesperado.')
  })

  it('joins array error messages', async () => {
    mockError(400, { message: ['Erro A', 'Erro B'] })
    await expect(getSelfProfile(TOKEN)).rejects.toThrow('Erro A, Erro B')
  })
})

describe('listSelfAssessments', () => {
  it('fetches /me/assessments and returns array', async () => {
    mockOk([assessment])
    const result = await listSelfAssessments(TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(assessment)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/me/assessments'),
      expect.any(Object),
    )
  })

  it('returns empty array when response is []', async () => {
    mockOk([])
    const result = await listSelfAssessments(TOKEN)
    expect(result).toEqual([])
  })

  it('throws on error', async () => {
    mockError(403, { message: 'Acesso negado' })
    await expect(listSelfAssessments(TOKEN)).rejects.toThrow('Acesso negado')
  })
})

describe('listSelfMealPlans', () => {
  it('fetches /me/meal-plans and returns plans', async () => {
    mockOk([planSummary])
    const result = await listSelfMealPlans(TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(planSummary)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/me/meal-plans'),
      expect.any(Object),
    )
  })

  it('throws on error', async () => {
    mockError(500, { message: 'Erro interno' })
    await expect(listSelfMealPlans(TOKEN)).rejects.toThrow('Erro interno')
  })
})

describe('getSelfMealPlan', () => {
  it('fetches /me/meal-plans/:id and returns detail', async () => {
    mockOk(planDetail)
    const result = await getSelfMealPlan(TOKEN, 'plan-1')
    expect(result).toEqual(planDetail)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/me/meal-plans/plan-1'),
      expect.any(Object),
    )
  })

  it('throws on 404', async () => {
    mockError(404, { message: 'Plano não encontrado' })
    await expect(getSelfMealPlan(TOKEN, 'plan-x')).rejects.toThrow('Plano não encontrado')
  })
})
