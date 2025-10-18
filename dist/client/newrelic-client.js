Object.defineProperty(exports, '__esModule', { value: true });
exports.__test__ = exports.NewRelicClient = void 0;
function nerdGraphUrlForRegion(region) {
  return region === 'EU'
    ? 'https://api.eu.newrelic.com/graphql'
    : 'https://api.newrelic.com/graphql';
}
class NewRelicClient {
  apiKey;
  defaultAccountId;
  region;
  graphqlEndpoint;
  constructor(apiKey, defaultAccountId) {
    this.apiKey = apiKey || process.env.NEW_RELIC_API_KEY || '';
    this.defaultAccountId = defaultAccountId || process.env.NEW_RELIC_ACCOUNT_ID;
    const envRegion = process.env.NEW_RELIC_REGION || 'US';
    this.region = envRegion === 'EU' ? 'EU' : 'US';
    this.graphqlEndpoint = nerdGraphUrlForRegion(this.region);
  }
  async validateCredentials() {
    try {
      const query = `{
        actor {
          user {
            id
            email
          }
        }
      }`;
      const response = await this.executeNerdGraphQuery(query);
      return !!response.data?.actor?.user;
    } catch (_error) {
      return false;
    }
  }
  async getAccountDetails(accountId) {
    const id = accountId || this.defaultAccountId;
    if (!id) {
      throw new Error('Account ID must be provided');
    }
    const query = `{
      actor {
        account(id: ${id}) {
          id
          name
        }
      }
    }`;
    const response = await this.executeNerdGraphQuery(query);
    if (!response.data?.actor?.account) {
      throw new Error(`Account ${id} not found`);
    }
    return {
      accountId: response.data.actor.account.id,
      name: response.data.actor.account.name,
      region: this.region,
    };
  }
  async runNrqlQuery(params) {
    if (!params.nrql || typeof params.nrql !== 'string') {
      throw new Error('Invalid or empty NRQL query provided');
    }
    if (!params.accountId || !/^\d+$/.test(params.accountId)) {
      throw new Error('Invalid account ID format');
    }
    const query = `{
      actor {
        account(id: ${params.accountId}) {
          nrql(query: "${params.nrql.replace(/"/g, '\\"')}") {
            results
            metadata {
              eventTypes
              timeWindow {
                begin
                end
              }
              facets
            }
          }
        }
      }
    }`;
    try {
      const response = await this.executeNerdGraphQuery(query);
      if (response.errors) {
        const errorMessage = response.errors[0]?.message || 'NRQL query failed';
        throw new Error(errorMessage);
      }
      const nrqlResult = response.data?.actor?.account?.nrql;
      if (!nrqlResult) {
        throw new Error('No results returned from NRQL query');
      }
      // Detect if it's a time series query
      const isTimeSeries = params.nrql.toLowerCase().includes('timeseries');
      return {
        results: nrqlResult.results || [],
        metadata: {
          ...nrqlResult.metadata,
          timeSeries: isTimeSeries,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Syntax error')) {
        throw new Error(`NRQL Syntax error: ${error.message}`);
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
  async listApmApplications(accountId) {
    const id = accountId || this.defaultAccountId;
    if (!id) {
      throw new Error('Account ID must be provided');
    }
    const query = `{
      actor {
        entitySearch(query: "domain = 'APM' AND type = 'APPLICATION' AND accountId = '${id}'") {
          results {
            entities {
              guid
              name
              ... on ApmApplicationEntityOutline {
                language
                reporting
                alertSeverity
                tags {
                  key
                  values
                }
              }
            }
          }
        }
      }
    }`;
    const response = await this.executeNerdGraphQuery(query);
    const entities = response.data?.actor?.entitySearch?.results?.entities || [];
    return entities.map((entity) => ({
      guid: entity.guid,
      name: entity.name,
      language: entity.language || 'unknown',
      reporting: entity.reporting || false,
      alertSeverity: entity.alertSeverity,
      tags: this.parseTags(entity.tags),
    }));
  }
  parseTags(tags) {
    if (!tags) return {};
    const result = {};
    tags.forEach((tag) => {
      const values = Array.isArray(tag.values) ? tag.values : [];
      if (tag.key && values.length > 0) {
        result[tag.key] = values[0];
      }
    });
    return result;
  }
  async executeNerdGraphQuery(query, variables) {
    // Check if API key is missing or empty
    if (!this.apiKey || this.apiKey === '' || this.apiKey.length === 0) {
      throw new Error('NEW_RELIC_API_KEY environment variable is not set');
    }
    const response = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': this.apiKey,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid API key');
      }
      throw new Error(`NerdGraph API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
}
exports.NewRelicClient = NewRelicClient;
// Expose internal helpers for testing
exports.__test__ = { nerdGraphUrlForRegion };
//# sourceMappingURL=newrelic-client.js.map
