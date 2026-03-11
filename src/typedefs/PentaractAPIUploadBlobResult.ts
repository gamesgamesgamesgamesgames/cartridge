import { type Cid } from '@atproto/lex'

export type PentaractAPIUploadBlobResult = {
	ref: Cid
	mimeType: string
	size: number
}
