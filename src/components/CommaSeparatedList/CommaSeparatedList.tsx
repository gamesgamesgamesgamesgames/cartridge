// Module imports
import { type ReactNode, useMemo } from 'react'
import { Text } from '@radix-ui/themes'

// Local imports
import { Link } from '@/components/Link/Link'

// Local imports
type Props = Readonly<{
	includeLinks?: boolean
	items: string[]
}>

export function CommaSeparatedList(props: Props) {
	const { includeLinks, items } = props

	const renderedList = useMemo(
		() =>
			items.reduce((accumulator, item, index, array) => {
				let result = <Text>{item}</Text>

				if (includeLinks) {
					result = (
						<Link
							key={item}
							href={`/dashboard/catalog?mode=${item}`}>
							{result}
						</Link>
					)
				}

				accumulator.push(result)

				if (index < array.length - 1) {
					accumulator.push(', ')
				}

				return accumulator
			}, [] as ReactNode[]),
		[items],
	)

	return <Text>{renderedList}</Text>
}
