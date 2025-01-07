import { StorageSpec } from "..";
import { IdentityConfig } from "../../identity-manager.types";
import { IGenericStoreProps } from "./index.types";
import { decryptWithAES, encryptWithAES } from "../../utils/crypto";

/**
 * An encrypted store implementation which can take any reader and writer function
 * and create a generic store, which store everything with AES cipher based encryption
 */

export class GenericStore<T extends IdentityConfig>
  implements StorageSpec<T, T>
{
  path: string;
  password: string;
  writer: (body: any) => Promise<void>;
  reader: () => Promise<string>;

  /**
   * Create a new generic store with a generic reader and writer function, the
   * reader and writer can be FS, DB or anything else you fancy
   *
   * @param {IGenericStoreProps} props
   */

  constructor(props: IGenericStoreProps) {
    this.path = props.path;
    this.password = props.password;
    this.writer = props.writer;
    this.reader = props.reader;
    if (props.build) props.build();
  }

  /**
   * Get all the contents in the store location specified and decrypt them
   *
   * @returns Promise<T[]>
   */

  private async _getFileContents(): Promise<T[]> {
    let decrypted: string;
    try {
      const raw = await this.reader();
      decrypted = decryptWithAES(raw.toString(), this.password);
    } catch (error) {
      throw new Error("Incorrect Password");
    }
    return JSON.parse(decrypted);
  }

  /**
   * write to raw file and encrypt the file data
   *
   * @param {Record<string, any>} data
   */

  private async _writeFileContents(data: Record<string, any>) {
    const encrypted = encryptWithAES(JSON.stringify(data), this.password);
    await this.writer(encrypted);
  }

  /**
   * Create a new data entry
   *
   * @param {T} body
   * @returns Promise<T>
   */

  public async create(body: T): Promise<T> {
    const entities = await this._getFileContents();
    const data = [...entities, body];
    await this._writeFileContents(data);
    return body;
  }

  /**
   * Find one entry in the storage using partial of T
   *
   * @param {Partial<T>} options
   * @returns Promise<T>
   */

  public async findOne(options: Partial<T>): Promise<T> {
    const entities = await this._getFileContents();
    return entities.find((e) => {
      let matches = 0;
      for (const key of Object.keys(options)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (e[key] === options[key] || !options[key]) matches++;
      }
      return matches === Object.keys(options).length;
    });
  }

  /**
   * Find many entities in the storage using partial of T
   *
   * @param {Partial<T>} options
   * @returns Promise<T[]>
   */

  public async findMany(options: Partial<T>): Promise<T[]> {
    const entities = await this._getFileContents();
    return entities.filter((e) => {
      let matches = 0;
      for (const key of Object.keys(options)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (e[key] === options[key]) matches++;
      }
      return matches === Object.keys(options).length;
    });
  }

  /**
   * Find one entry in the storage using partial of T and delete
   *
   * @param {Partial<T>} searchParams
   * @returns Promise<T>
   */

  public async findOneAndDelete(searchParams: Partial<T>): Promise<T> {
    const entities = await this._getFileContents();
    const match = await this.findOne(searchParams);
    if (!match) throw new Error("DID not found");
    const filtered = entities.filter((e) => {
      let matches = 0;
      for (const key of Object.keys(searchParams)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (e[key] === options[key]) matches++;
      }
      return matches !== Object.keys(searchParams).length;
    });
    await this._writeFileContents(filtered);
    return match;
  }

  /**
   * Find one entry in the storage using partial of T and update
   *
   * @param {Partial<T>} searchParams
   * @param {Partial<K>} body
   * @returns Promise<K>
   */

  public async findOneAndUpdate(
    searchParams: Partial<T>,
    body: Partial<T>
  ): Promise<T> {
    const entities = await this._getFileContents();
    const match = await this.findOne(searchParams);
    if (!match) throw new Error("DID not found");
    const filtered = entities.filter((e) => {
      let matches = 0;
      for (const key of Object.keys(searchParams)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (e[key] === searchParams[key]) matches++;
      }
      return matches !== Object.keys(searchParams).length;
    });
    for (const key of Object.keys(body)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      match[key] = body[key] ?? match[key];
    }
    await this._writeFileContents([...filtered, match]);
    return match;
  }
}
