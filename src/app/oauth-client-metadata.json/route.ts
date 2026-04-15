import { type NextRequest } from 'next/server'

const HAPPYVIEW_URL = process.env.NEXT_PUBLIC_HAPPYVIEW_URL!

export function GET(request: NextRequest) {
	const origin = request.nextUrl.origin

	return Response.json({
		client_id: `${origin}/oauth-client-metadata.json`,
		client_name: 'Cartridge',
		client_uri: origin,
		redirect_uris: [`${HAPPYVIEW_URL}/auth/callback`],
		token_endpoint_auth_method: 'none',
		grant_types: ['authorization_code', 'refresh_token'],
		scope: 'atproto include:games.gamesgamesgamesgames.authBasic',
		application_type: 'web',
		dpop_bound_access_tokens: true,
	})
}
