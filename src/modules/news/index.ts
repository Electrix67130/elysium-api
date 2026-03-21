import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import NewsService from './news.service';
import { createNewsSchema, updateNewsSchema } from './news.schema';

const crud = new CrudRouteBuilder({
  prefix: '/news',
  service: (fastify) => new NewsService(fastify.db),
  schemas: { create: createNewsSchema, update: updateNewsSchema },
  entityName: 'News',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'news-module' });
