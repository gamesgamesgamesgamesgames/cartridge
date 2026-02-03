'use client'

// Module imports
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from '@/components/ui/input-group'
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from '@/components/ui/item'
import { Link } from '@/components/Link/Link'
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
			<div className={'w-full max-w-lg'}>
				<div className={'flex flex-col gap-6'}>
					<Card>
						<CardHeader>
							<CardTitle>{'Atmosphere'}</CardTitle>
							<CardDescription>
								{'Connect with your Atmosphere account'}
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form action={handleSubmit}>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor={'handle'}>{'Handle'}</FieldLabel>
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

									<Collapsible asChild>
										<Item variant={'outline'}>
											<ItemContent>
												<CollapsibleTrigger asChild>
													<ItemTitle className={'group w-full'}>
														{/* <Button
													className={'group w-full'}
													variant={'ghost'}> */}
														{'What is an Atmosphere account?'}
														<FontAwesomeIcon
															className={
																'ml-auto group-data-[state=open]:rotate-180'
															}
															icon={faChevronDown}
														/>
													</ItemTitle>
												</CollapsibleTrigger>

												<CollapsibleContent asChild>
													<ItemDescription className={'line-clamp-none'}>
														<strong>{'The Pentaract Project'}</strong>
														{' uses the '}
														<Link href={'https://atproto.com'}>
															{'AT Protocol'}
														</Link>
														{
															' to power our platform, allowing developers to own their data and use one account for all compatible applications. Once you create an account, you can use other apps like '
														}
														<Link href={'https://bsky.app'}>{'Bluesky'}</Link>
														{' and '}
														<Link href={'https://tangled.org'}>
															{'Tangled'}
														</Link>
														{' with the same account.'}
													</ItemDescription>
												</CollapsibleContent>
											</ItemContent>
										</Item>
									</Collapsible>

									<Field>
										<Button
											disabled={state === 'active'}
											type={'submit'}>
											{state === 'active' && (
												<Spinner data-icon={'inline-start'} />
											)}
											{'Connect'}
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
