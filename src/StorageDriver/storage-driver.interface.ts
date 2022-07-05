export interface IStorageDriver<T> {
  /**
   * Find and return all instanstances of Credentiaks
   */
  findAll: () => Promise<T[]>;

  /**
   * Find and return the first match with a similar partial
   */
  findById: (id: string) => Promise<T>;

  /**
   * Find by credential subject, return all matches
   */
  findByCredentialType: (credType: string) => Promise<T[]>;

  /**
   * Find by issuer, return all matches
   */
  findByIssuer: (issuer: string) => Promise<T[]>;

  /**
   * Save a new credential
   */
  new: (data: T) => Promise<void>;

  /**
   * Delete the first entry that matches the Identifier
   */
  delete: (id: string) => Promise<void>;
}
