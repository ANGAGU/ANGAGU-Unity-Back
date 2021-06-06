#!/usr/bin/nodejs
import { createServer } from 'http';
import app from '../app.js';

const port = process.env.PORT || 5000;

const server = createServer(app);

server.listen(port, () => {
  console.log(`${port}포트 서버 실행`);
});

export default server;