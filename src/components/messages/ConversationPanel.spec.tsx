import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Message } from '@/lib/messages'
import { ConversationPanel } from './ConversationPanel'

const baseMsg: Message = {
  _id:            'msg-1',
  patientId:      'p-1',
  nutritionistId: 'n-1',
  senderId:       'n-1',
  senderRole:     'nutritionist',
  texto:          'Olá, tudo bem?',
  lida:           false,
  createdAt:      '2025-07-10T14:00:00.000Z',
}

const defaultProps = {
  messages: [] as Message[],
  loading:  false,
  currentRole: 'nutritionist' as const,
  onSend:   jest.fn().mockResolvedValue(undefined),
}

afterEach(() => jest.clearAllMocks())

describe('ConversationPanel', () => {
  it('shows the empty label when there are no messages', () => {
    render(<ConversationPanel {...defaultProps} />)
    expect(screen.getByText(/Nenhuma mensagem ainda/i)).toBeInTheDocument()
  })

  it('shows a custom empty label when provided', () => {
    render(<ConversationPanel {...defaultProps} emptyLabel="Sem conversas" />)
    expect(screen.getByText('Sem conversas')).toBeInTheDocument()
  })

  it('shows a loading spinner when loading', () => {
    const { container } = render(<ConversationPanel {...defaultProps} loading />)
    expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument()
  })

  it('renders message text', () => {
    render(<ConversationPanel {...defaultProps} messages={[baseMsg]} />)
    expect(screen.getByText('Olá, tudo bem?')).toBeInTheDocument()
  })

  it('disables send button when input is empty', () => {
    render(<ConversationPanel {...defaultProps} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('enables send button after typing', async () => {
    render(<ConversationPanel {...defaultProps} />)
    const input = screen.getByPlaceholderText('Escreva uma mensagem...')
    await userEvent.type(input, 'Oi')
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('calls onSend with the typed text and clears the input', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined)
    render(<ConversationPanel {...defaultProps} onSend={onSend} />)
    const input = screen.getByPlaceholderText('Escreva uma mensagem...') as HTMLInputElement
    await userEvent.type(input, 'Mensagem teste')
    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(onSend).toHaveBeenCalledWith('Mensagem teste'))
    await waitFor(() => expect(input.value).toBe(''))
  })

  it('sends message on Enter key without shift', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined)
    render(<ConversationPanel {...defaultProps} onSend={onSend} />)
    const input = screen.getByPlaceholderText('Escreva uma mensagem...')
    await userEvent.type(input, 'Enviar com enter')
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    await waitFor(() => expect(onSend).toHaveBeenCalledWith('Enviar com enter'))
  })

  it('does not call onSend for whitespace-only text', async () => {
    const onSend = jest.fn()
    render(<ConversationPanel {...defaultProps} onSend={onSend} />)
    const input = screen.getByPlaceholderText('Escreva uma mensagem...')
    await userEvent.type(input, '   ')
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(onSend).not.toHaveBeenCalled()
  })
})
