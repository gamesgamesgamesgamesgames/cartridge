// Module imports
import {
	Button,
	Dialog,
	Flex,
	TextField,
	VisuallyHidden,
} from '@radix-ui/themes'
import { Form } from 'radix-ui'
import { ReactNode, useCallback, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import { type State } from '@/typedefs/State'
import { store } from '@/store/store'

// Types
type Props = Readonly<{ trigger: ReactNode }>

export function LoginDialog(props: Props) {
	const { trigger } = props

	const [isOpen, setIsOpen] = useState(false)
	const [state, setSaveState] = useState<State>('idle')

	const { quicksliceClient } = useStore(store)

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			if (!quicksliceClient) {
				return
			}

			setSaveState('active')
			await quicksliceClient.loginWithRedirect({
				handle: formData.get('handle') as string,
			})
			setSaveState('idle')
		},
		[quicksliceClient],
	)

	return (
		<Dialog.Root
			open={isOpen}
			onOpenChange={setIsOpen}>
			<Dialog.Trigger>{trigger}</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Title>{'Login'}</Dialog.Title>
				<VisuallyHidden>
					<Dialog.Description>{''}</Dialog.Description>
				</VisuallyHidden>

				<Form.Root
					action={handleSubmit}
					asChild>
					<form>
						<Flex direction={'column'}>
							<Form.Field
								asChild
								name={'handle'}>
								<Flex direction={'column'}>
									<Form.Control asChild>
										<TextField.Root
											autoComplete={'username'}
											disabled={state === 'active'}
											placeholder={'handle.bsky.social'}
											required
										/>
									</Form.Control>
								</Flex>
							</Form.Field>
						</Flex>

						<Flex
							gap={'3'}
							justify={'between'}
							mt={'4'}>
							<Dialog.Close>
								<Button
									disabled={state === 'active'}
									variant={'outline'}>
									{'Cancel'}
								</Button>
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
