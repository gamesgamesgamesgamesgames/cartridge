import type { Metadata } from 'next'

import { ClaimPage } from '@/components/ClaimPage/ClaimPage'

export const metadata: Metadata = {
	title: 'Claim Ownership',
	description: 'Claim ownership of your games or organization on Cartridge.',
}

export default function ClaimRoute() {
	return <ClaimPage />
}
