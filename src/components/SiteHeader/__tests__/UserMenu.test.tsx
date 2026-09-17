// @vitest-environment happy-dom

// Module imports
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next-themes', () => ({
	useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}))

// The menu renders its signed-out branch unless the OAuth client reports a
// session, and there is no session in a test environment.
vi.mock('@/helpers/oauth', () => ({ isAuthenticated: () => true }))

vi.mock('@/store/actions/logout', () => ({ logout: vi.fn() }))

// Local imports
import { store } from '@/store/store'
import { UserMenu } from '@/components/SiteHeader/UserMenu'

type UserOverrides = {
	verifiedAccountType?: string
	roles?: string[]
}

function signIn(overrides: UserOverrides = {}) {
	store.set({
		user: {
			did: 'did:plc:abc',
			handle: 'birb.house',
			displayName: 'Birb House',
			roles: overrides.roles ?? [],
			verifiedAccountType: overrides.verifiedAccountType,
		},
	} as never)
}

/** The menu content is portalled and only mounts once the trigger is opened. */
async function openMenu() {
	const user = userEvent.setup()
	await user.click(screen.getByRole('button'))
	return user
}

beforeEach(() => {
	signIn()
})

afterEach(() => {
	store.set({ user: null } as never)
})

describe('UserMenu — Studio link', () => {
	it('is hidden for an unverified account', async () => {
		render(<UserMenu />)
		await openMenu()

		expect(
			screen.queryByRole('menuitem', { name: 'Studio' }),
		).not.toBeInTheDocument()
	})

	it.each(['studio', 'developer', 'publisher', 'game'])(
		'is shown for a verified %s account',
		async (accountType) => {
			signIn({ verifiedAccountType: accountType })
			render(<UserMenu />)
			await openMenu()

			expect(
				screen.getByRole('menuitem', { name: 'Studio' }),
			).toBeInTheDocument()
		},
	)

	it('points at the studio route', async () => {
		signIn({ verifiedAccountType: 'developer' })
		render(<UserMenu />)
		await openMenu()

		expect(screen.getByRole('menuitem', { name: 'Studio' })).toHaveAttribute(
			'href',
			'/studio',
		)
	})

	it('does not replace the profile link', async () => {
		// Studio is the private half; the public profile stays reachable.
		signIn({ verifiedAccountType: 'developer' })
		render(<UserMenu />)
		await openMenu()

		expect(
			screen.getByRole('menuitem', { name: 'View Profile' }),
		).toHaveAttribute('href', '/profile/birb.house')
	})

	it('is independent of admin access', async () => {
		// An unverified admin gets the review queues but has no studio to manage.
		signIn({ roles: ['admin'] })
		render(<UserMenu />)
		await openMenu()

		expect(screen.getByRole('menuitem', { name: 'Admin' })).toBeInTheDocument()
		expect(
			screen.queryByRole('menuitem', { name: 'Studio' }),
		).not.toBeInTheDocument()
	})
})
