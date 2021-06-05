const express = require('express');
const assetbundlecompiler = require('@mitm/assetbundlecompiler');
const BuildTargets = assetbundlecompiler.BuildTargets;
const bundle = assetbundlecompiler.bundle;
const setUnityPath = assetbundlecompiler.setUnityPath;
const Android = BuildTargets.Android;
const router = express.Router();
const fileUpload = require('../util/file-upload.js');

router.post('/:productId', fileUpload.upload, async (req, res) => {
  try {
    const { productId } = req.params;
    const { mainFile, textureFile } = req.files;
    const destination = '/home/ubuntu/angagu-unity/assets/result/result.assetbundle';
    const unityPath = process.env.UNITY_EDITOR_PATH
    setUnityPath(unityPath); 
    // await bundle('/home/ubuntu/angagu-unity/public/barstool-right.dxf','/home/ubuntu/angagu-unity/public/barstool-left.dxf','/home/ubuntu/angagu-unity/public/barstool-back.dxf', '/home/ubuntu/angagu-unity/public/barstool-front.dxf','/home/ubuntu/angagu-unity/public/barstool-top.dxf','/home/ubuntu/angagu-unity/public/barstool-3d.dxf')
    //   .targeting(Android)
    //   .withBuildOptions({ chunkBasedCompression: true, strictMode: true})
    //   .withLogger((message) => console.log(message))
    //   .withUnityLogger((message) => console.log(`Unity: ${message}`))
    //   .to(destination);
    const result = fileUpload.s3Upload(mainFile[0]);
    console.log(result);
    res.status(200).end();
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

module.exports = router;
