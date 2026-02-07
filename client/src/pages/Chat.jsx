import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { createSocket } from "../utils/socket";

export default function Chat() {
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ✅ prevents stale selectedUser issue
  const selectedUserRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
      logout();
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/api/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = () => {
    const currentSelected = selectedUserRef.current;

    if (!currentSelected) return;
    if (!text.trim()) return;

    socketRef.current.emit("sendMessage", {
      receiverId: currentSelected._id,
      text,
    });

    setText("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    socketRef.current = createSocket();

    socketRef.current.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.on("newMessage", (message) => {
      const currentSelected = selectedUserRef.current;
      if (!currentSelected) return;

      const isCurrentChat =
        (message.sender === loggedUser._id &&
          message.receiver === currentSelected._id) ||
        (message.sender === currentSelected._id &&
          message.receiver === loggedUser._id);

      if (isCurrentChat) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-screen bg-gray-950 text-white flex">
      {/* LEFT SIDEBAR */}
      <div className="w-[320px] bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold">{loggedUser?.name}</p>
          </div>

          <button
            onClick={logout}
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition text-sm"
          >
            Logout
          </button>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <p className="p-4 text-gray-400">No users found.</p>
          ) : (
            users.map((u) => {
              const isOnline = onlineUsers.includes(u._id);

              return (
                <button
                  key={u._id}
                  onClick={() => {
                    setSelectedUser(u);
                    fetchMessages(u._id);
                  }}
                  className={`w-full text-left p-4 border-b border-gray-800 hover:bg-gray-800 transition ${
                    selectedUser?._id === u._id ? "bg-gray-800" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{u.name}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isOnline ? "bg-green-600" : "bg-gray-700"
                      }`}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400">{u.email}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-800">
          {selectedUser ? (
            <div>
              <p className="font-semibold text-lg">{selectedUser.name}</p>
              <p className="text-sm text-gray-400">{selectedUser.email}</p>
            </div>
          ) : (
            <p className="text-gray-400">Select a user to start chatting</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!selectedUser ? (
            <p className="text-gray-500 text-center mt-10">
              👈 Select a user from the left
            </p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender === loggedUser._id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      isMine
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {selectedUser && (
          <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-3 rounded-xl bg-gray-800 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={sendMessage}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
