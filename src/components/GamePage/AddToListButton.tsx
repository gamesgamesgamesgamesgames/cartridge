'use client'

// Module imports
import { ListPlus, Loader2, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// Local imports
import * as API from '@/helpers/API'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	consumePendingListAdd,
	isAuthenticated,
	setPendingListAdd,
} from '@/helpers/oauth'
import { store } from '@/store/store'
import { type UserListView } from '@/helpers/API'

// Types
type Props = Readonly<{
	gameUri: string
}>

export function AddToListButton(props: Props) {
	const { gameUri } = props

	const [open, setOpen] = useState(false)
	const [lists, setLists] = useState<UserListView[]>([])
	const [loading, setLoading] = useState(false)
	const [newListName, setNewListName] = useState('')
	const [creating, setCreating] = useState(false)
	const [togglingUri, setTogglingUri] = useState<string | null>(null)
	const pendingChecked = useRef(false)

	const fetchLists = useCallback(async () => {
		const did = store.state.authDid
		if (!did) return

		setLoading(true)
		try {
			const { lists: fetched } = await API.getUserLists(did, gameUri)
			setLists(fetched)
		} catch {
			toast.error('Couldn\'t load your lists.')
		} finally {
			setLoading(false)
		}
	}, [gameUri])

	const handleToggle = useCallback(
		async (listUri: string) => {
			if (togglingUri) return

			setTogglingUri(listUri)
			setLists((prev) =>
				prev.map((l) =>
					l.uri === listUri ? { ...l, hasGame: !l.hasGame } : l,
				),
			)

			try {
				await API.toggleListItem(listUri, gameUri)
			} catch {
				setLists((prev) =>
					prev.map((l) =>
						l.uri === listUri ? { ...l, hasGame: !l.hasGame } : l,
					),
				)
				toast.error('Couldn\'t update list. Try again.')
			} finally {
				setTogglingUri(null)
			}
		},
		[gameUri, togglingUri],
	)

	const handleCreate = useCallback(async () => {
		const trimmed = newListName.trim()
		if (!trimmed || creating) return

		setCreating(true)
		try {
			const { uri } = await API.createList(trimmed)
			const newList: UserListView = {
				uri,
				name: trimmed,
				itemCount: 1,
				hasGame: true,
				createdAt: new Date().toISOString(),
			}
			setLists((prev) => [newList, ...prev])
			setNewListName('')

			await API.toggleListItem(uri, gameUri)
		} catch {
			toast.error('Couldn\'t create list. Try again.')
		} finally {
			setCreating(false)
		}
	}, [newListName, creating, gameUri])

	const handleTriggerClick = useCallback(() => {
		if (!isAuthenticated()) {
			setPendingListAdd(gameUri)
			const returnTo = window.location.pathname + window.location.search
			window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
			return
		}
	}, [gameUri])

	useEffect(() => {
		if (open) {
			fetchLists()
		}
	}, [open, fetchLists])

	useEffect(() => {
		if (pendingChecked.current) return
		pendingChecked.current = true

		if (!isAuthenticated()) return

		const pendingUri = consumePendingListAdd()
		if (pendingUri === gameUri) {
			setOpen(true)
		}
	}, [gameUri])

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={'ghost'}
					size={'default'}
					className={'hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10'}
					onClick={handleTriggerClick}>
					<ListPlus />
					{'Add to List'}
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align={'start'}
				aria-label={'Your lists'}
				side={'top'}
				className={'w-64 p-0'}
				collisionPadding={16}>
				<div className={'max-h-60 overflow-y-auto'}>
					{loading && (
						<div className={'flex items-center justify-center py-6'}>
							<Loader2
								className={'size-4 animate-spin text-muted-foreground'}
							/>
						</div>
					)}

					{!loading && lists.length === 0 && (
						<p
							className={'px-3 py-4 text-center text-sm text-muted-foreground'}>
							{'No lists yet.'}
						</p>
					)}

					{!loading &&
						lists.map((list) => (
							<label
								key={list.uri}
								className={
									'flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-accent'
								}>
								<Checkbox
									checked={list.hasGame ?? false}
									disabled={togglingUri === list.uri}
									onCheckedChange={() => handleToggle(list.uri)}
								/>
								<span className={'truncate text-sm'}>{list.name}</span>
							</label>
						))}
				</div>

				<div className={'border-t border-border p-2'}>
					<form
						className={'flex items-center gap-1.5'}
						onSubmit={(e) => {
							e.preventDefault()
							handleCreate()
						}}>
						<Input
							aria-label={'New list name'}
							className={'h-8 text-sm'}
							placeholder={'New list name...'}
							value={newListName}
							onChange={(e) => setNewListName(e.target.value)}
							disabled={creating}
						/>
						<Button
							type={'submit'}
							variant={'ghost'}
							size={'sm'}
							disabled={!newListName.trim() || creating}
							className={'shrink-0'}>
							{creating ? (
								<Loader2 className={'size-4 animate-spin'} />
							) : (
								<Plus className={'size-4'} />
							)}
						</Button>
					</form>
				</div>
			</PopoverContent>
		</Popover>
	)
}
