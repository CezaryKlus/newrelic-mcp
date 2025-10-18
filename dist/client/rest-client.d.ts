import { z } from 'zod';
export declare const RestClientOptions: z.ZodObject<
  {
    apiKey: z.ZodString;
    region: z.ZodDefault<z.ZodEnum<['US', 'EU']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    apiKey: string;
    region: 'US' | 'EU';
  },
  {
    apiKey: string;
    region?: 'US' | 'EU' | undefined;
  }
>;
export type RestClientOptions = z.infer<typeof RestClientOptions>;
export type Region = 'US' | 'EU';
declare function baseUrlForRegion(region: Region): string;
declare function serializeQuery(params: Record<string, unknown> | undefined): string;
declare function parseLinkHeader(linkHeader: string | null): Record<string, string>;
export interface RestResponse<T> {
  status: number;
  data: T;
  links?: Record<string, string>;
  url: string;
}
export declare class NewRelicRestClient {
  private readonly apiKey;
  private readonly region;
  constructor(options: RestClientOptions);
  private buildUrl;
  get<T>(path: string, query?: Record<string, unknown>): Promise<RestResponse<T>>;
  post<T>(path: string, body: unknown): Promise<RestResponse<T>>;
  delete<T>(path: string): Promise<RestResponse<T>>;
}
export declare const __test__: {
  serializeQuery: typeof serializeQuery;
  parseLinkHeader: typeof parseLinkHeader;
  baseUrlForRegion: typeof baseUrlForRegion;
};
//# sourceMappingURL=rest-client.d.ts.map
