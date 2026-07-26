import { afterEach } from 'vitest'

// jest-dom matchers are harmless to register everywhere and only used by DOM
// tests. Testing Library cleanup only runs when a DOM is present, so node-env
// tests (the ingest collector, ClickHouse schema) aren't affected.
await import('@testing-library/jest-dom/vitest')

if (typeof document !== 'undefined') {
	const { cleanup } = await import('@testing-library/react')
	afterEach(() => {
		cleanup()
	})
}
