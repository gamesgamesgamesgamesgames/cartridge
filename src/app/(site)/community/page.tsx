import { type Metadata } from 'next'

// Local imports
import { Header } from '@/components/Header/Header'

export const metadata: Metadata = { title: 'Cookie Policy' }

export default function CookiePolicyPage() {
	return (
		<div className={'mx-auto w-full max-w-4xl px-4 py-24'}>
			<Header>{'Cookie Policy'}</Header>
			<div
				className={
					'prose prose-sm dark:prose-invert mt-8 max-w-none text-foreground prose-headings:font-[family-name:var(--font-cartridge)] prose-a:text-primary'
				}>
				<p>
					Cartridge is a community-driven database for video games. Think of it
					as the kind of place where you'd geek out about your favorite obscure
					RPG from 2003 <em>and</em> find accurate info about what came out last
					week. We want that to be fun. These guidelines are how we keep it that
					way.
				</p>

				<p>
					This applies everywhere you interact with the Cartridge community: the
					website, the Discord server, and anywhere else we hang out together.
				</p>

				<h2>The Short Version</h2>

				<p>Be kind, and don't be a jerk about it.</p>

				<h2>Community Behavior</h2>

				<h3>The Basics</h3>

				<ul>
					<li>
						Treat people the way you'd want to be treated in a conversation
						about video games: enthusiastically, maybe a little nerdy, and
						without making anyone feel like they don't belong.
					</li>
					<li>
						Disagreements about games are fine and honestly kind of great.
						Disagreements that become personal attacks are not.
					</li>
					<li>
						Don't pile on. If someone got something wrong, one correction is
						enough.
					</li>
				</ul>

				<h3>Social Rules</h3>

				<p>
					These are borrowed and adapted from{' '}
					<a href='https://www.recurse.com/'>The Recurse Center</a>:
				</p>

				<ul>
					<li>
						<strong>No feigning surprise.</strong> "You haven't played Disco
						Elysium?!" isn't helpful. It just makes people feel bad for gaps in
						their experience.
					</li>
					<li>
						<strong>No well-actually's.</strong> Pedantic corrections that don't
						add anything to the conversation aren't contributions.
					</li>
					<li>
						<strong>No subtle -isms.</strong> Comments that make people feel
						unwelcome based on who they are, even when unintentional, aren't
						okay. If you mess this one up, apologize and move on. We all do
						sometimes.
					</li>
				</ul>

				<h3>What's Not Allowed</h3>

				<ul>
					<li>Harassment, hate speech, or targeted abuse of any kind</li>
					<li>Slurs or discriminatory language</li>
					<li>Spoilers for major story moments without a clear warning</li>
					<li>
						Spam, self-promotion outside of designated channels, or referral
						links
					</li>
					<li>Sharing anyone's personal information without their consent</li>
					<li>Content that sexualizes minors</li>
					<li>
						Coordinated review bombing or data manipulation to skew scores or
						rankings
					</li>
				</ul>

				<h2>Reporting</h2>

				<p>
					If something feels off, please report it. You don't have to be the one
					directly affected to speak up.
				</p>

				<ul>
					<li>
						<strong>On the website:</strong> Use the flag/report button on any
						page
					</li>
					<li>
						<strong>On Discord:</strong> DM a moderator or use the report
						channel
					</li>
					<li>
						<strong>Via email:</strong>{' '}
						<a href='mailto:conduct@cartridge.dev'>conduct@cartridge.dev</a>
					</li>
				</ul>

				<p>
					Reports are handled confidentially. We'll protect your identity unless
					you've told us it's okay to share it.
				</p>

				<h2>Consequences</h2>

				<p>
					Moderators have discretion on how to handle violations, depending on
					severity and context:
				</p>

				<ol>
					<li>A note or warning</li>
					<li>Removal of content</li>
					<li>Temporary suspension</li>
					<li>Permanent ban from the community</li>
				</ol>

				<p>
					Repeated or egregious violations skip straight to the bottom of that
					list. Accounts used specifically to harass or manipulate data won't
					get second chances.
				</p>

				<h2>A Note on Scope</h2>

				<p>
					These guidelines don't cover every possible situation, and they're not
					supposed to. Use your judgment. If something feels like it violates
					the spirit of these rules even if it doesn't appear on this list, it
					probably does.
				</p>

				<p>
					<small>Last updated: March 2026</small>
				</p>
			</div>
		</div>
	)
}
