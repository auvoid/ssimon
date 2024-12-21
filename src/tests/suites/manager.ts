import { IdentityManager } from "../../identity-manager";
import { ManagerProps } from "../test";
import { generateRandomString } from "../test-utils/random";

let manager: IdentityManager;
let didOneAlias: string;
let didTag: string;

export function ManagerSuite(getProps: () => ManagerProps) {
  return () => {
    test("Manager Initialises", async () => {
      const { manager: idManager } = getProps();
      manager = idManager;
      expect(manager).toBeDefined();
    });

    test("Create a DID", async () => {
      const { idStore } = getProps();
      didOneAlias = generateRandomString();
      const did = await manager.createDid({
        alias: didOneAlias,
        method: "jwk",
        store: idStore,
      });
      expect(did).toBeDefined();
      didTag = did.getDid();
    });

    test("Throw on Duplicate DID", async () => {
      const { idStore } = getProps();
      const did = async () => {
        await manager.createDid({
          alias: didOneAlias,
          method: "jwk",
          store: idStore,
        });
      };

      await expect(did()).rejects.toThrow();
    });

    test("Get DID", async () => {
      const { idStore } = getProps();
      const did = await manager.getDid({
        alias: didOneAlias,
        store: idStore,
      });
      expect(didTag).toEqual(did.getDid());
    });
  };
}
