import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangePasswordModal } from './ChangePasswordModal'

jest.mock('@/lib/auth', () => ({
  changePassword: jest.fn(),
  updateStoredToken: jest.fn(),
  updateStoredUser: jest.fn(),
}))

import { changePassword, updateStoredToken, updateStoredUser } from '@/lib/auth'

const mockChange = changePassword as jest.MockedFunction<typeof changePassword>
const user = { id: 'u1', nome: 'Ana', email: 'a@x.com', role: 'nutritionist' as const, mustChangePassword: false }

const fill = async (current: string, next: string, confirm: string) => {
  const [cur, nov, conf] = [
    screen.getByLabelText(/Senha (temporária|atual)/),
    screen.getByLabelText('Nova senha'),
    screen.getByLabelText('Confirmar nova senha'),
  ]
  if (current) await userEvent.type(cur, current)
  await userEvent.type(nov, next)
  await userEvent.type(conf, confirm)
  await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))
}

afterEach(() => jest.clearAllMocks())

describe('ChangePasswordModal', () => {
  describe('obrigatório (padrão)', () => {
    it('has no cancel button and asks for the temporary password', () => {
      render(<ChangePasswordModal open token="t" onPasswordChanged={jest.fn()} />)

      expect(screen.getByText('Troque sua senha')).toBeInTheDocument()
      expect(screen.getByLabelText('Senha temporária')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    })

    it('prefills the current password when asked to', () => {
      render(<ChangePasswordModal open token="t" prefillCurrentPassword="abc12345" onPasswordChanged={jest.fn()} />)
      expect(screen.getByLabelText('Senha temporária')).toHaveValue('abc12345')
    })

    it('starts empty by default', () => {
      render(<ChangePasswordModal open token="t" onPasswordChanged={jest.fn()} />)
      expect(screen.getByLabelText('Senha temporária')).toHaveValue('')
    })
  })

  describe('voluntário', () => {
    it('shows "Senha atual" and a cancel button that closes', async () => {
      const onClose = jest.fn()
      render(<ChangePasswordModal open forced={false} token="t" onClose={onClose} onPasswordChanged={jest.fn()} />)

      expect(screen.getByText('Alterar senha')).toBeInTheDocument()
      expect(screen.getByLabelText('Senha atual')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('envio', () => {
    it('saves the new token and user, then reports the change', async () => {
      mockChange.mockResolvedValue({ user, accessToken: 'new-token' })
      const onChanged = jest.fn()
      render(<ChangePasswordModal open token="old" onPasswordChanged={onChanged} />)

      await fill('TempSenha1', 'NovaSenha-123', 'NovaSenha-123')

      await waitFor(() => expect(onChanged).toHaveBeenCalledWith(user, 'new-token'))
      expect(mockChange).toHaveBeenCalledWith('old', { senhaAtual: 'TempSenha1', novaSenha: 'NovaSenha-123' })
      expect(updateStoredToken).toHaveBeenCalledWith('new-token')
      expect(updateStoredUser).toHaveBeenCalledWith(user)
    })

    it('rejects a new password shorter than 8 characters without calling the API', async () => {
      render(<ChangePasswordModal open token="t" onPasswordChanged={jest.fn()} />)

      await fill('TempSenha1', 'curta', 'curta')

      expect(await screen.findByText('A nova senha precisa ter pelo menos 8 caracteres.')).toBeInTheDocument()
      expect(mockChange).not.toHaveBeenCalled()
    })

    it('rejects a confirmation that does not match', async () => {
      render(<ChangePasswordModal open token="t" onPasswordChanged={jest.fn()} />)

      await fill('TempSenha1', 'NovaSenha-123', 'OutraSenha-123')

      expect(await screen.findByText('As senhas não conferem.')).toBeInTheDocument()
      expect(mockChange).not.toHaveBeenCalled()
    })

    it('rejects a new password equal to the current one', async () => {
      render(<ChangePasswordModal open token="t" onPasswordChanged={jest.fn()} />)

      await fill('MesmaSenha-1', 'MesmaSenha-1', 'MesmaSenha-1')

      expect(await screen.findByText('A nova senha deve ser diferente da atual.')).toBeInTheDocument()
      expect(mockChange).not.toHaveBeenCalled()
    })

    it('shows the API error and keeps the dialog open', async () => {
      mockChange.mockRejectedValue(new Error('A senha atual está incorreta.'))
      const onChanged = jest.fn()
      render(<ChangePasswordModal open token="t" onPasswordChanged={onChanged} />)

      await fill('TempSenha1', 'NovaSenha-123', 'NovaSenha-123')

      expect(await screen.findByText('A senha atual está incorreta.')).toBeInTheDocument()
      expect(onChanged).not.toHaveBeenCalled()
      expect(updateStoredToken).not.toHaveBeenCalled()
    })
  })
})
