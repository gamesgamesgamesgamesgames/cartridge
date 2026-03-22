'use client'

// Module imports
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Link2, RefreshCw, Unlink } from 'lucide-react'

// Local imports
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
	authorizeExternal,
	getExternalProviders,
	getLinkedAccounts,
	syncExternal,
	unlinkExternal,
} from '@/helpers/API'
import { type ExternalProvider, type LinkedAccount } from '@/typedefs/ExternalAccount'

export function AccountsSettingsPage() {
	const searchParams = useSearchParams()
	const [providers, setProviders] = useState<ExternalProvider[]>([])
	const [accounts, setAccounts] = useState<LinkedAccount[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [syncingPlugins, setSyncingPlugins] = useState<Set<string>>(new Set())
	const [unlinkingPlugins, setUnlinkingPlugins] = useState<Set<string>>(new Set())
	const [confirmUnlink, setConfirmUnlink] = useState<string | null>(null)

	const accountsByPlugin = useMemo(() => {
		const map = new Map<string, LinkedAccount>()
		for (const account of accounts) {
			map.set(account.plugin_id, account)
		}
		return map
	}, [accounts])

	// Handle OAuth callback params
	useEffect(() => {
		const auth = searchParams.get('auth')
		if (auth === 'success') {
			toast.success('Account connected successfully')
		} else if (auth === 'error') {
			const message = searchParams.get('message') || 'Failed to connect account'
			toast.error(message)
		}

		if (auth) {
			window.history.replaceState({}, '', '/settings/accounts')
		}
	}, [searchParams])

	// Fetch providers and accounts
	useEffect(() => {
		fetchData()
	}, [])

	async function fetchData() {
		try {
			const [providerList, accountList] = await Promise.all([
				getExternalProviders(),
				getLinkedAccounts(),
			])
			setProviders(providerList)
			setAccounts(accountList)
		} catch {
			toast.error('Failed to load accounts')
		} finally {
			setIsLoading(false)
		}
	}

	async function handleConnect(pluginId: string) {
		try {
			const { authorize_url } = await authorizeExternal(
				pluginId,
				window.location.origin + '/settings/accounts',
			)
			window.location.href = authorize_url
		} catch {
			toast.error('Failed to start connection')
		}
	}

	async function handleSync(pluginId: string) {
		setSyncingPlugins((prev) => new Set(prev).add(pluginId))
		try {
			const result = await syncExternal(pluginId)
			toast.success(`Synced ${result.written} games`)
			const accountList = await getLinkedAccounts()
			setAccounts(accountList)
		} catch {
			toast.error('Sync failed')
		} finally {
			setSyncingPlugins((prev) => {
				const next = new Set(prev)
				next.delete(pluginId)
				return next
			})
		}
	}

	async function handleUnlink(pluginId: string) {
		setConfirmUnlink(null)
		setUnlinkingPlugins((prev) => new Set(prev).add(pluginId))
		try {
			await unlinkExternal(pluginId)
			setAccounts((prev) => prev.filter((a) => a.plugin_id !== pluginId))
			toast.success('Account disconnected')
		} catch {
			toast.error('Failed to disconnect account')
		} finally {
			setUnlinkingPlugins((prev) => {
				const next = new Set(prev)
				next.delete(pluginId)
				return next
			})
		}
	}

	if (isLoading) {
		return (
			<div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-3'}>
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className={'h-5 w-24'} />
						</CardHeader>
						<CardContent>
							<Skeleton className={'h-9 w-full'} />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (providers.length === 0) {
		return (
			<p className={'text-muted-foreground text-sm'}>
				{'No external services available.'}
			</p>
		)
	}

	return (
		<div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-3'}>
			{providers.map((provider) => {
				const account = accountsByPlugin.get(provider.id)
				const isLinked = Boolean(account)
				const isSyncing = syncingPlugins.has(provider.id)
				const isUnlinking = unlinkingPlugins.has(provider.id)

				return (
					<Card key={provider.id}>
						<CardHeader>
							<CardTitle className={'flex items-center gap-2'}>
								{provider.icon_url && (
									<img
										alt={''}
										className={'size-5'}
										src={provider.icon_url}
									/>
								)}
								{provider.name}
							</CardTitle>
							{isLinked && account && (
								<CardDescription>
									{account.account_id}
									{' · Connected '}
									{new Date(account.created_at).toLocaleDateString()}
								</CardDescription>
							)}
						</CardHeader>

						<CardContent>
							{isLinked ? (
								<div className={'flex gap-2'}>
									<Button
										disabled={isSyncing}
										onClick={() => handleSync(provider.id)}
										size={'sm'}
										variant={'outline'}>
										{isSyncing ? (
											<Loader2 className={'mr-2 size-4 animate-spin'} />
										) : (
											<RefreshCw className={'mr-2 size-4'} />
										)}
										{'Sync'}
									</Button>

									{confirmUnlink === provider.id ? (
										<div className={'flex gap-2'}>
											<Button
												disabled={isUnlinking}
												onClick={() => handleUnlink(provider.id)}
												size={'sm'}
												variant={'destructive'}>
												{isUnlinking ? (
													<Loader2 className={'mr-2 size-4 animate-spin'} />
												) : (
													'Confirm'
												)}
											</Button>
											<Button
												onClick={() => setConfirmUnlink(null)}
												size={'sm'}
												variant={'ghost'}>
												{'Cancel'}
											</Button>
										</div>
									) : (
										<Button
											onClick={() => setConfirmUnlink(provider.id)}
											size={'sm'}
											variant={'ghost'}>
											<Unlink className={'mr-2 size-4'} />
											{'Disconnect'}
										</Button>
									)}
								</div>
							) : (
								<Button
									onClick={() => handleConnect(provider.id)}
									size={'sm'}>
									<Link2 className={'mr-2 size-4'} />
									{'Connect'}
								</Button>
							)}
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
