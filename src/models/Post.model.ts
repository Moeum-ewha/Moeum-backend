import { Optional } from "sequelize";
import { User, UserAttribs, UserResponse } from "./User.model";
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";

export type PostAttribs = {
  id: number;
  content: string;
  createdAt: Date;
  createdBy: User; // 모델에만 존재, 실제 데이터베이스 Column에는 없음.
  createdById: UserAttribs["id"];
};

type PostCAtrribs = Optional<PostAttribs, "id" | "createdAt" | "createdBy">;

export type PostResponse = Pick<PostAttribs, "id" | "content"> & {
  createdBy: UserResponse;
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

  @BelongsTo(() => User, "createdById")
  createdBy!: PostAttribs["createdBy"];

  toResponse(): PostResponse {
    return {
      id: this.id,
      content: this.content,
      createdBy: this.createdBy.toResponse(),
    };
  }
}
