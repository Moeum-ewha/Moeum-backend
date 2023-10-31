import { pbkdf2, randomBytes } from "node:crypto";
import * as jose from "jose";
import { readFile } from "fs/promises";
import ServerError from "./error";
import { Request } from "express";
import { User } from "../models/User.model";
import isInt from "validator/es/lib/isInt";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type HashResult = {
  derivedKey: string; // length: 128
  salt: string; // length: 64
};

export default class AuthService {
  static COOKIE_ACCESS_NAME = "access-token";
  static COOKIE_REFRESH_NAME = "refresh-token";
  static COOKIE_ACCESS_MAXAGE = 2 * HOUR;
  static COOKIE_REFRESH_MAXAGE = 30 * DAY;
  static JWT_ACCESS_PRIVATE_KEY: jose.KeyLike;
  static JWT_ACCESS_PUBLIC_KEY: jose.KeyLike;
  static JWT_REFRESH_PRIVATE_KEY: jose.KeyLike;
  static JWT_REFRESH_PUBLIC_KEY: jose.KeyLike;
  static JWT_ACCESS_EXPIRES = "2h";
  static JWT_REFRESH_EXPIRES = "30d";
  static JWT_ALGORITHM = "ES256";
  static JWT_ISSUER = "ewha-moeum";

  public static async renewAccessToken(req: Request) {
    let refreshToken: string | null;
    let payload: jose.JWTPayload | null;

    try {
      refreshToken = req.cookies?.[this.COOKIE_REFRESH_NAME];

      if (!refreshToken || typeof refreshToken !== "string") {
        throw new Error();
      }

      const idx = refreshToken.indexOf("Bearer ");
      if (idx !== 0) {
        throw new Error();
      }

      refreshToken = refreshToken.slice(7);
      if (!refreshToken) {
        throw new Error();
      }

      payload = await this.verifyToken(refreshToken, "refresh");

      if (!payload?.sub) {
        throw new Error();
      }

      // accessToken 재발급
      const newAccessToken = await this.generateToken(
        Number.parseInt(payload.sub),
        "access",
      );
      return newAccessToken;
    } catch (error) {
      // accessToken 확인에 실패하면 refreshToken 확인을 시도함
      return null;
    }
  }

  // Access 토큰이 제대로 들어있으면 유저를 돌려줌 (Refresh 토큰은 신경 안씀.)
  public static async authenticate(
    req: Request,
    newAccessToken?: string | null,
  ): Promise<User | null> {
    let accessToken: string | null;
    let payload: jose.JWTPayload | null;

    try {
      accessToken = newAccessToken || req.cookies?.[this.COOKIE_ACCESS_NAME];

      if (!accessToken || typeof accessToken !== "string") {
        throw new Error();
      }

      const idx = accessToken.indexOf("Bearer ");
      if (idx !== 0) {
        throw new Error();
      }

      accessToken = accessToken.slice(7);
      if (!accessToken) {
        throw new Error();
      }

      payload = await this.verifyToken(accessToken, "access");

      if (!payload) {
        throw new Error();
      }
    } catch (error) {
      // accessToken 확인에 실패하면 refreshToken 확인을 시도함
      return null;
    }

    const userId = payload.sub;
    if (!userId || !isInt(userId)) {
      throw new ServerError("AUTH__INVALID_SUB", 401);
    }

    return await User.findByPk(userId);
  }

  // getTokenCookie(req)에서 나온 쿠키가 유효한 토큰인지 확인
  public static async verifyToken(
    token: string | null | undefined,
    tokenType: "access" | "refresh",
  ) {
    if (!token) {
      return null;
    }

    if (tokenType === "access" && !this.JWT_ACCESS_PUBLIC_KEY) {
      return null;
    }

    if (tokenType === "refresh" && !this.JWT_REFRESH_PUBLIC_KEY) {
      return null;
    }

    try {
      const JWT_PUBLIC_KEY =
        tokenType === "access"
          ? this.JWT_ACCESS_PUBLIC_KEY
          : this.JWT_REFRESH_PUBLIC_KEY;

      const { payload } = await jose.jwtVerify(token, JWT_PUBLIC_KEY, {
        algorithms: [this.JWT_ALGORITHM],
        issuer: this.JWT_ISSUER,
        clockTolerance: 10,
      });

      if (payload.type === tokenType) return payload;
      else return null;
    } catch (error) {
      return null;
    }
  }

  public static async loadKeys() {
    // 비대칭 암호화 (Asymmetric Encrypotion)
    // Public Key: Token 서명이 유효한지 확인할 때
    // Private key: Token 서명을 만들 때

    // Read private key (for access token) from file
    const privateAccessKeyFile = await readFile("keys/private.access.ec.key", {
      encoding: "utf-8",
    });
    this.JWT_ACCESS_PRIVATE_KEY = await jose.importPKCS8(
      privateAccessKeyFile,
      this.JWT_ALGORITHM,
    );

    // Read public key (for access token) from file
    const publicAccessKeyFile = await readFile("keys/public.access.ec.pem", {
      encoding: "utf-8",
    });
    this.JWT_ACCESS_PUBLIC_KEY = await jose.importSPKI(
      publicAccessKeyFile,
      this.JWT_ALGORITHM,
    );

    // Read private key (for refresh token) from file
    const privateRefreshKeyFile = await readFile(
      "keys/private.refresh.ec.key",
      {
        encoding: "utf-8",
      },
    );
    this.JWT_REFRESH_PRIVATE_KEY = await jose.importPKCS8(
      privateRefreshKeyFile,
      this.JWT_ALGORITHM,
    );

    // Read public key (for refresh token) from file
    const publicRefreshKeyFile = await readFile("keys/public.refresh.ec.pem", {
      encoding: "utf-8",
    });
    this.JWT_REFRESH_PUBLIC_KEY = await jose.importSPKI(
      publicRefreshKeyFile,
      this.JWT_ALGORITHM,
    );
  }

  public static async generateToken(
    userId: number | undefined,
    tokenType: "access" | "refresh",
  ) {
    if (!userId) {
      throw new ServerError("AUTH__INVALID_USER", 401);
    }

    // SignJWT는 클래스임. 따라서 signJWT라는 인스턴스를 만듦.
    // 표준 페이로드는 다 set함수로 집어넣음.
    const signJWT = new jose.SignJWT({ type: tokenType }); // 표준 아닌 payload를 객체 안에 작성
    signJWT.setIssuedAt();
    signJWT.setExpirationTime(
      tokenType === "access"
        ? this.JWT_ACCESS_EXPIRES
        : this.JWT_REFRESH_EXPIRES,
    );
    signJWT.setSubject(String(userId));
    signJWT.setIssuer(this.JWT_ISSUER);
    signJWT.setJti(randomBytes(16).toString("hex")); // JWT ID

    // 헤더와 페이로드, 시크릿으로 signiture을 만드는 것이 sign의 본래 의미
    // 라이브러리에서는 signJWT메소드에서 signiture을 만들고 페이로드 뒤에 붙여주는 작업까지 진행함
    const token = await signJWT.sign(
      tokenType === "access"
        ? this.JWT_ACCESS_PRIVATE_KEY
        : this.JWT_REFRESH_PRIVATE_KEY,
    );
    return token;
  }

  public static hashPassword = (password: string, _salt?: string) => {
    return new Promise<HashResult>((resolve, reject) => {
      const secret = Buffer.from(password, "utf-8"); // password를 utf-8방식으로 인코딩해서 Buffer(메모리에 접근할 수 있는 객체)에 저장해라
      const salt = _salt ? Buffer.from(_salt, "hex") : randomBytes(32);

      pbkdf2(secret, salt, 600000, 64, "sha256", (err, derivedKey) => {
        if (err) return reject(err);

        resolve({
          derivedKey: derivedKey.toString("hex"), // 2진수를 16진수로 디코딩해서 derivedKey에 저장
          salt: salt.toString("hex"),
        });
      });
    });
  };
}
