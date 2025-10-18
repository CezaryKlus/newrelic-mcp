Object.defineProperty(exports, '__esModule', { value: true });
exports.__test__ = exports.NewRelicRestClient = exports.RestClientOptions = void 0;
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const zod_1 = require('zod');
exports.RestClientOptions = zod_1.z.object({
  apiKey: zod_1.z.string().min(1),
  region: zod_1.z.enum(['US', 'EU']).default('US'),
});
function baseUrlForRegion(region) {
  return region === 'EU' ? 'https://api.eu.newrelic.com/v2' : 'https://api.newrelic.com/v2';
}
function serializeQuery(params) {
  if (!params) return '';
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      // arrays as repeated params: names[]=a&names[]=b
      value.forEach((v) => query.append(`${key}[]`, String(v)));
    } else {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}
function parseLinkHeader(linkHeader) {
  if (!linkHeader) return {};
  const parts = linkHeader.split(',');
  const links = {};
  for (const part of parts) {
    const section = part.split(';');
    if (section.length < 2) continue;
    const url = section[0].trim().replace(/^<|>$/g, '');
    const relMatch = section[1].match(/rel="(.*)"/);
    const rel = relMatch?.[1];
    if (rel) {
      links[rel] = url;
    }
  }
  return links;
}
class NewRelicRestClient {
  apiKey;
  region;
  constructor(options) {
    const parsed = exports.RestClientOptions.parse(options);
    this.apiKey = parsed.apiKey;
    this.region = parsed.region;
  }
  buildUrl(path, query) {
    const base = baseUrlForRegion(this.region);
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const hasJson = normalizedPath.endsWith('.json');
    const qs = serializeQuery(query);
    return `${base}${hasJson ? normalizedPath : `${normalizedPath}.json`}${qs}`;
  }
  async get(path, query) {
    const url = this.buildUrl(path, query);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
      },
    });
    const links = parseLinkHeader(response.headers.get('link'));
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`REST API error: ${response.status} ${response.statusText}`);
    }
    return { status: response.status, data, links, url };
  }
  async post(path, body) {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
      },
      body: JSON.stringify(body),
    });
    const links = parseLinkHeader(response.headers.get('link'));
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`REST API error: ${response.status} ${response.statusText}`);
    }
    return { status: response.status, data, links, url };
  }
  async delete(path) {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
      },
    });
    const links = parseLinkHeader(response.headers.get('link'));
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`REST API error: ${response.status} ${response.statusText}`);
    }
    return { status: response.status, data, links, url };
  }
}
exports.NewRelicRestClient = NewRelicRestClient;
exports.__test__ = { serializeQuery, parseLinkHeader, baseUrlForRegion };
//# sourceMappingURL=rest-client.js.map
