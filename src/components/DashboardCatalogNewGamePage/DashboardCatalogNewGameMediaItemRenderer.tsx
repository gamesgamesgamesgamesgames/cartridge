// Module imports
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	ChangeEventHandler,
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
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'

// Types
type ItemRendererProps = Readonly<{
	mediaItem: MediaItem
}>

export function DashboardCatalogNewGameMediaItemRenderer(
	props: ItemRendererProps,
) {
	const { mediaItem } = props

	const { state, updateMedia } = useDashboardCatalogNewGameContext()

	const imageElementRef = useRef<HTMLImageElement>(null)
	const videoElementRef = useRef<HTMLVideoElement>(null)

	const url = useMemo(() => URL.createObjectURL(mediaItem.file), [mediaItem])

	const keyPrefix = mediaItem.file.name.replace(' ', '-')

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

	useEffect(() => {
		const imageElement = imageElementRef.current
		const videoElement = videoElementRef.current

		if (!mediaItem.dimensions) {
			if (imageElement) {
				imageElement.onload = () => {
					updateMedia({
						...mediaItem,
						dimensions: {
							height: imageElement.naturalHeight,
							width: imageElement.naturalWidth,
						},
					})
				}
			} else if (videoElement) {
				videoElement.addEventListener('loadedmetadata', () => {
					updateMedia({
						...mediaItem,
						dimensions: {
							height: videoElement.videoHeight,
							width: videoElement.videoWidth,
						},
					})
				})
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
							{mediaItem.file.type.startsWith('video/') && (
								<MediaPlayer
									className={'object-contain rounded-none size-full'}>
									<MediaPlayerVideo ref={videoElementRef}>
										<source
											src={url}
											type={mediaItem.file.type}
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

							{mediaItem.file.type.startsWith('image/') && (
								<img
									alt={mediaItem.file.name}
									className={'object-contain size-full'}
									ref={imageElementRef}
									src={url}
								/>
							)}
						</ItemHeader>

						<ItemContent>
							<DataList>
								<DataListLabel>{'Filename'}</DataListLabel>
								<DataListValue>{mediaItem.file.name}</DataListValue>

								<DataListLabel>{'Dimensions'}</DataListLabel>
								<DataListValue>
									{mediaItem.dimensions ? (
										`${mediaItem.dimensions.width} × ${mediaItem.dimensions.height}`
									) : (
										<span className={'text-muted-foreground'}>
											{'Unavailable'}
										</span>
									)}
								</DataListValue>

								<DataListLabel>{'Size'}</DataListLabel>
								<DataListValue>
									{formatBytes(mediaItem.file.size)}
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
								value={mediaItem.mediaType ?? undefined}>
								<SelectTrigger>
									<SelectValue placeholder={'Select a media type'} />
								</SelectTrigger>

								<SelectContent>
									{mediaItem.file.type.startsWith('video/') && (
										<>
											<SelectItem value={'trailer'}>{'Trailer'}</SelectItem>

											<SelectSeparator />

											<SelectGroup>
												<SelectLabel>{'Trailers'}</SelectLabel>
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

									{mediaItem.file.type.startsWith('image/') && (
										<>
											<SelectItem value={'screenshot'}>
												{'Screenshot'}
											</SelectItem>

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
												<SelectLabel>{'Arwork'}</SelectLabel>
												<SelectItem value={'keyArt'}>{'Key Art'}</SelectItem>
												<SelectItem value={'keyArtLogo'}>
													{'Key Art (with logo)'}
												</SelectItem>
												<SelectItem value={'conceptArt'}>
													{'Concept Art'}
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
							<Button variant={'destructive'}>
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
