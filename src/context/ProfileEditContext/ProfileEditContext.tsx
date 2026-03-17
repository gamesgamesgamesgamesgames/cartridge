'use client'

// Module imports
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type PropsWithChildren,
} from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { type Main as Facet } from '@/helpers/lexicons/app/bsky/richtext/facet.defs'
import { type Website } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type PentaractAPIUploadBlobResult } from '@/typedefs/PentaractAPIUploadBlobResult'
import { type State } from '@/typedefs/State'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { resolvePds } from '@/helpers/resolvePds'
import { store } from '@/store/store'

// Types
type Props = Readonly<PropsWithChildren>

type ProfileEditContextValue = {
	// Form state
	displayName: string
	description: string
	descriptionFacets: Facet[]
	pronouns: string
	websites: Website[]
	avatarURL: string
	avatarBlob: PentaractAPIUploadBlobResult | null

	// Status
	isLoading: boolean
	isDirty: boolean
	error: string | null
	state: State

	// Actions
	setDisplayName: (value: string) => void
	setDescription: (value: string) => void
	setDescriptionFacets: (value: Facet[]) => void
	setPronouns: (value: string) => void
	setWebsites: (value: Website[]) => void
	setAvatarBlob: (value: PentaractAPIUploadBlobResult | null) => void
	submitProfile: () => void
	cancel: () => void
}

export const ProfileEditContext = createContext<ProfileEditContextValue>({
	displayName: '',
	description: '',
	descriptionFacets: [],
	pronouns: '',
	websites: [],
	avatarURL: '',
	avatarBlob: null,

	isLoading: true,
	isDirty: false,
	error: null,
	state: 'idle',

	setDisplayName: () => {},
	setDescription: () => {},
	setDescriptionFacets: () => {},
	setPronouns: () => {},
	setWebsites: () => {},
	setAvatarBlob: () => {},
	submitProfile: () => {},
	cancel: () => {},
})

export function ProfileEditContextProvider(props: Props) {
	const { children } = props
	const router = useRouter()
	const { user } = useStore(store)

	// Form state
	const [displayName, setDisplayName] = useState('')
	const [description, setDescription] = useState('')
	const [descriptionFacets, setDescriptionFacets] = useState<Facet[]>([])
	const [pronouns, setPronouns] = useState('')
	const [websites, setWebsites] = useState<Website[]>([])
	const [avatarURL, setAvatarURL] = useState('')
	const [avatarBlob, setAvatarBlob] = useState<PentaractAPIUploadBlobResult | null>(null)
	const [state, setState] = useState<State>('idle')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Track initial values for dirty detection
	const initialValues = useRef({
		displayName: '',
		description: '',
		pronouns: '',
		websites: [] as Website[],
	})

	// Track original createdAt
	const createdAt = useRef<string | undefined>(undefined)

	// Fetch current profile on mount
	useEffect(() => {
		async function fetchProfile() {
			try {
				const result = await API.getProfile()
				if (!result.profile || result.profileType !== 'actor') {
					// No profile or org profile — editing not supported for orgs yet
					setIsLoading(false)
					return
				}

				// Safe to cast — we checked profileType === 'actor' above
				const profile = result.profile as import('@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs').ActorProfileDetailView

				setDisplayName(profile.displayName ?? '')
				setDescription(profile.description ?? '')
				setDescriptionFacets(profile.descriptionFacets ?? [])
				setPronouns(profile.pronouns ?? '')
				setWebsites(profile.websites ?? [])
				createdAt.current = profile.createdAt

				initialValues.current = {
					displayName: profile.displayName ?? '',
					description: profile.description ?? '',
					pronouns: profile.pronouns ?? '',
					websites: profile.websites ?? [],
				}

				// Resolve avatar URL from blob ref
				if (profile.avatar && profile.did) {
					try {
						const avatar = profile.avatar as { ref?: { $link: string } | string | unknown }
						const ref = avatar.ref
						let cid: string | undefined

						if (typeof ref === 'string') {
							cid = ref
						} else if (typeof ref === 'object' && ref !== null && '$link' in (ref as Record<string, unknown>)) {
							cid = (ref as { $link: string }).$link
						}

						if (cid) {
							const pdsEndpoint = await resolvePds(profile.did)
							setAvatarURL(getBlobUrl(pdsEndpoint, profile.did, cid))
						}
					} catch {
						// Avatar resolution failed — not critical
					}
				}
			} catch {
				setError('Failed to load profile')
			} finally {
				setIsLoading(false)
			}
		}

		fetchProfile()
	}, [])

	const isDirty = useMemo(() => {
		if (avatarBlob !== null) return true
		if (displayName !== initialValues.current.displayName) return true
		if (description !== initialValues.current.description) return true
		if (pronouns !== initialValues.current.pronouns) return true
		if (JSON.stringify(websites) !== JSON.stringify(initialValues.current.websites)) return true
		return false
	}, [avatarBlob, displayName, description, pronouns, websites])

	const cancel = useCallback(() => {
		if (user?.handle) {
			router.push(`/profile/${user.handle}`)
		} else {
			router.push('/')
		}
	}, [router, user?.handle])

	const submitProfile = useCallback(async () => {
		if (state !== 'idle') return

		setState('active')
		setError(null)

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const profile: any = {
				displayName: displayName || undefined,
				description: description || undefined,
				descriptionFacets: descriptionFacets.length ? descriptionFacets : undefined,
				pronouns: pronouns || undefined,
				websites: websites.length ? websites : undefined,
				createdAt: createdAt.current,
			}

			if (avatarBlob) {
				profile.avatar = {
					$type: 'blob',
					ref: { $link: avatarBlob.ref },
					mimeType: avatarBlob.mimeType,
					size: avatarBlob.size,
				}
			}

			await API.putActorProfile(profile)

			if (user?.handle) {
				router.push(`/profile/${user.handle}`)
			} else {
				router.push('/')
			}
		} catch (err) {
			console.error('[pentaract] Profile update failed:', err)
			setError('Failed to save profile. Please try again.')
			setState('idle')
		}
	}, [
		avatarBlob,
		description,
		descriptionFacets,
		displayName,
		pronouns,
		router,
		state,
		user?.handle,
		websites,
	])

	const providerValue = useMemo(
		() => ({
			displayName,
			description,
			descriptionFacets,
			pronouns,
			websites,
			avatarURL,
			avatarBlob,

			isLoading,
			isDirty,
			error,
			state,

			setDisplayName,
			setDescription,
			setDescriptionFacets,
			setPronouns,
			setWebsites,
			setAvatarBlob,
			submitProfile,
			cancel,
		}),
		[
			avatarBlob,
			avatarURL,
			cancel,
			description,
			descriptionFacets,
			displayName,
			error,
			isDirty,
			isLoading,
			pronouns,
			state,
			submitProfile,
			websites,
		],
	)

	return (
		<ProfileEditContext.Provider value={providerValue}>
			{children}
		</ProfileEditContext.Provider>
	)
}

export const useProfileEditContext = () => useContext(ProfileEditContext)
