// Which HappyView API client a request identifies as.
//
// HappyView rate-limits per client key, in one bucket shared by everyone who
// sends that key. The browser has to use the public key (it's in the page),
// but server renders, route handlers and image generation don't: on the
// server, the app uses its own confidential client, so a crawl or a busy page
// can't drain the bucket the browsers depend on, and vice versa.
//
// Server-only settings, never prefixed NEXT_PUBLIC_ so they stay out of the
// browser bundle:
//   HAPPYVIEW_SERVER_CLIENT_KEY     the confidential client's key (hvc_...)
//   HAPPYVIEW_SERVER_CLIENT_SECRET  its secret
// When either is unset, the server falls back to the public key, as before.

export type ClientHeaders = { 'x-client-key': string; 'x-client-secret'?: string }

const isServer = () => typeof window === 'undefined'

export function happyviewClientHeaders(): ClientHeaders {
	const publicKey = process.env.NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY ?? ''
	if (!isServer()) {
		return { 'x-client-key': publicKey }
	}
	const key = process.env.HAPPYVIEW_SERVER_CLIENT_KEY
	const secret = process.env.HAPPYVIEW_SERVER_CLIENT_SECRET
	if (key && secret) {
		return { 'x-client-key': key, 'x-client-secret': secret }
	}
	return { 'x-client-key': publicKey }
}
