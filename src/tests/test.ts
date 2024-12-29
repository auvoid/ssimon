import { IdentityManager, StorageSpec } from "../index";
import { DidJwkAdapter } from "@tanglelabs/jwk-identity-adapter";
import { DidKeyAdapter } from "../../../key-identity-adapter/src/index";
import { DidWebAdapter } from "../../../web-identity-adapter/src";
import {
  DidIotaAdapter,
  IotaResolver,
} from "../../../iota-identity-adapter/src";
import { getDidJwkResolver } from "@sphereon/did-resolver-jwk";
import { Resolver } from "did-resolver";
import {
  constructFileStore,
  createFolderIfNotExists,
  cleanUpTestStores,
  testDirPath,
} from "./test-utils/fs";
import path, { dirname } from "path";
import { ManagerSuite } from "./suites/manager";
import { DIDSuite } from "./suites/did";
import { CredentialsSuite } from "./suites/credentials";
import * as KeyResolver from "key-did-resolver";
import * as WebResolver from "web-did-resolver";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  createFolderIfNotExists();
  managerStore = constructFileStore({
    path: path.join(testDirPath, "./manager"),
    password: "password",
  });
  idStore = constructFileStore({
    path: path.join(testDirPath, "./id"),
    password: "password",
  });
  manager = await IdentityManager.build({
    storage: managerStore,
    adapters: [DidJwkAdapter, DidKeyAdapter, DidWebAdapter, DidIotaAdapter],
    resolver: new Resolver({
      ...KeyResolver.getResolver(),
      ...getDidJwkResolver(),
      ...WebResolver.getResolver(),
      ...IotaResolver.getResolver(),
    }),
  });
  return { manager };
}

beforeEach(() => {
  return initIdentityManager();
});
// afterEach(() => {
//   // return cleanUpTestStores();
// });
//
describe("IdentityManager Tests", ManagerSuite(getManagerParams));
describe("DID Tests", DIDSuite(getManagerParams));
describe("Credential Tests", CredentialsSuite(getManagerParams));
