import type { Region } from './rest-client';
declare function nerdGraphUrlForRegion(region: Region): string;
type GraphQLError = {
  message: string;
  [key: string]: unknown;
};
type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};
export interface NrqlQueryResult {
  results: Array<Record<string, unknown>>;
  metadata: {
    eventTypes?: string[];
    timeWindow?: {
      begin: number;
      end: number;
    };
    facets?: string[];
    timeSeries?: boolean;
  };
}
export interface AccountDetails {
  accountId: string;
  name: string;
  region?: string;
}
export interface ApmApplication {
  guid: string;
  name: string;
  language: string;
  reporting: boolean;
  alertSeverity?: string;
  tags?: Record<string, string>;
}
export declare class NewRelicClient {
  private apiKey;
  private defaultAccountId?;
  private region;
  private graphqlEndpoint;
  constructor(apiKey?: string, defaultAccountId?: string);
  validateCredentials(): Promise<boolean>;
  getAccountDetails(accountId?: string): Promise<AccountDetails>;
  runNrqlQuery(params: { nrql: string; accountId: string }): Promise<NrqlQueryResult>;
  listApmApplications(accountId?: string): Promise<ApmApplication[]>;
  private parseTags;
  executeNerdGraphQuery<T = unknown>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<GraphQLResponse<T>>;
}
export declare const __test__: {
  nerdGraphUrlForRegion: typeof nerdGraphUrlForRegion;
};
//# sourceMappingURL=newrelic-client.d.ts.map
