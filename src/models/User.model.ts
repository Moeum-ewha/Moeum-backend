import { Optional } from "sequelize";
import {
  AllowNull,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { Post } from "./Post.model";

export type UserAttribs = {
  id: number;
  email: string;
  username: string;
  password: string;
  salt: string;
  createdAt: string;
  posts?: Post[];
};

export type UserCAttribs = Optional<UserAttribs, "id" | "createdAt">;

export type UserResponse = Pick<UserAttribs, "id" | "email" | "username">;

@Table({
  modelName: "User",
  tableName: "users",
  timestamps: true, // createdAt, updatedAt 자동생성
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class User extends Model<UserAttribs, UserCAttribs> {
  @Unique("users.email")
  @AllowNull(false)
  @Column(DataType.STRING(256))
  email!: UserAttribs["email"];

  @Unique("users.username")
  @AllowNull(false)
  @Column(DataType.STRING(36))
  username!: UserAttribs["username"];

  @AllowNull(false)
  @Column(DataType.CHAR(128))
  password!: UserAttribs["password"];

  @AllowNull(false)
  @Column(DataType.CHAR(64))
  salt!: UserAttribs["salt"];

  @HasMany(() => Post, { foreignKey: "createdById" })
  posts: UserAttribs["posts"];

  toResponse(): UserResponse {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
    };
  }
}
