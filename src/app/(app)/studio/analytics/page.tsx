import { type Metadata } from 'next'

// Local imports
import { AnalyticsOverview } from '@/components/AnalyticsDashboard/AnalyticsOverview'

export const metadata: Metadata = { title: 'Analytics' }

export default function AnalyticsPage() {
	return <AnalyticsOverview />
}
