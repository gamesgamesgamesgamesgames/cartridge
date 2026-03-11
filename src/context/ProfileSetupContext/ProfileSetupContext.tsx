'use client'

// Module imports
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from 'react'
import { useRouter } from 'next/navigation'

// Local imports
import * as API from '@/helpers/API'
import { getReturnUrl } from '@/helpers/oauth'
import { type ProfileType } from '@/typedefs/GlobalState'
import { type ProfileSourceData } from '@/typedefs/ProfileSourceData'
import { fetchPrefillData } from '@/helpers/fetchPrefillData'
import { type Main as Facet } from '@/helpers/lexicons/app/bsky/richtext/facet.defs'
import { type State } from '@/typedefs/State'
import { type Website } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { setProfileTypeCookie } from '@/helpers/setProfileTypeCookie'
import { store } from '@/store/store'
import { type PentaractAPIUploadBlobResult } from '@/typedefs/PentaractAPIUploadBlobResult'

// Types
type Props = Readonly<PropsWithChildren>

export const ProfileSetupContext = createContext<{
	// Form state
	displayName: string
	description: string
	descriptionFacets: Facet[]
	pronouns: string
	websites: Website[]
	avatarURL: string
	avatarBlob: PentaractAPIUploadBlobResult | null

	// Prefill
	prefillData: ProfileSourceData | null

	// Actions
	setDisplayName: (value: string) => void
	setDescription: (value: string) => void
	setDescriptionFacets: (value: Facet[]) => void
	setPronouns: (value: string) => void
	setWebsites: (value: Website[]) => void
	setAvatarBlob: (value: PentaractAPIUploadBlobResult | null) => void
	submitProfile: () => void
	state: State
}>({
	displayName: '',
	description: '',
	descriptionFacets: [],
	pronouns: '',
	websites: [],
	avatarURL: '',
	avatarBlob: null,

	prefillData: null,

	setDisplayName: () => {},
	setDescription: () => {},
	setDescriptionFacets: () => {},
	setPronouns: () => {},
	setWebsites: () => {},
	setAvatarBlob: () => {},
	submitProfile: () => {},
	state: 'idle',
})

export function ProfileSetupContextProvider(props: Props) {
	const { children } = props
	const router = useRouter()

	// Form state
	const [displayName, setDisplayName] = useState('')
	const [description, setDescription] = useState('')
	const [descriptionFacets, setDescriptionFacets] = useState<Facet[]>([])
	const [pronouns, setPronouns] = useState('')
	const [websites, setWebsites] = useState<Website[]>([])
	const [avatarURL, setAvatarURL] = useState('')
	const [avatarBlob, setAvatarBlob] = useState<PentaractAPIUploadBlobResult | null>(null)
	const [state, setState] = useState<State>('idle')
	const [prefillData, setPrefillData] = useState<ProfileSourceData | null>(null)

	// Fetch prefill data on mount
	useEffect(() => {
		fetchPrefillData().then((data) => {
			setPrefillData(data)
			if (data.displayName) setDisplayName(data.displayName)
			if (data.description) setDescription(data.description)
			if (data.pronouns) setPronouns(data.pronouns)
			if (data.avatarURL) setAvatarURL(data.avatarURL)
		})
	}, [])

	const submitProfile = useCallback(async () => {
		if (state !== 'idle') return

		setState('active')

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const profile: any = {
				displayName: displayName || undefined,
				description: description || undefined,
				descriptionFacets: descriptionFacets.length ? descriptionFacets : undefined,
				pronouns: pronouns || undefined,
				websites: websites.length ? websites : undefined,
				createdAt: new Date().toISOString(),
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

			store.set(() => ({ profileType: 'actor' as ProfileType }))
			setProfileTypeCookie('actor')
			router.replace(getReturnUrl() ?? '/')
		} catch (error) {
			console.error('[pentaract] Profile creation failed:', error)
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

			prefillData,

			setDisplayName,
			setDescription,
			setDescriptionFacets,
			setPronouns,
			setWebsites,
			setAvatarBlob,
			submitProfile,
			state,
		}),
		[
			avatarBlob,
			avatarURL,
			description,
			descriptionFacets,
			displayName,
			prefillData,
			pronouns,
			state,
			submitProfile,
			websites,
		],
	)

	return (
		<ProfileSetupContext.Provider value={providerValue}>
			{children}
		</ProfileSetupContext.Provider>
	)
}

export const useProfileSetupContext = () => useContext(ProfileSetupContext)
