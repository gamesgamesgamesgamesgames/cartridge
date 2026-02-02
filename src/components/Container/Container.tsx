// Module imports
import { type ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

// Local imports
import { Scroller } from '@/components/ui/scroller'

// Types
type Props = Readonly<
	ComponentProps<'div'> & {
		isScrollable?: boolean
	}
>

export function Container(props: Props) {
	const { children, className, isScrollable = true } = props

	if (isScrollable) {
		return (
			<Scroller
				className={twMerge(
					'flex flex-col grow items-center overflow-auto p-4',
					className,
				)}>
				<div className={'max-w-6xl size-full'}>{children}</div>
			</Scroller>
		)
	}

	return (
		<div
			className={twMerge(
				'flex flex-col grow items-center overflow-auto p-4',
				className,
			)}>
			<div className={'max-w-6xl size-full'}>{children}</div>
		</div>
	)
}
