// Module imports
import { Suspense } from 'react'

// Local imports
import { LoginPage } from '@/components/LoginPage/LoginPage'

export default function Page() {
	return (
		<Suspense>
			<LoginPage />
		</Suspense>
	)
}
