import { readFile, writeFile } from "fs/promises";
import { GenericStore } from "../../Storage/GenericStore";
import { encryptWithAES } from "../../utils/crypto";
import path from "path";
import { existsSync, mkdirSync, rmSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const testDirPath = path.join(__dirname, "../../../test-stores");

export const createFolderIfNotExists = () => {
  if (!existsSync(testDirPath)) {
    mkdirSync(testDirPath);
  }
};

export const constructFileStore = ({
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

export const cleanUpTestStores = async () => {
  if (existsSync(testDirPath)) {
    // Delete the folder and its contents
    rmSync(testDirPath, { recursive: true, force: true });
  }
};
