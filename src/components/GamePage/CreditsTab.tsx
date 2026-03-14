// Local imports
import {
	type ActorCreditView,
	type CompanyRole,
	type IndividualRole,
	type OrgCreditView,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { SectionHeader } from './SectionHeader'

// Types
type Props = Readonly<{
	orgCredits?: OrgCreditView[]
	actorCredits?: ActorCreditView[]
}>

// Constants
const COMPANY_ROLE_LABELS: Record<string, string> = {
	developer: 'Developer',
	publisher: 'Publisher',
	porter: 'Porter',
	supporter: 'Supporter',
}

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

function getCompanyRoleLabel(role: CompanyRole): string {
	return COMPANY_ROLE_LABELS[role] ?? role
}

function getIndividualRoleLabel(role: string): string {
	return INDIVIDUAL_ROLE_LABELS[role] ?? role
}

function getRoleSortIndex(role: string): number {
	const index = INDIVIDUAL_ROLE_ORDER.indexOf(role)
	return index === -1 ? INDIVIDUAL_ROLE_ORDER.length : index
}

export function CreditsTab(props: Props) {
	const { orgCredits, actorCredits } = props

	// Group actor credits by role
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

	// Sort roles in logical order
	const sortedRoles = [...creditsByRole.keys()].sort(
		(a, b) => getRoleSortIndex(a) - getRoleSortIndex(b),
	)

	const hasOrgCredits = orgCredits && orgCredits.length > 0
	const hasActorCredits = sortedRoles.length > 0

	if (!hasOrgCredits && !hasActorCredits) {
		return null
	}

	return (
		<>
			{hasOrgCredits && (
				<SectionHeader
					id={'credits-companies'}
					title={'Companies'}>
					<div className={'flex flex-col gap-4'}>
						{orgCredits.map((org) => (
							<div
								key={org.uri}
								className={'flex items-center gap-3'}>
								<span className={'font-medium'}>
									{org.displayName ?? 'Unknown'}
								</span>

								<div className={'flex flex-wrap gap-1.5'}>
									{org.roles.map((role) => (
										<span
											key={role}
											className={'rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium'}>
											{getCompanyRoleLabel(role)}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</SectionHeader>
			)}

			{sortedRoles.map((role) => (
				<SectionHeader
					key={role}
					id={`credits-${role}`}
					title={getIndividualRoleLabel(role)}>
					<div className={'flex flex-wrap gap-x-6 gap-y-1'}>
						{creditsByRole.get(role)!.map((name, index) => (
							<span
								key={index}
								className={'text-sm text-foreground'}>
								{name}
							</span>
						))}
					</div>
				</SectionHeader>
			))}
		</>
	)
}
