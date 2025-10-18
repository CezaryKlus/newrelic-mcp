#!/usr/bin/env node
Object.defineProperty(exports, '__esModule', { value: true });
exports.NewRelicMCPServer = void 0;
const index_js_1 = require('@modelcontextprotocol/sdk/server/index.js');
const stdio_js_1 = require('@modelcontextprotocol/sdk/server/stdio.js');
const types_js_1 = require('@modelcontextprotocol/sdk/types.js');
const newrelic_client_1 = require('./client/newrelic-client');
const alert_1 = require('./tools/alert');
const apm_1 = require('./tools/apm');
const entity_1 = require('./tools/entity');
const nerdgraph_1 = require('./tools/nerdgraph');
const nrql_1 = require('./tools/nrql');
const apm_2 = require('./tools/rest/apm');
const deployments_1 = require('./tools/rest/deployments');
const metrics_1 = require('./tools/rest/metrics');
const synthetics_1 = require('./tools/synthetics');
class NewRelicMCPServer {
  server;
  client;
  tools;
  defaultAccountId;
  constructor(client) {
    this.defaultAccountId = process.env.NEW_RELIC_ACCOUNT_ID;
    if (client) {
      this.client = client;
    } else {
      // Best practice for Smithery tool discovery: do not force auth at startup
      // Allow listing tools without credentials; validate when tools are invoked
      const apiKey = process.env.NEW_RELIC_API_KEY || '';
      this.client = new newrelic_client_1.NewRelicClient(apiKey, this.defaultAccountId);
    }
    this.server = new index_js_1.Server(
      {
        name: 'newrelic-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.tools = new Map();
    this.registerTools();
    this.setupHandlers();
  }
  registerTools() {
    const nrqlTool = new nrql_1.NrqlTool(this.client);
    const apmTool = new apm_1.ApmTool(this.client);
    const entityTool = new entity_1.EntityTool(this.client);
    const alertTool = new alert_1.AlertTool(this.client);
    const syntheticsTool = new synthetics_1.SyntheticsTool(this.client);
    const nerdGraphTool = new nerdgraph_1.NerdGraphTool(this.client);
    const restDeployments = new deployments_1.RestDeploymentsTool();
    const restApm = new apm_2.RestApmTool();
    const restMetrics = new metrics_1.RestMetricsTool();
    // Register all tools
    const tools = [
      nrqlTool.getToolDefinition(),
      apmTool.getListApplicationsTool(),
      entityTool.getSearchTool(),
      entityTool.getDetailsTool(),
      alertTool.getPoliciesTool(),
      alertTool.getIncidentsTool(),
      alertTool.getAcknowledgeTool(),
      syntheticsTool.getListMonitorsTool(),
      syntheticsTool.getCreateMonitorTool(),
      nerdGraphTool.getQueryTool(),
      // REST v2 tools
      restDeployments.getCreateTool(),
      restDeployments.getListTool(),
      restDeployments.getDeleteTool(),
      restApm.getListApplicationsTool(),
      restMetrics.getListMetricNamesTool(),
      restMetrics.getMetricDataTool(),
      restMetrics.getListApplicationHostsTool(),
      {
        name: 'get_account_details',
        description: 'Get New Relic account details',
        inputSchema: {
          type: 'object',
          properties: {
            target_account_id: {
              type: 'string',
              description: 'Optional account ID to get details for',
            },
          },
        },
      },
    ];
    tools.forEach((tool) => {
      this.tools.set(tool.name, tool);
    });
  }
  setupHandlers() {
    this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
      tools: Array.from(this.tools.values()),
    }));
    this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
      const tool = this.tools.get(request.params.name);
      if (!tool) {
        throw new types_js_1.McpError(
          types_js_1.ErrorCode.MethodNotFound,
          `Tool ${request.params.name} not found`
        );
      }
      try {
        const result = await this.executeTool(request.params.name, request.params.arguments || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Tool execution failed';
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, message);
      }
    });
  }
  async start() {
    // Only validate if credentials were provided; otherwise allow startup for tool discovery
    if (process.env.NEW_RELIC_API_KEY) {
      const isValid = await this.client.validateCredentials();
      if (!isValid) {
        throw new Error('Invalid New Relic API credentials');
      }
    }
    const transport = new stdio_js_1.StdioServerTransport();
    await this.server.connect(transport);
    console.error('New Relic MCP Server started');
  }
  async executeTool(name, args) {
    const accountId = args.target_account_id || args.account_id || this.defaultAccountId;
    if (!accountId && this.requiresAccountId(name)) {
      throw new Error('Account ID must be provided');
    }
    switch (name) {
      case 'run_nrql_query':
        return await new nrql_1.NrqlTool(this.client).execute({
          ...args,
          target_account_id: accountId,
        });
      case 'list_apm_applications':
        return await new apm_1.ApmTool(this.client).execute({
          ...args,
          target_account_id: accountId,
        });
      case 'create_deployment':
        return await new deployments_1.RestDeploymentsTool().create(args);
      case 'list_deployments_rest':
        return await new deployments_1.RestDeploymentsTool().list(args);
      case 'delete_deployment':
        return await new deployments_1.RestDeploymentsTool().delete(args);
      case 'list_apm_applications_rest':
        return await new apm_2.RestApmTool().listApplications(args);
      case 'list_metric_names_for_host':
        return await new metrics_1.RestMetricsTool().listMetricNames(args);
      case 'get_metric_data_for_host':
        return await new metrics_1.RestMetricsTool().getMetricData(args);
      case 'list_application_hosts':
        return await new metrics_1.RestMetricsTool().listApplicationHosts(args);
      case 'get_account_details':
        return await this.client.getAccountDetails(accountId);
      case 'list_alert_policies':
        return await new alert_1.AlertTool(this.client).listAlertPolicies({
          ...args,
          target_account_id: accountId,
        });
      case 'list_open_incidents':
        return await new alert_1.AlertTool(this.client).listOpenIncidents({
          ...args,
          target_account_id: accountId,
        });
      case 'acknowledge_incident': {
        const { incident_id, comment } = args;
        if (typeof incident_id !== 'string' || incident_id.trim() === '') {
          throw new Error('acknowledge_incident: "incident_id" (non-empty string) is required');
        }
        if (comment !== undefined && typeof comment !== 'string') {
          throw new Error('acknowledge_incident: "comment" must be a string when provided');
        }
        return await new alert_1.AlertTool(this.client).acknowledgeIncident({
          incident_id,
          comment: comment,
        });
      }
      case 'search_entities': {
        const { query, entity_types } = args;
        if (typeof query !== 'string' || query.trim() === '') {
          throw new Error('search_entities: "query" (non-empty string) is required');
        }
        let types;
        if (entity_types !== undefined) {
          if (!Array.isArray(entity_types)) {
            throw new Error('search_entities: "entity_types" must be an array of strings');
          }
          types = entity_types.filter((t) => typeof t === 'string');
        }
        return await new entity_1.EntityTool(this.client).searchEntities({
          query,
          entity_types: types,
          target_account_id: accountId,
        });
      }
      case 'get_entity_details': {
        const { entity_guid } = args;
        if (typeof entity_guid !== 'string' || entity_guid.trim() === '') {
          throw new Error('get_entity_details: "entity_guid" (non-empty string) is required');
        }
        return await new entity_1.EntityTool(this.client).getEntityDetails({ entity_guid });
      }
      case 'list_synthetics_monitors':
        return await new synthetics_1.SyntheticsTool(this.client).listSyntheticsMonitors({
          ...args,
          target_account_id: accountId,
        });
      case 'create_browser_monitor': {
        const { name, url, frequency, locations } = args;
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error('create_browser_monitor: "name" (non-empty string) is required');
        }
        if (typeof url !== 'string' || url.trim() === '') {
          throw new Error('create_browser_monitor: "url" (non-empty string) is required');
        }
        if (typeof frequency !== 'number' || !Number.isFinite(frequency) || frequency <= 0) {
          throw new Error('create_browser_monitor: "frequency" (positive number) is required');
        }
        if (!Array.isArray(locations) || locations.some((l) => typeof l !== 'string')) {
          throw new Error('create_browser_monitor: "locations" must be an array of strings');
        }
        return await new synthetics_1.SyntheticsTool(this.client).createBrowserMonitor({
          name,
          url,
          frequency,
          locations: locations,
          target_account_id: accountId,
        });
      }
      case 'run_nerdgraph_query':
        return await new nerdgraph_1.NerdGraphTool(this.client).execute(args);
      default: {
        const tool = this.tools.get(name);
        if (!tool) {
          throw new Error(`Tool ${name} not found`);
        }
        throw new Error(`Tool handler for ${name} not implemented`);
      }
    }
  }
  requiresAccountId(toolName) {
    const accountRequiredTools = [
      'run_nrql_query',
      'list_apm_applications',
      'search_entities',
      'get_account_details',
      'list_alert_policies',
      'list_open_incidents',
      'list_synthetics_monitors',
      'create_browser_monitor',
    ];
    return accountRequiredTools.includes(toolName);
  }
  getMetadata() {
    return {
      name: 'newrelic-mcp',
      version: '1.0.0',
      description: 'MCP server for New Relic observability platform integration',
    };
  }
  getRegisteredTools() {
    return Array.from(this.tools.keys());
  }
  getTool(name) {
    return this.tools.get(name);
  }
  getDefaultAccountId() {
    return this.defaultAccountId;
  }
}
exports.NewRelicMCPServer = NewRelicMCPServer;
// Main entry point
if (require.main === module) {
  const server = new NewRelicMCPServer();
  server.start().catch(console.error);
}
//# sourceMappingURL=server.js.map
