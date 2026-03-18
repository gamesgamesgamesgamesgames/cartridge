'use client'

// Module imports
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'

// Types
type Tab = {
	id: string
	label: string
}

type Props = Readonly<{
	tabs: Tab[]
	value: string
	onValueChange: (value: string) => void
	children?: ReactNode
}>

export function UnderlineTabs(props: Props) {
	const { tabs, value, onValueChange, children } = props

	const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

	const tablistRef = useRef<HTMLDivElement>(null)
	const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

	const updateUnderline = useCallback(() => {
		const button = buttonRefs.current.get(value)
		const tablist = tablistRef.current

		if (!button || !tablist) {
			return
		}

		const tablistRect = tablist.getBoundingClientRect()
		const buttonRect = button.getBoundingClientRect()

		setUnderlineStyle({
			left: buttonRect.left - tablistRect.left + tablist.scrollLeft,
			width: buttonRect.width,
		})
	}, [value])

	// Update underline whenever value changes or on mount
	useEffect(() => {
		updateUnderline()
	}, [updateUnderline])

	// Recalculate underline on resize
	useEffect(() => {
		const observer = new ResizeObserver(() => {
			updateUnderline()
		})

		if (tablistRef.current) {
			observer.observe(tablistRef.current)
		}

		return () => {
			observer.disconnect()
		}
	}, [updateUnderline])

	// Auto-scroll active tab into view
	useEffect(() => {
		const button = buttonRefs.current.get(value)

		if (button) {
			button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
		}
	}, [value])

	return (
		<div>
			<div
				ref={tablistRef}
				role={'tablist'}
				className={'relative flex overflow-x-auto scrollbar-none border-b border-border'}>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						ref={(el) => {
							if (el) {
								buttonRefs.current.set(tab.id, el)
							} else {
								buttonRefs.current.delete(tab.id)
							}
						}}
						role={'tab'}
						type={'button'}
						id={`tab-${tab.id}`}
						aria-selected={value === tab.id}
						tabIndex={value === tab.id ? 0 : -1}
						className={`shrink-0 cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
							value === tab.id
								? 'text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
						onClick={() => onValueChange(tab.id)}>
						{tab.label}
					</button>
				))}

				<span
					className={'pointer-events-none absolute bottom-0 h-0.5 bg-primary transition-all duration-200 ease-in-out'}
					style={{
						left: underlineStyle.left,
						width: underlineStyle.width,
					}}
				/>
			</div>

			{children}
		</div>
	)
}
