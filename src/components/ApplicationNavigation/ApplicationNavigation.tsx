'use client'

// Module imports
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { useStore } from 'statery'

// Local imports
import { Link } from '@/components/Link/Link'
import { LoginDialog } from '@/components/LoginDialog/LoginDialog'
import { store } from '@/store/store'

export function ApplicationNavigation() {
	const { user } = useStore(store)

	return (
		<Box gridColumn={'span 2'}>
			<Card>
				<Flex
					align={'center'}
					justify={'between'}>
					<Heading>{'The Pentaract'}</Heading>

					<Flex>
						<Link href={'/'}>
							<Flex p={'2'}>
								<Text>{'Home'}</Text>
							</Flex>
						</Link>

						{Boolean(user) && (
							<Link href={'/dashboard'}>
								<Flex p={'2'}>
									<Text>{'Dashboard'}</Text>
								</Flex>
							</Link>
						)}

						<Link href={'/about'}>
							<Flex p={'2'}>
								<Text>{'About'}</Text>
							</Flex>
						</Link>

						{!user && (
							<LoginDialog
								trigger={
									<Button variant={'ghost'}>
										<Flex p={'2'}>
											<Text>{'Login'}</Text>
										</Flex>
									</Button>
								}
							/>
						)}
					</Flex>
				</Flex>
			</Card>
		</Box>
	)
}
