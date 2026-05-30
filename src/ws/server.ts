import { Server as HttpServer} from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import { Match } from "../db/schema";

export interface AliveWebSocket extends WebSocket {
  isAlive: boolean;
}

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }
  | Match;


const sendJSON = (socket: WebSocket, payload: JSONValue) => {
  const client = socket as AliveWebSocket;
  if(client.readyState !== WebSocket.OPEN) {
   return;
  }
  client.send(JSON.stringify(payload));
}

const broadcast = (wss: WebSocketServer, payload: JSONValue) => {
  for(const client of wss.clients) {
    if(client.readyState !== WebSocket.OPEN) {
      continue;
    }
  client.send(JSON.stringify(payload));
  }
}

export const attachWebSocketServer = (server: HttpServer) => {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 1024 * 1024,
  });
  
 wss.on('connection', (socket: WebSocket) => {
  const client = socket as AliveWebSocket;
  client.isAlive = true;
  client.on('pong', () => { client.isAlive = true; });

  sendJSON(client, { type: 'welcome' });

  client.on('error', console.error);
 });

 const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const client = ws as AliveWebSocket;
    if(client.isAlive === false) return client.terminate();

    client.isAlive = false;
    client.ping();
  })}, 30000);

  wss.on('close', () => clearInterval(interval));

  const broadcastMatchCreated = (match: Match) => {
    broadcast(wss, { type: 'match_created', data: match });
  }

  return { broadcastMatchCreated };
}