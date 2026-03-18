// Module imports
import { type IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
	faBluesky,
	faDiscord,
	faFacebook,
	faInstagram,
	faItchIo,
	faReddit,
	faSteam,
	faTwitch,
	faXTwitter,
	faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import { faGlobe, faLink } from '@fortawesome/free-solid-svg-icons'

// Types
export type WebsiteTypeConfig = {
	label: string
	value: string
	icon: IconDefinition
	/** URL template — `{value}` is replaced with the user input */
	urlTemplate?: string
	/** Regex to extract the username/handle from a full URL */
	urlPattern?: RegExp
	/** Placeholder shown in the input */
	placeholder: string
}

// Constants
export const WEBSITE_TYPES: WebsiteTypeConfig[] = [
	{
		label: 'Personal',
		value: 'official',
		icon: faGlobe,
		placeholder: 'https://example.com',
	},
	{
		label: 'Bluesky',
		value: 'bluesky',
		icon: faBluesky,
		urlTemplate: 'https://bsky.app/profile/{value}',
		urlPattern: /(?:https?:\/\/)?bsky\.app\/profile\/(@?[\w.-]+)/,
		placeholder: '@example.cartridge.dev',
	},
	{
		label: 'Discord',
		value: 'discord',
		icon: faDiscord,
		urlTemplate: 'https://discord.gg/{value}',
		urlPattern: /(?:https?:\/\/)?(?:www\.)?discord\.(?:gg|com\/invite)\/([\w-]+)/,
		placeholder: 'invite-code',
	},
	{
		label: 'Facebook',
		value: 'facebook',
		icon: faFacebook,
		urlTemplate: 'https://facebook.com/{value}',
		urlPattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([\w.]+)/,
		placeholder: 'username',
	},
	{
		label: 'Instagram',
		value: 'instagram',
		icon: faInstagram,
		urlTemplate: 'https://instagram.com/{value}',
		urlPattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([\w.]+)/,
		placeholder: 'username',
	},
	{
		label: 'Itch.io',
		value: 'itch',
		icon: faItchIo,
		urlTemplate: 'https://{value}.itch.io',
		urlPattern: /(?:https?:\/\/)?([\w-]+)\.itch\.io/,
		placeholder: 'username',
	},
	{
		label: 'Reddit',
		value: 'reddit',
		icon: faReddit,
		urlTemplate: 'https://reddit.com/u/{value}',
		urlPattern: /(?:https?:\/\/)?(?:www\.)?reddit\.com\/u(?:ser)?\/([\w-]+)/,
		placeholder: 'username',
	},
	{
		label: 'Steam',
		value: 'steam',
		icon: faSteam,
		urlTemplate: 'https://steamcommunity.com/id/{value}',
		urlPattern: /(?:https?:\/\/)?steamcommunity\.com\/id\/([\w-]+)/,
		placeholder: 'username',
	},
	{
		label: 'Twitch',
		value: 'twitch',
		icon: faTwitch,
		urlTemplate: 'https://twitch.tv/{value}',
		urlPattern: /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([\w_]+)/,
		placeholder: 'username',
	},
	{
		label: 'Twitter',
		value: 'twitter',
		icon: faXTwitter,
		urlTemplate: 'https://x.com/{value}',
		urlPattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/@?([\w_]+)/,
		placeholder: '@username',
	},
	{
		label: 'YouTube',
		value: 'youtube',
		icon: faYoutube,
		urlTemplate: 'https://youtube.com/@{value}',
		urlPattern: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@?([\w-]+)/,
		placeholder: '@channel',
	},
	{
		label: 'Other',
		value: 'other',
		icon: faLink,
		placeholder: 'https://example.com',
	},
]

export const WEBSITE_TYPE_MAP = new Map(WEBSITE_TYPES.map((wt) => [wt.value, wt]))

/**
 * Try to detect the website type from a pasted URL.
 * Returns the type config and extracted username, or null.
 */
export function detectFromUrl(url: string): { type: WebsiteTypeConfig; username: string } | null {
	for (const wt of WEBSITE_TYPES) {
		if (!wt.urlPattern) continue
		const match = url.match(wt.urlPattern)
		if (match?.[1]) {
			return { type: wt, username: match[1] }
		}
	}
	return null
}

/**
 * Given a stored full URL and a type config, extract the display value.
 * Falls back to the full URL if extraction fails.
 */
export function extractDisplayValue(url: string, typeConfig: WebsiteTypeConfig | undefined): string {
	if (!typeConfig?.urlPattern) return url
	const match = url.match(typeConfig.urlPattern)
	return match?.[1] ?? url
}

/**
 * Build a full URL from a display value and type config.
 */
export function buildFullUrl(displayValue: string, typeConfig: WebsiteTypeConfig | undefined): string {
	if (!typeConfig?.urlTemplate) return displayValue
	// Strip leading @ for types where users might type it
	const cleaned = displayValue.replace(/^@/, '')
	return typeConfig.urlTemplate.replace('{value}', cleaned)
}
