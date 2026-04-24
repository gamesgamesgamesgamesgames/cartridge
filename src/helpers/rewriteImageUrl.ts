export function rewriteImageUrl(url: string | undefined): string | undefined {
	if (!url) return url
	return url.replace('https://cdn.bsky.app/', 'https://cdn.blueat.net/')
}
