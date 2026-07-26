// @vitest-environment happy-dom

// Module imports
import { describe, expect, it } from 'vitest'

// Local imports
import {
	formatCompact,
	formatCtr,
	formatDuration,
	formatFull,
} from '@/components/AnalyticsDashboard/formatDuration'

describe('formatDuration', () => {
	it('formats milliseconds as m:ss', () => {
		expect(formatDuration(92000)).toBe('1:32')
		expect(formatDuration(61000)).toBe('1:01')
		expect(formatDuration(9000)).toBe('0:09')
		expect(formatDuration(600000)).toBe('10:00')
	})

	it('clamps non-positive and non-finite input to 0:00', () => {
		expect(formatDuration(0)).toBe('0:00')
		expect(formatDuration(-5000)).toBe('0:00')
		expect(formatDuration(Number.NaN)).toBe('0:00')
	})
})

describe('formatCtr', () => {
	it('formats a fraction as a one-decimal percentage', () => {
		expect(formatCtr(0.0647)).toBe('6.5%')
		expect(formatCtr(0.1)).toBe('10.0%')
		expect(formatCtr(1)).toBe('100.0%')
	})

	it('formats zero / invalid as 0.0%', () => {
		expect(formatCtr(0)).toBe('0.0%')
		expect(formatCtr(Number.NaN)).toBe('0.0%')
	})
})

describe('formatCompact', () => {
	it('leaves sub-thousand values intact', () => {
		expect(formatCompact(0)).toBe('0')
		expect(formatCompact(999)).toBe('999')
	})

	it('compacts thousands and millions', () => {
		expect(formatCompact(1200)).toBe('1.2k')
		expect(formatCompact(48250)).toBe('48.3k')
		expect(formatCompact(1000)).toBe('1k')
		expect(formatCompact(1_500_000)).toBe('1.5M')
	})
})

describe('formatFull', () => {
	it('thousands-separates', () => {
		expect(formatFull(48250)).toBe('48,250')
		expect(formatFull(0)).toBe('0')
	})
})
