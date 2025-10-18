import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type Region } from '../../client/rest-client';
type ListPoliciesArgs = {
  filter_name?: string;
  page?: number;
  auto_paginate?: boolean;
  region?: Region;
};
type ListIncidentsArgs = {
  page?: number;
  auto_paginate?: boolean;
  only_open?: boolean;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  region?: Region;
};
export declare class RestAlertsTool {
  private restFor;
  getListPoliciesTool(): Tool;
  listPolicies(args: ListPoliciesArgs): Promise<unknown>;
  getListIncidentsTool(): Tool;
  listIncidents(args: ListIncidentsArgs): Promise<unknown>;
}
//# sourceMappingURL=alerts.d.ts.map
