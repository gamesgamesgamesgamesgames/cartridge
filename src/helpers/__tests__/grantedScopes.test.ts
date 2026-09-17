import { describe, expect, it } from 'vitest'

import { coversScopes, missingScopes, toScopeList } from '@/helpers/grantedScopes'
import { REQUIRED_SCOPES, STUDIO_SCOPES } from '@/constants/REQUIRED_SCOPES'

describe('toScopeList', () => {
	it('splits the space-delimited string the token actually carries', () => {
		// `HappyViewSession.scopes` is typed string[] but holds `tokens.scope`,
		// which RFC 6749 defines as a space-delimited string.
		expect(toScopeList('atproto repo:com.example.thing')).toEqual([
			'atproto',
			'repo:com.example.thing',
		])
	})

	it('passes an array through', () => {
		expect(toScopeList(['atproto', 'repo:a'])).toEqual(['atproto', 'repo:a'])
	})

	it('never yields single characters', () => {
		// The bug this replaces: iterating the string produced one entry per
		// character, so every scope check failed.
		expect(toScopeList('atproto')).toEqual(['atproto'])
	})

	it('tolerates padding and repeated whitespace', () => {
		expect(toScopeList('  atproto   repo:a  ')).toEqual(['atproto', 'repo:a'])
	})

	it('treats empty input as no scopes', () => {
		expect(toScopeList('')).toEqual([])
		expect(toScopeList(null)).toEqual([])
		expect(toScopeList(undefined)).toEqual([])
	})
})

describe('missingScopes — repo actions', () => {
	const REQUIRED = ['repo:com.example.thing?action=create']

	it('accepts a grant with no action, which means every action', () => {
		expect(missingScopes('repo:com.example.thing', REQUIRED)).toEqual([])
	})

	it('accepts a grant naming the required action', () => {
		expect(
			missingScopes('repo:com.example.thing?action=create', REQUIRED),
		).toEqual([])
	})

	it('accepts repeated action parameters', () => {
		expect(
			missingScopes(
				'repo:com.example.thing?action=create&action=update',
				REQUIRED,
			),
		).toEqual([])
	})

	it('rejects a grant for a different action only', () => {
		expect(
			missingScopes('repo:com.example.thing?action=delete', REQUIRED),
		).toEqual(REQUIRED)
	})

	it('rejects a grant for a different collection', () => {
		expect(missingScopes('repo:com.example.other', REQUIRED)).toEqual(REQUIRED)
	})

	it('accepts the bundled repo?collection= form', () => {
		expect(
			missingScopes(
				'repo?collection=com.example.thing&collection=com.example.other&action=create',
				REQUIRED,
			),
		).toEqual([])
	})

	it('accepts a collection wildcard', () => {
		expect(missingScopes('repo:*', REQUIRED)).toEqual([])
	})

	it('merges actions granted across separate scopes', () => {
		expect(
			missingScopes(
				'repo:com.example.thing?action=delete repo:com.example.thing?action=create',
				REQUIRED,
			),
		).toEqual([])
	})
})

describe('missingScopes — non-repo scopes', () => {
	it('matches exactly', () => {
		expect(missingScopes('atproto blob:*/*', ['blob:*/*'])).toEqual([])
		expect(missingScopes('atproto', ['blob:*/*'])).toEqual(['blob:*/*'])
	})

	it('is not confused by an rpc scope carrying an aud', () => {
		const granted =
			'atproto rpc:games.gamesgamesgamesgames.createList?aud=did:web:example.com%23g5_appview repo:games.gamesgamesgamesgames.feed.list'

		expect(missingScopes(granted, ['repo:games.gamesgamesgamesgames.feed.list?action=create'])).toEqual([])
	})
})

describe('the reported failure', () => {
	// What the session actually returns after login: one space-delimited string
	// of expanded permissions. Previously this reported both scopes missing.
	const GRANTED = [
		'atproto',
		'repo:games.gamesgamesgamesgames.collection',
		'repo:games.gamesgamesgamesgames.feed.list',
		'repo:games.gamesgamesgamesgames.feed.listItem',
		'repo:games.gamesgamesgamesgames.graph.like',
		'rpc:games.gamesgamesgamesgames.createList?aud=did:web:gamesgamesgamesgames.games%23g5_appview',
		'rpc:games.gamesgamesgamesgames.getUserLists?aud=did:web:gamesgamesgamesgames.games%23g5_appview',
	].join(' ')

	it('no longer reports the list scopes as missing', () => {
		expect(missingScopes(GRANTED, REQUIRED_SCOPES)).toEqual([])
		expect(coversScopes(GRANTED, REQUIRED_SCOPES)).toBe(true)
	})

	it('still reports them when they genuinely are not granted', () => {
		expect(missingScopes('atproto', REQUIRED_SCOPES)).toEqual([
			...REQUIRED_SCOPES,
		])
	})

	it('recognises the studio scopes from a granted string', () => {
		const studio = `${GRANTED} repo:games.gamesgamesgamesgames.game repo:games.gamesgamesgamesgames.org.profile`

		expect(coversScopes(studio, STUDIO_SCOPES)).toBe(true)
		expect(coversScopes(GRANTED, STUDIO_SCOPES)).toBe(false)
	})
})
