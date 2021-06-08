import { BuildTargets as _BuildTargets, bundle as _bundle, setUnityPath as _setUnityPath } from '@mitm/assetbundlecompiler';
const BuildTargets = _BuildTargets;
const bundle = _bundle;
const setUnityPath = _setUnityPath;
const Android = BuildTargets.Android;
import { updateProductAr } from '../database/bundle-service.js';
import { s3Upload } from './file-upload.js';
import config from '../config.js';

import Queue from 'bee-queue';
const queue = new Queue('bundle', {
  redis: config.redis,
});

queue.on('ready', function () {
  queue.process(async function (job, done) {
    try {
      const unityPath = "../Desktop/2018.4.35f1/Editor/Unity";
      console.log('unityPath ============> ' + unityPath);
      setUnityPath(unityPath);
      await bundle(...job.data.filePath)
      .targeting(Android)
      .withBuildOptions({ chunkBasedCompression: true, strictMode: true})
      .withLogger((message) => console.log(message))
      .withUnityLogger((message) => console.log(`Unity: ${message}`))
      .to(job.data.destination);
      const result = s3Upload(job.data.destination);
      const updateResult = await updateProductAr(job.data.productId, result.key, job.data.originalName);
    } catch(err) {
      console.log(err);
    }
    setTimeout(function () {
      done(null);
    }, 3000);
  });

  console.log('processing jobs...');
});