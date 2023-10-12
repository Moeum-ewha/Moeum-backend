import { pbkdf2, randomBytes } from "node:crypto";
import * as jose from "jose";
import { readFile } from "fs/promises";
import ServerError from "./error";

const HOUR = 60 * 60 * 1000;

type HashResult = {
  derivedKey: string; // length: 128
  salt: string; // length: 64
};

export default class AuthService {
  static COOKIE_NAME = "access-token";
  static COOKIE_MAXAGE = 2 * HOUR;
  static JWT_PRIVATE_KEY: jose.KeyLike;
  static JWT_PUBLIC_KEY: jose.KeyLike;
  static JWT_ALGORITHM = "ES256";
  static JWT_EXPIRES = "2h";
  static JWT_ISSUER = "ewha-moeum";

  public static async loadKeys() {
    // 비대칭 암호화 (Asymmetric Encrypotion)
    // Public Key: Token 서명이 유효한지 확인할 때
    // Private key: Token 서명을 만들 때

    // Read private key from file
    const privateKeyFile = await readFile("keys/private.ec.key", {
      encoding: "utf-8",
    });
    this.JWT_PRIVATE_KEY = await jose.importPKCS8(
      privateKeyFile,
      this.JWT_ALGORITHM,
    );

    // Read public key from file
    const publicKeyFile = await readFile("keys/public.ec.pem", {
      encoding: "utf-8",
    });
    this.JWT_PUBLIC_KEY = await jose.importSPKI(
      publicKeyFile,
      this.JWT_ALGORITHM,
    );
  }

  public static async generateToken(userId: number | undefined) {
    if (!userId) {
      throw new ServerError("AUTH__INVALID_USER", 401);
    }

    // SignJWT는 클래스임. 따라서 signJWT라는 인스턴스를 만듦.
    // 표준 페이로드는 다 set함수로 집어넣음.
    const signJWT = new jose.SignJWT({ type: "access" }); // 표준 아닌 payload를 객체 안에 작성
    signJWT.setIssuedAt();
    signJWT.setExpirationTime(this.JWT_EXPIRES);
    signJWT.setSubject(String(userId));
    signJWT.setIssuer(this.JWT_ISSUER);
    signJWT.setJti(randomBytes(16).toString("hex")); // JWT ID

    // 헤더와 페이로드, 시크릿으로 signiture을 만드는 것이 sign의 본래 의미
    // 라이브러리에서는 signJWT메소드에서 signiture을 만들고 페이로드 뒤에 붙여주는 작업까지 진행함
    const token = await signJWT.sign(this.JWT_PRIVATE_KEY);
    return token;
  }

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
