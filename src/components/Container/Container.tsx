// Module imports
import { type ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

// Types
type Props = Readonly<ComponentProps<'div'>>

export function Container(props: Props) {
	const { children, className } = props

	return (
		<div
			className={twMerge(
				'flex flex-col grow items-center shrink-0',
				className,
			)}>
			<div className={'h-full max-w-6xl w-full'}>{children}</div>
		</div>
	)
}
