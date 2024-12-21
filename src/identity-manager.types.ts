import { Resolver } from "did-resolver";
import { IdentityAccount } from "./NetworkAdapter/IdentityAccount/index";
import { NetworkAdapter } from "./NetworkAdapter/index.types";
import { StorageSpec } from "./Storage/index.types";

export type IdentityConfig = {
  alias: string;
  did?: string;
  document?: Record<string, any>;
  seed?: string;
  extras?: any;
};

export type IdentityManagerOptions<T extends StorageSpec<any, any>> = {
  adapters: (typeof NetworkAdapter)[];
  storage: T;
  resolver: Resolver;
};

export declare class IdentityManagerSpec {
  networkAdapters: Record<string, NetworkAdapter>;

  public static build<
    T extends IdentityAccount,
  >(): Promise<IdentityManagerSpec>;

  public getDid(props: {
    did?: string;
    alias?: string;
  }): Promise<IdentityAccount>;

  public createDid(...props: any[]): Promise<IdentityAccount>;
}
