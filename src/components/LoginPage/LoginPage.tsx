'use client'

// Module imports
import { useCallback, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from '../ui/input-group'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { type State } from '@/typedefs/State'
import { store } from '@/store/store'

export function LoginPage() {
	const [state, setSaveState] = useState<State>('idle')

	const { quicksliceClient } = useStore(store)

	const handleSubmit = useCallback(
		(formData: FormData) => {
			if (!quicksliceClient) {
				return
			}
			setSaveState('active')
			quicksliceClient
				.loginWithRedirect(Object.fromEntries(formData.entries()))
				.then(() => setSaveState('idle'))
		},
		[quicksliceClient],
	)

	return (
		<div
			className={
				'bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'
			}>
			<div className={'w-full max-w-sm'}>
				<div className={'flex flex-col gap-6'}>
					<Card>
						<CardHeader>
							<CardTitle>{'Login'}</CardTitle>
							<CardDescription>
								{'Enter your Bluesky/ATProto username below to login'}
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form action={handleSubmit}>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor={'handle'}>{'Username'}</FieldLabel>
										<InputGroup>
											<InputGroupAddon>
												<InputGroupText>{'@'}</InputGroupText>
											</InputGroupAddon>
											<InputGroupInput
												autoComplete={'username'}
												disabled={state === 'active'}
												id={'handle'}
												name={'handle'}
												placeholder={'handle.bsky.social'}
												required
											/>
										</InputGroup>
									</Field>

									<Field>
										<Button
											disabled={state === 'active'}
											type={'submit'}>
											{state === 'active' && (
												<Spinner data-icon={'inline-start'} />
											)}
											{'Login'}
										</Button>
									</Field>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
