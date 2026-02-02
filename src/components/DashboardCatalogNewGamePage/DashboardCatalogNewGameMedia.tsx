// Module import
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local import
import { Button } from '@/components/ui/button'
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadTrigger,
} from '@/components/ui/file-upload'
import { DashboardCatalogNewGameMediaItemRenderer } from '@/components/DashboardCatalogNewGamePage/DashboardCatalogNewGameMediaItemRenderer'
import { Scroller } from '@/components/ui/scroller'
import { toast } from 'sonner'
import { useCallback, useMemo } from 'react'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'

export function DashboardCatalogNewGameMedia() {
	const { media, updateAllMedia } = useDashboardCatalogNewGameContext()

	const onFileReject = useCallback((file: File, message: string) => {
		toast(message, {
			description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
		})
	}, [])

	const mediaElements = useMemo(() => {
		return Array.from(media.values()).map((mediaItem, index) => (
			<DashboardCatalogNewGameMediaItemRenderer
				key={index}
				mediaItem={mediaItem}
			/>
		))
	}, [media])

	return (
		<FileUpload
			className={
				'flex flex-col gap-4 grow justify-stretch overflow-hidden shrink w-full'
			}
			maxSize={5 * 1024 * 1024}
			multiple
			onFileReject={onFileReject}
			onValueChange={updateAllMedia}
			value={Array.from(media.values()).map(({ file }) => file)}>
			<FileUploadDropzone>
				<div className={'flex flex-col items-center gap-1 text-center'}>
					<div
						className={
							'flex items-center justify-center rounded-full border p-2.5'
						}>
						<FontAwesomeIcon
							className={'text-muted-foreground'}
							icon={faUpload}
							size={'lg'}
						/>
					</div>
					<p className={'font-medium text-sm'}>{'Drag & drop files here'}</p>
					<p className={'text-muted-foreground text-xs'}>
						{'Or click to browse (up to 5MB each)'}
					</p>
				</div>
				<FileUploadTrigger asChild>
					<Button
						variant={'outline'}
						size={'sm'}
						className={'mt-2 w-fit'}>
						{'Browse files'}
					</Button>
				</FileUploadTrigger>
			</FileUploadDropzone>

			<Scroller>
				<ul className={'flex flex-col gap-4'}>{mediaElements}</ul>
			</Scroller>
		</FileUpload>
	)
}
