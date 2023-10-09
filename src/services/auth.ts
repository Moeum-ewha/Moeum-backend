import { pbkdf2, randomBytes } from "node:crypto";

type HashResult = {
  derivedKey: string; // length: 128
  salt: string; // length: 64
};

export default class AuthService {
  public static hashPassword = (password: string, _salt?: string) => {
    return new Promise<HashResult>((resolve, reject) => {
      const secret = Buffer.from(password, "utf-8");
      const salt = _salt ? Buffer.from(_salt, "hex") : randomBytes(32);

      pbkdf2(secret, salt, 600000, 64, "sha256", (err, derivedKey) => {
        if (err) return reject(err);

        resolve({
          derivedKey: derivedKey.toString("hex"),
          salt: salt.toString("hex"),
        });
      });
    });
  };
}
