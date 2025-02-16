import { AccessToken } from "@/zdrofit/types/login";
import { promises as fs } from "fs";

export class AccessTokenStorage {
  private readonly storageFilePath = "accessToken.json";

  async getToken(): Promise<AccessToken> {
    const data = await fs.readFile(this.storageFilePath, "utf8");
    return JSON.parse(data) as AccessToken;
  }

  async setToken(token: AccessToken): Promise<void> {
    // Save the token to the file
    const data = JSON.stringify(token);
    await fs.writeFile(this.storageFilePath, data, "utf8");
  }
}
