'use client'

// Local imports
import { ProfileEditContextProvider } from '@/context/ProfileEditContext/ProfileEditContext'
import { ProfileEditForm } from '@/components/SettingsPage/ProfileEditForm'
import { ProfileEditFooter } from '@/components/SettingsPage/ProfileEditFooter'

export function ProfileEditPage() {
	return (
		<ProfileEditContextProvider>
			<div className={'flex flex-col gap-8'}>
				<ProfileEditForm />
				<ProfileEditFooter />
			</div>
		</ProfileEditContextProvider>
	)
}
