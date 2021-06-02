var express = require('express');
const assetbundlecompiler = require('@mitm/assetbundlecompiler');
const BuildTargets = assetbundlecompiler.BuildTargets;
const bundle = assetbundlecompiler.bundle;
const setUnityPath = assetbundlecompiler.setUnityPath;
//import { BuildTargets, bundle, setUnityPath } from '@mitm/assetbundlecompiler';
//const { Android } = BuildTargets;
const Android = BuildTargets.Android;
var router = express.Router();

router.get('/', async function(req, res) {
  //const filePath = req.body.filePath;
  try {
    const unityPath = process.env.UNITY_EDITOR_PATH
    setUnityPath(unityPath); 
    await bundle('/home/ubuntu/angagu-unity/public/barstool-right.dxf','/home/ubuntu/angagu-unity/public/barstool-left.dxf','/home/ubuntu/angagu-unity/public/barstool-back.dxf', '/home/ubuntu/angagu-unity/public/barstool-front.dxf','/home/ubuntu/angagu-unity/public/barstool-top.dxf','/home/ubuntu/angagu-unity/public/barstool-3d.dxf')
      // .targeting() is mandatory and tells the library what platform your asset bundle targets.
      // You can either pass a predefined constant in BuildTargets, or a string,
      // matching the name of a member of the UnityEditor.BuildTarget enum.
      // @see https://docs.unity3d.com/ScriptReference/BuildTarget.html
      .targeting(Android)

      // Lets you define build options. Those are always flags, and the key names represent
      // member names of the UnityEditor.BuildAssetBundleOptions enum.
      // @see https://docs.unity3d.com/ScriptReference/BuildAssetBundleOptions.html
      .withBuildOptions({ chunkBasedCompression: true, strictMode: true /* etc */ })

      // This lets you define a simple logger to get simple text updates about the conversion.
      .withLogger((message) => console.log(message))

      // This lets you define a logger for the real-time output of Unity (stdout+stderr).
      // Beware, it's very verbose :)
      .withUnityLogger((message) => console.log(`Unity: ${message}`))

      // This is the "run" function and marks the termination of the fluent calls
      // by returning a Promise that resolves when the asset bundle generation ends.
      // Give it a path to the asset bundle name or a fs.WriteStream.
      .to('/home/ubuntu/angagu-unity/public/assetBundle/barstool.assetbundle');
    // const manifest = await bundle('/Users/minjae/Documents/project/angagu/assets/IKEA-Frosta_Stool-3D.obj').to('/Users/minjae/Documents/project/angagu/assets');
    res.status(200).end();
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
