import { BrowseFeedSections } from '@/components/BrowsePage/BrowseFeedSections'

export const metadata = {
	title: 'Browse Games',
}

export default function BrowsePage() {
	return (
		<div className={'flex flex-col pb-8'}>
			<h1 className={'sr-only'}>{'Browse Games'}</h1>

			<BrowseFeedSections />
		</div>
	)
}
