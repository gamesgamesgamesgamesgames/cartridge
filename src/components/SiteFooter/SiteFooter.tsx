// Module imports
import { IconBrandBluesky, IconBrandGithub } from '@tabler/icons-react'
import Link from 'next/link'

const SOCIALS = [
	{
		icon: IconBrandBluesky,
		label: 'Bluesky',
		href: 'https://bsky.app/profile/gamesgamesgamesgames.games',
	},
	{
		icon: IconBrandGithub,
		label: 'GitHub',
		href: 'https://github.com/gamesgamesgamesgames',
	},
] as const

const LEGAL = [
	{ label: 'Privacy Policy', href: '/privacy' },
	{ label: 'Terms of Service', href: '/terms' },
	{ label: 'Acceptable Use', href: '/acceptable-use' },
	{ label: 'Cookie Policy', href: '/cookies' },
] as const

const CARTRIDGE = [
	{ label: 'About', href: '/about' },
	{ label: 'Credits', href: '/credits' },
] as const

export function SiteFooter() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className={'mt-auto border-t border-border bg-muted/30'}>
			<div className={'mx-auto max-w-6xl px-4 py-12'}>
				<div className={'grid grid-cols-1 gap-8 md:grid-cols-3'}>
					<div>
						<h3
							className={
								'text-xs font-semibold uppercase tracking-wider text-muted-foreground'
							}>
							{'Cartridge'}
						</h3>
						<ul className={'mt-4 space-y-2'}>
							{CARTRIDGE.map((link) => (
								<li key={link.label}>
									<Link
										className={
											'text-sm text-muted-foreground transition-colors hover:text-foreground'
										}
										href={link.href}>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3
							className={
								'text-xs font-semibold uppercase tracking-wider text-muted-foreground'
							}>
							{'Socials'}
						</h3>
						<ul className={'mt-4 space-y-2'}>
							{SOCIALS.map((social) => (
								<li key={social.label}>
									<a
										className={
											'inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
										}
										href={social.href}
										rel={'noopener noreferrer'}
										target={'_blank'}>
										<social.icon className={'size-4'} />
										{social.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3
							className={
								'text-xs font-semibold uppercase tracking-wider text-muted-foreground'
							}>
							{'Legal'}
						</h3>
						<ul className={'mt-4 space-y-2'}>
							{LEGAL.map((link) => (
								<li key={link.label}>
									<Link
										className={
											'text-sm text-muted-foreground transition-colors hover:text-foreground'
										}
										href={link.href}>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Copyright */}
				<div className={'mt-12 border-t border-border pt-6'}>
					<p className={'text-center text-xs text-muted-foreground'}>
						{`© ${currentYear} Cartridge`}
					</p>
				</div>
			</div>
		</footer>
	)
}
