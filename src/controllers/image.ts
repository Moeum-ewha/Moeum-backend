import { NextFunction, Request, Response } from "express";
import ms from "ms";
import s3Client from "../services/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import ServerError from "../services/error";

// app.get("/image/:path")
// localhost:3000/image/~~~~.png

const extToMime = (exttype: string) => {
  const extdict = {
    gif: "image/gif",
    bmp: "image/bmp",
    jpg: "image/jpg",
    png: "image/png",
    tiff: "image/tiff",
    webp: "image/webp",
  };

  if (exttype in extdict) {
    // in 키워드를 감지 못하는 타스..때문에 아래처럼 작성함
    return extdict[exttype as keyof typeof extdict];
  }

  throw new ServerError("FILE__INVALID_EXTTYPE", 400);
};

const imageController = {
  getImage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const path = req.params.path;
      const ext = path.split(".")[1];
      const command = new GetObjectCommand({
        Bucket: "moeumbucket",
        Key: `images/${path}`,
      });

      const { Body, ContentType, ContentLength } = await s3Client.send(command);
      if (Body instanceof Readable) {
        if (ContentType) res.setHeader("content-type", extToMime(ext)); // 클라이언트한테 나 사진보낼거라고 말해줘야 함
        if (ContentLength) res.setHeader("content-length", ContentLength);

        if (process.env.NOE_ENV === "production") {
          res.setHeader("cache-control", `max-age=${ms("1h")}`);
        }
        Body.pipe(res); // Body에서 읽어온 사진 조각을 res에 넣어준다
      } else {
        console.log();
        throw new ServerError("IMAGE__NOT_FOUND", 404);
      }
    } catch (error) {
      next(error);
    }
  },
};
export default imageController;
