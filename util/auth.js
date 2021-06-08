import { jwtVerify } from './jwt.js';
import errCode from './errCode.js';

const authorization = (req, res, next) => {
  const { authorization: token } = req.headers;
  if (typeof token === 'undefined') {
    res.status(403).json({
      status: 'error',
      data: {
        errCode: 201,
      },
      message: errCode[201],
    });
    return;
  }
  try {
    const { id, type } = jwtVerify(token).data;
    if (typeof id === 'undefined' || typeof type === 'undefined') {
      res.status(403).json({
        status: 'error',
        data: {
          errCode: 201,
        },
        message: errCode[201],
      });
      return;
    }
    res.locals.id = id;
    res.locals.type = type;
    next();
  } catch (err) {
    res.status(403).json({
      status: 'error',
      data: {
        errCode: 202,
      },
      message: errCode[202],
    });
  }
};

export {
  authorization,
};