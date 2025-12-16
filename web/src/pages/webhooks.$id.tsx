import { createFileRoute } from '@tanstack/react-router'
import { WebhookDetails } from '../components/webhook-details'
import { Suspense } from 'react'

export const Route = createFileRoute('/webhooks/$id')({
	component: WebhookDetailPage,
})

function WebhookDetailPage() {
	const { id } = Route.useParams()

	return (
		<Suspense fallback={<p>Carregando...</p>}>
			<WebhookDetails id={id} />
		</Suspense>
	)
}
