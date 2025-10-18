Object.defineProperty(exports, '__esModule', { value: true });
exports.RestDeploymentsTool = void 0;
const rest_client_1 = require('../../client/rest-client');
class RestDeploymentsTool {
  restFor(region) {
    const apiKey = process.env.NEW_RELIC_API_KEY;
    const envRegion = process.env.NEW_RELIC_REGION || 'US';
    const effective = region ?? (envRegion === 'EU' ? 'EU' : 'US');
    return new rest_client_1.NewRelicRestClient({ apiKey, region: effective });
  }
  getCreateTool() {
    return {
      name: 'create_deployment',
      description: 'Create a deployment marker for an APM application (REST v2).',
      inputSchema: {
        type: 'object',
        properties: {
          application_id: { type: 'number' },
          revision: { type: 'string' },
          changelog: { type: 'string' },
          description: { type: 'string' },
          user: { type: 'string' },
          region: { type: 'string', enum: ['US', 'EU'] },
        },
        required: ['application_id', 'revision'],
      },
    };
  }
  async create(args) {
    const client = this.restFor(args.region);
    const path = `/applications/${args.application_id}/deployments`;
    const payload = {
      deployment: {
        revision: args.revision,
        changelog: args.changelog,
        description: args.description,
        user: args.user,
      },
    };
    const res = await client.post(path, payload);
    return { ...res };
  }
  getListTool() {
    return {
      name: 'list_deployments_rest',
      description: 'List deployments for an APM application (REST v2).',
      inputSchema: {
        type: 'object',
        properties: {
          application_id: { type: 'number' },
          page: { type: 'number' },
          auto_paginate: { type: 'boolean' },
          region: { type: 'string', enum: ['US', 'EU'] },
        },
        required: ['application_id'],
      },
    };
  }
  async list(args) {
    const client = this.restFor(args.region);
    const path = `/applications/${args.application_id}/deployments`;
    const results = [];
    let page = args.page;
    let nextUrl;
    do {
      const res = await client.get(path, page ? { page } : undefined);
      results.push(res.data);
      const next = res.links?.next;
      if (args.auto_paginate && next) {
        // Extract page from next URL if present
        const u = new URL(next);
        const p = u.searchParams.get('page');
        page = p ? Number(p) : undefined;
        nextUrl = next;
      } else {
        nextUrl = undefined;
      }
    } while (args.auto_paginate && nextUrl);
    return {
      items: args.auto_paginate ? results : results[0],
      page: page,
    };
  }
  getDeleteTool() {
    return {
      name: 'delete_deployment',
      description: 'Delete a deployment record (REST v2). Requires admin role permissions.',
      inputSchema: {
        type: 'object',
        properties: {
          application_id: { type: 'number' },
          id: { type: 'number' },
          confirm: { type: 'boolean' },
          region: { type: 'string', enum: ['US', 'EU'] },
        },
        required: ['application_id', 'id', 'confirm'],
      },
    };
  }
  async delete(args) {
    if (args.confirm !== true) {
      throw new Error('delete_deployment: confirm must be true');
    }
    const client = this.restFor(args.region);
    const path = `/applications/${args.application_id}/deployments/${args.id}`;
    const res = await client.delete(path);
    return { ...res };
  }
}
exports.RestDeploymentsTool = RestDeploymentsTool;
//# sourceMappingURL=deployments.js.map
