import { Optional } from "sequelize";
import { User, UserAttribs, UserResponse } from "./User.model";
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import ServerError from "../services/error";

export type PostAttribs = {
  id: number;
  content: string;
  createdAt: Date;
  createdBy?: User; // 모델에만 존재, 실제 데이터베이스 Column에는 없음.
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

  @BelongsTo(() => User, { foreignKey: "createdById" }) // 두 번째 인자는 외래 키 column의 이름
  createdBy!: PostAttribs["createdBy"]; // post.createdBy를 사용할 일이 많아서 쓰는 것(JOIN하는 역할)

  toResponse(): PostResponse {
    const createdBy = this.createdBy;
    if (!createdBy) throw new ServerError("MODEL_POST_INCLUDE", 500);
    return {
      id: this.id,
      content: this.content,
      createdBy: createdBy.toResponse(),
    };
  }
}
