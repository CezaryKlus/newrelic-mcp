import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type Region } from '../../client/rest-client';
type ListMetricNamesArgs = {
  application_id: number;
  host_id: number;
  name?: string;
  page?: number;
  auto_paginate?: boolean;
  region?: Region;
};
type GetMetricDataArgs = {
  application_id: number;
  host_id: number;
  names: string[];
  values?: string[];
  from?: string;
  to?: string;
  period?: number;
  summarize?: boolean;
  page?: number;
  auto_paginate?: boolean;
  region?: Region;
};
type ListHostsArgs = {
  application_id: number;
  filter_hostname?: string;
  filter_ids?: string;
  page?: number;
  auto_paginate?: boolean;
  region?: Region;
};
export declare class RestMetricsTool {
  private restFor;
  getListMetricNamesTool(): Tool;
  listMetricNames(args: ListMetricNamesArgs): Promise<unknown>;
  getMetricDataTool(): Tool;
  getMetricData(args: GetMetricDataArgs): Promise<unknown>;
  getListApplicationHostsTool(): Tool;
  listApplicationHosts(args: ListHostsArgs): Promise<unknown>;
}
//# sourceMappingURL=metrics.d.ts.map
