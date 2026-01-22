// Module imports
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { Form } from 'radix-ui'
import { type ReactNode, useCallback, useState } from 'react'

// Local imports
import { GenresField } from '@/components/NewGameDialog/GenresField'
import { ModesField } from '@/components/NewGameDialog/ModesField'
import { PlayerPerspectivesField } from '@/components/NewGameDialog/PlayerPerspectivesField'
import { ThemesField } from '@/components/NewGameDialog/ThemesField'
import { TypesField } from '@/components/NewGameDialog/TypesField'
import { NameField } from '@/components/NewGameDialog/NameField'
import { putGame } from '@/store/actions/putGame'
import { type State } from '@/typedefs/State'
import { SummaryField } from '@/components/NewGameDialog/SummaryField'

// Types
type Props = Readonly<{ trigger: ReactNode }>

export function NewGameDialog(props: Props) {
	const { trigger } = props

	const [isOpen, setIsOpen] = useState(false)
	const [state, setState] = useState<State>('idle')

	const handleSubmit = useCallback((formData: FormData) => {
		setState('active')
		const result: Record<string, unknown> = Object.fromEntries(formData)
		result.genres = formData.getAll('genres')
		result.modes = formData.getAll('modes')
		result.playerPerspectives = formData.getAll('playerPerspectives')
		result.themes = formData.getAll('themes')
		putGame(result).then(() => {
			setIsOpen(false)
			setState('idle')
		})
	}, [])

	return (
		<Dialog.Root
			open={isOpen}
			onOpenChange={setIsOpen}>
			<Dialog.Trigger>{trigger}</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Title>{'New Game'}</Dialog.Title>
				<Dialog.Description mb={'4'}>{'Create a new game.'}</Dialog.Description>

				<Form.Root
					action={handleSubmit}
					asChild>
					<form>
						<Flex direction={'column'}>
							<NameField disabled={state === 'active'} />

							<SummaryField disabled={state === 'active'} />

							<TypesField disabled={state === 'active'} />

							{/* parent */}

							<PlayerPerspectivesField disabled={state === 'active'} />

							<GenresField disabled={state === 'active'} />

							<ModesField disabled={state === 'active'} />

							<ThemesField disabled={state === 'active'} />

							{/* releaseDates */}
						</Flex>

						<Flex
							gap={'3'}
							justify={'end'}
							mt={'4'}>
							<Dialog.Close>
								<Button disabled={state === 'active'}>{'Cancel'}</Button>
							</Dialog.Close>

							<Form.Submit asChild>
								<Button loading={state === 'active'}>{'Save'}</Button>
							</Form.Submit>
						</Flex>
					</form>
				</Form.Root>
			</Dialog.Content>
		</Dialog.Root>
	)
}
