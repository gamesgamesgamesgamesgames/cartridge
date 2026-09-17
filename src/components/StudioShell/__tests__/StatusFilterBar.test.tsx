// @vitest-environment happy-dom

// Module imports
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

// Local imports
import {
	CONTRIBUTION_STATUS_OPTIONS,
	REVIEW_STATUS_OPTIONS,
	StatusFilterBar,
} from '@/components/StudioShell/StatusFilterBar'

describe('StatusFilterBar', () => {
	it('renders one option per status', () => {
		render(
			<StatusFilterBar
				options={REVIEW_STATUS_OPTIONS}
				value={'all'}
				onValueChange={vi.fn()}
				label={'Filter claims by status'}
			/>,
		)

		for (const option of REVIEW_STATUS_OPTIONS) {
			expect(screen.getByRole('radio', { name: option.label })).toBeInTheDocument()
		}
	})

	it('names the group for assistive technology', () => {
		render(
			<StatusFilterBar
				options={REVIEW_STATUS_OPTIONS}
				value={'all'}
				onValueChange={vi.fn()}
				label={'Filter claims by status'}
			/>,
		)

		expect(
			screen.getByRole('radiogroup', { name: 'Filter claims by status' }),
		).toBeInTheDocument()
	})

	it('marks only the active status as selected', () => {
		render(
			<StatusFilterBar
				options={REVIEW_STATUS_OPTIONS}
				value={'pending'}
				onValueChange={vi.fn()}
				label={'Filter claims by status'}
			/>,
		)

		expect(screen.getByRole('radio', { name: 'Pending' })).toBeChecked()
		expect(screen.getByRole('radio', { name: 'All' })).not.toBeChecked()
	})

	it('reports the newly selected status', async () => {
		const onValueChange = vi.fn()
		const user = userEvent.setup()

		render(
			<StatusFilterBar
				options={REVIEW_STATUS_OPTIONS}
				value={'all'}
				onValueChange={onValueChange}
				label={'Filter claims by status'}
			/>,
		)

		await user.click(screen.getByRole('radio', { name: 'Denied' }))

		expect(onValueChange).toHaveBeenCalledWith('denied')
	})

	it('ignores a re-press of the active status', async () => {
		// Radix emits '' when the pressed item is activated again. A filter always
		// has exactly one selection, so deselecting to "nothing" is not a state
		// these lists can render.
		const onValueChange = vi.fn()
		const user = userEvent.setup()

		render(
			<StatusFilterBar
				options={REVIEW_STATUS_OPTIONS}
				value={'denied'}
				onValueChange={onValueChange}
				label={'Filter claims by status'}
			/>,
		)

		await user.click(screen.getByRole('radio', { name: 'Denied' }))

		expect(onValueChange).not.toHaveBeenCalled()
	})

	it('disables every option when the list is busy', () => {
		render(
			<StatusFilterBar
				options={REVIEW_STATUS_OPTIONS}
				value={'all'}
				onValueChange={vi.fn()}
				label={'Filter claims by status'}
				disabled
			/>,
		)

		for (const option of REVIEW_STATUS_OPTIONS) {
			expect(screen.getByRole('radio', { name: option.label })).toBeDisabled()
		}
	})

	describe('status vocabularies', () => {
		it('shares the review statuses across claims and verification', () => {
			expect(REVIEW_STATUS_OPTIONS.map((option) => option.value)).toEqual([
				'all',
				'pending',
				'approved',
				'denied',
			])
		})

		it('extends the review statuses for contributions rather than redefining them', () => {
			// Contributions are the only list with a revision state; keeping it as
			// an extension is what stops the two vocabularies drifting apart.
			expect(CONTRIBUTION_STATUS_OPTIONS.map((option) => option.value)).toEqual([
				'all',
				'pending',
				'approved',
				'denied',
				'needsRevision',
			])
		})
	})
})
