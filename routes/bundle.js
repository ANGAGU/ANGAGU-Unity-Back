import express from 'express';
const router = express.Router();

import { upload, original, s3Upload, uploadOriginal } from '../util/file-upload.js';
import * as service from '../database/bundle-service.js';
import { authorization } from '../util/auth.js';
import errCode from '../util/errCode.js';
import Queue from 'bee-queue';
import config from '../config.js';
import path from 'path'

const queue = new Queue('bundle', {
  redis: config.redis,
});

router.post('/:productId', authorization, upload, async (req, res) => {
  try {
    const { id, type } = res.locals;
    const { productId } = req.params;
    const { mainFile, textureFile } = req.files;
    const { isMod } = req.body;
    const mainExt = ['.obj', '.fbx', '.dae', '.3ds', '.dxf'];
    const textureExt = ['.png', '.jpg', '.mtl'];
    const destination = '/home/ubuntu/angagu-unity/assets/result/result.assetbundle';

    if(!mainFile) {
      res
          .status(200)
          .json({
            status: 'error',
            data: {
              errCode: 302,
            },
            message: errCode[302],
          })
          .end();
        return;
    }
    // main file extension check
    mainFile.forEach(x => {
      if (!mainExt.includes(path.extname(x.path).toLowerCase())) {
        res
          .status(400)
          .json({
            status: 'error',
            data: {
              errCode: 800,
            },
            message: errCode[800],
          })
          .end();
        return;
      }
    });

    // texture file extension check
    if(textureFile) {
      textureFile.forEach(x => {
        if (!textureExt.includes(path.extname(x.path).toLowerCase())) {
          res
            .status(400)
            .json({
              status: 'error',
              data: {
                errCode: 800,
              },
              message: errCode[800],
            })
            .end();
          return;
        }
      });
    }
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

    const companyId = await service.getCompanyIdByProductId(productId);
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

    const checkStatus = await service.getStatus(productId);
    if(checkStatus.status !== 'success') {
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

    // modify ar file
    if(isMod === 1 && checkStatus.data !== 2 && checkStatus.data !== 3) {
      let payLoad = {
        status: 'error',
        data: {
          errCode: 0,
        },
        message: '',
      }
      if(!checkStatus.data) {
        payLoad.data.errCode = 706;
        payLoad.message = errCode[706];
      }
      switch(checkStatus.data) {
        case 0: 
          payLoad.data.errCode = 701;
          payLoad.message = errCode[701];
          break;
        case 1:
          payLoad.data.errCode = 702;
          payLoad.message = errCode[702];
          break;
      }
      res
        .status(200)
        .json(payLoad)
        .end();
      return;
    }

    // post ar file
    if(isMod === 0 && checkStatus.data && checkStatus.data !== 3) {
      let payLoad = {
        status: 'error',
        data: {
          errCode: 0,
        },
        message: '',
      }
      switch(checkStatus.data) {
        case 0:
          payLoad.data.errCode = 701;
          payLoad.message = errCode[701];
          break;
        case 1:
          payLoad.data.errCode = 702;
          payLoad.message = errCode[702];
          break;
        case 2:
          payLoad.data.errCode = 703;
          payLoad.message = errCode[703];
          break;
      }
      res
        .status(400)
        .json(payLoad)
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
  
    job.save(async function (err) {
      if (err) {
        console.log(err);
        res
          .status(700)
          .json({
            status: 'error',
            data: {
              err,
            },
            message: errCode[700],
          })
          .end();
        return;
      }
      console.log('saved job ' + job.id);
      try {
        await service.updateStatus(productId, 0);
        res
          .status(200)
          .json({
            status: 'success',
            data: {},
          })
          .end();
        return;
      } catch (err) {
        console.log(err);
      }
    });

    job.on('progress', async (progress) => {
      try {
        await service.updateStatus(productId, 1);
      } catch (err) {
        console.log(err);
      }
    });

    job.on('succeeded', async function (result) {
      try {
        console.log('completed job ' + job.id);
        await service.updateStatus(productId, 2);
        const data = await uploadOriginal(mainFile[0], textureFile, productId);
        await service.addProductAr(productId, data.mainKey, data.texturePath);
      } catch (err) {
        console.log(err);
      }
    });
    queue.on('job failed', async (jobId, err) => {
      await service.updateStatus(job.data.productId, 3);
      console.log(`Job ${jobId} failed with error ${err.message}`);
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        status: 'error',
        data: {
          errCode: 0,
          err,
        },
        message: errCode[0],
      })
      .end();
  }
});

router.delete('/:productId', authorization, async (req, res) => {
  try {
    const { id, type } = res.locals;
    const { productId } = req.params;
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
    const companyId = await service.getCompanyIdByProductId(productId);
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

    const checkStatus = await service.getStatus(productId);
    if(checkStatus.status !== 'success') {
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
    if(checkStatus.data === null) {
      res
        .status(400)
        .json({
          status: 'error',
          data: {
            errCode: 705,
          },
          message: errCode[705],
        })
        .end();
      return;
    }
    const delResult = await service.delAr(productId);
    if(delResult.status !== 'success'){
      res
        .status(400)
        .json({
          status: 'error',
          data: {
            errCode: 303,
          },
          message: errCode[303],
        })
        .end();
      return;
    }
    res
      .status(200)
      .json({
        status: 'success',
        data: {},
      })
      .end();
  } catch(err) {
    res
      .status(500)
      .json({
        status: 'error',
        data: {
          errCode: 0,
          err,
        },
        message: errCode[0],
      })
      .end();
  }
});

export default router;
