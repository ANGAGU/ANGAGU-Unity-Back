import express from 'express';
const router = express.Router();

import { upload } from '../util/file-upload.js';
import { getCompanyIdByProductId } from '../database/bundle-service.js';
import { authorization } from '../util/auth.js';
import errCode from '../util/errCode.js';
import Queue from 'bee-queue';
import config from '../config.js';

const queue = new Queue('bundle', {
  redis: config.redis,
});

router.post('/:productId', authorization, upload, async (req, res) => {
  try {
    const { id, type } = res.locals;
    const { productId } = req.params;
    const { mainFile, textureFile } = req.files;
    
    const destination = '/home/ubuntu/angagu-unity/assets/result/result.assetbundle';

    if (type !== 'company') {
      res
        .status(403)
        .json({
          status: 'error',
          data: {
            errCode: 200,
          },
          message: errCode[200],
        })
        .end();
      return;
    }
    const companyId = await getCompanyIdByProductId(productId);
    if (companyId.status !== 'success' || companyId.data == null) {
      res
        .status(400)
        .json({
          status: 'error',
          data: {
            errCode: 100,
          },
          message: errCode[100],
        })
        .end();
      return;
    }
    if(companyId.data !== id) {
      res
        .status(400)
        .json({
          status: 'error',
          data: {
            errCode: 500,
          },
          message: errCode[500],
        })
        .end();
      return;
    }

    const mainPath = mainFile.map(file => file.path);

    let texturePath = [];
    if(textureFile !== undefined){
      texturePath = textureFile.map((file) => file.path);
    }
    
    const filePath = mainPath.concat(texturePath);

    const job = queue.createJob({
      filePath,
      destination,
      productId,
      originalName: mainFile[0].originalname,
    });
  
    job.save(function (err) {
      if (err) {
        console.log('job failed to save');
        return res.send('job failed to save');
      }
      console.log('saved job ' + job.id);
      res.send(200).end();
    });

    job.on('succeeded', function (result) {
      console.log('completed job ' + job.id);
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        data: err,
      })
      .end();
  }
});

export default router;
