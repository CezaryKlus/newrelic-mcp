#!/usr/bin/env node
import { type Tool } from '@modelcontextprotocol/sdk/types.js';
import { NewRelicClient } from './client/newrelic-client';
export declare class NewRelicMCPServer {
  private server;
  private client;
  private tools;
  private defaultAccountId?;
  constructor(client?: NewRelicClient);
  private registerTools;
  private setupHandlers;
  start(): Promise<void>;
  executeTool(
    name: string,
    args: {
      target_account_id?: string;
      account_id?: string;
      [key: string]: unknown;
    }
  ): Promise<unknown>;
  private requiresAccountId;
  getMetadata(): {
    name: string;
    version: string;
    description: string;
  };
  getRegisteredTools(): string[];
  getTool(name: string): Tool | undefined;
  getDefaultAccountId(): string | undefined;
}
//# sourceMappingURL=server.d.ts.map
