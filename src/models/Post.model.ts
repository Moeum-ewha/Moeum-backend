import { Optional } from "sequelize";
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import ServerError from "../services/error";
import { User, UserAttribs, UserResponse } from "./User.model";
import { Comment, CommentResponse } from "./Comment.model";
import { Friend } from "./Friend.model";
import { FriendPost } from "./FriendPost.model";

export type PostAttribs = {
  id: number;
  content: string;
  takenAt: Date;
  location: string;
  latitude: number;
  longitude: number;
  imgPath: string;
  createdAt: Date;
  createdBy?: User; // 모델에만 존재, 실제 데이터베이스 Column에는 없음.
  createdById: UserAttribs["id"];
  comments?: Comment[];
  friends: Friend[];
};

type PostCAtrribs = Optional<PostAttribs, "id" | "createdAt">;

export type PostResponse = Pick<
  PostAttribs,
  | "id"
  | "content"
  | "takenAt"
  | "location"
  | "latitude"
  | "longitude"
  // "imgPath"???
  | "createdAt"
> & {
  createdBy: UserResponse;
  comments?: CommentResponse[];
};

@Table({
  modelName: "Post",
  tableName: "posts",
  timestamps: true, // createdAt, updatedAt 자동생성
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class Post extends Model<PostAttribs, PostCAtrribs> {
  @AllowNull(false)
  @Column(DataType.STRING(255))
  content!: PostAttribs["content"]; // sequelize가 확실히 만들어 줄 것이기 때문에 !로 타입스크립트 에러를 없애야 함

  @AllowNull(false)
  @Column(DataType.DATE)
  takenAt!: PostAttribs["takenAt"];

  @AllowNull(false)
  @Column(DataType.STRING)
  location!: PostAttribs["location"];

  @AllowNull(false)
  @Column(DataType.FLOAT)
  latitude!: PostAttribs["latitude"];

  @AllowNull(false)
  @Column(DataType.FLOAT)
  longitude!: PostAttribs["longitude"];

  @AllowNull(false)
  @Column(DataType.STRING)
  imgPath!: PostAttribs["imgPath"];

  // @ForeignKey(() => User)
  // @Column(DataType.INTEGER)
  // createdById!: PostAttribs['createdById'];

  @BelongsTo(() => User, { foreignKey: "createdById" }) // 두 번째 인자는 외래 키 column의 이름
  createdBy: PostAttribs["createdBy"]; // post.createdBy를 사용할 일이 많아서 쓰는 것(JOIN하는 역할)

  @HasMany(() => Comment, { foreignKey: "postId" })
  comments: PostAttribs["comments"];

  @BelongsToMany(() => Friend, () => FriendPost)
  friends!: PostAttribs["friends"];

  toResponse(): PostResponse {
    const createdBy = this.createdBy;
    if (!createdBy) throw new ServerError("POST__USER_NOT_INCLUDED", 500);

    let comments = this.comments; // comments, [], undefined 3가지 경우의 수

    return {
      id: this.id,
      content: this.content,
      takenAt: this.takenAt,
      location: this.location,
      latitude: this.latitude,
      longitude: this.longitude,
      createdAt: this.createdAt,
      createdBy: createdBy.toResponse(),
      comments: comments?.map((comment) => comment.toResponse()),
    };
  }
}
