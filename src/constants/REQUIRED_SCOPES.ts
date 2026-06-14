export const REQUIRED_SCOPES = [
	// authGameInteractions — list permissions
	'repo:games.gamesgamesgamesgames.feed.list?action=create',
	'repo:games.gamesgamesgamesgames.feed.listItem?action=create',
]

export const STUDIO_SCOPES = [
	// authStudioCatalog — verified users need these for claims and game management
	'repo:games.gamesgamesgamesgames.claim',
	'repo:games.gamesgamesgamesgames.game',
	// authStudioOrgs — verified users need these for org management
	'repo:games.gamesgamesgamesgames.org.profile',
]
