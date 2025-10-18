Object.defineProperty(exports, '__esModule', { value: true });
exports.NerdGraphTool = void 0;
const zod_1 = require('zod');
class NerdGraphTool {
  client;
  constructor(client) {
    this.client = client;
  }
  getQueryTool() {
    return {
      name: 'run_nerdgraph_query',
      description: 'Execute a custom NerdGraph GraphQL query',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The GraphQL query to execute',
          },
          variables: {
            type: 'object',
            description: 'Optional GraphQL variables to supply to the query',
          },
        },
        required: ['query'],
      },
    };
  }
  async execute(input) {
    // Validate input with Zod for consistency
    const schema = zod_1.z.object({
      query: zod_1.z.string().min(1, 'Invalid or empty GraphQL query provided'),
      variables: zod_1.z.record(zod_1.z.any()).optional(),
    });
    const { query, variables } = schema.parse(input);
    return await this.client.executeNerdGraphQuery(query, variables);
  }
}
exports.NerdGraphTool = NerdGraphTool;
//# sourceMappingURL=nerdgraph.js.map
