import { IdentityManager } from "../../identity-manager";
import { IdentityAccount } from "../../NetworkAdapter/IdentityAccount";
import { ManagerProps } from "../test";
import { generateRandomString } from "../test-utils/random";

let didAccount: IdentityAccount;

const vcs = [];

export function DIDSuite(getProps: () => ManagerProps) {
  return () => {
    test("Get DID Tag", async () => {
      const { manager, idStore } = getProps();
      const did = await manager.createDid({
        alias: generateRandomString(),
        method: "jwk",
        store: idStore,
      });
      didAccount = did;
      expect(did.getDid()).toBeDefined();
    });

    test("Get DID Document", async () => {
      const { manager, idStore } = getProps();
      const did = await manager.createDid({
        alias: generateRandomString(),
        method: "jwk",
        store: idStore,
      });
      expect(did.getDocument()).toBeDefined();
    });

    test("Create Verifiable Presentation", async () => {
      const vp = await didAccount.createPresentation(vcs);
      expect(vp.presentationJwt).toBeDefined();
    });
  };
}
