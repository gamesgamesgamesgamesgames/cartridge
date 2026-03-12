import { type Metadata } from 'next'
import { type PropsWithChildren } from 'react'

export const metadata: Metadata = { title: 'Search' }

export default function SearchLayout(props: Readonly<PropsWithChildren>) {
	return props.children
}
