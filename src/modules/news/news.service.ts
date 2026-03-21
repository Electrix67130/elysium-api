import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { NewsRow } from './news.schema';

class NewsService extends BaseService<NewsRow> {
  constructor(db: Knex) {
    super(db, 'news');
  }

  async findByAuthorId(authorId: string): Promise<NewsRow[]> {
    return this.findMany({ author_id: authorId });
  }

  async findByCategory(category: NewsRow['category']): Promise<NewsRow[]> {
    return this.findMany({ category });
  }
}

export default NewsService;
