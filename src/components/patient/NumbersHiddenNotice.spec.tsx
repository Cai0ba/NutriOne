import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumbersHiddenNotice } from './NumbersHiddenNotice'

describe('NumbersHiddenNotice', () => {
  it('explains the mode is on', () => {
    render(<NumbersHiddenNotice />)
    expect(screen.getByText('Modo sem números ativado')).toBeInTheDocument()
  })

  it('does not claim the mode is on when preferences failed to load, and offers retry', async () => {
    const onRetry = jest.fn()
    render(<NumbersHiddenNotice error onRetry={onRetry} />)

    expect(screen.queryByText('Modo sem números ativado')).not.toBeInTheDocument()
    expect(screen.getByText('Não foi possível carregar suas preferências')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onRetry).toHaveBeenCalled()
  })
})
