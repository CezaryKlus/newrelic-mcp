import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { NewRelicClient } from '../client/newrelic-client';
export declare class EntityTool {
  private client;
  constructor(client: NewRelicClient);
  getSearchTool(): Tool;
  getDetailsTool(): Tool;
  searchEntities(input: {
    query: string;
    entity_types?: string[];
    target_account_id?: string;
  }): Promise<{
    entities: Array<Record<string, unknown>>;
    nextCursor?: string;
  }>;
  getEntityDetails(input: { entity_guid: string }): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=entity.d.ts.map
