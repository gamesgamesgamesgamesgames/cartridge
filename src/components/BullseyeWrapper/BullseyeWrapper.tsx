// Module imports
import { type PropsWithChildren } from 'react'

// Types
type Props = Readonly<PropsWithChildren>

export function BullseyeWrapper(props: Props) {
	const { children } = props

	return (
		<div
			className={
				'flex min-h-svh w-full items-center justify-center p-6 md:p-10'
			}>
			<div className={'w-full max-w-sm'}>{children}</div>
		</div>
	)
}
