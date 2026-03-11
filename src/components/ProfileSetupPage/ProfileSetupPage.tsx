'use client'

// Local imports
import { ActorProfileStep } from '@/components/ProfileSetupPage/ActorProfileStep'
import { Container } from '@/components/Container/Container'
import { Footer } from '@/components/ProfileSetupPage/Footer'
import {
	ProfileSetupContextProvider,
} from '@/context/ProfileSetupContext/ProfileSetupContext'

export function ProfileSetupPage() {
	return (
		<ProfileSetupContextProvider>
			<div className={'border-b p-4'}>
				<h1 className={'text-xl font-semibold'}>{'Set Up Your Profile'}</h1>
			</div>

			<Container>
				<ActorProfileStep />
				<Footer />
			</Container>
		</ProfileSetupContextProvider>
	)
}
