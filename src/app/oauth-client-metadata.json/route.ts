// Local imports
import { baseScopes, studioScopes } from '@/helpers/oauthScopes'

export function GET() {
	const publicUrl = process.env.NEXT_PUBLIC_URL!
	const instanceUrl = process.env.NEXT_PUBLIC_HAPPYVIEW_URL!

	const protocol = /^(?:localhost|127\.0\.0\.1)/giu.test(publicUrl)
		? 'http'
		: 'https'
	const uri = `${protocol}://${publicUrl}`

	return Response.json({
		client_id: `${uri}/oauth-client-metadata.json`,
		client_name: 'Cartridge',
		client_uri: uri,
		redirect_uris: [`${uri}/oauth/callback`],
		token_endpoint_auth_method: 'none',
		grant_types: ['authorization_code', 'refresh_token'],
		scope: [...baseScopes(instanceUrl), ...studioScopes(instanceUrl)].join(' '),
		application_type: 'web',
		dpop_bound_access_tokens: true,
	})
}
