import { ensureFile, readJSON, writeJSON } from "fs-extra";
import path from "path";

export class JsonDataStore<T> {
  private readonly filePath: string;

  constructor(relativePath: string, private readonly defaults: T) {
    this.filePath = path.resolve(process.cwd(), relativePath);
  }

  private async ensureInitialized() {
    await ensureFile(this.filePath);
    try {
      await readJSON(this.filePath);
    } catch (error) {
      await writeJSON(this.filePath, this.defaults, { spaces: 2 });
    }
  }

  async get(): Promise<T> {
    await this.ensureInitialized();
    return readJSON(this.filePath);
  }

  async set(data: T): Promise<void> {
    await this.ensureInitialized();
    await writeJSON(this.filePath, data, { spaces: 2 });
  }
}
