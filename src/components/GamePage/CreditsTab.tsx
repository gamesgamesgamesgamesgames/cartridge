import {
	type ActorCreditView,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { Header } from '@/components/Header/Header'

type Props = Readonly<{
	actorCredits?: ActorCreditView[]
}>

const INDIVIDUAL_ROLE_ORDER: string[] = [
	'director',
	'producer',
	'designer',
	'programmer',
	'artist',
	'animator',
	'writer',
	'composer',
	'soundDesigner',
	'voiceActor',
	'qa',
	'localization',
	'communityManager',
	'marketing',
]

const INDIVIDUAL_ROLE_LABELS: Record<string, string> = {
	director: 'Directors',
	producer: 'Producers',
	designer: 'Designers',
	programmer: 'Programmers',
	artist: 'Artists',
	animator: 'Animators',
	writer: 'Writers',
	composer: 'Composers',
	soundDesigner: 'Sound Designers',
	voiceActor: 'Voice Actors',
	qa: 'QA',
	localization: 'Localization',
	communityManager: 'Community Managers',
	marketing: 'Marketing',
}

function getIndividualRoleLabel(role: string): string {
	return INDIVIDUAL_ROLE_LABELS[role] ?? role
}

function getRoleSortIndex(role: string): number {
	const index = INDIVIDUAL_ROLE_ORDER.indexOf(role)
	return index === -1 ? INDIVIDUAL_ROLE_ORDER.length : index
}

export function CreditsTab(props: Props) {
	const { actorCredits } = props

	const creditsByRole = new Map<string, string[]>()

	if (actorCredits) {
		for (const actor of actorCredits) {
			for (const credit of actor.credits) {
				const role = credit.role
				if (!creditsByRole.has(role)) {
					creditsByRole.set(role, [])
				}
				creditsByRole.get(role)!.push(actor.displayName ?? 'Unknown')
			}
		}
	}

	const sortedRoles = [...creditsByRole.keys()].sort(
		(a, b) => getRoleSortIndex(a) - getRoleSortIndex(b),
	)

	if (!sortedRoles.length) return null

	return (
		<>
			{sortedRoles.map((role) => (
				<div key={role}>
					<Header className={'mb-3 text-base'} level={4}>
						{getIndividualRoleLabel(role)}
					</Header>
					<div className={'flex flex-wrap gap-x-6 gap-y-1'}>
						{creditsByRole.get(role)!.map((name, index) => (
							<span
								key={index}
								className={'text-sm text-foreground'}>
								{name}
							</span>
						))}
					</div>
				</div>
			))}
		</>
	)
}
