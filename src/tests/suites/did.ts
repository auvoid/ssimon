import { IdentityManager } from "../../identity-manager";
import { IdentityAccount } from "../../NetworkAdapter/IdentityAccount";
import { ManagerProps } from "../test";
import { generateRandomString } from "../test-utils/random";

let didAccount: IdentityAccount;
let alias: string;

const vcs: string[] = [
  "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9nZSJdLCJpZCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vMTIzMTMiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJ0ZXN0IjoidGVzdCJ9fSwic3ViIjoiZGlkOndlYjpkaWQuYXV2by5pbyIsIm5iZiI6MTczNDc3NTkyOCwianRpIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS8xMjMxMyIsImlzcyI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpGUXlJc0luZ2lPaUpaZFdodlNrTlRMVU5TUWtoeWNVWlVUREZSV2s1U2FrUkJhVkpHTUdod2NXTkZialZSTFRScE9FMU5JaXdpZVNJNklubFZjRFpLUkhoclUyaHlUVzB0ZDBoNk5WTnVVVGhRVjFSaE1uZFBaazkxTWpCVVNYaHdjWGRIY3pBaUxDSmpjbllpT2lKUUxUSTFOaUo5In0.cejkQgPiY6f3pTKhfkDWoq_LWSrw0Xs143HfYdsCEBH8kp5g49qBr41O8uLE6AtqgAHwh1PX4BaHfEr9p2afOQ",
];

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
      alias = generateRandomString();
      const did = await manager.createDid({
        alias,
        method: "jwk",
        store: idStore,
      });
      expect(did.getDocument()).toBeDefined();
    });

    test("Create Verifiable Presentation", async () => {
      const { manager, idStore } = getProps();
      const did = await manager.getDid({ alias, store: idStore });
      const vp = await did.createPresentation(vcs);
      expect(vp.presentationJwt).toBeDefined();
    });
  };
}
