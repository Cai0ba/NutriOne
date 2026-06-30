import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { ProtectedRoute } from './ProtectedRoute'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn() })),
}))

// Mock auth lib
jest.mock('@/lib/auth', () => ({
  getStoredToken:        jest.fn(),
  getStoredUser:         jest.fn(),
  getCurrentUser:        jest.fn(),
  clearSession:          jest.fn(),
  updateStoredUser:      jest.fn(),
  getDashboardPathByRole: jest.fn((role: string) => role === 'nutritionist' ? '/nutritionist/dashboard' : '/home'),
}))

// Mock ChangePasswordModal (heavy component)
jest.mock('./ChangePasswordModal', () => ({
  ChangePasswordModal: () => null,
}))

import { getStoredToken, getCurrentUser, clearSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const mockGetStoredToken  = getStoredToken  as jest.MockedFunction<typeof getStoredToken>
const mockGetCurrentUser  = getCurrentUser  as jest.MockedFunction<typeof getCurrentUser>
const mockClearSession    = clearSession    as jest.MockedFunction<typeof clearSession>
const mockUseRouter       = useRouter       as jest.MockedFunction<typeof useRouter>

afterEach(() => jest.clearAllMocks())

describe('ProtectedRoute', () => {
  it('shows loading spinner while checking session', () => {
    mockGetStoredToken.mockReturnValue('token')
    mockGetCurrentUser.mockReturnValue(new Promise(() => {})) // never resolves
    render(
      <ProtectedRoute allowedRoles={['nutritionist']}>
        {() => <div>Dashboard</div>}
      </ProtectedRoute>,
    )
    expect(screen.getByText(/Validating/i)).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('redirects to "/" when no token stored', async () => {
    const mockReplace = jest.fn()
    mockUseRouter.mockReturnValue({ replace: mockReplace, push: jest.fn() } as any)
    mockGetStoredToken.mockReturnValue(null)

    render(
      <ProtectedRoute allowedRoles={['nutritionist']}>
        {() => <div>Dashboard</div>}
      </ProtectedRoute>,
    )

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'))
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('renders children when session is valid and role matches', async () => {
    mockGetStoredToken.mockReturnValue('valid-token')
    mockGetCurrentUser.mockResolvedValue({ sub: 'u1', email: 'n@x.com', role: 'nutritionist' })

    render(
      <ProtectedRoute allowedRoles={['nutritionist']}>
        {() => <div>Nutritionist Dashboard</div>}
      </ProtectedRoute>,
    )

    await waitFor(() => expect(screen.getByText('Nutritionist Dashboard')).toBeInTheDocument())
  })

  it('redirects when role does not match allowedRoles', async () => {
    const mockReplace = jest.fn()
    mockUseRouter.mockReturnValue({ replace: mockReplace, push: jest.fn() } as any)
    mockGetStoredToken.mockReturnValue('valid-token')
    mockGetCurrentUser.mockResolvedValue({ sub: 'u1', email: 'p@x.com', role: 'client' })

    render(
      <ProtectedRoute allowedRoles={['nutritionist']}>
        {() => <div>Nutritionist Dashboard</div>}
      </ProtectedRoute>,
    )

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/home'))
    expect(screen.queryByText('Nutritionist Dashboard')).not.toBeInTheDocument()
  })

  it('clears session and redirects when getCurrentUser throws', async () => {
    const mockReplace = jest.fn()
    mockUseRouter.mockReturnValue({ replace: mockReplace, push: jest.fn() } as any)
    mockGetStoredToken.mockReturnValue('bad-token')
    mockGetCurrentUser.mockRejectedValue(new Error('401 Unauthorized'))

    render(
      <ProtectedRoute>{() => <div>Content</div>}</ProtectedRoute>,
    )

    await waitFor(() => {
      expect(mockClearSession).toHaveBeenCalled()
      expect(mockReplace).toHaveBeenCalledWith('/')
    })
  })

  it('renders children without allowedRoles restriction', async () => {
    mockGetStoredToken.mockReturnValue('valid-token')
    mockGetCurrentUser.mockResolvedValue({ sub: 'u1', email: 'p@x.com', role: 'client' })

    render(
      <ProtectedRoute>
        {() => <div>Open Content</div>}
      </ProtectedRoute>,
    )

    await waitFor(() => expect(screen.getByText('Open Content')).toBeInTheDocument())
  })
})
