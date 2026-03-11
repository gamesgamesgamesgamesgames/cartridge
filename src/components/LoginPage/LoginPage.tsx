'use client'

// Module imports
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// Local imports
import { Button } from '@/components/ui/button'
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
	ItemTitle,
} from '@/components/ui/item'
import { Link } from '@/components/Link/Link'
import { Spinner } from '@/components/ui/spinner'
import { type State } from '@/typedefs/State'
import { loginWithRedirect } from '@/helpers/oauth'

export function LoginPage() {
	const searchParams = useSearchParams()
	const [state, setSaveState] = useState<State>('idle')

	const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSaveState('active')
		const formData = new FormData(event.currentTarget)
		const handle = formData.get('handle') as string
		const returnTo = searchParams.get('returnTo') ?? undefined
		loginWithRedirect(handle || undefined, returnTo)
	}, [searchParams])

	return (
		<div
			className={
				'bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'
			}>
			<div className={'w-full max-w-lg'}>
				<div className={'flex flex-col gap-6'}>
					<h1 className={'text-2xl font-semibold'}>{'Atmosphere'}</h1>
					<p className={'text-muted-foreground'}>
						{'Connect with your Atmosphere account'}
					</p>

					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={'handle'}>{'Handle'}</FieldLabel>
								<InputGroup>
									<InputGroupAddon>
										<InputGroupText>{'@'}</InputGroupText>
									</InputGroupAddon>
									<InputGroupInput
										autoComplete={'username handle did login-url'}
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
				</div>
			</div>
		</div>
	)
}
