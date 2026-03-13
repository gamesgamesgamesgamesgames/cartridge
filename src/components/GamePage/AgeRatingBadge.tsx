'use client'

import Image from 'next/image'

import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from '@/components/ui/popover'

type RatingInfo = {
	label: string
	age: string
	description: string
}

type OrgInfo = {
	name: string
	fullName: string
	url: string
	ratings: Record<string, RatingInfo>
}

const AGE_RATING_INFO: Record<string, OrgInfo> = {
	esrb: {
		name: 'ESRB',
		fullName: 'Entertainment Software Rating Board',
		url: 'https://www.esrb.org',
		ratings: {
			EC: {
				label: 'Early Childhood',
				age: 'Ages 3+',
				description: 'Content is intended for young children.',
			},
			E: {
				label: 'Everyone',
				age: 'All ages',
				description:
					'Content is generally suitable for all ages. May contain minimal cartoon, fantasy or mild violence and/or infrequent use of mild language.',
			},
			E10: {
				label: 'Everyone 10+',
				age: 'Ages 10+',
				description:
					'Content is generally suitable for ages 10 and up. May contain more cartoon, fantasy or mild violence, mild language and/or minimal suggestive themes.',
			},
			T: {
				label: 'Teen',
				age: 'Ages 13+',
				description:
					'Content is generally suitable for ages 13 and up. May contain violence, suggestive themes, crude humor, minimal blood, simulated gambling and/or infrequent use of strong language.',
			},
			M: {
				label: 'Mature 17+',
				age: 'Ages 17+',
				description:
					'Content is generally suitable for ages 17 and up. May contain intense violence, blood and gore, sexual content and/or strong language.',
			},
			AO: {
				label: 'Adults Only 18+',
				age: 'Ages 18+',
				description:
					'Content suitable only for adults ages 18 and up. May include prolonged scenes of intense violence, graphic sexual content and/or gambling with real currency.',
			},
			RP: {
				label: 'Rating Pending',
				age: 'TBD',
				description:
					'Not yet assigned a final ESRB rating. Appears only in promotional materials for games that have not yet been rated.',
			},
		},
	},
	pegi: {
		name: 'PEGI',
		fullName: 'Pan European Game Information',
		url: 'https://pegi.info',
		ratings: {
			Three: {
				label: 'PEGI 3',
				age: 'Ages 3+',
				description:
					'Suitable for all age groups. May contain some comical violence in an appropriate context. No bad language, no frightening content.',
			},
			Seven: {
				label: 'PEGI 7',
				age: 'Ages 7+',
				description:
					'May contain some scenes or sounds that are frightening for younger children. Mild, implied violence only.',
			},
			Twelve: {
				label: 'PEGI 12',
				age: 'Ages 12+',
				description:
					'May contain violence towards fantasy characters, non-graphic nudity, slightly graphic violence towards human-like characters, mild language, and simulated gambling.',
			},
			Sixteen: {
				label: 'PEGI 16',
				age: 'Ages 16+',
				description:
					'Violence looks the same as would be expected in real life. May contain strong language, depiction of drug or tobacco use, and sexual activity.',
			},
			Eighteen: {
				label: 'PEGI 18',
				age: 'Ages 18+',
				description:
					'May contain gross violence, motiveless killing, violence towards defenseless characters, sexual violence, graphic sexual content, and glamorization of drugs.',
			},
		},
	},
	cero: {
		name: 'CERO',
		fullName: 'Computer Entertainment Rating Organization',
		url: 'https://www.cero.gr.jp/en/',
		ratings: {
			A: {
				label: 'CERO A',
				age: 'All ages',
				description: 'Content suitable for all ages.',
			},
			B: {
				label: 'CERO B',
				age: 'Ages 12+',
				description: 'Content suitable for ages 12 and above.',
			},
			C: {
				label: 'CERO C',
				age: 'Ages 15+',
				description: 'Content suitable for ages 15 and above.',
			},
			D: {
				label: 'CERO D',
				age: 'Ages 17+',
				description: 'Content suitable for ages 17 and above.',
			},
			Z: {
				label: 'CERO Z',
				age: 'Ages 18+ only',
				description: 'Content restricted to ages 18 and above only.',
			},
		},
	},
	usk: {
		name: 'USK',
		fullName: 'Unterhaltungssoftware Selbstkontrolle',
		url: 'https://usk.de',
		ratings: {
			Zero: {
				label: 'USK 0',
				age: 'All ages',
				description:
					'No content that could be harmful or impairing to any age group. Suitable for all players.',
			},
			Six: {
				label: 'USK 6',
				age: 'Ages 6+',
				description:
					'May contain elements that could be disturbing for very young children. Occasional frightening moments acceptable.',
			},
			Twelve: {
				label: 'USK 12',
				age: 'Ages 12+',
				description:
					'May contain frightening content and shock moments. Combat-focused gameplay permitted.',
			},
			Sixteen: {
				label: 'USK 16',
				age: 'Ages 16+',
				description:
					'May contain realistic violence, horror elements, and explicit language.',
			},
			Eighteen: {
				label: 'USK 18',
				age: 'Ages 18+',
				description:
					'May contain frequent, detailed, and realistic violence, unreflected drug use, and other mature content.',
			},
		},
	},
	grac: {
		name: 'GRAC',
		fullName: 'Game Rating and Administration Committee',
		url: 'https://www.grac.or.kr',
		ratings: {
			All: {
				label: 'All Ages',
				age: 'All ages',
				description:
					'Games suitable for universal audiences. No content problematic for youth.',
			},
			Twelve: {
				label: '12+',
				age: 'Ages 12+',
				description:
					'Restricted to those aged 12 and above. May contain mild violence, language, and gambling simulation.',
			},
			Fifteen: {
				label: '15+',
				age: 'Ages 15+',
				description:
					'Restricted to those aged 15 and above. May contain realistic frightening elements.',
			},
			Nineteen: {
				label: '18+',
				age: 'Ages 18+',
				description:
					'Youth cannot access. May contain excessive violence, drug depiction, and gambling.',
			},
		},
	},
	classInd: {
		name: 'ClassInd',
		fullName: 'Classificação Indicativa',
		url: 'https://www.gov.br/mj/pt-br/assuntos/seus-direitos/classificacao-1',
		ratings: {
			L: {
				label: 'Livre',
				age: 'All ages',
				description:
					'Appropriate for all ages. May contain mild, non-graphic elements.',
			},
			Ten: {
				label: '10 anos',
				age: 'Ages 10+',
				description:
					'Content may have some impact. May contain mild language, weapons, and fights.',
			},
			Twelve: {
				label: '12 anos',
				age: 'Ages 12+',
				description:
					'Mild impact. May contain language, sexual references, injuries, and blood.',
			},
			Fourteen: {
				label: '14 anos',
				age: 'Ages 14+',
				description:
					'Moderate impact. May contain deaths, eroticism, nudity, and drug references.',
			},
			Sixteen: {
				label: '16 anos',
				age: 'Ages 16+',
				description:
					'Moderate impact. May contain strong violence, mutilation, torture, and sexual content.',
			},
			Eighteen: {
				label: '18 anos',
				age: 'Ages 18+',
				description:
					'High impact. May contain sadism, violence advocacy, and explicit sexual content.',
			},
		},
	},
	acb: {
		name: 'ACB',
		fullName: 'Australian Classification Board',
		url: 'https://www.classification.gov.au',
		ratings: {
			G: {
				label: 'General',
				age: 'All ages',
				description:
					'Content is very mild in impact. Suitable for all audiences.',
			},
			PG: {
				label: 'Parental Guidance',
				age: 'All ages',
				description:
					'Content is mild in impact. Parental guidance recommended for children under 15.',
			},
			M: {
				label: 'Mature',
				age: 'Ages 15+',
				description:
					'Content is moderate in impact. Recommended for mature audiences, not legally restricted.',
			},
			MA15: {
				label: 'Mature Accompanied',
				age: 'Ages 15+',
				description:
					'Content is strong in impact. Legally restricted — persons under 15 must be accompanied by a parent or adult guardian.',
			},
			R18: {
				label: 'Restricted',
				age: 'Ages 18+',
				description:
					'Content is high in impact. Legally restricted to adults aged 18 and over.',
			},
		},
	},
}

type Props = {
	organization: string
	rating: string
	src: string
}

export function AgeRatingBadge({ organization, rating, src }: Props) {
	const orgInfo = AGE_RATING_INFO[organization]
	const ratingInfo = orgInfo?.ratings[rating]

	const label = orgInfo
		? `${orgInfo.name} ${ratingInfo?.label ?? rating}`
		: `${organization} ${rating}`

	if (!ratingInfo) {
		return (
			<Image
				src={src}
				alt={label}
				width={48}
				height={48}
				className={'h-12 w-auto'}
			/>
		)
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type={'button'}
					className={'cursor-pointer transition-transform hover:scale-110'}>
					<Image
						src={src}
						alt={label}
						width={48}
						height={48}
						className={'h-12 w-auto'}
					/>
				</button>
			</PopoverTrigger>

			<PopoverContent side={'top'}>
				<PopoverHeader>
					<PopoverTitle>
						{ratingInfo.label}
						<span className={'text-muted-foreground ml-2 text-xs font-normal'}>
							{ratingInfo.age}
						</span>
					</PopoverTitle>
				</PopoverHeader>
				<PopoverDescription className={'mt-2 text-xs'}>
					{ratingInfo.description}
				</PopoverDescription>
				<a
					href={orgInfo.url}
					target={'_blank'}
					rel={'noopener noreferrer'}
					className={'text-muted-foreground mt-2 block text-[10px] hover:underline'}>
					{orgInfo.fullName}
				</a>
			</PopoverContent>
		</Popover>
	)
}
