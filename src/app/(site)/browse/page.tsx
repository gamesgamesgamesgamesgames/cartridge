// Local imports
import { BrowseFeedSections } from '@/components/BrowsePage/BrowseFeedSections'

export const metadata = {
	title: 'Browse Games',
}

export default function BrowsePage() {
	return (
		<div className={'flex flex-col gap-12 py-8'}>
			<BrowseFeedSections />
		</div>
	)
}
