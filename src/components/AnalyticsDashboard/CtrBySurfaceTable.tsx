// Local imports
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { type CtrBySurface } from '@/helpers/analytics/types'
import {
	formatCompact,
	formatCtr,
	formatFull,
} from '@/components/AnalyticsDashboard/formatDuration'
import { sourceLabel } from '@/components/AnalyticsDashboard/feedLabels'

type Props = Readonly<{
	rows: CtrBySurface[]
}>

/** Small table: click-through rate broken down by surface. */
export function CtrBySurfaceTable(props: Props) {
	const { rows } = props

	if (!rows.length) {
		return (
			<p className={'py-6 text-center text-xs text-muted-foreground'}>
				{'No surface data yet'}
			</p>
		)
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{'Surface'}</TableHead>
					<TableHead className={'text-right'}>{'Impr.'}</TableHead>
					<TableHead className={'text-right'}>{'Clicks'}</TableHead>
					<TableHead className={'text-right'}>{'CTR'}</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{rows.map((row) => (
					<TableRow key={row.surface}>
						<TableCell className={'font-medium'}>
							{sourceLabel(row.surface)}
						</TableCell>
						<TableCell className={'text-right tabular-nums'}>
							{formatCompact(row.impressions)}
						</TableCell>
						<TableCell className={'text-right tabular-nums'}>
							{formatFull(row.clicks)}
						</TableCell>
						<TableCell className={'text-right tabular-nums'}>
							{formatCtr(row.ctr)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
