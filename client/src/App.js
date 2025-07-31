import React, { useEffect, useState } from "react";
import "./App.css";

const socket = new WebSocket("ws://localhost:4000");

function App() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [currentVotes, setCurrentVotes] = useState(null);
  const [voted, setVoted] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [countdown, setCountdown] = useState(60);
// Handle message responses from server
  useEffect(() => {
    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      switch (type) {
        case "ROOM_CREATED":
          // Room created successfully, show room ID to user
          setRoomId(payload.roomId);
          break;
        case "JOIN_SUCCESS":
           // Successfully joined room, update vote state
          setCurrentVotes(payload.voteState);
          setRoomJoined(true);
          break;
        case "VOTE_UPDATE":
           // Real-time update of votes
          setCurrentVotes(payload);
          break;
        case "ERROR":
          alert(payload);
          break;
        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    if (roomId) {
      const storedVote = localStorage.getItem(roomId);
      if (storedVote) {
        setVoted(true);
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (roomJoined && countdown > 0 && !voted) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomJoined, countdown, voted]);

  const handleCreateRoom = () => {
    socket.send(JSON.stringify({ type: "CREATE_ROOM" }));
  };

  const handleJoinRoom = () => {
    socket.send(
      JSON.stringify({ type: "JOIN_ROOM", payload: { roomId, userName } })
    );
  };

  const handleVoting = (option) => {
    if (!voted && countdown > 0) {
      socket.send(
        JSON.stringify({ type: "VOTE", payload: { roomId, vote: option } })
      );
      localStorage.setItem(roomId, option);
      setVoted(true);
    }
  };

  return (
    <div className="App">
      {!roomJoined ? (
        <div>
          <h2>Live Poll Battle Starts</h2>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter Your Name"
          />
          <br />
          <button onClick={handleCreateRoom}>Create Room</button>
          <br />
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <h3>Room ID: {roomId}</h3>
          <h4>Vote: BJP vs Congress</h4>
          <div>
            <button
              disabled={voted || countdown <= 0}
              onClick={() => handleVoting("optionA")}
            >
              BJP
            </button>
            <button
              disabled={voted || countdown <= 0}
              onClick={() => handleVoting("optionB")}
            >
              Congress
            </button>
          </div>
          <div>
            <p> Time left: {countdown} sec</p>
            <p>
              Votes: BJP = {currentVotes?.optionA} | Congress ={" "}
              {currentVotes?.optionB}
            </p>
            {voted && <p> You have voted</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
