// server/src/utils/jwt.js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccess = (userId) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES || "15m",
  });

export const signRefresh = (userId) =>
  jwt.sign({ sub: userId }, env.REFRESH_SECRET, {
    expiresIn: env.REFRESH_EXPIRES || "7d",
  });

export const verifyAccess = (token) => jwt.verify(token, env.JWT_SECRET);
export const verifyRefresh = (token) => jwt.verify(token, env.REFRESH_SECRET);
