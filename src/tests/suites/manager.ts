import { IdentityManager } from "../../identity-manager";
import { ManagerProps } from "../test";
import { generateRandomString } from "../test-utils/random";

let manager: IdentityManager;
let didOneAlias: string = "staging.did.auvo.io";
let didTag: string;

export function ManagerSuite(getProps: () => ManagerProps) {
  return () => {
    test("Manager Initialises", async () => {
      const { manager: idManager } = getProps();
      manager = idManager;
      expect(manager).toBeDefined();
    });

    test("Create a DID", async () => {
      const { idStore, seed } = getProps();
      const did = await manager.getDid({
        alias: didOneAlias,
        store: idStore,
      });
      expect(did).toBeDefined();
      didTag = did.getDid();
    });
  };
}
