import express from 'express';
import { BuildTargets as _BuildTargets, bundle as _bundle, setUnityPath as _setUnityPath } from '@mitm/assetbundlecompiler';
const BuildTargets = _BuildTargets;
const bundle = _bundle;
const setUnityPath = _setUnityPath;
const Android = BuildTargets.Android;
const router = express.Router();
import Queue from 'bee-queue';
// const bundleQueue = new Queue('bundle');

import { updateProductAr } from '../database/bundle-service.js';
import { upload, s3Upload } from '../util/file-upload.js';

router.post('/:productId', upload, async (req, res) => {
  try {
    const { productId } = req.params;
    const { mainFile, textureFile } = req.files;
    const destination = '/home/ubuntu/angagu-unity/assets/result/result.assetbundle';
    const unityPath = process.env.UNITY_EDITOR_PATH
    setUnityPath(unityPath);
    const mainPath = mainFile[0].path;
    const texturePath = textureFile.map((file) => file.path);
    console.log(mainPath, texturePath);
    //const job = bundleQueue.createJob();
    // job
    //   .timeout(3000)
    //   .retries(2)
    //   .save()
    //   .then((job) => {
    //     // job enqueued, job.id populated
    // });
    await bundle(mainPath, ...texturePath)
      .targeting(Android)
      .withBuildOptions({ chunkBasedCompression: true, strictMode: true})
      .withLogger((message) => console.log(message))
      .withUnityLogger((message) => console.log(`Unity: ${message}`))
      .to(destination);
    const result = s3Upload(destination);
    const updateResult = await updateProductAr(productId, result.key, mainFile[0].originalname);
    res
      .status(200)
      .json({
        status: 'success',
        data: {
          arFilePath: result.key,
        },
      })
      .end();
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
