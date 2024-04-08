import { StorageSpec } from "../../Storage/index.types";

export interface IVerificationResult {
  vc: boolean;
  dvid: boolean;
}

export type CreateCredentialProps = {
  id: string;
  recipientDid: string;
  body: Record<string, unknown>;
  type: string | string[];
  keyIndex: number;
  expiryDate?: number;
  extras?: Record<string, unknown>;
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
export declare class CredentialsManager<
  T extends StorageSpec<Record<string, any>, any>
> {
  store: T;

  /**
   * INTERNAL ONLY
   *
   * construct a new CredentialsManager
   *
   * @param {...any[]} props
   */
  public static build<T extends StorageSpec<any, any>>(
    ...props: any[]
  ): Promise<CredentialsManager<T>>;

  /**
   * check wether a credential is cryptographically valid or not
   *
   * @param {Record<string, unknown>} credential
   * @returns Promise<boolean>
   */
  public isCredentialValid(
    credential: Record<string, unknown>
  ): Promise<boolean>;

  /**
   * Verify the credential and the proof or origin for a domain
   *
   * @param {Record<string, unknown>} credential
   * @returns Promise<IVerificationResult>
   */

  public verify(
    credential: Record<string, unknown>
  ): Promise<IVerificationResult>;

  /**
   * Create and issue a new credential
   *
   * @param {CreateCredentialProps} options
   * @returns {Promise<Record<string, any>>}
   */

  public create(options: CreateCredentialProps): Promise<Record<string, any>>;

  /**
   * Create and issue a new badge
   *
   * @param {CreateBadgeProps} options
   * @returns {Promise<Record<string, any>>}
   */

  public createBadge(options: CreateBadgeProps): Promise<Record<string, any>>;
}
