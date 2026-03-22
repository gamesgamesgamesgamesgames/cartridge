export type ExternalProvider = {
	id: string
	name: string
	icon_url: string | null
	auth_type: string
	config_schema?: Record<string, unknown>
}

export type LinkedAccount = {
	plugin_id: string
	account_id: string
	created_at: string
	updated_at: string
}

export type AuthorizeResponse = {
	authorize_url: string
	state: string
}

export type SyncResponse = {
	status: string
	processed: number
	written: number
}

export type UnlinkResponse = {
	status: string
	was_linked: boolean
}
