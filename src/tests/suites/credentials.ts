import { IdentityAccount } from "../../NetworkAdapter/IdentityAccount";
import { ManagerProps } from "../test";
import * as didJWT from "did-jwt";

let did: IdentityAccount;
let vcJwt: string;
let sdJwt: string;
let badgeJwt: string;

export function CredentialsSuite(getProps: () => ManagerProps) {
  return () => {
    test("Create VC", async () => {
      const { manager, idStore, seed } = getProps();
      did = await manager.createDid({
        alias: "staging.did.auvo.io",
        method: "jwk",
        store: idStore,
      });
      const vc = await did.credentials.create({
        recipientDid: "did:web:did.auvo.io",
        body: {
          test: "test",
        },
        type: ["Doge"],
        id: "https://example.com/12313",
      });
      vcJwt = vc;
      expect(vc).toBeDefined();
    });

    test("Create a Badge", async () => {
      const badge = await did.credentials.createBadge({
        recipientDid: "did:web:did.auvo.io",
        body: {
          test: "test",
        },
        type: "TestCredential",
        id: "https://example.com/12313",
        description: "asf",
        criteria: "af",
        image: "https://example.com",
        badgeName: "doge",
        issuerName: "doggity",
      });
      badgeJwt = badge;
      expect(badge).toBeDefined();
    });

    test("Create SD-JWT", async () => {
      const sd = await did.credentials.createSdJwt({
        type: "Doge",
        recipientDid: "did:web:did.auvo.io",
        disclosureFrame: ["ginjo"],
        body: {
          panja: "ding",
          ginjo: "dingg",
        },
      });
      sdJwt = sd;
      expect(sd).toBeDefined();
    });

    test("Verify SD-JWT", async () => {
      const result = await didJWT.verifyJWT(sdJwt.split("~")[0], {
        resolver: did.credentials.resolver,
      });
      expect(result.verified).toEqual(true);
    });

    test("Verify Credential", async () => {
      const result = await did.credentials.verify(vcJwt);
      expect(result).toEqual(true);
    });

    test("Verify Badge", async () => {
      const result = await did.credentials.verify(badgeJwt);
      expect(result).toEqual(true);
    });

    test("Tampered Credential Fails Verification", async () => {
      const result = await did.credentials.verify(vcJwt + "32");
      expect(result).toEqual(false);
    });
  };
}
