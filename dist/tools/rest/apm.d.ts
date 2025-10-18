import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type Region } from '../../client/rest-client';
type ListApplicationsArgs = {
  filter_name?: string;
  filter_host?: string;
  filter_ids?: number[];
  filter_language?: string;
  page?: number;
  auto_paginate?: boolean;
  region?: Region;
};
export declare class RestApmTool {
  private restFor;
  getListApplicationsTool(): Tool;
  listApplications(args: ListApplicationsArgs): Promise<unknown>;
}
//# sourceMappingURL=apm.d.ts.map
