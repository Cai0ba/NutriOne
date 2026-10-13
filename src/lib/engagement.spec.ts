import { getEngagement, RISK_CFG } from './engagement'

const mockFetch = jest.fn()
global.fetch = mockFetch

afterEach(() => mockFetch.mockReset())

describe('getEngagement', () => {
  it('calls the engagement endpoint with the token', async () => {
    const body = { resumo: { total: 0, alto: 0, atencao: 0, ok: 0 }, patients: [] }
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(body) })

    const result = await getEngagement('tok')

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toMatch(/\/engagement\/patients$/)
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(result).toEqual(body)
  })

  it('throws the API message on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403, json: () => Promise.resolve({ message: 'Forbidden resource' }) })
    await expect(getEngagement('tok')).rejects.toThrow('Forbidden resource')
  })

  it('falls back to the status code when the body is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.reject(new Error('x')) })
    await expect(getEngagement('tok')).rejects.toThrow('Erro 500')
  })
})

describe('RISK_CFG', () => {
  it('has a label for every risk level', () => {
    expect(Object.keys(RISK_CFG).sort()).toEqual(['alto', 'atencao', 'ok'])
  })
})
