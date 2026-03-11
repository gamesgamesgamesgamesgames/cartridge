// Module imports
import { GoogleAnalytics } from '@next/third-parties/google'
import { type Metadata } from 'next'
import {
	Geist,
	Geist_Mono,
	Readex_Pro,
} from 'next/font/google'
import localFont from 'next/font/local'
import { type PropsWithChildren } from 'react'

import '@radix-ui/themes/styles.css'

// Local imports
import { ThemeProvider } from '@/context/ThemeProvider/ThemeProvider'

import './fonts.css'

import './globals.css'

// Types
type Props = Readonly<PropsWithChildren>

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const readexPro = Readex_Pro({
	variable: '--font-readex-pro',
	subsets: ['latin'],
})

const cartridge = localFont({
	variable: '--font-cartridge',
	src: [
		{ path: '../../public/fonts/cartridge/Cartridge-Light.woff2', weight: '300', style: 'normal' },
		{ path: '../../public/fonts/cartridge/Cartridge-LightSoft.woff2', weight: '300', style: 'italic' },
		{ path: '../../public/fonts/cartridge/Cartridge-Regular.woff2', weight: '400', style: 'normal' },
		{ path: '../../public/fonts/cartridge/Cartridge-RegularSoft.woff2', weight: '400', style: 'italic' },
		{ path: '../../public/fonts/cartridge/Cartridge-Semibold.woff2', weight: '600', style: 'normal' },
		{ path: '../../public/fonts/cartridge/Cartridge-SemiboldSoft.woff2', weight: '600', style: 'italic' },
		{ path: '../../public/fonts/cartridge/Cartridge-Bold.woff2', weight: '700', style: 'normal' },
		{ path: '../../public/fonts/cartridge/Cartridge-BoldSoft.woff2', weight: '700', style: 'italic' },
		{ path: '../../public/fonts/cartridge/Cartridge-Black.woff2', weight: '900', style: 'normal' },
		{ path: '../../public/fonts/cartridge/Cartridge-BlackSoft.woff2', weight: '900', style: 'italic' },
	],
})

export const metadata: Metadata = {
	title: 'Cartridge',
	description: 'Every game, loaded.',
}

export default function RootLayoutWrapper(props: Props) {
	const { children } = props

	return (
		<html
			lang={'en'}
			suppressHydrationWarning>
			<body
				className={[
					geistSans.variable,
					geistMono.variable,
					readexPro.variable,
					cartridge.variable,
				].join(' ')}>
				<ThemeProvider
					attribute={'class'}
					defaultTheme={'system'}
					enableSystem
					disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>

			{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
				<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
			)}
		</html>
	)
}
