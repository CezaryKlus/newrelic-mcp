Object.defineProperty(exports, '__esModule', { value: true });
exports.RestApmTool = void 0;
const rest_client_1 = require('../../client/rest-client');
class RestApmTool {
  restFor(region) {
    const apiKey = process.env.NEW_RELIC_API_KEY;
    const envRegion = process.env.NEW_RELIC_REGION || 'US';
    const effective = region ?? (envRegion === 'EU' ? 'EU' : 'US');
    return new rest_client_1.NewRelicRestClient({ apiKey, region: effective });
  }
  getListApplicationsTool() {
    return {
      name: 'list_apm_applications_rest',
      description: 'List APM applications via REST v2.',
      inputSchema: {
        type: 'object',
        properties: {
          filter_name: { type: 'string' },
          filter_host: { type: 'string' },
          filter_ids: { type: 'array', items: { type: 'number' } },
          filter_language: { type: 'string' },
          page: { type: 'number' },
          auto_paginate: { type: 'boolean' },
          region: { type: 'string', enum: ['US', 'EU'] },
        },
      },
    };
  }
  async listApplications(args) {
    const client = this.restFor(args.region);
    const path = '/applications';
    const query = {};
    if (args.filter_name) query['filter[name]'] = args.filter_name;
    if (args.filter_host) query['filter[host]'] = args.filter_host;
    if (args.filter_language) query['filter[language]'] = args.filter_language;
    if (args.filter_ids && args.filter_ids.length > 0)
      query['filter[ids]'] = args.filter_ids.join(',');
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
    return { items: args.auto_paginate ? results : results[0], page };
  }
}
exports.RestApmTool = RestApmTool;
//# sourceMappingURL=apm.js.map
