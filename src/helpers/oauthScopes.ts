/**
 * OAuth scope construction.
 *
 * Kept apart from `oauth.ts` so it can be tested without pulling in the browser
 * OAuth client: a mistake here doesn't fail a request, it locks everyone out of
 * the app at the login step.
 */

/**
 * The service entry in HappyView's DID document that our RPC calls target.
 *
 * Every permission set we request declares `inheritAud: true`, which means its
 * `rpc` permissions take their audience from the `include:` that loaded them.
 * Per the AT Protocol permission spec: *"if `inheritAud` is true and no `aud`
 * is defined on the invoking `include:`, then the `rpc` permission is invalid
 * (and should be ignored)."*
 *
 * So a bare `include:` grants no RPC access at all — the sets expand to
 * nothing and login fails with "scope '<rpc scope>' is not allowed for this
 * client". Never drop the audience from these scopes.
 *
 * Changing this fragment invalidates every grant already issued to users, and
 * it must match a service entry registered on the HappyView instance.
 */
export const APPVIEW_FRAGMENT = 'g5_appview'

/** Permission sets every signed-in user needs. */
export const BASE_PERMISSION_SETS = [
	'games.gamesgamesgamesgames.authProfiles',
	'games.gamesgamesgamesgames.authGameInteractions',
	'games.gamesgamesgamesgames.authContributions',
	'games.gamesgamesgamesgames.authCustomFeeds',
	'games.gamesgamesgamesgames.authGameBrowsing',
	'dev.cartridge.authActor',
] as const

/** Additional sets granted to verified accounts for studio management. */
export const STUDIO_PERMISSION_SETS = [
	'games.gamesgamesgamesgames.authGamesCatalog',
	'games.gamesgamesgamesgames.authGamesOrg',
	'dev.cartridge.authClaims',
] as const

/**
 * HappyView's AppView as a DID service reference, ready to drop into a scope.
 *
 * Derived from the instance URL so that pointing the app at a local HappyView
 * doesn't silently keep addressing production. The `#` is percent-encoded
 * because the scope grammar requires it, and a port's `:` needs the same
 * treatment to stay a valid `did:web`.
 */
export function appviewAud(instanceUrl: string): string {
	const { host } = new URL(instanceUrl)
	return `did:web:${host.replace(':', '%3A')}%23${APPVIEW_FRAGMENT}`
}

/** Turn permission set NSIDs into `include:` scopes carrying the audience. */
export function includeScopes(
	permissionSets: readonly string[],
	instanceUrl: string,
): string[] {
	const aud = appviewAud(instanceUrl)
	return permissionSets.map((nsid) => `include:${nsid}?aud=${aud}`)
}

/** Scopes requested for every account. */
export function baseScopes(instanceUrl: string): string[] {
	return ['atproto', ...includeScopes(BASE_PERMISSION_SETS, instanceUrl)]
}

/** Extra scopes requested for verified accounts. */
export function studioScopes(instanceUrl: string): string[] {
	return [...includeScopes(STUDIO_PERMISSION_SETS, instanceUrl), 'blob:*/*']
}
