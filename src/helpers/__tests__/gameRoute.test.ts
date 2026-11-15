import { describe, expect, test } from 'vitest'

import { CATALOGUE_DID, encodeGameParam, gameHref, gameParamFromUri, gameUriFromParam, isRecordKey } from '@/helpers/gameRoute'

const G = 'games.gamesgamesgamesgames.game'

describe('isRecordKey', () => {
	test('accepts atproto TIDs and rejects slugs', () => {
		expect(isRecordKey('3moaektlwki2x')).toBe(true)
		expect(isRecordKey('dark-souls')).toBe(false)
		expect(isRecordKey('3moaektlwki2')).toBe(false)
		expect(isRecordKey('zmoaektlwki2x')).toBe(false)
	})
})

describe('gameUriFromParam', () => {
	test('a record key names a catalogue game', () => {
		expect(gameUriFromParam('3moaektlwki2x')).toBe(`at://${CATALOGUE_DID}/${G}/3moaektlwki2x`)
	})

	test('an encoded game URI names that game', () => {
		const uri = `at://did:plc:abc/${G}/3moaektlwki2x`
		expect(gameUriFromParam(encodeURIComponent(uri))).toBe(uri)
		expect(gameUriFromParam(uri)).toBe(uri)
	})

	test('a slug, or a URI of something else, names nothing', () => {
		expect(gameUriFromParam('dark-souls')).toBeUndefined()
		expect(gameUriFromParam(encodeURIComponent('at://did:plc:abc/app.bsky.feed.post/3moaektlwki2x'))).toBeUndefined()
		expect(gameUriFromParam('%E0%A4%A')).toBeUndefined()
	})
})

describe('gameHref', () => {
	test('encodes the slug', () => {
		expect(gameHref({ slug: 'café & co' })).toBe(`/game/${encodeURIComponent('café & co')}`)
	})

	test('prefers the slug', () => {
		expect(gameHref({ slug: 'dark-souls', uri: `at://${CATALOGUE_DID}/${G}/3moaektlwki2x` })).toBe('/game/dark-souls')
	})

	test('a catalogue game without a slug links by record key', () => {
		expect(gameHref({ uri: `at://${CATALOGUE_DID}/${G}/3moaektlwki2x` })).toBe('/game/3moaektlwki2x')
	})

	test('a game from another repo without a slug links by its encoded URI', () => {
		const uri = `at://did:plc:abc/${G}/3moaektlwki2x`
		expect(gameHref({ uri })).toBe(`/game/${encodeURIComponent(uri)}`)
	})

	test('no slug and no game URI means no link', () => {
		expect(gameHref({})).toBeUndefined()
		expect(gameHref(undefined)).toBeUndefined()
		expect(gameHref({ uri: 'not a uri' })).toBeUndefined()
	})
})

describe('gameParamFromUri / encodeGameParam', () => {
	test('round-trip a record URL parameter safely', () => {
		const uri = `at://did:plc:abc/${G}/3moaektlwki2x`
		expect(encodeGameParam(uri)).toBe(encodeURIComponent(uri))
		expect(encodeGameParam(encodeURIComponent(uri))).toBe(encodeURIComponent(uri))
		expect(encodeGameParam('dark-souls')).toBe('dark-souls')
		expect(gameParamFromUri(`at://${CATALOGUE_DID}/${G}/3moaektlwki2x`)).toBe('3moaektlwki2x')
	})
})
