const express = require("express");
const db = require("../models/db");
const authenticateJWT = require("../authMiddleware");

const router = express.Router();

router.post("/create-user", authenticateJWT, (req, res) => {
  const { email, password, role } = req.body;
  const bcrypt = require("bcryptjs");
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
    [email, hashedPassword, role],
    (err) => {
      if (err) return res.status(400).json({ message: "Error creating user" });
      res.status(201).json({ message: "User created" });
    }
  );
});

router.get("/borrow-requests", authenticateJWT, (req, res) => {
  db.all("SELECT * FROM borrow_requests", (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error fetching borrow requests" });
    res.status(200).json(data);
  });
});

router.get("/users/:id/history", authenticateJWT, (req, res) => {
  const { id } = req.params;
  db.all(
    "SELECT * FROM borrow_history WHERE user_id = ?",
    [id],
    (err, data) => {
      if (err)
        return res.status(500).json({ message: "Error fetching user history" });
      res.status(200).json(data);
    }
  );
});

router.put("/borrow-requests/:id/approve", authenticateJWT, (req, res) => {
  const { id } = req.params;
  db.run(
    "UPDATE borrow_requests SET status = 'Approved' WHERE id = ?",
    [id],
    function (err) {
      if (err)
        return res.status(500).json({ message: "Error approving request" });
      res.status(200).json({ message: "Request approved" });
    }
  );
});

router.put("/borrow-requests/:id/deny", authenticateJWT, (req, res) => {
  const { id } = req.params;
  db.run(
    "UPDATE borrow_requests SET status = 'Denied' WHERE id = ?",
    [id],
    function (err) {
      if (err)
        return res.status(500).json({ message: "Error denying request" });
      res.status(200).json({ message: "Request denied" });
    }
  );
});

module.exports = router;
