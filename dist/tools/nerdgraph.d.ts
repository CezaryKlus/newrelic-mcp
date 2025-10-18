import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { NewRelicClient } from '../client/newrelic-client';
export declare class NerdGraphTool {
  private client;
  constructor(client: NewRelicClient);
  getQueryTool(): Tool;
  execute(input: unknown): Promise<unknown>;
}
//# sourceMappingURL=nerdgraph.d.ts.map
