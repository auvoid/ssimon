import { IdentityConfig } from "../identity-manager.types";
import { IdentityAccount } from "./IdentityAccount/index.types";
import { StorageSpec } from "../Storage/index.types";
import * as didJWT from "did-jwt";
import { Resolver } from "did-resolver";

export type DidCreationResult = {
  identity: IdentityAccount;
  seed: string;
};

export type NetworkAdapterOptions = {
  driver: StorageSpec<any, any>;
  resolver: Resolver;
};

export type CreateDidProps<T extends StorageSpec<Record<string, any>, any>> = {
  seed?: string;
  alias: string;
  method: string;
  store: T;
};

export declare class NetworkAdapter {
  public static build(options: NetworkAdapterOptions): Promise<NetworkAdapter>;

  public getMethodIdentifier(): string;

  public createDid<T extends StorageSpec<Record<string, any>, any>>(
    props: CreateDidProps<T>
  ): Promise<DidCreationResult>;

  public deserializeDid<T extends StorageSpec<Record<string, any>, any>>(
    conf: IdentityConfig,
    store: T
  ): Promise<DidCreationResult>;

  public getSigner(seed: string): Promise<DidSigner>;
}

export type DidSigner = {
  did: `did:${string}`;
  kid: `did:${string}`;
  alg: string;
  signer: didJWT.Signer;
};
