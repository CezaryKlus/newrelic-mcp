import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ApmApplication, NewRelicClient } from '../client/newrelic-client';
export declare class ApmTool {
  private client;
  constructor(client: NewRelicClient);
  getListApplicationsTool(): Tool;
  execute(input: { target_account_id?: string }): Promise<ApmApplication[]>;
}
//# sourceMappingURL=apm.d.ts.map
