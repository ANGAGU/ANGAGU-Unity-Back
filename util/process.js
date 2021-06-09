import { BuildTargets as _BuildTargets, bundle as _bundle, setUnityPath as _setUnityPath } from '@mitm/assetbundlecompiler';
const BuildTargets = _BuildTargets;
const bundle = _bundle;
const setUnityPath = _setUnityPath;
const Android = BuildTargets.Android;
import * as service from '../database/bundle-service.js';
import { s3Upload } from './file-upload.js';
import config from '../config.js';

import Queue from 'bee-queue';
const queue = new Queue('bundle', {
  redis: config.redis,
});

queue.on('ready', function () {
  queue.process(async (job, done) => {
    try{
      await service.updateStatus(job.data.productId, 1);
      const unityPath = config.unityPath;
      setUnityPath(unityPath);
      await bundle(...job.data.filePath)
      .targeting(Android)
      .withBuildOptions({ chunkBasedCompression: true, strictMode: true})
      .withLogger((message) => console.log(message))
      .withUnityLogger((message) => console.log(`Unity: ${message}`))
      .to(job.data.destination);
      const result = s3Upload(job.data.destination);
      if(result.status === 'error') {
        return Promise.reject('s3 upload fail');
      }
      const updateResult = await service.updateProductAr(job.data.productId, result.key, job.data.originalName);
      if(updateResult.status === 'error') {
        return Promise.reject('db update fail');
      }
      setTimeout(function () {
        done(null);
      }, 3000);
    } catch(err) {
      return Promise.reject('bundle fail');
    }    
  });

  console.log('processing jobs...');
});