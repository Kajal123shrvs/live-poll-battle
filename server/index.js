const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

// In-memory store for live poll rooms
const rooms = {};

// Utility function to broadcast to all clients in a room
function broadcastToRoom(roomId, message) {
  rooms[roomId]?.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Handle new WebSocket connections
webSocketServer.on("connection", (clientSocket) => {
  console.log(" New client connected");

  clientSocket.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;

      switch (type) {
        case "CREATE_ROOM":
          return handleCreateRoom(clientSocket, payload);
        case "JOIN_ROOM":
          return handleJoinRoom(clientSocket, payload);
        case "VOTE":
          return handleVote(clientSocket, payload);
        default:
          clientSocket.send(
            JSON.stringify({ type: "ERROR", payload: "Unknown message type" })
          );
      }
    } catch (err) {
      console.error(" Failed to parse message:", err);
      clientSocket.send(
        JSON.stringify({ type: "ERROR", payload: "Invalid message format" })
      );
    }
  });
});

// Handle room creation
function handleCreateRoom(clientSocket, payload) {
  const roomId = uuidv4();
  rooms[roomId] = {
    voteState: { optionA: 0, optionB: 0 },
    clients: [],
  };

  console.log(` Room created: ${roomId}`);
  clientSocket.send(
    JSON.stringify({
      type: "ROOM_CREATED",
      payload: { roomId },
    })
  );
}

// Handle joining an existing room
function handleJoinRoom(clientSocket, payload) {
  const { roomId, userName } = payload;

  if (!roomId || !rooms[roomId]) {
    clientSocket.send(
      JSON.stringify({ type: "ERROR", payload: "Room not found" })
    );
    return;
  }

  clientSocket.roomId = roomId;
  clientSocket.userName = userName;
  rooms[roomId].clients.push(clientSocket);

  console.log(` ${userName} joined room ${roomId}`);
  clientSocket.send(
    JSON.stringify({
      type: "JOIN_SUCCESS",
      payload: { voteState: rooms[roomId].voteState },
    })
  );
}

// Handle voting
function handleVote(clientSocket, payload) {
  const { roomId, vote } = payload;

  if (!rooms[roomId] || !["optionA", "optionB"].includes(vote)) {
    clientSocket.send(
      JSON.stringify({ type: "ERROR", payload: "Invalid vote or room" })
    );
    return;
  }

  rooms[roomId].voteState[vote]++;
  console.log(` Vote casted in room ${roomId}: ${vote}`);

  broadcastToRoom(roomId, {
    type: "VOTE_UPDATE",
    payload: rooms[roomId].voteState,
  });
}

// Start the server
server.listen(4000, () => {
  console.log(" WebSocket server is running on port 4000");
});
