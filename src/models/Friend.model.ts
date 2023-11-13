import { Optional } from "sequelize";
import { Post, PostAttribs } from "./Post.model";
import { User, UserAttribs, UserResponse } from "./User.model";
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";
import { FriendPost } from "./FriendPost.model";
import ServerError from "../services/error";

export type FriendAttribs = {
  id: number;
  friendName: string;
  createdBy?: User;
  createdById: UserAttribs["id"];
  posts?: Post[];
};

type FriendCAttribs = Optional<FriendAttribs, "id">;

export type FriendResponse = Pick<
  FriendAttribs,
  "id" | "friendName" | "posts"
> & {
  createdBy: UserResponse;
};

@Table({
  modelName: "Friend",
  tableName: "friends",
  timestamps: false, // createdAt, updatedAt 자동생성 X
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class Friend extends Model<FriendAttribs, FriendCAttribs> {
  @AllowNull(false)
  @Column(DataType.STRING(255))
  friendName!: FriendAttribs["friendName"];

  @BelongsTo(() => User, { foreignKey: "createdById" })
  createdBy: FriendAttribs["createdBy"];

  @BelongsToMany(() => Post, () => FriendPost)
  posts: FriendAttribs["posts"];

  toResponse(): FriendResponse {
    const createdBy = this.createdBy;
    if (!createdBy) throw new ServerError("FRIEND__USER_NOT_INCLUDED", 500);

    return {
      id: this.id,
      friendName: this.friendName,
      createdBy: createdBy.toResponse(),
      posts: this.posts,
    };
  }
}
