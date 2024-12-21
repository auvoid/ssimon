import { Resolver } from "did-resolver";
import { IdentityAccount } from "../../NetworkAdapter/IdentityAccount";
import { ManagerProps } from "../test";
import { generateRandomString } from "../test-utils/random";
import * as didJWT from "did-jwt";
import { getDidJwkResolver } from "@sphereon/did-resolver-jwk";

let did: IdentityAccount;
let vcJwt: string;
let sdJwt: string;
let badgeJwt: string;

export function CredentialsSuite(getProps: () => ManagerProps) {
  return () => {
    test("Create VC", async () => {
      const { manager, idStore } = getProps();
      did = await manager.createDid({
        alias: generateRandomString(),
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
        resolver: new Resolver({ ...getDidJwkResolver() }),
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
