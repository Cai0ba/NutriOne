import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { AccountPasswordDialog } from './AccountPasswordDialog'

type ModalProps = {
  open: boolean
  forced?: boolean
  token: string
  onPasswordChanged: (user: unknown, accessToken: string) => void
}
let mockProps: ModalProps | null = null
jest.mock('./ChangePasswordModal', () => ({
  ChangePasswordModal: (props: ModalProps) => {
    mockProps = props
    return props.open ? <div>voluntary-modal</div> : null
  },
}))
jest.mock('@/lib/auth', () => ({ getStoredToken: jest.fn() }))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

import { getStoredToken } from '@/lib/auth'
import { toast } from 'sonner'

afterEach(() => jest.clearAllMocks())

describe('AccountPasswordDialog', () => {
  it('opens the voluntary (non-forced) change with the stored token', () => {
    ;(getStoredToken as jest.Mock).mockReturnValue('tok')
    render(<AccountPasswordDialog open onClose={jest.fn()} />)

    expect(screen.getByText('voluntary-modal')).toBeInTheDocument()
    expect(mockProps?.forced).toBe(false)
    expect(mockProps?.token).toBe('tok')
  })

  it('renders nothing without a session', () => {
    ;(getStoredToken as jest.Mock).mockReturnValue(null)
    const { container } = render(<AccountPasswordDialog open onClose={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('confirms with a toast and closes after the change', () => {
    ;(getStoredToken as jest.Mock).mockReturnValue('tok')
    const onClose = jest.fn()
    render(<AccountPasswordDialog open onClose={onClose} />)

    mockProps?.onPasswordChanged({}, 'new')

    expect(toast.success).toHaveBeenCalledWith('Senha alterada com sucesso.')
    expect(onClose).toHaveBeenCalled()
  })
})
