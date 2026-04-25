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

function extractAvatar(
	value: Record<string, unknown>,
	pdsEndpoint: string,
	did: string,
): string | undefined {
	const avatarRef = value.avatar as
		| { ref?: { $link: string }; mimeType?: string }
		| undefined
	if (avatarRef?.ref?.$link) {
		return getBlobUrl(pdsEndpoint, did, avatarRef.ref.$link)
	}
	return undefined
}

export async function getReviewerProfile(
	did: string,
): Promise<ReviewerProfile> {
	const [didDoc, pdsEndpoint] = await Promise.all([
		resolveDidDocument(did),
		resolvePds(did),
	])

	const handle = extractHandle(didDoc)

	const collections = [
		'games.gamesgamesgamesgames.actor.profile',
		'social.popfeed.actor.profile',
		'app.bsky.actor.profile',
	]

	let displayName: string | undefined
	let avatarUrl: string | undefined

	for (const collection of collections) {
		const record = await fetchRecord(pdsEndpoint, did, collection)
		if (!record) continue

		const value = record.value
		if (!displayName) {
			displayName = value.displayName as string | undefined
		}
		if (!avatarUrl) {
			avatarUrl = extractAvatar(value, pdsEndpoint, did)
		}
		if (displayName && avatarUrl) break
	}

	return { handle, displayName, avatarUrl }
}
