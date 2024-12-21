import { StorageSpec } from "../../Storage/index.types";
import { Resolver } from "did-resolver";
import {
  createVerifiableCredentialJwt,
  JwtCredentialPayload,
  verifyCredential,
} from "did-jwt-vc";
import type { DisclosureFrame } from "@sd-jwt/types";

import { DidSigner } from "../index.types";
import { Validator } from "jsonschema";
import { OpenBadgeSchema } from "./ob-schema";
import { SDJwtVcInstance } from "@sd-jwt/sd-jwt-vc";
import { digest, generateSalt } from "@sd-jwt/crypto-nodejs";

export type CreateCredentialProps = {
  id: string;
  recipientDid: string;
  body: Record<string, unknown>;
  type: string | string[];
  expiryDate?: number;
  extras?: Record<string, unknown>;
};

export type CreateSdJwtProps = {
  body: Record<string, any>;
  disclosureFrame: string[];
  recipientDid: string;
  type: string;
};

export type CreateBadgeProps = CreateCredentialProps & {
  image: string;
  badgeName: string;
  issuerName: string;
  criteria: string;
  description: string;
};

/**
 * Credentials Manager, accessible at <account>.credentials
 */
export class CredentialsManager {
  store: StorageSpec<any, any>;
  signer: DidSigner;
  resolver: Resolver;
  sdJwt: SDJwtVcInstance;

  private constructor() {}

  /**
   * INTERNAL ONLY
   *
   * construct a new CredentialsManager
   *
   * @param {Record<string, string>} store
   * @param {DidSigner} signer
   */
  public static build(
    store: StorageSpec<any, any>,
    signer: DidSigner,
    resolver: Resolver
  ): CredentialsManager {
    const credManager = new CredentialsManager();
    credManager.store = store;
    credManager.signer = signer;
    credManager.resolver = resolver;
    credManager.sdJwt = new SDJwtVcInstance({
      signer: async (data: string) => {
        const sign = (await signer.signer(data)) as string;
        return sign;
      },
      signAlg: signer.alg,
      hasher: digest,
      hashAlg: "SHA-256",
      saltGenerator: generateSalt,
    });
    return credManager;
  }

  /**
   * Verify the credential and the proof or origin for a domain
   *
   * @param {Record<string, unknown>} credential
   * @returns Promise<IVerificationResult>
   */

  public async verify(credential: string): Promise<boolean> {
    const result = await verifyCredential(credential, this.resolver).catch(
      (e) => {
        return false;
      }
    );
    if (result === false) return false;
    return true;
  }

  /**
   * Create and issue a new credential
   *
   * @param {CreateSdJwtProps} options
   * @returns {Promise<string>}
   */
  async createSdJwt(props: CreateSdJwtProps): Promise<string> {
    const { body, disclosureFrame, type, recipientDid } = props;
    const frame = {
      _sd: disclosureFrame,
    };
    const credential = await this.sdJwt.issue(
      {
        iss: this.signer.did,
        sub: recipientDid,
        iat: Math.floor(Date.now() / 1000),
        vct: type,
        ...body,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      frame
    );
    console.log(credential);
    return credential;
  }

  /**
   * Create and issue a new credential
   *
   * @param {CreateCredentialProps} options
   * @returns {Promise<string>}
   */

  public async create(options: CreateCredentialProps): Promise<string> {
    const { id, recipientDid, body, type } = options;

    const vcIssuer = {
      did: this.signer.did,
      signer: this.signer.signer,
      alg: this.signer.alg,
      kid: this.signer.kid,
    };
    const types = Array.isArray(type) ? [...type] : [type];

    const credential: JwtCredentialPayload = {
      sub: recipientDid,
      nbf: Math.floor(Date.now() / 1000),
      id,
      vc: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential", ...types],
        id,
        credentialSubject: {
          ...body,
        },
      },
    };
    if (options.expiryDate) credential.exp = options.expiryDate;

    const jwt = await createVerifiableCredentialJwt(credential, vcIssuer);

    return jwt;
  }

  /**
   * Create and issue a new badge
   *
   * @param {CreateBadgeProps} options
   * @returns {Promise<string>}
   */

  public async createBadge(options: CreateBadgeProps): Promise<string> {
    const {
      id,
      recipientDid,
      body,
      type,
      image,
      issuerName,
      criteria,
      description,
    } = options;

    const vcIssuer = {
      did: this.signer.did,
      signer: this.signer.signer,
      alg: this.signer.alg,
      kid: this.signer.kid,
    };
    const credential: JwtCredentialPayload = {
      sub: recipientDid,
      nbf: Math.floor(Date.now() / 1000),
      id,
      vc: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://purl.imsglobal.org/spec/ob/v3p0/schema/json/ob_v3p0_achievementcredential_schema.json",
        ],
        type: ["VerifiableCredential", "OpenBadgeCredential"],
        id,
        name: type,
        issuer: {
          id: this.signer.did,
          type: ["Profile"],
          name: issuerName,
        },
        issuanceDate: new Date(Date.now()).toISOString(),
        credentialSubject: {
          type: ["AchievementSubject"],
          achievement: {
            id: id,
            type: "",
            criteria: {
              narrative: criteria,
            },
            name: type,
            description: description,
            image: {
              id: image,
              type: "Image",
            },
            ...body,
          },
        },
      },
    };

    if (options.expiryDate) credential.exp = options.expiryDate;

    const validator = new Validator();
    const result = validator.validate(credential.vc, OpenBadgeSchema);
    if (result.errors.length > 0) throw new Error("Schema Validation Failed");
    const jwt = await createVerifiableCredentialJwt(credential, vcIssuer);

    return jwt;
  }
}
