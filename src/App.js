import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import SendIcon from "@material-ui/icons/Send";
import "./App.css";

const BASE_URL = "ws://127.0.0.1:5000/ws/"; // Replace with your server URL

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // start First page
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setLoggedIn(true);
    }
    // store new socket
    const newSocket = new WebSocket(BASE_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);


  // third party joing
  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = event.data;
      setMessages((prevMessages) => [...prevMessages, message]);
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!username || !messageInput.trim()) return;

    const messageWithUsername = `${username}: ${messageInput}`; // Combine username and message
    socket.send(messageWithUsername);  //msg send
    setMessageInput("");
  };

  const handleLogin = () => {
    if (username.trim() === "") {
      setSnackbarOpen(true);  //database store false
    } else {
      localStorage.setItem("username", username);
      setLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setLoggedIn(false);
  };

  return (
    <Container className="App" maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        FastAPI Chat App
      </Typography>
      {loggedIn ? (
        // if user loging
        <>
          <div className="chat-box">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.startsWith(username) ? "own-message" : "other-message"
                  }`}
              >
                {message}
              </div>
            ))}
          </div>
          <TextField
            label="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            fullWidth
            variant="outlined"
            disabled={!loggedIn}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!loggedIn}
          >
            Send
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            style={{ marginTop: 10 }}
          >
            Logout
          </Button>
        </>
      ) :
        // if not loging 
        (
          <>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              style={{ marginTop: 10 }}
            >
              Login
            </Button>
          </>
        )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}  //4secs
        onClose={() => setSnackbarOpen(false)}
      >
        <MuiAlert severity="error" onClose={() => setSnackbarOpen(false)}>
          Please enter a valid username.
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}

export default App;
