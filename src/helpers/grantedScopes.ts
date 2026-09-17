/**
 * Reading the scopes a session was actually granted.
 *
 * Separate from `oauthScopes.ts`, which builds what we *ask* for: this is about
 * interpreting what came back, and the two have different failure modes. Kept
 * out of `oauth.ts` so it can be tested without the browser OAuth client.
 *
 * ## Why this is more than a `Set.has()`
 *
 * `HappyViewSession.scopes` is **typed `string[]` but is a space-delimited
 * string at runtime** — the OAuth client assigns `tokens.scope` straight
 * through, and `scope` is a single string per RFC 6749. TypeScript can't catch
 * it, and iterating a string yields characters, so a naive `for (const scope of
 * scopes)` builds a set of single letters and every check fails. That is what
 * made the "Update permissions" banner show for everyone.
 *
 * Granted repo scopes also arrive in several shapes, and an absent `action`
 * means *all* actions rather than none:
 *
 * - `repo:com.example.thing` — every action
 * - `repo:com.example.thing?action=create` — just that one
 * - `repo:com.example.thing?action=create&action=update` — repeated keys
 * - `repo?collection=a&collection=b&action=create` — the older bundled form
 * - `repo:*` — every collection
 */

/** The actions a repo permission can grant. */
export type RepoAction = 'create' | 'update' | 'delete'

const ALL_ACTIONS: readonly RepoAction[] = ['create', 'update', 'delete']

/** A collection's granted actions. `'*'` is the any-collection wildcard. */
type RepoGrants = Map<string, Set<RepoAction>>

/**
 * Coerce whatever the session hands us into a list of scope strings.
 *
 * Accepts the space-delimited string the token really contains as well as the
 * array the types promise, so a library fix later doesn't break this.
 */
export function toScopeList(
	scopes: string | readonly string[] | null | undefined,
): string[] {
	if (!scopes) {
		return []
	}

	const list = typeof scopes === 'string' ? scopes.split(/\s+/) : scopes

	return list.map((scope) => scope.trim()).filter(Boolean)
}

/** Split `name?a=1&a=2` into its name and parameters. */
function splitScope(scope: string): {
	head: string
	params: URLSearchParams
} {
	const index = scope.indexOf('?')

	if (index === -1) {
		return { head: scope, params: new URLSearchParams() }
	}

	return {
		head: scope.slice(0, index),
		params: new URLSearchParams(scope.slice(index + 1)),
	}
}

function parseActions(params: URLSearchParams): Set<RepoAction> {
	const actions = params
		.getAll('action')
		.flatMap((value) => value.split(','))
		.map((value) => value.trim())
		.filter((value): value is RepoAction =>
			(ALL_ACTIONS as readonly string[]).includes(value),
		)

	// No action parameter means the permission is unrestricted, not empty.
	return new Set(actions.length > 0 ? actions : ALL_ACTIONS)
}

/** Index every granted repo permission by collection. */
function repoGrants(scopes: readonly string[]): RepoGrants {
	const grants: RepoGrants = new Map()

	const add = (collection: string, actions: Set<RepoAction>) => {
		const existing = grants.get(collection)

		if (existing) {
			for (const action of actions) {
				existing.add(action)
			}
		} else {
			grants.set(collection, new Set(actions))
		}
	}

	for (const scope of scopes) {
		const { head, params } = splitScope(scope)

		if (head === 'repo') {
			// Bundled form: collections listed as parameters.
			const actions = parseActions(params)
			for (const collection of params.getAll('collection')) {
				add(collection, actions)
			}
			continue
		}

		if (head.startsWith('repo:')) {
			add(head.slice('repo:'.length), parseActions(params))
		}
	}

	return grants
}

/**
 * Whether the granted scopes cover a required `repo:<collection>?action=<a>`.
 *
 * A required scope with no action is satisfied by any grant on that collection.
 */
function coversRepoScope(grants: RepoGrants, required: string): boolean {
	const { head, params } = splitScope(required)
	const collection = head.startsWith('repo:')
		? head.slice('repo:'.length)
		: null

	if (!collection) {
		return false
	}

	const granted = grants.get(collection) ?? grants.get('*')

	if (!granted) {
		return false
	}

	const needed = params.getAll('action')

	return needed.every((action) => granted.has(action as RepoAction))
}

/**
 * The required scopes a session is missing.
 *
 * Non-`repo:` requirements fall back to an exact string match, which is all
 * they have ever needed.
 */
export function missingScopes(
	granted: string | readonly string[] | null | undefined,
	required: readonly string[],
): string[] {
	const list = toScopeList(granted)
	const grants = repoGrants(list)
	const exact = new Set(list)

	return required.filter((scope) => {
		if (scope.startsWith('repo:') || scope === 'repo' || scope.startsWith('repo?')) {
			return !coversRepoScope(grants, scope)
		}

		return !exact.has(scope)
	})
}

/** Whether every required scope is covered by what was granted. */
export function coversScopes(
	granted: string | readonly string[] | null | undefined,
	required: readonly string[],
): boolean {
	return missingScopes(granted, required).length === 0
}
