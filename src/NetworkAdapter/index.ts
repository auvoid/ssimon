import { IdentityConfig } from "../identity-manager.types";
import { IdentityAccount } from "./IdentityAccount";
import { StorageSpec } from "../Storage";
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

export type CreateDidProps = {
  seed?: string;
  alias: string;
  method: string;
  store: StorageSpec<any, any>;
};

export declare class NetworkAdapter {
  public static build(options: NetworkAdapterOptions): Promise<NetworkAdapter>;

  public getMethodIdentifier(): string;

  public createDid(props: CreateDidProps): Promise<DidCreationResult>;

  public deserializeDid(
    conf: IdentityConfig,
    store: StorageSpec<any, any>
  ): Promise<DidCreationResult>;
}

export type DidSigner = {
  did: `did:${string}`;
  kid: `did:${string}`;
  alg: string;
  signer: didJWT.Signer;
};
