import { Loader2, Wand2 } from 'lucide-react'
import { webhookListSchema } from '../http/schemas/webhooks'
import { WebhooksListItem } from './webhooks-list-item'
import {
	useSuspenseInfiniteQuery,
} from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CodeBlock } from './ui/code-block'

export function WebhooksList() {
	const loadMoreRef = useRef<HTMLDivElement>(null)
	const observerRef = useRef<IntersectionObserver>(null)

	const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([])
	const [generatedHandlerCode, setGeneratedHandlerCode] = useState<string | null>(null)

	const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery({
			queryKey: ['webhooks'],
			queryFn: async ({ pageParam }) => {
				const url = new URL('http://localhost:3333/webhooks')

				if (pageParam) {
					url.searchParams.set('cursor', pageParam)
				}

				const response = await fetch(url)
				const data = await response.json()

				return webhookListSchema.parse(data)
			},
			getNextPageParam: (lastPage) => {
				return lastPage.nextCursor ?? undefined
			},
			initialPageParam: undefined as string | undefined,
		})

	const webhooks = data.pages.flatMap((page) => page.webhooks)

	useEffect(() => {
		if (observerRef.current) {
			observerRef.current.disconnect()
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const entry = entries[0]

				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage()
				}
			},
			{
				threshold: 0.1,
			},
		)

		if (loadMoreRef.current) {
			observerRef.current.observe(loadMoreRef.current)
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage])

	function handleCheckWebhook(checkedWebhookId: string) {
		if (checkedWebhooksIds.includes(checkedWebhookId)) {
			setCheckedWebhooksIds(state => {
				return state.filter(webhookId => webhookId !== checkedWebhookId)
			})
		} else {
			setCheckedWebhooksIds(state => [...state, checkedWebhookId])
		}
	}

	async function handleGenerateHandler() {
		const response = await fetch('http://localhost:3333/generate', {
			method: 'POST',
			body: JSON.stringify({ webhookIds: checkedWebhooksIds }),
			headers: {
				'Content-Type': 'application/json'
			}
		})

		type GenerateResponse = { code: string }


		const data: GenerateResponse = await response.json()
		setGeneratedHandlerCode(data.code)

		return data
	}

	const hasAnyWebhookChecked = checkedWebhooksIds.length > 0

	return (
		<>
			<div className="flex-1 overflow-y-auto">

				<div className="space-y-1 p-2">
					<button
						disabled={!hasAnyWebhookChecked}
						className='w-full bg-rose-400 disabled:opacity-50 rounded-lg flex items-center justify-center gap-3 font-medium text-sm py-2.5 cursor-pointer'
						onClick={() => handleGenerateHandler()}
					>
						<Wand2 className='size-4' />
						Gerar Handler
					</button>
				</div>
				<div className="space-y-1 p-2">
					{webhooks.map((webhook) => {
						return (
							<WebhooksListItem
								key={webhook.id}
								webhook={webhook}
								onWebhookChecked={handleCheckWebhook}
								isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
							/>
						)
					})}
				</div>

				{hasNextPage && (
					<div className="p-2" ref={loadMoreRef}>
						{isFetchingNextPage && (
							<div className="flex items-center justify-center py-2">
								<Loader2 className="size-5 animate-spin text-zinc-500" />
							</div>
						)}
					</div>
				)}

			</div>

			{generatedHandlerCode &&
				<Dialog.Root defaultOpen>
					<Dialog.Portal>
						<Dialog.Overlay className='bg-black/60 inset-0 fixed z-20' />
						<Dialog.Content className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 max-w-[60vw] max-h-[85vh]'>
							<Dialog.Title className='sr-only'>Generate Handler Concluded ✅</Dialog.Title>
							<div className="bg-zinc-900 w-full rounded-lg p-4 border border-zinc-800 max-h-[85vh] overflow-y-auto">
								<CodeBlock language='typescript' code={generatedHandlerCode} />
							</div>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			}
		</>
	)
}