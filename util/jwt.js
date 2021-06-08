import jwt from 'jsonwebtoken';
import config from '../config.js';

export function jwtVerify(token) {
  try {
    const decode = jwt.verify(token, config.jwtSecret);
    return decode;
  } catch {
    return {};
  }
}