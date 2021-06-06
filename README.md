# ANGAGU_Unity_Back
# Introduction
안가구 기업 상품 3D model 등록시 실시간 유니티 에셋 번들링 및 s3 업로드 지원을 위한 서버입니다.
<br/>지원되는 3D 파일 포맷: .fbx, .dae(Collada), .3ds, .dxf, .obj
<br/><br/>

## Requirements
* Installation of activated Unity
* Node.js v14.17.0
* npm v7.16.0
<br/><br/>

## Install & Usage
#### Install
```bash
git clone https://github.com/ANGAGU/ANGAGU_Unity_Back

npm i

cd ANGAGU_Unity_Back

touch config.js
```
#### config.js
```javascript
export default {
  dbConfig: {
    host: "",
    user: "",
    password: "",
    database: "",
    timezone: "",
    waitForConnections: true,
    connectionLimit: 10
  },
  awsConfig: {
    keyId: "",
    secretAccessKey: "",
    region: ""
  },
};
```
#### Execute
```bash
npm start
```