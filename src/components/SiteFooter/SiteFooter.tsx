// Module imports
import { IconBrandBluesky, IconBrandGithub } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'

const SOCIALS = [
	{
		icon: IconBrandBluesky,
		label: 'Bluesky',
		href: 'https://bsky.app/profile/cartridge.dev',
	},
	{
		icon: IconBrandGithub,
		label: 'GitHub',
		href: 'https://github.com/gamesgamesgamesgamesgames/cartridge',
	},
] as const

const LEGAL = [
	{ label: 'Privacy Policy', href: '/privacy' },
	{ label: 'Terms of Service', href: '/terms' },
	{ label: 'Acceptable Use', href: '/acceptable-use' },
	{ label: 'Cookie Policy', href: '/cookies' },
	{ label: 'Community Guidelines', href: '/community' },
] as const

export function SiteFooter() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className={'mt-auto border-t border-border bg-muted/30'}>
			<div className={'mx-auto max-w-6xl px-4 py-12'}>
				<div
					className={
						'flex flex-col gap-8 md:flex-row md:items-start md:justify-between'
					}>
					<Link href={'/'}>
						<Image
							src={'/images/branding/logo.color.svg'}
							alt={'Cartridge'}
							width={200}
							height={50}
						/>
					</Link>

					<div className={'grid grid-cols-2 gap-20 pr-20'}>
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
				</div>

				<div className={'mt-12 border-t border-border pt-6'}>
					<p className={'text-center text-xs text-muted-foreground'}>
						{`© ${currentYear} Cartridge`}
					</p>
				</div>
			</div>
		</footer>
	)
}
