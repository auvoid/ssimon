import { IdentityConfig } from "../identity-manager.types";
import { IdentityAccount } from "./IdentityAccount/index.types";
import { StorageSpec } from "../Storage/index.types";

export type DidCreationResult = {
  identity: IdentityAccount;
  seed: string;
};

export type NetworkAdapterOptions = {
  driver: StorageSpec<any, any>;
};

export type CreateDidProps<T extends StorageSpec<Record<string, any>, any>> = {
  seed?: string;
  alias: string;
  method: string;
  store: T;
};

export declare class NetworkAdapter {
  public static build<T extends IdentityAccount>(
    options: NetworkAdapterOptions
  ): Promise<NetworkAdapter>;

  public getMethodIdentifier(): string;

  public createDid<T extends StorageSpec<Record<string, any>, any>>(
    props: CreateDidProps<T>
  ): Promise<DidCreationResult>;

  public deserializeDid<T extends StorageSpec<Record<string, any>, any>>(
    conf: IdentityConfig,
    store: T
  ): Promise<DidCreationResult>;
}
