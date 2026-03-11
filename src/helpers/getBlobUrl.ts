export function getBlobUrl(pdsEndpoint: string, did: string, cid: string): string {
	return `${pdsEndpoint}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`
}
