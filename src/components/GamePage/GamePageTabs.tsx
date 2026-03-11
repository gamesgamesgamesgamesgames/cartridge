'use client'

// Module imports
import { type ReactNode, startTransition, useState, ViewTransition } from 'react'

// Local imports
import { GamePageSubnav, type SubnavConfig } from './GamePageSubnav'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Constants
const TAB_ORDER = ['about', 'media', 'reviews'] as const

// Types
type TabValue = (typeof TAB_ORDER)[number]
type Props = Readonly<{
	aboutContent: ReactNode
	mediaContent: ReactNode
	reviewsContent: ReactNode
	subnavConfig: SubnavConfig
}>

export function GamePageTabs(props: Props) {
	const { aboutContent, mediaContent, reviewsContent, subnavConfig } = props

	const [activeTab, setActiveTab] = useState<TabValue>('about')
	const [direction, setDirection] = useState<'left' | 'right'>('right')

	const contentMap: Record<TabValue, ReactNode> = {
		about: aboutContent,
		media: mediaContent,
		reviews: reviewsContent,
	}

	const handleTabChange = (newTab: string) => {
		const oldIdx = TAB_ORDER.indexOf(activeTab)
		const newIdx = TAB_ORDER.indexOf(newTab as TabValue)

		startTransition(() => {
			setDirection(newIdx > oldIdx ? 'left' : 'right')
			setActiveTab(newTab as TabValue)
		})
	}

	return (
		<Tabs
			value={activeTab}
			onValueChange={handleTabChange}>
			<TabsList>
				<TabsTrigger value={'about'}>{'About'}</TabsTrigger>
				<TabsTrigger value={'media'}>{'Media'}</TabsTrigger>
				<TabsTrigger value={'reviews'}>{'Reviews'}</TabsTrigger>
			</TabsList>

			<div className={'flex gap-20'}>
				<div className={'sticky top-20 self-start'}>
					<GamePageSubnav
						basePath={''}
						subnavConfig={subnavConfig}
					/>
				</div>

				<ViewTransition
					name={'game-tab-content'}
					update={direction === 'left' ? 'game-tab-slide-left' : 'game-tab-slide-right'}>
					<div className={'grid flex-1'}>
						{TAB_ORDER.map((tab) => (
							<div
								key={tab}
								className={`col-start-1 row-start-1 flex flex-col gap-10 pt-4${activeTab !== tab ? ' invisible' : ''}`}>
								{contentMap[tab]}
							</div>
						))}
					</div>
				</ViewTransition>
			</div>
		</Tabs>
	)
}
