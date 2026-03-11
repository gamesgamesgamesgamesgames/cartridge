'use client'

import { useEffect, useState } from 'react'
import { type AtUriString } from '@atproto/lex'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { parseATURI } from '@/helpers/parseATURI'
import { resolvePds } from '@/helpers/resolvePds'

type BlobRefLike = {
	ref: unknown
}

function extractCid(ref: unknown): string | undefined {
	if (!ref) return undefined
	if (typeof ref === 'string') return ref
	if (typeof ref === 'object' && '$link' in (ref as Record<string, unknown>)) {
		return (ref as { $link: string }).$link
	}
	if (typeof ref === 'object' && 'toString' in (ref as object)) {
		return String(ref)
	}
	return undefined
}

export function useBlobUrl(
	uri: string | undefined,
	blobRef: BlobRefLike | undefined,
): string | undefined {
	const [blobUrl, setBlobUrl] = useState<string | undefined>()

	useEffect(() => {
		if (!uri || !blobRef?.ref) {
			setBlobUrl(undefined)
			return
		}

		const cid = extractCid(blobRef.ref)
		if (!cid) {
			setBlobUrl(undefined)
			return
		}

		const { did } = parseATURI(uri as AtUriString)

		let cancelled = false

		resolvePds(did).then((pdsEndpoint) => {
			if (!cancelled) {
				setBlobUrl(getBlobUrl(pdsEndpoint, did, cid))
			}
		})

		return () => {
			cancelled = true
		}
	}, [uri, blobRef])

	return blobUrl
}
