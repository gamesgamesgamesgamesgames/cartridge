'use client'

import { type ReactNode, useCallback, useState } from 'react'
import { Check, Copy } from 'lucide-react'

type Props = Readonly<{
	label: ReactNode
	value: string
	monospace?: boolean
}>

export function CopyableValue(props: Props) {
	const { label, value, monospace } = props
	const [copied, setCopied] = useState(false)

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(value).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}, [value])

	return (
		<button
			type={'button'}
			className={'group flex w-full cursor-pointer items-start justify-between gap-2 rounded-md px-1.5 py-1 -mx-1.5 transition-colors hover:bg-accent'}
			onClick={handleCopy}>
			<span className={'text-muted-foreground shrink-0'}>{label}</span>
			<span className={'flex items-center gap-1.5 min-w-0'}>
				<span className={`truncate text-right group-hover:text-primary transition-colors ${monospace ? 'font-mono text-xs' : ''}`}>
					{value}
				</span>
				{copied ? (
					<Check className={'size-3 shrink-0 text-green-500'} />
				) : (
					<Copy className={'size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'} />
				)}
			</span>
		</button>
	)
}
