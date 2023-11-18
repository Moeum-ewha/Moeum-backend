import { Optional } from "sequelize";
import { User, UserAttribs } from "./User.model";
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Post, PostAttribs } from "./Post.model";

export type CommentAttribs = {
  id: number;
  profile: number;
  content: string;
  createdAt: Date;
  createdBy?: User;
  createdById?: UserAttribs["id"];
  post?: Post;
  postId: PostAttribs["id"];
};

type CommentCAttribs = Optional<CommentAttribs, "id" | "createdAt">;

export type CommentResponse = Pick<
  CommentAttribs,
  "id" | "profile" | "content" | "createdAt" | "postId"
>;

@Table({
  modelName: "Comment",
  tableName: "comments",
  timestamps: true, // createdAt, updatedAt 자동생성
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class Comment extends Model<CommentAttribs, CommentCAttribs> {
  @AllowNull(false)
  @Column(DataType.STRING(255))
  profile!: CommentAttribs["profile"];

  @AllowNull(false)
  @Column(DataType.STRING(255))
  content!: CommentAttribs["content"];

  @BelongsTo(() => User, { foreignKey: "createdById" })
  createdBy!: PostAttribs["createdBy"];

  @ForeignKey(() => Post)
  @Column(DataType.INTEGER)
  postId!: CommentAttribs["postId"];

  @BelongsTo(() => Post, { foreignKey: "postId" })
  post!: CommentAttribs["post"];

  toResponse(): CommentResponse {
    return {
      id: this.id,
      profile: this.profile,
      content: this.content,
      createdAt: this.createdAt,
      postId: this.postId,
    };
  }
}
