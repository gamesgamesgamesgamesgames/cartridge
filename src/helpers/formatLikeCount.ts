export function formatLikeCount(count: number): string {
	if (count >= 10_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`
	if (count >= 1_000) return count.toLocaleString()
	return String(count)
}
