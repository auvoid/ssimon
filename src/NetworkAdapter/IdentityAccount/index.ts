import { StorageSpec } from "../../Storage/index.types";
import { CredentialsManager } from "../CredentialsManager";
import * as didJWT from "did-jwt";
import { DidSigner } from "../index.types";
import {
  createVerifiablePresentationJwt,
  JwtPresentationPayload,
} from "did-jwt-vc";
import { Resolver } from "did-resolver";

export type IdentityAccountProps<
  T extends StorageSpec<Record<string, any>, any>
> = {
  seed: string;
  isOld: boolean;
  alias: string;
  store: T;
  extras?: any;
};

export class IdentityAccount {
  credentials: CredentialsManager;
  signer: DidSigner;
  document: Record<string, any>;

  /**
   * Get a did identifier (did:foobar:fj438r84jt859t959t)
   *
   * @returns {string}
   */

  public getDid(): string {
    return this.document.id;
  }

  /**
   * Get the full DID Document
   *
   * @returns {Record<string, any>}
   */

  public getDocument(): Record<string, any> {
    return this.document;
  }

  /**
   * Create a verifiable presentation
   *
   * @param {string[]} credentials
   * @returns {Promise<{ vpPayload: Record<string, any>; presentationJwt: string }>}
   */
  async createPresentation(
    credentials: string[]
  ): Promise<{ vpPayload: Record<string, any>; presentationJwt: string }> {
    const vpIssuer = {
      did: this.signer.did,
      signer: this.signer.signer,
      alg: this.signer.alg,
      kid: this.signer.kid,
    };

    const vpPayload: JwtPresentationPayload = {
      vp: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiablePresentation"],
        verifiableCredential: credentials,
      },
    };

    const presentationJwt = await createVerifiablePresentationJwt(
      vpPayload,
      vpIssuer
    );

    return { vpPayload, presentationJwt };
  }
}
