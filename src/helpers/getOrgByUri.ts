import { getBlobUrl } from '@/helpers/getBlobUrl'
import { resolvePds } from '@/helpers/resolvePds'

export type OrgProfile = {
	uri: string
	did: string
	rkey: string
	displayName?: string
	description?: string
	country?: string
	status?: string
	foundedAt?: string
	websites?: { url: string; type?: string }[]
	avatar?: { ref?: { $link: string }; mimeType?: string }
	avatarUrl?: string
}

const ORG_COLLECTION = 'games.gamesgamesgamesgames.org.profile'

export function buildOrgUri(did: string, rkey: string): string {
	return `at://${did}/${ORG_COLLECTION}/${rkey}`
}

export function parseOrgUri(orgUri: string): { did: string; rkey: string } | null {
	const match = orgUri.match(/^at:\/\/([^/]+)\/[^/]+\/(.+)$/)
	if (!match) return null
	return { did: match[1], rkey: match[2] }
}

export async function getOrgByUri(orgUri: string): Promise<OrgProfile | null> {
	const parsed = parseOrgUri(orgUri)
	if (!parsed) return null
	return getOrgByRkey(parsed.did, parsed.rkey)
}

export async function getOrgByRkey(did: string, rkey: string): Promise<OrgProfile | null> {
	try {
		const pdsEndpoint = await resolvePds(did)

		const params = new URLSearchParams({
			repo: did,
			collection: ORG_COLLECTION,
			rkey,
		})

		const response = await fetch(
			`${pdsEndpoint}/xrpc/com.atproto.repo.getRecord?${params}`,
		)

		if (!response.ok) return null

		const data = await response.json()
		const value = data.value as Record<string, unknown>
		const uri = buildOrgUri(did, rkey)

		const avatar = value.avatar as OrgProfile['avatar'] | undefined
		let avatarUrl: string | undefined

		if (avatar?.ref?.$link) {
			avatarUrl = getBlobUrl(pdsEndpoint, did, avatar.ref.$link)
		}

		return {
			uri,
			did,
			rkey,
			displayName: value.displayName as string | undefined,
			description: value.description as string | undefined,
			country: value.country as string | undefined,
			status: value.status as string | undefined,
			foundedAt: value.foundedAt as string | undefined,
			websites: value.websites as OrgProfile['websites'],
			avatar,
			avatarUrl,
		}
	} catch {
		return null
	}
}
