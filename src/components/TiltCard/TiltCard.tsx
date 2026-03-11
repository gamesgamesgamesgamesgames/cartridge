'use client'

// Module imports
import {
	type PropsWithChildren,
	type CSSProperties,
	useCallback,
	useRef,
	useState,
} from 'react'

// Types
type Props = Readonly<
	PropsWithChildren<{
		className?: string
		maxTilt?: number
	}>
>

export function TiltCard(props: Props) {
	const { children, className, maxTilt = 15 } = props
	const ref = useRef<HTMLDivElement>(null)
	const [style, setStyle] = useState<CSSProperties>({
		transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
		transition: 'transform 0.4s ease',
	})

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const el = ref.current
			if (!el) return

			const rect = el.getBoundingClientRect()
			const x = (e.clientX - rect.left) / rect.width
			const y = (e.clientY - rect.top) / rect.height

			const rotateX = (0.5 - y) * maxTilt
			const rotateY = (x - 0.5) * maxTilt

			setStyle({
				transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
				transition: 'transform 0.1s ease',
			})
		},
		[maxTilt],
	)

	const handleMouseLeave = useCallback(() => {
		setStyle({
			transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
			transition: 'transform 0.4s ease',
		})
	}, [])

	return (
		<div
			ref={ref}
			className={className}
			style={style}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}>
			{children}
		</div>
	)
}
