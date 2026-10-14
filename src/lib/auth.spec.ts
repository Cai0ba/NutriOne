import {
  login,
  getCurrentUser,
  registerUser,
  changePassword,
  saveSession,
  getStoredToken,
  getStoredUser,
  updateStoredUser,
  updateStoredToken,
  clearSession,
  getMyPatients,
  getDashboardPathByRole,
  type LoginResponse,
  type AuthUser,
} from './auth'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockFetch = jest.fn()
global.fetch = mockFetch

function mockOk(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(body),
  })
}

function mockError(status: number, body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  })
}

function mockNetworkFailure() {
  mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
}

// ─── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

beforeEach(() => {
  mockFetch.mockClear()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear()
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('returns login response on success', async () => {
    const response: LoginResponse = {
      accessToken: 'tok123',
      user: { id: '1', nome: 'Ana', email: 'ana@test.com', role: 'nutritionist' },
    }
    mockOk(response)

    const result = await login({ email: 'ana@test.com', senha: '123456' })
    expect(result).toEqual(response)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws on invalid credentials', async () => {
    mockError(401, { message: 'Credenciais inválidas' })
    await expect(login({ email: 'x@x.com', senha: 'wrong' })).rejects.toThrow('Credenciais inválidas')
  })

  it('throws on network failure with descriptive message', async () => {
    mockNetworkFailure()
    await expect(login({ email: 'x@x.com', senha: '123' })).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining('Nao foi possivel conectar') }),
    )
  })

  it('joins array error messages', async () => {
    mockError(400, { message: ['Campo inválido', 'Outro erro'] })
    await expect(login({ email: 'x@x.com', senha: '123' })).rejects.toThrow('Campo inválido, Outro erro')
  })

  it('uses fallback message when body has no message', async () => {
    mockError(500, {})
    await expect(login({ email: 'x@x.com', senha: '123' })).rejects.toThrow(
      'Não foi possível concluir a solicitação.',
    )
  })
})

describe('getCurrentUser', () => {
  it('calls /auth/me with bearer token', async () => {
    const meResp = { sub: '1', email: 'ana@test.com', role: 'nutritionist' as const }
    mockOk(meResp)

    const result = await getCurrentUser('my-token')
    expect(result).toEqual(meResp)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    )
  })
})

describe('registerUser', () => {
  it('posts to /auth/register with token', async () => {
    const user: AuthUser = { id: '2', nome: 'Bob', email: 'bob@test.com', role: 'client' }
    mockOk({ user })

    const result = await registerUser('tok', {
      nome: 'Bob', email: 'bob@test.com', cpf: '12345678901',
      dataNascimento: '1990-01-01', role: 'client',
    })
    expect(result.user).toEqual(user)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

describe('changePassword', () => {
  it('calls /auth/change-password', async () => {
    const user: AuthUser = { id: '1', nome: 'Ana', email: 'ana@test.com', role: 'nutritionist' }
    mockOk({ user, accessToken: 'new-token' })

    const result = await changePassword('tok', { senhaAtual: 'old', novaSenha: 'new' })
    expect(result.user).toEqual(user)
    expect(result.accessToken).toBe('new-token')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/change-password'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

describe('getMyPatients', () => {
  it('returns list of patients', async () => {
    const patients = [{ id: 'p1', nome: 'Carlos', email: 'c@test.com', role: 'client' as const }]
    mockOk({ patients })

    const result = await getMyPatients('tok')
    expect(result.patients).toHaveLength(1)
    expect(result.patients[0].id).toBe('p1')
  })
})

describe('saveSession / getStoredToken / getStoredUser', () => {
  it('saves and retrieves token', () => {
    saveSession({
      accessToken: 'abc',
      user: { id: '1', nome: 'Ana', email: 'ana@test.com', role: 'nutritionist' },
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nutriconnect.accessToken', 'abc')
  })

  it('getStoredToken returns stored token', () => {
    localStorageMock.getItem.mockReturnValueOnce('tok-xyz')
    expect(getStoredToken()).toBe('tok-xyz')
  })

  it('getStoredToken returns null when not set', () => {
    localStorageMock.getItem.mockReturnValueOnce(null)
    expect(getStoredToken()).toBeNull()
  })

  it('getStoredUser returns parsed user', () => {
    const user: AuthUser = { id: '1', nome: 'Ana', email: 'ana@test.com', role: 'nutritionist' }
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(user))
    expect(getStoredUser()).toEqual(user)
  })

  it('getStoredUser returns null when nothing stored', () => {
    localStorageMock.getItem.mockReturnValueOnce(null)
    expect(getStoredUser()).toBeNull()
  })

  it('getStoredUser clears session and returns null on corrupt JSON', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json{')
    expect(getStoredUser()).toBeNull()
    expect(localStorageMock.removeItem).toHaveBeenCalled()
  })
})

describe('updateStoredUser', () => {
  it('updates the stored user in localStorage', () => {
    const user: AuthUser = { id: '1', nome: 'Ana', email: 'ana@test.com', role: 'nutritionist' }
    updateStoredUser(user)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nutriconnect.user', JSON.stringify(user))
  })
})

describe('updateStoredToken', () => {
  it('replaces only the token, keeping the stored user', () => {
    updateStoredToken('fresh-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nutriconnect.accessToken', 'fresh-token')
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
  })
})

describe('clearSession', () => {
  it('removes both token and user keys', () => {
    clearSession()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('nutriconnect.accessToken')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('nutriconnect.user')
  })
})

describe('getDashboardPathByRole', () => {
  it('returns nutritionist dashboard path for nutritionist role', () => {
    expect(getDashboardPathByRole('nutritionist')).toBe('/nutritionist/dashboard')
  })

  it('returns /home for client role', () => {
    expect(getDashboardPathByRole('client')).toBe('/home')
  })
})
