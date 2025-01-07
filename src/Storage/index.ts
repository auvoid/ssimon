/**
 * SPECIFICATION
 *
 * Baseline Storage Specification, used for storing and managing secrets and
 * credentials
 */

export declare class StorageSpec<T, K> {
  /**
   * Build a new storage driver
   *
   * @param {...any[]} props
   * @returns Promise<StorageSpec>
   */

  public static build<T, K>(...props: any[]): Promise<StorageSpec<T, K>>;

  /**
   * Create a new entry in the storage
   *
   * @param body
   * @returns Promise<K>
   */

  public create(body: T): Promise<K>;

  /**
   * Find one entry in the storage using partial of K
   *
   * @param {Partial<K>} options
   * @returns Promise<K>
   */

  public findOne(options: Partial<K>): Promise<K>;

  /**
   * Find many entities in the storage using partial of K
   *
   * @param {Partial<K>} options
   * @returns Promise<K[]>
   */

  public findMany(options: Partial<K>): Promise<K[]>;

  /**
   * Find one entry in the storage using partial of K and update
   *
   * @param {Partial<T>} searchParams
   * @param {Partial<K>} body
   * @returns Promise<K>
   */

  public findOneAndUpdate(
    searchParams: Partial<T>,
    body: Partial<K>
  ): Promise<K>;

  /**
   * Find one entry in the storage using partial of T and delete
   *
   * @param {Partial<T>} searchParams
   * @returns Promise<K>
   */

  public findOneAndDelete(searchParams: Partial<T>): Promise<K>;
}
