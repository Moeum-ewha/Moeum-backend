import { join } from "path";
import dotenv from "dotenv";
import { Sequelize } from "sequelize-typescript";

dotenv.config();
const modelBasename = join(__dirname, "..", "models", "*.model");

export const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT as unknown as number,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: "mysql",
  models: [`${modelBasename}.ts`, `${modelBasename}.js`], // 모델 파일이 어디에 저장되어 있는지 경로를 알려줌
  modelMatch: (filename, member) => {
    // export하는 게 여러 개이기 때문에 내가 세운 모델 이름 규칙과 member(export하는 각각의 멤버)와 일치하는 애가 모델임을 알림
    return filename.substring(0, filename.indexOf(".model")) === member;
  },
  logging: process.env.NODE_ENV === "production" ? false : true,
});

export const connectDB = async () => {
  await sequelize.authenticate(); // 연결 테스트
  console.log("✅ Connected to database");
  await sequelize.sync({ force: false }); // mysql table의 상태와 내 모델 코드와 동기화시켜줌
  console.log("✅ Database synced");
};
