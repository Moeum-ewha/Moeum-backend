import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Friend } from "./Friend.model";
import { Post } from "./Post.model";

export type FriendPostAttribs = {
  friendId: number;
  postId: number;
};

@Table({
  modelName: "FriendPost",
  tableName: "friendPosts",
  timestamps: false, // createdAt, updatedAt 자동생성
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class FriendPost extends Model<FriendPostAttribs> {
  @ForeignKey(() => Friend)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  friendId!: FriendPostAttribs["friendId"];

  @ForeignKey(() => Post)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  postId!: FriendPostAttribs["postId"];
}
