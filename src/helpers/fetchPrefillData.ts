import { PROFILE_SOURCES } from '@/constants/PROFILE_SOURCES'
import { type ProfileSourceData } from '@/typedefs/ProfileSourceData'

export async function fetchPrefillData(): Promise<ProfileSourceData> {
	const result: ProfileSourceData = {}

	for (const source of PROFILE_SOURCES) {
		const data = await source.fetch()
		if (!data) continue

		if (!result.displayName && data.displayName)
			result.displayName = data.displayName
		if (!result.description && data.description)
			result.description = data.description
		if (!result.avatarURL && data.avatarURL) result.avatarURL = data.avatarURL
		if (!result.avatarBlob && data.avatarBlob) result.avatarBlob = data.avatarBlob
	}

	return result
}
