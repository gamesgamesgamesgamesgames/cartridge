import { describe, expect, it } from 'vitest'

import { legacyPathTarget } from '@/middleware'

describe('legacyPathTarget', () => {
	it('sends the dashboard root to the studio', () => {
		expect(legacyPathTarget('/dashboard')).toBe('/studio')
	})

	it.each([
		['/dashboard/catalog', '/studio/catalog'],
		['/dashboard/analytics', '/studio/analytics'],
		['/dashboard/contributions', '/studio/contributions'],
	])('moves %s to %s', (from, to) => {
		expect(legacyPathTarget(from)).toBe(to)
	})

	it('preserves arbitrary depth', () => {
		expect(legacyPathTarget('/dashboard/catalog/did:plc:abc/3kxyz')).toBe(
			'/studio/catalog/did:plc:abc/3kxyz',
		)
	})

	describe('routes that left the dashboard entirely', () => {
		it('sends verification to the standalone verify route', () => {
			expect(legacyPathTarget('/dashboard/verification')).toBe('/verify')
		})

		it('sends the claim form to the standalone claim route', () => {
			expect(legacyPathTarget('/dashboard/claim')).toBe('/claim')
		})

		it('sends admin queues to the admin route, at any depth', () => {
			expect(legacyPathTarget('/dashboard/admin/claims')).toBe('/admin/claims')
			expect(
				legacyPathTarget('/dashboard/admin/claims/did:plc:abc/3kxyz'),
			).toBe('/admin/claims/did:plc:abc/3kxyz')
		})
	})

	describe('prefix collisions', () => {
		it('does not let /dashboard/claim swallow /dashboard/claims', () => {
			// The studio's claims list and the standalone claim form differ by one
			// character and go to completely different places.
			expect(legacyPathTarget('/dashboard/claims')).toBe('/studio/claims')
		})

		it('does not let /dashboard/claim swallow a nested claims path', () => {
			expect(legacyPathTarget('/dashboard/claims/detail')).toBe(
				'/studio/claims/detail',
			)
		})
	})

	describe('non-legacy paths', () => {
		it.each(['/studio', '/studio/catalog', '/admin/claims', '/claim', '/verify', '/'])(
			'leaves %s alone',
			(pathname) => {
				expect(legacyPathTarget(pathname)).toBeNull()
			},
		)
	})

	it('does not match a path that merely starts with the same characters', () => {
		expect(legacyPathTarget('/dashboards')).toBeNull()
	})
})
