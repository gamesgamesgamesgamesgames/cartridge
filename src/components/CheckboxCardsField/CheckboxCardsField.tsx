// Module imports
import { useMemo } from 'react'

// Local imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Field,
	FieldContent,
	FieldLabel,
	FieldSet,
	FieldTitle,
} from '@/components/ui/field'
import { type Mode } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	data: Record<
		string,
		{
			fqid: string
			id: string
			name: string
		}
	>
	disabled: boolean
	fieldPrefix: string
	label: string

	onChange: (id: Mode) => (isChecked: boolean) => void
	value: Set<Mode>
}>

export function CheckboxCardsField(props: Props) {
	const { data, disabled, fieldPrefix, label, onChange, value } = props

	const options = useMemo(
		() =>
			Object.values(data).map((datum) => {
				const key = `game-${fieldPrefix}-${datum.id}`

				return (
					<FieldLabel key={key}>
						<Field orientation={'horizontal'}>
							<Checkbox
								checked={value.has(datum.fqid)}
								disabled={disabled}
								id={key}
								name={key}
								onCheckedChange={onChange(datum.fqid)}
							/>
							<FieldContent>
								<FieldTitle>{datum.name}</FieldTitle>
							</FieldContent>
						</Field>
					</FieldLabel>
				)
			}),
		[disabled, onChange, value],
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>{label}</CardTitle>
			</CardHeader>

			<CardContent>
				<FieldSet
					className={
						'auto-rows-min gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-flow-row'
					}
					id={`game-${fieldPrefix}`}>
					{options}
				</FieldSet>
			</CardContent>
		</Card>
	)
}
