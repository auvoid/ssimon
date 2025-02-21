import * as path from "path";
import { IdentityManager } from "../identity-manager";
import {
  constructFileStore,
  createFolderIfNotExists,
  testDirPath,
} from "./test-utils/fs";

export async function initIdentityManager() {
  console.log("gets here");
  const { Resolver } = await import("did-resolver");
  const { getDidJwkResolver } = await import("@sphereon/did-resolver-jwk");
  createFolderIfNotExists();
  const managerStore = constructFileStore({
    path: path.join(testDirPath, "./manager"),
    password: "password",
  });
  const { DidJwkAdapter } = await import("@tanglelabs/jwk-identity-adapter");
  const idStore = constructFileStore({
    path: path.join(testDirPath, "./id"),
    password: "password",
  });
  const manager: IdentityManager = await IdentityManager.build({
    storage: managerStore,
    adapters: [DidJwkAdapter],
    resolver: new Resolver({
      ...getDidJwkResolver(),
    }),
  });

  const did = await manager.createDid({
    alias: "asf332dasdf",
    method: "jwk",
    store: idStore,
  });
  console.log(did.getDid());

  const cred = await did.credentials.create({
    id: "fsfsdf",
    body: { name: "sfd" },
    type: "41212",
    recipientDid: "did:example:fsfd",
  });

  const badge = await did.credentials.createBadge({
    id: "fsfsdf",
    body: { name: "sfd" },
    type: "41212",
    recipientDid: "did:example:fsfd",
    badgeName: "13412",
    criteria: "fsdsef",
    issuerName: "423q44q",
    description: "4323",
    image: "3123",
  });

  const sd = await did.credentials.createSdJwt({
    body: { name: "sfd" },
    type: "41212",
    recipientDid: "did:example:fsfd",
    disclosureFrame: ["name"],
  });

  console.log("normal", cred);
  console.log("badge", badge);
  console.log("sd", sd);

  return { manager };
}

initIdentityManager();
