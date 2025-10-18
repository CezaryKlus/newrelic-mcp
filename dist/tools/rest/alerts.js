Object.defineProperty(exports, '__esModule', { value: true });
exports.RestAlertsTool = void 0;
const rest_client_1 = require('../../client/rest-client');
class RestAlertsTool {
  restFor(region) {
    const apiKey = process.env.NEW_RELIC_API_KEY;
    const envRegion = process.env.NEW_RELIC_REGION || 'US';
    const effective = region ?? (envRegion === 'EU' ? 'EU' : 'US');
    return new rest_client_1.NewRelicRestClient({ apiKey, region: effective });
  }
  getListPoliciesTool() {
    return {
      name: 'list_alert_policies_rest',
      description: 'List alert policies via REST v2.',
      inputSchema: {
        type: 'object',
        properties: {
          filter_name: { type: 'string' },
          page: { type: 'number' },
          auto_paginate: { type: 'boolean' },
          region: { type: 'string', enum: ['US', 'EU'] },
        },
      },
    };
  }
  async listPolicies(args) {
    const client = this.restFor(args.region);
    const path = '/alerts_policies';
    const query = {};
    if (args.filter_name) query['filter[name]'] = args.filter_name;
    if (args.page) query.page = args.page;
    const res = await client.get(path, query);
    return res;
  }
  getListIncidentsTool() {
    return {
      name: 'list_open_incidents_rest',
      description: 'List alert incidents via REST v2 (client-side filtering of open/priority).',
      inputSchema: {
        type: 'object',
        properties: {
          only_open: { type: 'boolean' },
          priority: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          page: { type: 'number' },
          auto_paginate: { type: 'boolean' },
          region: { type: 'string', enum: ['US', 'EU'] },
        },
      },
    };
  }
  async listIncidents(args) {
    const client = this.restFor(args.region);
    const path = '/alerts_incidents';
    const query = {};
    if (args.page) query.page = args.page;
    const results = [];
    let nextUrl;
    let page = args.page;
    do {
      const res = await client.get(path, page ? { ...query, page } : query);
      results.push(res.data);
      const next = res.links?.next;
      if (args.auto_paginate && next) {
        const u = new URL(next);
        const p = u.searchParams.get('page');
        page = p ? Number(p) : undefined;
        nextUrl = next;
      } else {
        nextUrl = undefined;
      }
    } while (args.auto_paginate && nextUrl);
    const combined = args.auto_paginate ? results.flat() : results[0];
    // Apply client-side filters if requested
    let items = combined;
    if (Array.isArray(combined)) {
      items = combined.filter((inc) => {
        let ok = true;
        if (args.only_open === true) {
          ok = ok && (!inc.closed_at || inc.closed_at === 0);
        }
        if (args.priority) {
          ok = ok && inc.priority === args.priority;
        }
        return ok;
      });
    }
    return { items, page };
  }
}
exports.RestAlertsTool = RestAlertsTool;
//# sourceMappingURL=alerts.js.map
