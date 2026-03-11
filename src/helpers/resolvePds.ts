const pdsCache = new Map<string, Promise<string>>()

export function resolvePds(did: string): Promise<string> {
	const cached = pdsCache.get(did)
	if (cached) return cached

	const promise = resolveOnce(did)
	pdsCache.set(did, promise)

	promise.catch(() => {
		pdsCache.delete(did)
	})

	return promise
}

async function resolveOnce(did: string): Promise<string> {
	let didDoc: { service?: { id: string; serviceEndpoint: string }[] }

	if (did.startsWith('did:web:')) {
		const domain = did.replace('did:web:', '')
		const response = await fetch(`https://${domain}/.well-known/did.json`)
		didDoc = await response.json()
	} else {
		const response = await fetch(`https://plc.directory/${did}`)
		didDoc = await response.json()
	}

	const pdsService = didDoc.service?.find(
		(s) => s.id === '#atproto_pds',
	)

	if (!pdsService) {
		throw new Error(`No PDS service found for ${did}`)
	}

	return pdsService.serviceEndpoint
}
