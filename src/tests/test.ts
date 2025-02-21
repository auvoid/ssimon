import { IdentityManager, StorageSpec } from "../index";
import {
  constructFileStore,
  createFolderIfNotExists,
  cleanUpTestStores,
  testDirPath,
} from "./test-utils/fs";
import * as path from "path";
import { ManagerSuite } from "./suites/manager";
import { DIDSuite } from "./suites/did";
import { CredentialsSuite } from "./suites/credentials";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let manager: IdentityManager;
let managerStore: StorageSpec<any, any>;
let idStore: StorageSpec<any, any>;

export type ManagerProps = {
  manager: IdentityManager;
  idStore: StorageSpec<any, any>;
  managerStore: StorageSpec<any, any>;
  seed?: string;
};

function getManagerParams(): ManagerProps {
  return {
    manager,
    idStore,
    managerStore,
    seed: process.env.IDENTITY_SEED,
  };
}

export async function initIdentityManager() {
  const { Resolver } = await import("did-resolver");
  const { getDidJwkResolver } = await import("@sphereon/did-resolver-jwk");
  createFolderIfNotExists();
  managerStore = constructFileStore({
    path: path.join(testDirPath, "./manager"),
    password: "password",
  });
  const { DidJwkAdapter } = await import("@tanglelabs/jwk-identity-adapter");
  idStore = constructFileStore({
    path: path.join(testDirPath, "./id"),
    password: "password",
  });
  manager = await IdentityManager.build({
    storage: managerStore,
    adapters: [DidJwkAdapter],
    resolver: new Resolver({
      ...getDidJwkResolver(),
    }),
  });
  return { manager };
}

beforeEach(() => {
  return initIdentityManager();
});
afterEach(() => {
  return cleanUpTestStores();
});

describe("IdentityManager Tests", ManagerSuite(getManagerParams));
describe("DID Tests", DIDSuite(getManagerParams));
describe("Credential Tests", CredentialsSuite(getManagerParams));
