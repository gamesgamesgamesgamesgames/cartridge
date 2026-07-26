/**
 * Data-viz palette for the owner analytics dashboard.
 *
 * The DESIGN.md brand accents (Amber / Coral / Hot Pink / Jade / Crimson) are
 * exposed globally as the `--chart-1..5` CSS custom properties in globals.css,
 * so both light and dark mode resolve from a single themed source. This module
 * maps those tokens onto stable, per-*entity* roles: color follows the entity,
 * never its rank, and the assignment never cycles.
 *
 * Colorblind note: the brand palette is deliberately warm-dominant, so several
 * pairs land in the CVD "floor" band (adjacent ΔE 6–8). That is only legal with
 * secondary encoding, so every chart here ships a legend AND direct labels AND
 * distinct tooltip keys — identity is never carried by hue alone. A table view
 * (the underlying rows) is always reachable too.
 */

/** Brand accent tokens, resolved from globals.css (light + dark). */
export const BRAND = {
	amber: 'var(--chart-1)',
	coral: 'var(--chart-2)',
	hotPink: 'var(--chart-3)',
	jade: 'var(--chart-4)',
	crimson: 'var(--chart-5)',
} as const

/**
 * Per-entity color assignment. Reused across every panel so a given dimension
 * (e.g. "feed") reads the same hue everywhere in the dashboard.
 */
export const SERIES_COLORS = {
	// Discovery surfaces / referrer sources.
	feed: BRAND.amber,
	search: BRAND.jade,
	direct: BRAND.coral,
	external: BRAND.hotPink,

	// Conversion record types. "likes" borrows Hot Pink to echo the brand's
	// liked-state color.
	likes: BRAND.hotPink,
	reviews: BRAND.amber,
	listAdds: BRAND.jade,

	// Default single-series / magnitude hue (Amber is the brand's signal color).
	primary: BRAND.amber,
} as const

/** Chart ink + surface tokens (shared with the app's design tokens). */
export const CHART_INK = {
	grid: 'var(--border)',
	axis: 'var(--muted-foreground)',
} as const
