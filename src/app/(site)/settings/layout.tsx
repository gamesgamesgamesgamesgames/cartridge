'use client'

// Module imports
import { useRouter } from 'next/navigation'
import { type PropsWithChildren, useEffect, useState } from 'react'

// Local imports
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { SettingsNav } from '@/components/SettingsPage/SettingsNav'
import { isAuthenticated } from '@/helpers/oauth'

type Props = Readonly<PropsWithChildren>

export default function SettingsLayout(props: Props) {
	const { children } = props
	const router = useRouter()
	const [isAuthed, setIsAuthed] = useState(false)

	useEffect(() => {
		if (!isAuthenticated()) {
			router.replace('/login?returnUrl=/settings/profile')
			return
		}
		setIsAuthed(true)
	}, [router])

	if (!isAuthed) return null

	return (
		<Container>
			<Header
				className={'mb-4'}
				level={2}>
				{'Settings'}
			</Header>

			<SettingsNav />

			<div className={'py-8'}>
				{children}
			</div>
		</Container>
	)
}
