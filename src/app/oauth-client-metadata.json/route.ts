const PUBLIC_URL = process.env.NEXT_PUBLIC_URL!

export function GET() {
	const protocol = /^(?:localhost|127\.0\.0\.1)/giu.test(PUBLIC_URL)
		? 'http'
		: 'https'
	const uri = `${protocol}://${PUBLIC_URL}`

	return Response.json({
		client_id: `${uri}/oauth-client-metadata.json`,
		client_name: 'Cartridge',
		client_uri: uri,
		redirect_uris: [`${uri}/oauth/callback`],
		token_endpoint_auth_method: 'none',
		grant_types: ['authorization_code', 'refresh_token'],
		scope: 'atproto include:games.gamesgamesgamesgames.authBasic',
		application_type: 'web',
		dpop_bound_access_tokens: true,
	})
}
