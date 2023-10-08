import { Optional } from "sequelize";
import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  Unique,
} from "sequelize-typescript";

export type UserAttribs = {
  id: string;
  email: string;
  username: string;
  password: string;
  salt: string;
  createdAt: string;
  // posts?: Post[];
};

export type UserCAttribs = Optional<UserAttribs, "id" | "createdAt">;

export type UserResponse = Pick<UserAttribs, "id" | "email" | "username">;

export class User extends Model<UserAttribs, UserCAttribs> {
  @Unique("users.email")
  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: UserAttribs["email"];

  @Unique("users.username")
  @AllowNull(false)
  @Column(DataType.STRING(36))
  username!: UserAttribs["username"];

  @AllowNull(false)
  @Column(DataType.CHAR(128))
  password!: UserAttribs["password"];

  @AllowNull(false)
  @Column(DataType.CHAR(32))
  salt!: UserAttribs["salt"];

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column(DataType.DATE)
  createdAt!: UserAttribs["createdAt"];

  // Post모델이랑 HasMany 만들어야 함

  toResponse(): UserResponse {
    return {
      id: this.get("id"),
      email: this.get("email"),
      username: this.get("username"),
    };
  }
}
