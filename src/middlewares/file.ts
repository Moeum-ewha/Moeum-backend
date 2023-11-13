import multer, { Multer } from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import ServerError from "../services/error";
import s3Client from "../services/s3";

const mimeToExt = (mimetype: string) => {
  const mimedict = {
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/tiff": "tiff",
    "image/webp": "webp",
  };

  if (mimetype in mimedict) {
    // in 키워드를 감지 못하는 타스..때문에 아래처럼 작성함
    return mimedict[mimetype as keyof typeof mimedict];
  }

  throw new ServerError("FILE__INVALID_MIMETYPE", 400);
};

export const s3upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "moeumbucket",
    key: (req, file, callback) => {
      const { mimetype } = file;
      try {
        const ext = mimeToExt(mimetype);
        callback(null, `images/${uuidv4()}.${ext}`);
      } catch (error) {
        callback(error);
      }
    },
  }),
});
