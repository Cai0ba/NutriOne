import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'
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

// Mock ConsentGate (faz chamadas de rede próprias): expõe o token recebido
jest.mock('./ConsentGate', () => ({
  ConsentGate: ({ token }: { token: string }) => <div>consent-gate:{token}</div>,
}))

// Mock ChangePasswordModal: expõe as props para os testes
type ModalProps = {
  open: boolean
  forced?: boolean
  prefillCurrentPassword?: string
  onPasswordChanged: (user: unknown, accessToken: string) => void
}
let mockModalProps: ModalProps | null = null
jest.mock('./ChangePasswordModal', () => ({
  ChangePasswordModal: (props: ModalProps) => {
    mockModalProps = props
    return props.open ? <div>change-password-modal</div> : null
  },
}))

import { getStoredToken, getStoredUser, getCurrentUser, clearSession } from '@/lib/auth'
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
    expect(screen.getByText(/Validando sessão/i)).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('redirects to "/login" when no token stored', async () => {
    const mockReplace = jest.fn()
    mockUseRouter.mockReturnValue({ replace: mockReplace, push: jest.fn() } as any)
    mockGetStoredToken.mockReturnValue(null)

    render(
      <ProtectedRoute allowedRoles={['nutritionist']}>
        {() => <div>Dashboard</div>}
      </ProtectedRoute>,
    )

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'))
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
      expect(mockReplace).toHaveBeenCalledWith('/login')
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

  describe('troca de senha obrigatória', () => {
    beforeEach(() => {
      mockModalProps = null
      mockGetStoredToken.mockReturnValue('old-token')
    })

    it('forces the password change for a nutritionist with a pending temporary password', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'n1', email: 'n@x.com', role: 'nutritionist', mcp: true })

      render(<ProtectedRoute allowedRoles={['nutritionist']}>{() => <div>Dashboard</div>}</ProtectedRoute>)

      expect(await screen.findByText('change-password-modal')).toBeInTheDocument()
      expect(mockModalProps?.forced).not.toBe(false)
    })

    it('forces the password change for a patient and prefills the temporary password', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'p1', email: 'p@x.com', role: 'client', mcp: true })

      render(<ProtectedRoute>{() => <div>Home</div>}</ProtectedRoute>)

      expect(await screen.findByText('change-password-modal')).toBeInTheDocument()
      expect(mockModalProps?.prefillCurrentPassword).toBe('trocar1234')
    })

    it('does not prefill anything for a nutritionist', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'n1', email: 'n@x.com', role: 'nutritionist', mcp: true })

      render(<ProtectedRoute>{() => <div>Dashboard</div>}</ProtectedRoute>)

      await screen.findByText('change-password-modal')
      expect(mockModalProps?.prefillCurrentPassword).toBe('')
    })

    it('does not show the modal when nothing is pending', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'n1', email: 'n@x.com', role: 'nutritionist' })

      render(<ProtectedRoute>{() => <div>Dashboard</div>}</ProtectedRoute>)

      await screen.findByText('Dashboard')
      expect(screen.queryByText('change-password-modal')).not.toBeInTheDocument()
    })

    it('trusts the stored user for old tokens that carry no flag', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'n1', email: 'n@x.com', role: 'nutritionist' })
      ;(getStoredUser as jest.Mock).mockReturnValue({ id: 'n1', mustChangePassword: true })

      render(<ProtectedRoute>{() => <div>Dashboard</div>}</ProtectedRoute>)

      expect(await screen.findByText('change-password-modal')).toBeInTheDocument()
    })

    it('does not ask for consent while the password change is pending', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'p1', email: 'p@x.com', role: 'client', mcp: true })

      render(<ProtectedRoute>{() => <div>Home</div>}</ProtectedRoute>)

      await screen.findByText('change-password-modal')
      expect(screen.queryByText(/consent-gate/)).not.toBeInTheDocument()
    })

    it('switches everything to the new token after the change (the old one stays blocked)', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'p1', email: 'p@x.com', role: 'client', mcp: true })
      render(<ProtectedRoute>{() => <div>Home</div>}</ProtectedRoute>)
      await screen.findByText('change-password-modal')

      act(() => {
        mockModalProps?.onPasswordChanged({ id: 'p1', mustChangePassword: false, role: 'client' }, 'new-token')
      })

      expect(screen.queryByText('change-password-modal')).not.toBeInTheDocument()
      expect(await screen.findByText('consent-gate:new-token')).toBeInTheDocument()
    })

    it('does not mount the pages while the change is pending (they would call the API with the blocked token)', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'p1', email: 'p@x.com', role: 'client', mcp: true })

      render(<ProtectedRoute>{() => <div>Pagina</div>}</ProtectedRoute>)

      await screen.findByText('change-password-modal')
      expect(screen.queryByText('Pagina')).not.toBeInTheDocument()
    })

    it('mounts the pages only after the change, already with the new token available', async () => {
      mockGetCurrentUser.mockResolvedValue({ sub: 'p1', email: 'p@x.com', role: 'client', mcp: true })
      render(<ProtectedRoute>{() => <div>Pagina</div>}</ProtectedRoute>)
      await screen.findByText('change-password-modal')

      act(() => {
        mockModalProps?.onPasswordChanged({ id: 'p1', mustChangePassword: false, role: 'client' }, 'new-token')
      })

      expect(await screen.findByText('Pagina')).toBeInTheDocument()
    })
  })
})
