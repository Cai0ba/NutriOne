import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from './UserMenu'

const setup = (props: Partial<React.ComponentProps<typeof UserMenu>> = {}) => {
  const onChangePassword = jest.fn()
  render(<UserMenu initials="AL" name="Ana Lima" onChangePassword={onChangePassword} {...props} />)
  return { onChangePassword }
}

describe('UserMenu', () => {
  it('shows the initials and the name, and tells it opens a menu', () => {
    setup()

    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.getByText('Ana Lima')).toBeInTheDocument()
    const trigger = screen.getByRole('button', { name: 'Menu da conta de Ana Lima' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).not.toHaveAttribute('aria-expanded')
  })

  it('opens with "Alterar senha" as the only option', async () => {
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Menu da conta de Ana Lima' }))

    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(1)
    expect(screen.getByRole('menuitem', { name: 'Alterar senha' })).toBeInTheDocument()
    // com o menu aberto o MUI esconde o resto da página dos leitores de tela
    expect(screen.getByRole('button', { name: 'Menu da conta de Ana Lima', hidden: true })).toHaveAttribute('aria-expanded', 'true')
  })

  it('calls the handler and closes the menu when the option is chosen', async () => {
    const { onChangePassword } = setup()

    await userEvent.click(screen.getByRole('button', { name: 'Menu da conta de Ana Lima' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Alterar senha' }))

    expect(onChangePassword).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('closes with Escape without calling the handler', async () => {
    const { onChangePassword } = setup()

    await userEvent.click(screen.getByRole('button', { name: 'Menu da conta de Ana Lima' }))
    await screen.findByRole('menu')
    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    expect(onChangePassword).not.toHaveBeenCalled()
  })

  it('hides the name in the compact version but keeps it in the accessible label', () => {
    setup({ compact: true })

    expect(screen.queryByText('Ana Lima')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu da conta de Ana Lima' })).toBeInTheDocument()
  })
})
