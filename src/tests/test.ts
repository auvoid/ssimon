import { IdentityManager, StorageSpec } from "../index";
import { DidJwkAdapter } from "../../../jwk-identity-adapter/src";
import { getDidJwkResolver } from "@sphereon/did-resolver-jwk";
import { Resolver } from "did-resolver";
import {
  constructFileStore,
  createFolderIfNotExists,
  testDirPath,
} from "./test-utils/fs";
import path from "path";
import { ManagerSuite } from "./suites/manager";
import { DIDSuite } from "./suites/did";
import { CredentialsSuite } from "./suites/credentials";

let manager: IdentityManager;
let managerStore: StorageSpec<any, any>;
let idStore: StorageSpec<any, any>;

export type ManagerProps = {
  manager: IdentityManager;
  idStore: StorageSpec<any, any>;
  managerStore: StorageSpec<any, any>;
};

function getManagerParams(): ManagerProps {
  return {
    manager,
    idStore,
    managerStore,
  };
}

async function initIdentityManager() {
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
    adapters: [DidJwkAdapter],
    resolver: new Resolver({ ...getDidJwkResolver() }),
  });
}

beforeAll(() => {
  return initIdentityManager();
});

describe("IdentityManager Tests", ManagerSuite(getManagerParams));
describe("DID Tests", DIDSuite(getManagerParams));
describe("Credential Tests", CredentialsSuite(getManagerParams));
