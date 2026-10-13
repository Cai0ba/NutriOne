import { act, renderHook, waitFor } from '@testing-library/react'

jest.mock('@/lib/auth', () => ({ getStoredToken: jest.fn() }))
jest.mock('@/lib/patient-self', () => ({
  getSelfProfile: jest.fn(),
  updateSelfPreferences: jest.fn(),
}))

import { getStoredToken } from '@/lib/auth'
import { getSelfProfile, updateSelfPreferences } from '@/lib/patient-self'
import { resetPatientPreferencesStore, usePatientPreferences } from './usePatientPreferences'

const mockToken = getStoredToken as jest.MockedFunction<typeof getStoredToken>
const mockProfile = getSelfProfile as jest.MockedFunction<typeof getSelfProfile>
const mockUpdate = updateSelfPreferences as jest.MockedFunction<typeof updateSelfPreferences>

beforeEach(() => {
  resetPatientPreferencesStore()
  mockToken.mockReturnValue('token-A')
})
afterEach(() => jest.clearAllMocks())

describe('usePatientPreferences', () => {
  it('starts loading (null) so numbers are never shown before the preference is known', () => {
    mockProfile.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => usePatientPreferences())

    expect(result.current.modoSemNumeros).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('loads the preference from the profile', async () => {
    mockProfile.mockResolvedValue({ modoSemNumeros: true } as never)
    const { result } = renderHook(() => usePatientPreferences())

    await waitFor(() => expect(result.current.modoSemNumeros).toBe(true))
  })

  it('defaults to showing numbers when the patient has no profile yet', async () => {
    mockProfile.mockResolvedValue(null)
    const { result } = renderHook(() => usePatientPreferences())

    await waitFor(() => expect(result.current.modoSemNumeros).toBe(false))
  })

  it('hides numbers when the preference cannot be loaded (fail safe)', async () => {
    mockProfile.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => usePatientPreferences())

    await waitFor(() => expect(result.current.modoSemNumeros).toBe(true))
  })

  it('shares one request and one state between components', async () => {
    mockProfile.mockResolvedValue({ modoSemNumeros: false } as never)
    const a = renderHook(() => usePatientPreferences())
    const b = renderHook(() => usePatientPreferences())

    await waitFor(() => expect(a.result.current.modoSemNumeros).toBe(false))
    expect(mockProfile).toHaveBeenCalledTimes(1)

    mockUpdate.mockResolvedValue({ modoSemNumeros: true })
    await act(async () => {
      await a.result.current.save(true)
    })

    expect(mockUpdate).toHaveBeenCalledWith('token-A', true)
    expect(b.result.current.modoSemNumeros).toBe(true)
  })

  it('does not reuse another user\'s preference after the session changes', async () => {
    mockProfile.mockResolvedValue({ modoSemNumeros: false } as never)
    const first = renderHook(() => usePatientPreferences())
    await waitFor(() => expect(first.result.current.modoSemNumeros).toBe(false))
    first.unmount()

    mockToken.mockReturnValue('token-B')
    mockProfile.mockResolvedValue({ modoSemNumeros: true } as never)
    const second = renderHook(() => usePatientPreferences())

    // enquanto carrega, não mostra o valor do usuário anterior
    expect(second.result.current.modoSemNumeros).toBeNull()
    await waitFor(() => expect(second.result.current.modoSemNumeros).toBe(true))
  })
})
