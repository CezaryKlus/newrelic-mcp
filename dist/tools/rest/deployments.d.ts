import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type Region } from '../../client/rest-client';
type CreateDeploymentArgs = {
  application_id: number;
  revision: string;
  changelog?: string;
  description?: string;
  user?: string;
  region?: Region;
};
type ListDeploymentsArgs = {
  application_id: number;
  page?: number;
  auto_paginate?: boolean;
  region?: Region;
};
type DeleteDeploymentArgs = {
  application_id: number;
  id: number;
  confirm: true;
  region?: Region;
};
export declare class RestDeploymentsTool {
  private restFor;
  getCreateTool(): Tool;
  create(args: CreateDeploymentArgs): Promise<unknown>;
  getListTool(): Tool;
  list(args: ListDeploymentsArgs): Promise<unknown>;
  getDeleteTool(): Tool;
  delete(args: DeleteDeploymentArgs): Promise<unknown>;
}
//# sourceMappingURL=deployments.d.ts.map
