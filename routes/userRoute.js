const express = require("express");
const db = require("../models/db");
const { Parser } = require("json2csv");
const authenticateJWT = require("../authMiddleware");
const router = express.Router();

router.get("/books", (req, res) => {
  db.all("SELECT * FROM books", (err, books) => {
    if (err) return res.status(500).json({ message: "Error fetching books" });
    res.status(200).json(books);
  });
});

router.get("/history/:id", authenticateJWT, (req, res) => {
  db.all(
    "SELECT * FROM borrow_history WHERE user_id = ?",
    [req.params.id],
    (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching history", error: err });
      }

      if (!data || data.length === 0) {
        return res
          .status(200)
          .json({ message: "No borrow history found", data: [] });
      }

      res.status(200).json(data);
    }
  );
});

router.get("/history/:id/download", authenticateJWT, (req, res) => {
  db.all(
    "SELECT * FROM borrow_history WHERE user_id = ?",
    [req.params.id],
    (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching history", error: err });
      }

      if (!data || data.length === 0) {
        return res
          .status(200)
          .json({ message: "No borrow history found", data: [] });
      }

      try {
        const csvFields = Object.keys(data[0]);
        const json2csvParser = new Parser({ fields: csvFields });
        const csv = json2csvParser.parse(data);

        res.attachment("history.csv");
        res.send(csv);
      } catch (error) {
        res.status(500).json({ message: "Error generating CSV", error: error });
      }
    }
  );
});

router.post("/borrow-requests", authenticateJWT, (req, res) => {
  const { book_id, start_date, end_date } = req.body;
  const { userId } = req.user;

  if (!book_id || !start_date || !end_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  console.log(
    `User ID: ${userId}, Book ID: ${book_id}, Start Date: ${start_date}, End Date: ${end_date}`
  );

  db.run(
    "INSERT INTO borrow_requests (user_id, book_id, start_date, end_date, status) VALUES (?, ?, ?, ?, 'Pending')",
    [userId, book_id, start_date, end_date],
    function (err) {
      if (err) {
        console.error("Error creating borrow request:", err.message);
        return res
          .status(500)
          .json({ message: "Error creating borrow request" });
      }
      res.status(201).json({ message: "Borrow request created" });
    }
  );
});

module.exports = router;
