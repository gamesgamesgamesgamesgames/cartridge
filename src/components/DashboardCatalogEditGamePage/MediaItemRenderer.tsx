// Module imports
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	type ChangeEventHandler,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'react'

// Local imports
import { type BCP47LanguageCode } from '@/typedefs/BCP47LanguageCode'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	DataList,
	DataListLabel,
	DataListValue,
} from '@/components/DataList/DataList'
import { Field, FieldLabel } from '@/components/ui/field'
import { formatBytes } from '@/helpers/formatBytes'
import { Input } from '@/components/ui/input'
import { Item, ItemContent, ItemHeader } from '@/components/ui/item'
import { LanguageSelect } from '@/components/LanguageSelect/LanguageSelect'
import { type MediaItem } from '@/typedefs/MediaItem'
import {
	MediaPlayer,
	MediaPlayerVideo,
	MediaPlayerLoading,
	MediaPlayerError,
	MediaPlayerVolumeIndicator,
	MediaPlayerControls,
	MediaPlayerControlsOverlay,
	MediaPlayerPlay,
	MediaPlayerVolume,
	MediaPlayerSeek,
	MediaPlayerTime,
} from '@/components/ui/media-player'
import { type MediaType } from '@/typedefs/MediaType'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'

// Types
type ItemRendererProps = Readonly<{
	mediaItem: MediaItem
}>

export function MediaItemRenderer(props: ItemRendererProps) {
	const { mediaItem } = props

	const { removeMedia, state, updateMedia } =
		useDashboardCatalogEditGameContext()

	const imageElementRef = useRef<HTMLImageElement>(null)
	const videoElementRef = useRef<HTMLVideoElement>(null)

	const url = useMemo(() => {
		if (mediaItem.file) return URL.createObjectURL(mediaItem.file)
		if (mediaItem.blob?.url) return mediaItem.blob.url
		return ''
	}, [mediaItem])

	const mimeType = mediaItem.file?.type ?? mediaItem.blob?.mimeType ?? ''
	const fileName = mediaItem.file?.name ?? mediaItem.title ?? 'Existing media'
	const fileSize = mediaItem.file?.size ?? mediaItem.blob?.size ?? 0
	const keyPrefix = mediaItem.id

	const handleMediaItemTitleChange = useCallback<
		ChangeEventHandler<HTMLInputElement>
	>(
		(event) => {
			updateMedia({
				...mediaItem,
				title: event.target.value,
			})
		},
		[mediaItem, updateMedia],
	)

	const handleMediaItemDescriptionChange = useCallback<
		ChangeEventHandler<HTMLTextAreaElement>
	>(
		(event) => {
			updateMedia({
				...mediaItem,
				description: event.target.value,
			})
		},
		[mediaItem, updateMedia],
	)

	const handleMediaItemMediaTypeChange = useCallback(
		(value: MediaType) => {
			updateMedia({
				...mediaItem,
				mediaType: value,
			})
		},
		[mediaItem, updateMedia],
	)

	const handleMediaItemLocaleChange = useCallback(
		(value: null | BCP47LanguageCode) => {
			updateMedia({
				...mediaItem,
				locale: value,
			})
		},
		[mediaItem, updateMedia],
	)

	const handleMediaItemRemove = useCallback(
		() => removeMedia(mediaItem),
		[mediaItem, removeMedia],
	)

	const handleLoadedMetadata = useCallback((event: Event) => {
		const target = event.target as HTMLVideoElement

		target.removeEventListener('loadedmetadata', handleLoadedMetadata)

		updateMedia({
			...mediaItem,
			height: target.videoHeight,
			width: target.videoWidth,
		})
	}, [])

	useEffect(() => {
		const imageElement = imageElementRef.current
		const videoElement = videoElementRef.current

		if (!mediaItem.height) {
			if (imageElement) {
				imageElement.onload = () => {
					imageElement.onload = null

					updateMedia({
						...mediaItem,
						height: imageElement.naturalHeight,
						width: imageElement.naturalWidth,
					})
				}
			} else if (videoElement) {
				videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
			}
		}
	}, [mediaItem])

	const isDisabled = state === 'active'

	return (
		<li className={'border-none p-0'}>
			<Card className={'p-4 size-full'}>
				<div className={'flex gap-4 items-stretch'}>
					<Item
						className={'shrink-0 w-xs'}
						variant={'outline'}>
						<ItemHeader>
							{mimeType.startsWith('video/') && (
								<MediaPlayer
									className={'object-contain rounded-none size-full'}>
									<MediaPlayerVideo ref={videoElementRef}>
										<source
											src={url}
											type={mimeType}
										/>
									</MediaPlayerVideo>
									<MediaPlayerLoading />
									<MediaPlayerError />
									<MediaPlayerVolumeIndicator />

									<MediaPlayerControls className={'flex-col items-start gap-2'}>
										<MediaPlayerControlsOverlay />

										<div className={'flex w-full items-center gap-2'}>
											<div className='flex flex-1 items-center gap-2'>
												<MediaPlayerPlay />
												<MediaPlayerVolume expandable />
											</div>

											<div className={'flex items-center gap-2'}>
												<MediaPlayerTime />
											</div>
										</div>
										<MediaPlayerSeek />
									</MediaPlayerControls>
								</MediaPlayer>
							)}

							{mimeType.startsWith('image/') && (
								<img
									alt={fileName}
									className={'object-contain size-full'}
									ref={imageElementRef}
									src={url}
								/>
							)}
						</ItemHeader>

						<ItemContent>
							<DataList>
								<DataListLabel>{'Filename'}</DataListLabel>
								<DataListValue>{fileName}</DataListValue>

								<DataListLabel>{'Dimensions'}</DataListLabel>
								<DataListValue>
									{mediaItem.height ? (
										`${mediaItem.width} × ${mediaItem.height}`
									) : (
										<span className={'text-muted-foreground'}>
											{'Unavailable'}
										</span>
									)}
								</DataListValue>

								<DataListLabel>{'Size'}</DataListLabel>
								<DataListValue>
									{formatBytes(fileSize)}
								</DataListValue>
							</DataList>
						</ItemContent>
					</Item>

					<div className={'flex flex-col gap-4 grow w-full'}>
						<Field>
							<FieldLabel htmlFor={`${keyPrefix}-title`}>{'Title'}</FieldLabel>
							<Input
								autoComplete={'off'}
								disabled={isDisabled}
								id={`${keyPrefix}-title`}
								onChange={handleMediaItemTitleChange}
								required
								type={'text'}
								value={mediaItem.title}
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor={`${keyPrefix}-description`}>
								{'Description'}
							</FieldLabel>
							<Textarea
								autoComplete={'off'}
								disabled={isDisabled}
								id={`${keyPrefix}-description`}
								onChange={handleMediaItemDescriptionChange}
								required
								value={mediaItem.description}
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor={`${keyPrefix}-description`}>
								{'Media Type'}
							</FieldLabel>
							<Select
								disabled={isDisabled}
								onValueChange={handleMediaItemMediaTypeChange}
								value={mediaItem.mediaType ?? ''}>
								<SelectTrigger>
									<SelectValue placeholder={'Select a media type'} />
								</SelectTrigger>

								<SelectContent>
									{mimeType.startsWith('video/') && (
										<>
											<SelectGroup>
												<SelectLabel>{'Trailers'}</SelectLabel>
												<SelectItem value={'trailer'}>{'Trailer'}</SelectItem>
												<SelectItem value={'announcementTrailer'}>
													{'Announcement Trailer'}
												</SelectItem>
												<SelectItem value={'releaseDateTrailer'}>
													{'Release Date Trailer'}
												</SelectItem>
												<SelectItem value={'cinematicTrailer'}>
													{'Cinematic Trailer'}
												</SelectItem>
												<SelectItem value={'gameplayTrailer'}>
													{'Gameplay Trailer'}
												</SelectItem>
												<SelectItem value={'accoladesTrailer'}>
													{'Accolades Trailer'}
												</SelectItem>
												<SelectItem value={'launchTrailer'}>
													{'Launch Trailer'}
												</SelectItem>
											</SelectGroup>

											<SelectGroup>
												<SelectLabel>{'Other'}</SelectLabel>
												<SelectItem value={'teaser'}>{'Teaser'}</SelectItem>
												<SelectItem value={'gameplayImage'}>
													{'Gameplay Footage'}
												</SelectItem>
												<SelectItem value={'devDiary'}>
													{'Dev Diary'}
												</SelectItem>
												<SelectItem value={'intro'}>{'Game Intro'}</SelectItem>
												<SelectItem value={'cutscene'}>{'Cutscene'}</SelectItem>
											</SelectGroup>
										</>
									)}

									{mimeType.startsWith('image/') && (
										<>
											<SelectItem value={'screenshot'}>
												{'Screenshot'}
											</SelectItem>

											<SelectSeparator />

											<SelectGroup>
												<SelectLabel>{'Covers'}</SelectLabel>
												<SelectItem value={'cover'}>{'Cover'}</SelectItem>
												<SelectItem value={'coverAlt'}>
													{'Alternative Cover'}
												</SelectItem>
												<SelectItem value={'logoWhite'}>
													{'Historical Cover'}
												</SelectItem>
												{mediaItem.width === mediaItem.height && (
													<SelectItem value={'logoWhite'}>
														{'Square Cover'}
													</SelectItem>
												)}
											</SelectGroup>

											<SelectSeparator />

											<SelectGroup>
												<SelectLabel>{'Artwork'}</SelectLabel>
												<SelectItem value={'artwork'}>{'Artwork'}</SelectItem>
												<SelectItem value={'keyArt'}>{'Key Art'}</SelectItem>
												<SelectItem value={'keyArtLogo'}>
													{'Key Art (with logo)'}
												</SelectItem>
												<SelectItem value={'conceptArt'}>
													{'Concept Art'}
												</SelectItem>
											</SelectGroup>

											<SelectSeparator />

											<SelectGroup>
												<SelectLabel>{'Logos'}</SelectLabel>
												<SelectItem value={'logoColor'}>
													{'Game Logo (color)'}
												</SelectItem>
												<SelectItem value={'logoBlack'}>
													{'Game Logo (black)'}
												</SelectItem>
												<SelectItem value={'logoWhite'}>
													{'Game Logo (white)'}
												</SelectItem>
											</SelectGroup>

											<SelectSeparator />

											<SelectGroup>
												<SelectLabel>{'Other'}</SelectLabel>
												<SelectItem value={'icon'}>{'Icon'}</SelectItem>
												<SelectItem value={'infographic'}>
													{'Infographic'}
												</SelectItem>
											</SelectGroup>
										</>
									)}
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel>{'Locale'}</FieldLabel>

							<LanguageSelect
								onValueChange={handleMediaItemLocaleChange}
								value={mediaItem.locale}
							/>
						</Field>

						<div className={'flex justify-end mt-auto'}>
							<Button
								onClick={handleMediaItemRemove}
								variant={'destructive'}>
								<FontAwesomeIcon icon={faTimes} />
								{'Remove'}
							</Button>
						</div>
					</div>
				</div>
			</Card>
		</li>
	)
}
