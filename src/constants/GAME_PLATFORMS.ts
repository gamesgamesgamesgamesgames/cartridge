export type GamePlatform = {
	id: string
	label: string
}

export const GAME_PLATFORMS: GamePlatform[] = [
	{ id: 'pc', label: 'PC' },
	{ id: 'mac', label: 'Mac' },
	{ id: 'linux', label: 'Linux' },
	{ id: 'ps5', label: 'PlayStation 5' },
	{ id: 'ps4', label: 'PlayStation 4' },
	{ id: 'xboxSeriesXS', label: 'Xbox Series X|S' },
	{ id: 'xboxOne', label: 'Xbox One' },
	{ id: 'nintendoSwitch2', label: 'Nintendo Switch 2' },
	{ id: 'nintendoSwitch', label: 'Nintendo Switch' },
	{ id: 'steamDeck', label: 'Steam Deck' },
	{ id: 'ios', label: 'iOS' },
	{ id: 'android', label: 'Android' },
	{ id: 'web', label: 'Web Browser' },
	{ id: 'ps3', label: 'PlayStation 3' },
	{ id: 'xbox360', label: 'Xbox 360' },
	{ id: 'wiiU', label: 'Wii U' },
	{ id: 'nintendo3ds', label: 'Nintendo 3DS' },
	{ id: 'psVita', label: 'PlayStation Vita' },
	{ id: 'stadia', label: 'Stadia' },
	{ id: 'oculus', label: 'Meta Quest' },
	{ id: 'playstationVR2', label: 'PlayStation VR2' },
]
