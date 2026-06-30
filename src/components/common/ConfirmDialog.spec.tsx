import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

const defaultProps = {
  open:        true,
  title:       'Excluir item',
  description: 'Tem certeza que deseja excluir?',
  onConfirm:   jest.fn(),
  onCancel:    jest.fn(),
}

afterEach(() => jest.clearAllMocks())

describe('ConfirmDialog', () => {
  it('renders title and description when open', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Excluir item')).toBeInTheDocument()
    expect(screen.getByText('Tem certeza que deseja excluir?')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)
    expect(screen.queryByText('Excluir item')).not.toBeInTheDocument()
  })

  it('shows default confirm and cancel labels', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('uses custom labels when provided', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Deletar" cancelLabel="Voltar" />)
    expect(screen.getByRole('button', { name: 'Deletar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined)
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
  })

  it('shows loading state during async confirm', async () => {
    let resolve: () => void
    const onConfirm = jest.fn().mockReturnValue(new Promise<void>((res) => { resolve = res }))
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(screen.getByText('Aguarde...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Aguarde/i })).toBeDisabled()

    resolve!()
    await waitFor(() => expect(screen.queryByText('Aguarde...')).not.toBeInTheDocument())
  })

  it('disables cancel button during loading', async () => {
    let resolve: () => void
    const onConfirm = jest.fn().mockReturnValue(new Promise<void>((res) => { resolve = res }))
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()

    resolve!()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancelar' })).not.toBeDisabled())
  })

  it('renders with danger variant (default)', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />)
    // AlertTriangle should render (no error thrown)
    expect(screen.getByText('Excluir item')).toBeInTheDocument()
  })

  it('renders with warning variant', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" />)
    expect(screen.getByText('Excluir item')).toBeInTheDocument()
  })

  it('renders with neutral variant', () => {
    render(<ConfirmDialog {...defaultProps} variant="neutral" />)
    expect(screen.getByText('Excluir item')).toBeInTheDocument()
  })
})
