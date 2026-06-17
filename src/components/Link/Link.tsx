// Module imports
import { type ComponentProps } from 'react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { twMerge } from 'tailwind-merge'

// Types
type Props = Readonly<ComponentProps<'a'> & NextLinkProps & {}>

export function Link(props: Props) {
	const { children, className } = props

	return (
		<NextLink
			{...props}
			className={twMerge(
				'no-underline text-primary hover:underline',
				className,
			)}>
			{children}
		</NextLink>
	)
}
