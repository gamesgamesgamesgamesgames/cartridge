import { type Metadata } from 'next'

// Module imports
import {
	IconBrandBluesky,
	IconBrandDiscord,
	IconBrandGithub,
} from '@tabler/icons-react'
import { ArrowRight, Compass, ShieldCheck, Store } from 'lucide-react'
import Link from 'next/link'

// Local imports
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/Header/Header'
import { Logo } from '@/components/Logo/Logo'

const FEATURES = [
	{
		icon: Compass,
		title: 'Discover your next favorite game.',
		description:
			'Search, browse, and explore a catalog of games built by the community. Filter by genre, platform, theme, and more.',
	},
	{
		icon: Store,
		title: 'Manage your presence in one place.',
		description:
			"Claim your studio and game pages. Update your info once and let it propagate everywhere. Your data lives in your repo, not someone else's database.",
	},
	{
		icon: ShieldCheck,
		title: 'Own your credit history.',
		description:
			"Your credits live in your own record, not the studio's. Verified by the people you worked with, controlled by you. No one can strip your name.",
	},
] as const

const STATS = [
	{
		value: '32,000+',
		label: 'daily active users across 5 game dev feeds',
	},
	{
		value: '6,000+',
		label: 'game developers labeled and discoverable',
	},
	{
		value: '450+',
		label: 'studios in the network and growing',
	},
] as const

const COMMUNITY_LINKS = [
	{
		icon: IconBrandGithub,
		title: 'GitHub',
		description: 'Browse the source, report issues, and contribute code.',
		href: 'https://github.com/gamesgamesgamesgames',
		label: 'View source',
	},
	{
		icon: IconBrandBluesky,
		title: 'Bluesky',
		description: 'Follow along for updates, screenshots, and discussion.',
		href: 'https://bsky.app/profile/gamesgamesgamesgames.games',
		label: 'Follow us',
	},
	{
		icon: IconBrandDiscord,
		title: 'Discord',
		description: 'Chat with other contributors and get help.',
		href: 'https://discord.gg/gamesgamesgamesgames',
		label: 'Join server',
	},
] as const

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
	return (
		<div className={'flex flex-1 flex-col items-center bg-background'}>
			{/* Hero */}
			<section className={'flex w-full flex-col items-center px-4 pt-24 pb-12'}>
				<Logo tagline={'The game database that developers and players actually own.'} />

				<p className={'mt-8 max-w-xl text-center text-lg text-muted-foreground'}>
					{'IMDb + IMDb Pro for the games industry, built on open data that travels with you.'}
				</p>
			</section>

			{/* What is Cartridge? */}
			<section className={'w-full max-w-4xl px-4 pb-20'}>
				<Header
					level={2}
					className={'mb-8 text-center'}>
					{'What is Cartridge?'}
				</Header>

				<div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
					{FEATURES.map((feature) => (
						<Card
							key={feature.title}
							className={'border-border/50'}>
							<CardHeader>
								<div
									className={
										'mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10'
									}>
									<feature.icon className={'size-5 text-primary'} />
								</div>
								<CardTitle>{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className={'text-sm leading-relaxed'}>
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Already in the wild */}
			<section
				className={'w-full border-y border-border/50 bg-muted/30 px-4 py-20'}>
				<div className={'mx-auto max-w-4xl'}>
					<Header
						level={2}
						className={'mb-12 text-center'}>
						{'Already in the wild'}
					</Header>

					<div className={'grid grid-cols-1 gap-8 md:grid-cols-3'}>
						{STATS.map((stat) => (
							<div
								key={stat.value}
								className={'flex flex-col items-center text-center'}>
								<span
									className={
										'font-[family-name:var(--font-cartridge)] text-5xl font-extrabold md:text-6xl'
									}
									style={{
										background:
											'linear-gradient(to right, #FFC753 0%, #FF755F 43%, #FF3CAF 100%)',
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text',
									}}>
									{stat.value}
								</span>
								<span className={'mt-2 text-sm text-muted-foreground'}>
									{stat.label}
								</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Built on open data */}
			<section className={'w-full px-4 py-20'}>
				<div className={'mx-auto max-w-4xl'}>
					<Header
						level={2}
						className={'mb-6 text-center'}>
						{'Built on open data'}
					</Header>

					<div
						className={
							'mx-auto max-w-2xl space-y-4 text-center text-muted-foreground'
						}>
						<p>
							{'Cartridge runs on the AT Protocol, the same decentralized technology behind Bluesky. Game data is defined by open lexicons that anyone can read, implement, and build on.'}
						</p>

						<p>
							{"That means Cartridge isn't the only thing you can build with this data. Content filters, personalized discovery feeds, accessibility tools, studio dashboards — if you can imagine it, the data is there."}
						</p>

						<p className={'pt-2'}>
							<Button
								variant={'link'}
								asChild>
								<a
									href={'https://gamesgamesgamesgames.games'}
									target={'_blank'}
									rel={'noopener noreferrer'}>
									{'Want to dig into the technical details? Check out the Video Game Lexicons.'}
									<ArrowRight className={'size-3.5'} />
								</a>
							</Button>
						</p>
					</div>
				</div>
			</section>

			{/* Get Involved */}
			<section className={'w-full max-w-4xl border-t border-border/50 px-4 py-20'}>
				<Header
					level={2}
					className={'mb-8 text-center'}>
					{'Get Involved'}
				</Header>

				<div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
					{COMMUNITY_LINKS.map((link) => (
						<Card
							key={link.title}
							className={'border-border/50'}>
							<CardHeader>
								<div
									className={
										'mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10'
									}>
									<link.icon className={'size-5 text-primary'} />
								</div>
								<CardTitle>{link.title}</CardTitle>
								<CardDescription>{link.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant={'outline'}
									size={'sm'}
									asChild>
									<a
										href={link.href}
										target={'_blank'}
										rel={'noopener noreferrer'}>
										{link.label}
										<ArrowRight className={'size-3.5'} />
									</a>
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Credits link */}
			<section className={'w-full border-t border-border/50 px-4 py-12'}>
				<div className={'flex justify-center'}>
					<Button
						variant={'link'}
						asChild>
						<Link href={'/credits'}>
							{'See who built this'}
							<ArrowRight className={'size-3.5'} />
						</Link>
					</Button>
				</div>
			</section>
		</div>
	)
}
