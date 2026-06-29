import {
  listMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  type MealPlanSummary,
  type MealPlanDetail,
} from './diet'

const mockFetch = jest.fn()
global.fetch = mockFetch

function mockOk(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

function mock204() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 204,
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
  mockFetch.mockRejectedValueOnce(new TypeError('Network error'))
}

beforeEach(() => mockFetch.mockClear())

const TOKEN = 'test-token'
const PATIENT_ID = 'patient-1'
const PLAN_ID = 'plan-1'

const sampleSummary: MealPlanSummary = {
  _id: PLAN_ID,
  patientId: PATIENT_ID,
  nutritionistId: 'nutri-1',
  nome: 'Plano Ativo',
  status: 'ativo',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const sampleDetail: MealPlanDetail = {
  ...sampleSummary,
  refeicoes: [
    {
      _id: 'meal-1',
      nome: 'Café da manhã',
      horario: '07:00',
      ordem: 1,
      itens: [
        { _id: 'item-1', alimento: 'Ovo', quantidade: '2', unidade: 'unidades' },
      ],
    },
  ],
}

const savePlanPayload = {
  nome: 'Novo Plano',
  status: 'rascunho' as const,
  refeicoes: [],
}

describe('listMealPlans', () => {
  it('returns list of meal plan summaries', async () => {
    mockOk([sampleSummary])
    const result = await listMealPlans(TOKEN, PATIENT_ID)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(sampleSummary)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/meal-plans`),
      expect.any(Object),
    )
  })

  it('throws on API error', async () => {
    mockError(500, { message: 'Erro interno' })
    await expect(listMealPlans(TOKEN, PATIENT_ID)).rejects.toThrow('Erro interno')
  })

  it('throws on network failure', async () => {
    mockNetworkError()
    await expect(listMealPlans(TOKEN, PATIENT_ID)).rejects.toThrow('Não foi possível conectar na API.')
  })
})

describe('getMealPlan', () => {
  it('returns meal plan detail with refeicoes', async () => {
    mockOk(sampleDetail)
    const result = await getMealPlan(TOKEN, PATIENT_ID, PLAN_ID)
    expect(result).toEqual(sampleDetail)
    expect(result.refeicoes).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/meal-plans/${PLAN_ID}`),
      expect.any(Object),
    )
  })

  it('throws on 404', async () => {
    mockError(404, { message: 'Plano não encontrado' })
    await expect(getMealPlan(TOKEN, PATIENT_ID, PLAN_ID)).rejects.toThrow('Plano não encontrado')
  })
})

describe('createMealPlan', () => {
  it('sends POST and returns created plan detail', async () => {
    mockOk(sampleDetail)
    const result = await createMealPlan(TOKEN, PATIENT_ID, savePlanPayload)
    expect(result).toEqual(sampleDetail)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/meal-plans`),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('joins array error messages', async () => {
    mockError(400, { message: ['Nome obrigatório', 'Status inválido'] })
    await expect(createMealPlan(TOKEN, PATIENT_ID, savePlanPayload)).rejects.toThrow('Nome obrigatório, Status inválido')
  })

  it('uses fallback message when body has no message', async () => {
    mockError(500, {})
    await expect(createMealPlan(TOKEN, PATIENT_ID, savePlanPayload)).rejects.toThrow('Erro inesperado.')
  })
})

describe('updateMealPlan', () => {
  it('sends PUT to correct endpoint', async () => {
    const updated = { ...sampleDetail, nome: 'Plano Atualizado' }
    mockOk(updated)
    const result = await updateMealPlan(TOKEN, PATIENT_ID, PLAN_ID, { ...savePlanPayload, nome: 'Plano Atualizado' })
    expect(result.nome).toBe('Plano Atualizado')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/meal-plans/${PLAN_ID}`),
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})

describe('deleteMealPlan', () => {
  it('sends DELETE and returns undefined on 204', async () => {
    mock204()
    const result = await deleteMealPlan(TOKEN, PATIENT_ID, PLAN_ID)
    expect(result).toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/patients/${PATIENT_ID}/meal-plans/${PLAN_ID}`),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('throws on error', async () => {
    mockError(403, { message: 'Não autorizado' })
    await expect(deleteMealPlan(TOKEN, PATIENT_ID, PLAN_ID)).rejects.toThrow('Não autorizado')
  })
})
