import { encryptWithAES, GenericStore, IdentityManager } from "../index";
import { DidJwkAdapter } from "../../../jwk-identity-adapter/src";
import { getDidJwkResolver } from "@sphereon/did-resolver-jwk";
import { Resolver } from "did-resolver";

import { readFile, writeFile } from "fs/promises";

const constructFileStore = ({
  path,
  password,
}: {
  path: string;
  password: string;
}) => {
  /**
   * FS writer
   */
  const writer = async (body: string) => {
    await writeFile(path, body);
  };

  /**
   * FS Reader
   */
  const reader = async () => {
    const data = await readFile(path).catch(async (e) => {
      if (e.code === "ENOENT") {
        const encryptedEmptyArray = encryptWithAES("[]", password);
        await writer(encryptedEmptyArray);
        return encryptedEmptyArray;
      }
      throw new Error();
    });

    return data.toString();
  };

  /**
   * Construct a new FS Store and return
   */

  const store = new GenericStore({ path, password, reader, writer });
  return store;
};

async function run() {
  const idStore = constructFileStore({ path: "./", password: "pass" });
  const managerStore = constructFileStore({
    path: "./manager",
    password: "pass",
  });
  const resolver = new Resolver({ ...getDidJwkResolver() });
  const manager = await IdentityManager.build({
    adapters: [DidJwkAdapter],
    resolver,
    storage: managerStore,
  });
  const did = await manager.createDid({
    alias: "doge",
    store: idStore,
    method: "jwk",
  });
  console.log(did);
}

run();
