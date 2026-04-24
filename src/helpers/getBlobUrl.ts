export function getBlobUrl(
	_pdsEndpoint: string,
	did: string,
	cid: string,
): string {
	// return `${pdsEndpoint}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`
	return `https://cdn.blueat.net/img/feed_fullsize/plain/${did}/${cid}@jpeg`
}
