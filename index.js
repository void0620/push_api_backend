const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// VAPID Keys (Generate using `npx web-push generate-vapid-keys`)
const vapidKeys = {
  publicKey: "BI5gWL3u-paHcH32d1wSuQ24RtHV1P6YSk3tuH9aacnUmyrHrj5oZ7pNWJmYiUnqEuMM7OeX5smJRQ8vIXrXus4",
  privateKey: "chTa4lxWbYW8SQtvX69HhhUREx78bctdOgVYP9jJS14"
}

webpush.setVapidDetails(
  "mailto:rymercadodev@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const rooms = {
  room1: [],
  room2: [],
  room3: [],
};

// ✅ API: Subscribe User to Room
app.post("/subscribe", (req, res) => {
  const { endpoint, p256dh, auth, room } = req.body;

  if (!rooms[room]) {
    return res.status(400).json({ error: "Invalid room" });
  }

  rooms[room].push({endpoint: endpoint, keys: {p256dh: p256dh, auth: auth}});
  console.log({endpoint: endpoint, keys: {p256dh: p256dh, auth: auth}});
  res.status(201).json({ message: `Subscribed to ${room}` });
});

// ✅ API: Send Notification to Room
app.post("/send-notification", async (req, res) => {
  const { room, title, message } = req.body;
  if (!rooms[room]) {
    return res.status(400).json({ error: "Invalid room" });
  }

  const payload = JSON.stringify({ title, body: message, data: {url: 'http://localhost:3000'} });

  rooms[room].forEach((subscription) => {
    webpush.sendNotification(subscription, payload).catch((err) => console.error(err));
  });

  res.status(200).json({ message: `Notification sent to ${room}` });
});

app.post("/clearSubscription", (req, res) => {
  Object.keys(rooms).forEach((room) => {
    rooms[room] = [];
  });
  res.status(200).json({ message: "All subscriptions cleared" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));