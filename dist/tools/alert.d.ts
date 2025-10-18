import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { NewRelicClient } from '../client/newrelic-client';
export declare class AlertTool {
  private client;
  constructor(client: NewRelicClient);
  getPoliciesTool(): Tool;
  getIncidentsTool(): Tool;
  getAcknowledgeTool(): Tool;
  listAlertPolicies(input: { target_account_id?: string }): Promise<Array<Record<string, unknown>>>;
  listOpenIncidents(input: {
    target_account_id?: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }): Promise<Record<string, unknown>[]>;
  acknowledgeIncident(input: {
    incident_id: string;
    comment?: string;
  }): Promise<Record<string, unknown> | null>;
  acknowledgeIncidents(input: { incident_ids: string[] }): Promise<Record<string, unknown>[]>;
}
//# sourceMappingURL=alert.d.ts.map
