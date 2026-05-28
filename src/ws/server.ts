import { Server as HttpServer} from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import { Match } from "../db/schema";

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }
  | Match;


const sendJSON = (socket: WebSocket, payload: JSONValue) => {
  if(socket.readyState !== WebSocket.OPEN) {
   return;
  }
  socket.send(JSON.stringify(payload));
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
    sendJSON(socket, { type : 'welcome' });

    socket.on("error", console.error);
  });

  const broadcastMatchCreated = (match: Match) => {
    broadcast(wss, { type: 'match_created',  data: match });
  }

  return { broadcastMatchCreated };
}