import {
  IdentityConfig,
  IdentityManagerOptions,
  IdentityManagerSpec,
} from "./identity-manager.types";
import { IdentityAccount } from "./NetworkAdapter/IdentityAccount";
import { CreateDidProps, NetworkAdapter } from "./NetworkAdapter/index.types";
import { StorageSpec } from "./Storage/index.types";

export class IdentityManager<T extends IdentityAccount>
  implements IdentityManagerSpec<T>
{
  networkAdapters: Record<string, NetworkAdapter>;
  storage: StorageSpec<IdentityConfig, IdentityConfig>;

  /**
   * Create a new Identity manager instance
   * store being passed here will be used to store keys and config
   *
   * @param {IdentityManagerOptions} options
   * @returns Promise<IdentityManager>
   */

  public static async build(
    options: IdentityManagerOptions<StorageSpec<any, any>>
  ) {
    const { adapters, storage, resolver } = options;
    const manager = new IdentityManager();
    manager.storage = storage;
    const initializedAdapters = await Promise.all(
      adapters.map(
        async (a) => await a.build({ driver: manager.storage, resolver })
      )
    );
    const networkAdapters: Record<string, NetworkAdapter> = {};
    initializedAdapters.forEach(
      (a) => (networkAdapters[a.getMethodIdentifier()] = a)
    );
    manager.networkAdapters = networkAdapters;
    return manager;
  }

  private _extractDidMethodIdentifier(did: string) {
    const fragments = did.split(":");
    if (fragments.length < 2) throw new Error("Malformed DID");
    const [_, method] = fragments;
    return method;
  }

  private getMethodAdapter(did: string) {
    const method = this._extractDidMethodIdentifier(did);
    if (!Object.keys(this.networkAdapters).includes(method))
      throw new Error("DID Method not supported");
    return this.networkAdapters[method];
  }

  /**
   * Get an existing DID from the storage, by either alias or the did identifier
   * store being passed here is going to be used to store credentials, hence
   * each DID should have a separate store to ensure separation of data
   *
   * @param props {{ did: string, alias: string, store: T }}
   * @returns Promise<IdentityAccount>
   */

  public async getDid<T extends StorageSpec<Record<string, any>, any>>(props: {
    did?: string;
    alias?: string;
    store: T;
  }): Promise<IdentityAccount> {
    const config = await this.storage.findOne({
      did: props.did,
      alias: props.alias,
    });
    if (!config) throw new Error("Unable to find DID");
    const adapter = this.getMethodAdapter(config.did);
    const { identity } = await adapter.deserializeDid(config, props.store);
    return identity;
  }

  /**
   * Create a new DID with a specific alias
   * store being passed here is going to be used to store credentials, hence
   * each DID should have a separate store to ensure separation of data
   *
   * @param {CreateDidProps} props
   * @returns Promise<IdentityAccount>
   */

  public async createDid<T extends StorageSpec<Record<string, any>, any>>(
    props: CreateDidProps<T>
  ): Promise<IdentityAccount> {
    const aliasExists = await this.storage.findOne({ alias: props.alias });
    if (aliasExists) {
      const isTemp = aliasExists.did.split(":")[2].startsWith("TEMP");
      if (!isTemp) throw new Error("Alias already exists");
    }
    await this.storage.create({ alias: props.alias });
    if (!Object.keys(this.networkAdapters).includes(props.method))
      throw new Error("DID Method not supported");
    const adapter = this.networkAdapters[props.method];
    const { identity, seed } = await adapter
      .createDid(props)
      .catch(async (e) => {
        if (e.name === "InsufficientFundsError") {
          await this.storage.findOneAndUpdate(
            { alias: props.alias },
            { seed: e.seed, did: e.did }
          );
        }
        throw e;
      });

    await this.storage.findOneAndUpdate(
      { alias: props.alias },
      { seed, did: identity.getDid() }
    );

    return identity;
  }
}
