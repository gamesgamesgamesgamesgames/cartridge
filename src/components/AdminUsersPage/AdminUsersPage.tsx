'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from 'statery'
import { Trash2 } from 'lucide-react'

import * as API from '@/helpers/API'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { Spinner } from '@/components/ui/spinner'
import { isSuperAdmin } from '@/helpers/admin'
import { store } from '@/store/store'

const TYPEAHEAD_URL = 'https://typeahead.waow.tech'

type TypeaheadActor = {
	did: string
	handle: string
	displayName?: string
	avatar?: string
}

export function AdminUsersPage() {
	const { user } = useStore(store)
	const router = useRouter()

	type MemberProfile = API.SpaceMember & {
		handle?: string
		displayName?: string
		avatarURL?: string
	}

	const [spaceUri, setSpaceUri] = useState<string | null>(null)
	const [members, setMembers] = useState<MemberProfile[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const inputRef = useRef<HTMLInputElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const [inputValue, setInputValue] = useState('')
	const [selectedDid, setSelectedDid] = useState<string | null>(null)
	const [suggestions, setSuggestions] = useState<TypeaheadActor[]>([])
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [isAdding, setIsAdding] = useState(false)
	const [addError, setAddError] = useState<string | null>(null)

	const [removingDid, setRemovingDid] = useState<string | null>(null)

	const resolveProfiles = useCallback(async (rawMembers: API.SpaceMember[]): Promise<MemberProfile[]> => {
		const resolved = await Promise.all(
			rawMembers.map(async (member) => {
				try {
					const result = await API.getProfileByHandle(member.did)
					return {
						...member,
						handle: result.handle,
						displayName: result.profile?.displayName,
					}
				} catch {
					return member
				}
			}),
		)
		return resolved
	}, [])

	const loadMembers = useCallback(async () => {
		if (!user?.did) return

		setIsLoading(true)
		setError(null)

		const uri = `at://${user.did}/space/dev.cartridge.claims.adminGroup/self`

		try {
			const result = await API.listSpaceMembers(uri)
			setSpaceUri(uri)
			setMembers(await resolveProfiles(result.members))
		} catch {
			try {
				await API.createSpace({
					type: 'dev.cartridge.claims.adminGroup',
					skey: 'self',
					config: { membershipPublic: false, recordsPublic: false },
				})
				setSpaceUri(uri)
				const result = await API.listSpaceMembers(uri)
				setMembers(await resolveProfiles(result.members))
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load admin space')
			}
		} finally {
			setIsLoading(false)
		}
	}, [user?.did, resolveProfiles])

	useEffect(() => {
		if (isSuperAdmin(user)) {
			loadMembers()
		}
	}, [loadMembers])

	const isDid = inputValue.trim().startsWith('did:')
	const resolvedDid = isDid ? inputValue.trim() : selectedDid

	useEffect(() => {
		const query = inputValue.trim()
		if (isDid || query.length < 2) {
			setSuggestions([])
			setShowSuggestions(false)
			return
		}

		const controller = new AbortController()
		const timer = setTimeout(async () => {
			try {
				const res = await fetch(
					`${TYPEAHEAD_URL}/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(query)}&limit=8`,
					{
						headers: { 'X-Client': 'kart.sh' },
						signal: controller.signal,
					},
				)
				if (!res.ok) return
				const data = await res.json()
				const actors: TypeaheadActor[] = data.actors ?? []
				setSuggestions(actors)
				setSelectedIndex(-1)
				if (actors.length > 0) setShowSuggestions(true)
			} catch {
				// AbortError or network failure
			}
		}, 200)

		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [inputValue, isDid])

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(e.target as Node)
			) {
				setShowSuggestions(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const selectSuggestion = useCallback((actor: TypeaheadActor) => {
		setInputValue(actor.handle)
		setSelectedDid(actor.did)
		setShowSuggestions(false)
		setSuggestions([])
		inputRef.current?.focus()
	}, [])

	const handleInputKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!showSuggestions || suggestions.length === 0) return

			if (e.key === 'ArrowDown') {
				e.preventDefault()
				setSelectedIndex((prev) =>
					Math.min(prev + 1, suggestions.length - 1),
				)
			} else if (e.key === 'ArrowUp') {
				e.preventDefault()
				setSelectedIndex((prev) => Math.max(prev - 1, -1))
			} else if (e.key === 'Enter' && selectedIndex >= 0) {
				e.preventDefault()
				selectSuggestion(suggestions[selectedIndex])
			} else if (e.key === 'Escape') {
				setShowSuggestions(false)
			}
		},
		[showSuggestions, suggestions, selectedIndex, selectSuggestion],
	)

	const handleAdd = useCallback(async () => {
		if (!spaceUri || !resolvedDid) return
		setIsAdding(true)
		setAddError(null)

		try {
			await API.addSpaceMember(spaceUri, resolvedDid)
			setInputValue('')
			setSelectedDid(null)
			await loadMembers()
		} catch (err) {
			setAddError(err instanceof Error ? err.message : 'Failed to add member')
		} finally {
			setIsAdding(false)
		}
	}, [loadMembers, resolvedDid, spaceUri])

	const handleRemove = useCallback(async (did: string) => {
		if (!spaceUri) return
		setRemovingDid(did)

		try {
			await API.removeSpaceMember(spaceUri, did)
			await loadMembers()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to remove member')
		} finally {
			setRemovingDid(null)
		}
	}, [loadMembers, spaceUri])

	if (user !== null && !isSuperAdmin(user)) {
		router.replace('/admin/claims')
		return null
	}

	return (
		<Container>
			<div className={'flex flex-col gap-6'}>
				<div className={'flex flex-col gap-2'}>
					<Header level={3}>{'Admin Users'}</Header>
					<p className={'text-muted-foreground text-sm'}>
						{'Manage who has admin access to review claims, contributions, and verification requests.'}
					</p>
				</div>

				{isLoading && (
					<div className={'flex items-center justify-center py-12'}>
						<Spinner className={'size-6'} />
					</div>
				)}

				{error && (
					<div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
						<p className={'text-sm text-destructive'}>{error}</p>
					</div>
				)}

				{!isLoading && !error && (
					<>
						<div className={'flex gap-2'}>
							<div className={'relative flex-1'}>
								<input
									aria-activedescendant={
										selectedIndex >= 0
											? `admin-suggestion-${selectedIndex}`
											: undefined
									}
									aria-autocomplete={'list'}
									aria-controls={'admin-handle-suggestions'}
									aria-expanded={showSuggestions}
									autoComplete={'off'}
									className={
										'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono'
									}
									disabled={isAdding}
									onChange={(e) => {
										setInputValue(e.target.value)
										setSelectedDid(null)
										setAddError(null)
									}}
									onFocus={() => {
										if (suggestions.length > 0) setShowSuggestions(true)
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && selectedIndex < 0) {
											handleAdd()
										} else {
											handleInputKeyDown(e)
										}
									}}
									placeholder={'handle or did:plc:...'}
									ref={inputRef}
									role={'combobox'}
									value={inputValue}
								/>

								{showSuggestions && suggestions.length > 0 && (
									<div
										ref={dropdownRef}
										role={'listbox'}
										id={'admin-handle-suggestions'}
										className={
											'absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-input bg-popover shadow-lg'
										}>
										{suggestions.map((actor, index) => (
											<button
												key={actor.did}
												type={'button'}
												role={'option'}
												id={`admin-suggestion-${index}`}
												aria-selected={index === selectedIndex}
												className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
													index === selectedIndex
														? 'bg-accent text-accent-foreground'
														: 'hover:bg-accent/50'
												}`}
												onMouseDown={(e) => {
													e.preventDefault()
													selectSuggestion(actor)
												}}
												onMouseEnter={() => setSelectedIndex(index)}>
												<div className={'min-w-0 flex-1'}>
													{actor.displayName && (
														<div className={'truncate text-sm font-medium'}>
															{actor.displayName}
														</div>
													)}
													<div className={'truncate text-xs text-muted-foreground font-mono'}>
														{'@'}{actor.handle}
													</div>
												</div>
											</button>
										))}
									</div>
								)}
							</div>
							<Button
								disabled={isAdding || !resolvedDid}
								onClick={handleAdd}>
								{isAdding ? (
									<>
										<Spinner className={'size-4'} />
										{'Adding...'}
									</>
								) : (
									'Add Admin'
								)}
							</Button>
						</div>

						{addError && (
							<div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
								<p className={'text-sm text-destructive'}>{addError}</p>
							</div>
						)}

						{members.length === 0 ? (
							<div className={'flex items-center justify-center py-12'}>
								<p className={'text-muted-foreground text-sm'}>{'No admin users yet.'}</p>
							</div>
						) : (
							<div className={'flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden'}>
								{members.map((member) => {
									const isSuper = member.did === user?.did

									return (
										<div
											key={member.did}
											className={'flex items-center gap-4 px-4 py-3 bg-background'}>
											<div className={'flex-1 min-w-0'}>
												<div className={'flex items-baseline gap-2'}>
													{member.displayName && (
														<p className={'text-sm font-medium truncate'}>
															{member.displayName}
														</p>
													)}
													{member.handle && (
														<p className={'text-xs text-muted-foreground truncate font-mono'}>
															{'@'}{member.handle}
														</p>
													)}
													{isSuper && (
														<span className={'text-xs text-muted-foreground'}>
															{'(superadmin)'}
														</span>
													)}
												</div>
												<p className={'text-xs text-muted-foreground font-mono truncate'}>
													{member.did}
												</p>
											</div>

											{!isSuper && (
												<Button
													disabled={removingDid === member.did}
													onClick={() => handleRemove(member.did)}
													size={'icon'}
													variant={'ghost'}>
													{removingDid === member.did ? (
														<Spinner className={'size-4'} />
													) : (
														<Trash2 className={'size-4 text-destructive'} />
													)}
												</Button>
											)}
										</div>
									)
								})}
							</div>
						)}
					</>
				)}
			</div>
		</Container>
	)
}
