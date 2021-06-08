import AWS from 'aws-sdk';
import { readFileSync } from 'fs';
import multer, { diskStorage } from 'multer';
import { generate } from 'short-id';
import config from '../config.js';

const s3 = new AWS.S3({
  accessKeyId: config.awsConfig.keyId,
  secretAccessKey: config.awsConfig.secretAccessKey,
  region: config.awsConfig.region,
});

const storage = diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'mainFile') {
      cb(null, `/home/ubuntu/angagu-unity/assets/main`);
    } else {
      cb(null, `/home/ubuntu/angagu-unity/assets/texture`);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileUpload = multer({
  storage,
});

export const upload = fileUpload.fields([
  {
    name: 'mainFile', limit: 1,
  },
  {
    name: 'textureFile',
  }
]);

export const s3Upload = (filePath) => {
  const name = generate();
  const key = `product/ar/${name}`;
  const fileContent = readFileSync(filePath);
  const params = {
    Body: fileContent,
    Bucket: 'angagu',
    Key: key,
  };
  s3.putObject(params, (err, data) => {
    if(err) {
      console.log(err);
      return {
        status: 'error',
      };
    }
  });
  return {
    status: 'success',
    key,
  };
}
