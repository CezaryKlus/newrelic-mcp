Object.defineProperty(exports, '__esModule', { value: true });
exports.ApmTool = void 0;
class ApmTool {
  client;
  constructor(client) {
    this.client = client;
  }
  getListApplicationsTool() {
    return {
      name: 'list_apm_applications',
      description: 'List all APM applications in your New Relic account',
      inputSchema: {
        type: 'object',
        properties: {
          target_account_id: {
            type: 'string',
            description: 'Optional New Relic account ID',
          },
        },
      },
    };
  }
  async execute(input) {
    if (!input.target_account_id) {
      throw new Error('Account ID must be provided');
    }
    const applications = await this.client.listApmApplications(input.target_account_id);
    return applications;
  }
}
exports.ApmTool = ApmTool;
//# sourceMappingURL=apm.js.map
