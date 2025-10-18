Object.defineProperty(exports, '__esModule', { value: true });
exports.NrqlTool = void 0;
const zod_1 = require('zod');
const _NrqlInputSchema = zod_1.z.object({
  nrql: zod_1.z.string().min(1),
  target_account_id: zod_1.z.string().optional(),
});
class NrqlTool {
  name = 'run_nrql_query';
  description = 'Execute NRQL queries against New Relic data to analyze metrics and events';
  client;
  constructor(client) {
    this.client = client;
  }
  getToolDefinition() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.getInputSchema(),
    };
  }
  getInputSchema() {
    return {
      type: 'object',
      properties: {
        nrql: {
          type: 'string',
          description: 'The NRQL query to execute',
        },
        target_account_id: {
          type: 'string',
          description: 'Optional New Relic account ID to query',
        },
      },
      required: ['nrql'],
    };
  }
  async execute(input) {
    // Validate input
    if (!input.nrql || typeof input.nrql !== 'string' || input.nrql.trim() === '') {
      throw new Error('Invalid or empty NRQL query provided');
    }
    if (!input.target_account_id) {
      throw new Error('Account ID must be provided');
    }
    if (input.target_account_id && !/^\d+$/.test(input.target_account_id)) {
      throw new Error('Invalid account ID format');
    }
    const result = await this.client.runNrqlQuery({
      nrql: input.nrql,
      accountId: input.target_account_id,
    });
    return result;
  }
}
exports.NrqlTool = NrqlTool;
//# sourceMappingURL=nrql.js.map
