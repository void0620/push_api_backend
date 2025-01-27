const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const webPush = require("web-push");

const app = express();
const port = 3001;

app.use(cors());

app.use(bodyParser.json());

// Generate VAPID keys (do this once and reuse the keys)
const vapidKeys = {
  publicKey: "BI5gWL3u-paHcH32d1wSuQ24RtHV1P6YSk3tuH9aacnUmyrHrj5oZ7pNWJmYiUnqEuMM7OeX5smJRQ8vIXrXus4",
  privateKey: "chTa4lxWbYW8SQtvX69HhhUREx78bctdOgVYP9jJS14"
}

webPush.setVapidDetails(
  "mailto: solsys.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions for each user and room
const userSubscriptions = {};

// Endpoint to get the public VAPID key
app.get("/vapid-public-key", (req, res) => {
  res.send({ publicKey: vapidKeys.publicKey });
});

// Endpoint to subscribe a user to a room
app.post("/subscribe", (req, res) => {
  const { userId, room, subscription } = req.body;

  if (!userSubscriptions[userId]) {
    userSubscriptions[userId] = {};
  }

  if (!userSubscriptions[userId][room]) {
    userSubscriptions[userId][room] = [];
  }

  // Store subscription
  userSubscriptions[userId][room].push(subscription);
  res.status(201).send({ message: `Subscribed to ${room} successfully!` });
});

// Endpoint to send notifications to a room
app.post("/notify", (req, res) => {
  const { room, message } = req.body;

  // Notify all users subscribed to this room
  for (const userId in userSubscriptions) {
    if (userSubscriptions[userId][room]) {
      userSubscriptions[userId][room].forEach((subscription) => {
        webPush
          .sendNotification(subscription, JSON.stringify({ title: `${room}`, body: message }))
          .catch((error) => console.error("Push notification error:", error));
      });
    }
  }

  res.send({ message: `Notifications sent to ${room}!` });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
