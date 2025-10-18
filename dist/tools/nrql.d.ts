import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { NewRelicClient, NrqlQueryResult } from '../client/newrelic-client';
export declare class NrqlTool {
  name: string;
  description: string;
  private client;
  constructor(client: NewRelicClient);
  getToolDefinition(): Tool;
  getInputSchema(): {
    type: 'object';
    properties: {
      nrql: {
        type: string;
        description: string;
      };
      target_account_id: {
        type: string;
        description: string;
      };
    };
    required: string[];
  };
  execute(input: { nrql?: string; target_account_id?: string }): Promise<NrqlQueryResult>;
}
//# sourceMappingURL=nrql.d.ts.map
