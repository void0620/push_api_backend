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

// Store subscriptions (in-memory for now)
let subscriptions = [];

// Subscribe endpoint
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: "Subscribed successfully!" });
});

// Send push notification
app.post("/send-notification", async (req, res) => {
  const payload = JSON.stringify({
    title: "Hello from Safari!",
    body: "You have a new notification!",
  });

  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, payload).catch(err => console.error(err));
  });

  res.json({ message: "Notification sent!" });
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
