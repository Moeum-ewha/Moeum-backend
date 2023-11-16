import { Optional } from "sequelize";
import { Post, PostAttribs, PostResponseSimple } from "./Post.model";
import { User, UserAttribs, UserResponse } from "./User.model";
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { FriendPost } from "./FriendPost.model";
import ServerError from "../services/error";

export type FriendAttribs = {
  id: number;
  friendName: string;
  imgPath: string;
  createdBy?: User;
  createdById: UserAttribs["id"];
  posts?: Post[];
};

export type FriendCAttribs = Optional<FriendAttribs, "id">;

export type FriendResponse = Pick<
  FriendAttribs,
  "id" | "friendName" | "imgPath"
> & { posts: PostResponseSimple[] | undefined };

@Table({
  modelName: "Friend",
  tableName: "friends",
  timestamps: false, // createdAt, updatedAt 자동생성 X
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class Friend extends Model<FriendAttribs, FriendCAttribs> {
  @Unique("user-friend")
  @AllowNull(false)
  @Column(DataType.STRING(255))
  friendName!: FriendAttribs["friendName"];

  @AllowNull(false)
  @Column(DataType.STRING)
  imgPath!: FriendAttribs["imgPath"];

  @Unique("user-friend")
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  createdById!: UserAttribs["id"];

  @BelongsTo(() => User, { foreignKey: "createdById" })
  createdBy: FriendAttribs["createdBy"];

  @BelongsToMany(() => Post, () => FriendPost)
  posts: FriendAttribs["posts"];

  toResponse(): FriendResponse {
    return {
      id: this.id,
      friendName: this.friendName,
      imgPath: this.imgPath,
      posts: this.posts?.map((post) => post.toResponseSimple()),
    };
  }
}
