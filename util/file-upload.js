const AWS = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');
const shortId = require('short-id');
const awsConfig = require('../config.json');

const s3 = new AWS.S3({
  accessKeyId: awsConfig.keyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
});

const storage = multer.diskStorage({
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

const upload = fileUpload.fields([
  {
    name: 'mainFile',
  },
  {
    name: 'textureFile',
  }
]);

const s3Upload = (file) => {
  const name = shortId.generate();
  const fileContent = fs.readFileSync(file.path);
  const params = {
    Body: fileContent,
    Bucket: 'angagu',
    Key: `product/ar/${name}`,
  };
  const result = s3.putObject(params, (err, data) => {
    if(err) {
      console.log(err);
      return {
        status: 'error',
      }
    }
  })
  return result;
}

module.exports = { upload, s3Upload };
