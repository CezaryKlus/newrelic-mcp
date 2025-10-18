import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { NewRelicClient } from '../client/newrelic-client';
export declare class SyntheticsTool {
  private client;
  constructor(client: NewRelicClient);
  getListMonitorsTool(): Tool;
  getCreateMonitorTool(): Tool;
  listSyntheticsMonitors(input: {
    target_account_id?: string;
    monitor_type?: 'SIMPLE' | 'BROWSER' | 'SCRIPT_API' | 'SCRIPT_BROWSER';
  }): Promise<Array<Record<string, unknown>>>;
  createBrowserMonitor(input: {
    target_account_id?: string;
    name: string;
    url: string;
    frequency: number;
    locations: string[];
  }): Promise<Record<string, unknown> | null>;
  private frequencyToPeriod;
}
//# sourceMappingURL=synthetics.d.ts.map
