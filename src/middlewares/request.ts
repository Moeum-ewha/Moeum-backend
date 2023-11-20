import { NextFunction, Request, Response } from "express";
import onFinished from "on-finished";
import { v4 as uuidv4 } from "uuid";
import { inspect } from "node:util";

export const logRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const reqId = uuidv4();
  res.setHeader("Moeum-Request-Id", reqId);

  const url = req.originalUrl || req.url;
  const query = req.query || {};
  const params = req.params || {};

  let body = {};
  if (req.get("Content-Type") !== "multipart/form-data") {
    body = req.body || {};
  }

  onFinished(res, function (err, res) {
    if (err) console.log(err);

    if (res.statusCode >= 400) {
      const log = { url, query, params, body };
      console.log(inspect(log, { colors: false, depth: null }));
    }
  });
};
