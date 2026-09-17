// @vitest-environment happy-dom

// Module imports
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Local imports
import { isNavItemActive, StudioNav } from '@/components/StudioShell/StudioNav'
import { store } from '@/store/store'

const mockPathname = vi.fn(() => '/studio')

vi.mock('next/navigation', () => ({
	usePathname: () => mockPathname(),
}))

function renderAt(pathname: string, roles: string[] = []) {
	mockPathname.mockReturnValue(pathname)
	store.set({ user: { did: 'did:plc:abc', handle: 'studio.test', roles } } as never)

	return render(<StudioNav />)
}

afterEach(() => {
	store.set({ user: null } as never)
})

describe('isNavItemActive', () => {
	it('matches an exact route only when it is exactly that route', () => {
		expect(isNavItemActive('/studio', '/studio', true)).toBe(true)
		expect(isNavItemActive('/studio/catalog', '/studio', true)).toBe(false)
	})

	it('matches a section and everything nested inside it', () => {
		expect(isNavItemActive('/studio/catalog', '/studio/catalog', false)).toBe(true)
		expect(
			isNavItemActive('/studio/catalog/did:plc:x/abc', '/studio/catalog', false),
		).toBe(true)
	})

	it('does not match a sibling route that merely shares a prefix', () => {
		// '/studio/claims' must not light up '/studio/claim'.
		expect(isNavItemActive('/studio/claims', '/studio/claim', false)).toBe(false)
	})
})

describe('StudioNav', () => {
	it('marks only the current section as the current page', () => {
		renderAt('/studio/catalog')

		expect(screen.getByRole('link', { name: 'Catalog' })).toHaveAttribute(
			'aria-current',
			'page',
		)
		expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
			'aria-current',
		)
	})

	it('keeps Overview inactive on a nested studio route', () => {
		renderAt('/studio/analytics/some-game')

		expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
			'aria-current',
		)
		expect(screen.getByRole('link', { name: 'Analytics' })).toHaveAttribute(
			'aria-current',
			'page',
		)
	})

	it('names the navigation landmark', () => {
		renderAt('/studio')

		expect(screen.getByRole('navigation', { name: 'Studio' })).toBeInTheDocument()
	})

	it('hides the review queues from a non-admin', () => {
		renderAt('/studio')

		expect(screen.queryByRole('button', { name: /admin/i })).not.toBeInTheDocument()
	})

	it('offers the review queues to an admin', () => {
		renderAt('/studio', ['admin'])

		expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument()
	})

	it('deactivates every studio section while inside the admin queues', () => {
		renderAt('/admin/claims', ['admin'])

		for (const label of ['Overview', 'Catalog', 'Analytics', 'Claims', 'Contributions']) {
			expect(screen.getByRole('link', { name: label })).not.toHaveAttribute(
				'aria-current',
			)
		}
	})
})
