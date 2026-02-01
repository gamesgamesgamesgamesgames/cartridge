// Module imports
import { type ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

// Types
type DataListProps = Readonly<ComponentProps<'dl'>>
type DataListLabelProps = Readonly<ComponentProps<'dt'>>
type DataListValueProps = Readonly<ComponentProps<'dd'>>

export function DataList(props: DataListProps) {
	const { children, className } = props

	return (
		<dl
			{...props}
			className={twMerge('gap-4 grid grid-cols-[auto_1fr] text-sm', className)}>
			{children}
		</dl>
	)
}

export function DataListLabel(props: DataListLabelProps) {
	const { children, className } = props

	return (
		<dt
			{...props}
			className={twMerge('text-muted-foreground', className)}>
			{children}
		</dt>
	)
}

export function DataListValue(props: DataListValueProps) {
	const { children } = props

	return <dd {...props}>{children}</dd>
}
