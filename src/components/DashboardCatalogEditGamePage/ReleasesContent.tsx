'use client'

// Module imports
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback, useMemo } from 'react'

// Local imports
import { Button } from '@/components/ui/button'
import { generateUUID } from '@/helpers/generateUUID'
import { ReleaseCard } from '@/components/DashboardCatalogEditGamePage/ReleaseCard'
import {
	type Release,
	type ReleaseDate,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type ReleaseWithID } from '@/typedefs/ReleaseWithID'
import { type ReleaseDateWithID } from '@/typedefs/ReleaseDateWithID'
import { Scroller } from '@/components/ui/scroller'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'

export function ReleasesContent() {
	const { releases, setReleases, state } = useDashboardCatalogEditGameContext()

	const isDisabled = state === 'active'

	// Ensure releases have IDs for stable keys
	const releasesWithIds = useMemo<ReleaseWithID[]>(() => {
		return (releases ?? []).map((release) => ({
			...release,
			id: (release as ReleaseWithID).id ?? generateUUID(),
			releaseDates: (release.releaseDates ?? []).map((rd) => ({
				...rd,
				id: (rd as ReleaseDateWithID).id ?? generateUUID(),
			})),
		}))
	}, [releases])

	const handleAddRelease = useCallback(() => {
		setReleases([
			...releasesWithIds,
			{
				id: generateUUID(),
				platform: '',
				releaseDates: [
					{
						id: generateUUID(),
						releasedAt: '',
						releasedAtFormat: 'TBD',
						region: '',
						status: 'release',
					},
				],
			},
		])
	}, [releasesWithIds, setReleases])

	const handleRemoveRelease = useCallback(
		(releaseId: string) => {
			setReleases(releasesWithIds.filter((r) => r.id !== releaseId))
		},
		[releasesWithIds, setReleases],
	)

	const handleDuplicateRelease = useCallback(
		(releaseId: string) => {
			const releaseToDuplicate = releasesWithIds.find((r) => r.id === releaseId)
			if (!releaseToDuplicate) return

			const duplicatedRelease: ReleaseWithID = {
				...releaseToDuplicate,
				id: generateUUID(),
				releaseDates: (releaseToDuplicate.releaseDates ?? []).map((rd) => ({
					...rd,
					id: generateUUID(),
				})),
			}

			setReleases([...releasesWithIds, duplicatedRelease])
		},
		[releasesWithIds, setReleases],
	)

	const handleUpdateRelease = useCallback(
		(releaseId: string, updates: Partial<Release>) => {
			setReleases(
				releasesWithIds.map((r) =>
					r.id === releaseId ? { ...r, ...updates } : r,
				),
			)
		},
		[releasesWithIds, setReleases],
	)

	const handleAddReleaseDate = useCallback(
		(releaseId: string) => {
			setReleases(
				releasesWithIds.map((r) =>
					r.id === releaseId
						? {
								...r,
								releaseDates: [
									...(r.releaseDates ?? []),
									{
										id: generateUUID(),
										releasedAt: '',
										releasedAtFormat: 'TBD',
										region: '',
										status: 'release',
									},
								],
							}
						: r,
				),
			)
		},
		[releasesWithIds, setReleases],
	)

	const handleUpdateReleaseDate = useCallback(
		(
			releaseId: string,
			releaseDateId: string,
			updates: Partial<ReleaseDate>,
		) => {
			setReleases(
				releasesWithIds.map((r) =>
					r.id === releaseId
						? {
								...r,
								releaseDates: (r.releaseDates ?? []).map((rd) =>
									(rd as ReleaseDateWithID).id === releaseDateId
										? { ...rd, ...updates }
										: rd,
								),
							}
						: r,
				),
			)
		},
		[releasesWithIds, setReleases],
	)

	const handleRemoveReleaseDate = useCallback(
		(releaseId: string, releaseDateId: string) => {
			setReleases(
				releasesWithIds.map((r) =>
					r.id === releaseId
						? {
								...r,
								releaseDates: (r.releaseDates ?? []).filter(
									(rd) => (rd as ReleaseDateWithID).id !== releaseDateId,
								),
							}
						: r,
				),
			)
		},
		[releasesWithIds, setReleases],
	)

	return (
		<Scroller className={'h-full'}>
			<div className={'flex flex-col gap-4'}>
				{releasesWithIds.length === 0 && (
					<div className={'flex flex-col items-center gap-4 py-8 text-center'}>
						<p className={'text-muted-foreground'}>
							{'No releases added yet. Add a platform release to get started.'}
						</p>
					</div>
				)}

				{releasesWithIds.map((release) => (
					<ReleaseCard
						key={release.id}
						isDisabled={isDisabled}
						onAddReleaseDate={() => handleAddReleaseDate(release.id)}
						onDuplicate={() => handleDuplicateRelease(release.id)}
						onRemove={() => handleRemoveRelease(release.id)}
						onRemoveReleaseDate={(rdId) =>
							handleRemoveReleaseDate(release.id, rdId)
						}
						onUpdatePlatform={(platform) =>
							handleUpdateRelease(release.id, { platform })
						}
						onUpdateReleaseDate={(rdId, updates) =>
							handleUpdateReleaseDate(release.id, rdId, updates)
						}
						release={release}
					/>
				))}

				<Button
					className={'w-full'}
					disabled={isDisabled}
					onClick={handleAddRelease}
					variant={'outline'}>
					<FontAwesomeIcon icon={faPlus} />
					{'Add Platform Release'}
				</Button>
			</div>
		</Scroller>
	)
}
