import { acceptConsent, getConsents } from './consents'

const mockFetch = jest.fn()
global.fetch = mockFetch

afterEach(() => mockFetch.mockReset())

describe('consents api', () => {
  it('lists the consents with the token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ consents: [] }) })

    await getConsents('tok')

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toMatch(/\/me\/consents$/)
    expect(init.headers.Authorization).toBe('Bearer tok')
  })

  it('accepts a consent sending type and version', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ consents: [] }) })

    await acceptConsent('tok', 'dados_saude', 'v1')

    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ tipo: 'dados_saude', versao: 'v1' })
  })

  it('joins validation messages when the API returns a list', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: () => Promise.resolve({ message: ['a', 'b'] }) })
    await expect(acceptConsent('tok', 'dados_saude', 'v1')).rejects.toThrow('a, b')
  })

  it('shows the single message of a stale version', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: () => Promise.resolve({ message: 'A versão do termo está desatualizada.' }) })
    await expect(acceptConsent('tok', 'dados_saude', 'v0')).rejects.toThrow('desatualizada')
  })
})
