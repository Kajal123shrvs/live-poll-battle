# Live Poll Battle

Live Poll Battle is a real-time voting web application allows users to create or join real-time voting rooms and vote between two options (BJP or Congress), and view live results instantly. This voting app is mainly built with React, Node.js, and WebSockets.

# Frontend Features :

1.  Creating or joining voting poll rooms
2.  showing real-time voting with 2 options and users can vote for one option
3.  live vote count
4.  One vote per user per room (tracked using localStorage) which indicates that the user has already voted and prevent revoting
5.  Indicating Countdown timer of 60 seconds as per vote session,after that room is disabled for voting
6.  Unique and random Room IDs for private voting rooms

# Backend Features :

1. handling creation and storage of poll rooms
2. accepting and broadcasting votes to all clients in the room
3. keeping poll state in local storage
4. supporting mulptiple rooms with unique room ids with the help of uuid with different users .
5. Basic error handling for invalid Room IDs
6. Using WebSocket enables real-time, two-way communication between the server and connected clients for instant vote updates without page refreshes.

# Project Structure :

live-poll-battle-project/
|- client/ React frontend
|-server/ Node.js backend (WebSocket)
|-.gitignore
|- README.md

# Tech Stack :

Frontend: React.js, JavaScript, CSS
Backend: Node.js, WebSocket ,uuid

# Setup Instructions :

Prerequisites-

React, Node.js ,nodemon and npm installed
Git installed

1. github repository:
   github - https://github.com/Kajal123shrvs/live-poll-battle.git

2. cd live-poll-battle
   Install frontend dependencies :
   cd client
   npm install
3. Install backend dependencies:
   cd ../server
   npm install
4. Start the application:
   From the root folder, run both client and server using:
   npm run dev
   (This uses concurrently to run client and server together)

# Vote State Sharing & Poll Room Management:

The backend uses WebSocket connections to manage real-time communication. When a room is created, a unique roomId is generated using UUID, and a server-side object is used to store the voting state and connected clients.

When a user joins a room:

1. Their WebSocket connection is stored inside that room's client list
2. The current vote count is sent to the new user
3. If the user votes, the vote count is updated and broadcasted to all connected clients in that room
4. This avoids any need for a database, and all vote state is stored in memory (local storage).
