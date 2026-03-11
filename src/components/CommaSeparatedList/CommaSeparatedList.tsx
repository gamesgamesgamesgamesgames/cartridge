// Module imports
import { type ReactNode, useMemo } from 'react'

// Types
type Props = Readonly<{ items: ReactNode[] }>

export function CommaSeparatedList(props: Props) {
	const { items } = props

	const renderedList = useMemo(
		() =>
			items.reduce<ReactNode[]>((accumulator, item, index, array) => {
				accumulator.push(item)

				if (index < array.length - 1) {
					accumulator.push(', ')
				}

				return accumulator
			}, []),
		[items],
	)

	return <span>{renderedList}</span>
}
