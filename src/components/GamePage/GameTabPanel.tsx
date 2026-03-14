import { type PropsWithChildren } from 'react'

type GameTabPanelProps = PropsWithChildren<{
	tab: string
}>

export function GameTabPanel({ children, tab }: GameTabPanelProps) {
	return (
		<div
			className={'flex flex-col gap-8 pt-8'}
			data-tab={tab}>
			{children}
		</div>
	)
}
