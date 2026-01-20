// Module imports
import {
	Box,
	Button,
	Dialog,
	Flex,
	TextArea,
	TextField,
} from '@radix-ui/themes'
import { Form } from 'radix-ui'
import { type ReactNode, useCallback, useState } from 'react'

// Local imports
import { FormLabel } from '@/components/FormLabel/FormLabel'
import { GameModesDropdown } from '@/components/NewGameDialog/GameModesDropdown'
import { GameTypesDropdown } from '@/components/NewGameDialog/GameTypesDropdown'
import { type State } from '@/typedefs/State'
import { putGame } from '@/store/actions/putGame'

// Types
type Props = Readonly<{ trigger: ReactNode }>

export function NewGameDialog(props: Props) {
	const { trigger } = props

	const [isOpen, setIsOpen] = useState(false)
	const [state, setState] = useState<State>('idle')

	const handleSubmit = useCallback((formData: FormData) => {
		setState('active')
		const result: Record<string, unknown> = Object.fromEntries(formData)
		result.modes = formData.getAll('modes')
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
							<Form.Field
								asChild
								name={'name'}>
								<Flex
									asChild
									direction={'column'}>
									<Box mb={'5'}>
										<FormLabel>{'Name'}</FormLabel>
										<Form.Message match={'valueMissing'}>
											{'Name is required'}
										</Form.Message>
										<Form.Control asChild>
											<TextField.Root
												autoComplete={'off'}
												disabled={state === 'active'}
												required
											/>
										</Form.Control>
									</Box>
								</Flex>
							</Form.Field>

							<Form.Field
								asChild
								name={'summary'}>
								<Flex
									asChild
									direction={'column'}>
									<Box mb={'5'}>
										<FormLabel>{'Summary'}</FormLabel>
										<Form.Message match={'valueMissing'}>
											{'Summary is required'}
										</Form.Message>
										<Form.Control asChild>
											<TextArea
												disabled={state === 'active'}
												required
											/>
										</Form.Control>
									</Box>
								</Flex>
							</Form.Field>

							<GameTypesDropdown disabled={state === 'active'} />

							<GameModesDropdown disabled={state === 'active'} />
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
