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
	children: ReactNode
}>

export function GameTabs(props: Props) {
	const { tabs, children } = props

	const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? '')
	const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

	const tablistRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

	const updateUnderline = useCallback(() => {
		const button = buttonRefs.current.get(activeTab)
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
	}, [activeTab])

	// Toggle visibility of tab panels via data-tab attribute
	useEffect(() => {
		const container = contentRef.current
		if (!container) return

		const panels = container.querySelectorAll<HTMLElement>('[data-tab]')
		for (const panel of panels) {
			panel.style.display = panel.dataset.tab === activeTab ? '' : 'none'
		}
	}, [activeTab])

	// Read hash on mount to set initial tab
	useEffect(() => {
		const hash = window.location.hash.slice(1)

		if (hash && tabs.some((tab) => tab.id === hash)) {
			setActiveTab(hash)
		}
	}, [tabs])

	// Update underline whenever activeTab changes or on mount
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
		const button = buttonRefs.current.get(activeTab)

		if (button) {
			button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
		}
	}, [activeTab])

	const handleTabChange = (tabId: string) => {
		setActiveTab(tabId)
		window.history.replaceState(null, '', `#${tabId}`)
	}

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
						aria-selected={activeTab === tab.id}
						aria-controls={`tabpanel-${tab.id}`}
						tabIndex={activeTab === tab.id ? 0 : -1}
						className={`shrink-0 cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === tab.id
								? 'text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
						onClick={() => handleTabChange(tab.id)}>
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

			<div ref={contentRef}>
				{children}
			</div>
		</div>
	)
}
