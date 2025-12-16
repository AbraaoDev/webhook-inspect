import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { webhooks } from '@/db/schema'
import { db } from '@/db'
import { eq } from 'drizzle-orm'

export const getWebhook: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/webhook/:id',
		{
			schema: {
				summary: 'Get a Webhook by ID',
				tags: ['Webhooks'],
				params: z.object({
					id: z.uuid(),
				}),
				response: {
					200: createSelectSchema(webhooks),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params

			const result = await db
				.select()
				.from(webhooks)
				.where(eq(webhooks.id, id))
				.limit(1)

			if (result.length === 0) {
				return reply.status(404).send({ message: 'Webhook not found' })
			}

			return reply.status(200).send(result[0])
		},
	)
}
