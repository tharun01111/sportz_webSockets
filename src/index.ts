import express, { Request, Response } from 'express';
import http from 'http';
import { matchRouter } from "./routes/matches";
import { configDotenv } from 'dotenv';
import { attachWebSocketServer } from './ws/server';

configDotenv();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();

const server = http.createServer(app);

app.use(express.json());

app.get('/', (_: Request, res: Response) => {
    res.send('Hello from express server');
});

app.use('/matches', matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, () => {
  const baseURL =
    HOST === "0.0.0.0"
      ? `http://localhost:${PORT}`
      : `http://${HOST}:${PORT}`;

  console.log(`Server is running on ${baseURL}`);
  console.log(`WebSocket Server is running on ${baseURL.replace("http", "ws")}/ws`);
});