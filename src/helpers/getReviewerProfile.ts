// Local imports
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { resolvePds } from '@/helpers/resolvePds'

export type ReviewerProfile = {
	handle: string
	displayName?: string
	avatarUrl?: string
}

type DidDocument = {
	alsoKnownAs?: string[]
	service?: { id: string; serviceEndpoint: string }[]
}

type GetRecordResponse = {
	value: Record<string, unknown>
}

async function resolveDidDocument(did: string): Promise<DidDocument> {
	if (did.startsWith('did:web:')) {
		const domain = did.replace('did:web:', '')
		const response = await fetch(`https://${domain}/.well-known/did.json`)
		return response.json()
	}

	const response = await fetch(`https://plc.directory/${did}`)
	return response.json()
}

function extractHandle(didDoc: DidDocument): string {
	const atUri = didDoc.alsoKnownAs?.find((aka) => aka.startsWith('at://'))
	if (atUri) {
		return atUri.replace('at://', '')
	}
	return ''
}

async function fetchRecord(
	pdsEndpoint: string,
	did: string,
	collection: string,
): Promise<GetRecordResponse | null> {
	const params = new URLSearchParams({
		repo: did,
		collection,
		rkey: 'self',
	})

	const response = await fetch(
		`${pdsEndpoint}/xrpc/com.atproto.repo.getRecord?${params}`,
	)

	if (!response.ok) {
		return null
	}

	return response.json()
}

export async function getReviewerProfile(
	did: string,
): Promise<ReviewerProfile> {
	const [didDoc, pdsEndpoint] = await Promise.all([
		resolveDidDocument(did),
		resolvePds(did),
	])

	const handle = extractHandle(didDoc)

	// Try games profile first
	const gamesProfile = await fetchRecord(
		pdsEndpoint,
		did,
		'games.gamesgamesgamesgames.actor.profile',
	)

	if (gamesProfile) {
		const value = gamesProfile.value
		const avatarRef = value.avatar as
			| { ref?: { $link: string }; mimeType?: string }
			| undefined

		return {
			handle,
			displayName: value.displayName as string | undefined,
			avatarUrl: avatarRef?.ref?.$link
				? getBlobUrl(pdsEndpoint, did, avatarRef.ref.$link)
				: undefined,
		}
	}

	// Fall back to popfeed profile
	const popfeedProfile = await fetchRecord(
		pdsEndpoint,
		did,
		'social.popfeed.actor.profile',
	)

	if (popfeedProfile) {
		return {
			handle,
			displayName: popfeedProfile.value.displayName as string | undefined,
		}
	}

	return { handle }
}
