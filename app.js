const express = require("express");
const app = express();
const port = 3000;
const mysql = require("mysql2");
const multer = require("multer");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static("./public"));

const db = mysql.createConnection({
  host: "database.ifew.me",
  user: "pocker",
  password: "41ekdjrHlvK4I!as",
  database: "Pocket",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "." + file.originalname.split(".").pop());
    },
  }),
});

/**======================
 **    View Routes
 *========================**/

app.get("/", (req, res) => {
  res.render("index");
});

/**======================
 **      API Routes
 * ========================**/

app.post("/api/insert", upload.single("profile_img"), (req, res) => {
  const { prefix, fname, lname, birthday } = req.body;
  const profile_img = req.file.filename;

  if (!prefix || !fname || !lname || !birthday || !profile_img) {
    return res
      .status(400)
      .send({ status: false, message: "All fields are required" });
  }

  if (prefix != 0 && prefix != 1 && prefix != 2) {
    return res
      .status(400)
      .send({ status: false, message: "Prefix must be 0, 1, or 2" });
  }

  try {
    const last_update = new Date().toISOString().slice(0, 19).replace("T", " ");
    const birthday_convert = new Date(Number(birthday)).toISOString().slice(0, 19).replace("T", " ");
    db.query(
      "INSERT INTO Users (prefix, fname, lname, birthday, profile, last_update) VALUES (?, ?, ?, ?, ?, ?)",
      [prefix, fname, lname, birthday_convert, profile_img, last_update],
      (err, result) => {
        if (err) {
          return res.status(500).send({ status: false, message: err.message });
        }
        return res
          .status(201)
          .send({ status: true, message: "Data inserted successfully" });
      }
    );
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM Users", (err, result) => {
    if (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
    return res.status(200).send({ status: true, data: result });
  });
});

app.post("/api/delete/:id", (req, res) => {
  const id = req.params.id;
  
  db.query("DELETE FROM Users WHERE id = ?", id, (err, result) => {
    if (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
    return res
      .status(200)
      .send({ status: true, message: "Data deleted successfully" });
  });
});

app.get("/api/user/:id", (req, res) => {
  const id = req.params.id;
  
  db.query("SELECT * FROM Users WHERE id = ?", id, (err, result) => {
    if (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
    return res.status(200).send({ status: true, data: result });
  });
});

app.post("/api/update/:id",upload.none(), (req, res) => {
  const id = req.params.id;
  const { prefix, fname, lname, birthday } = req.body;
  
  if (!prefix || !fname || !lname || !birthday) {
    return res
      .status(400)
      .send({ status: false, message: "All fields are required" });
  }

  if (prefix != 0 && prefix != 1 && prefix != 2) {
    return res
      .status(400)
      .send({ status: false, message: "Prefix must be 0, 1, or 2" });
  }

  try {
    const last_update = new Date().toISOString().slice(0, 19).replace("T", " ");
    const birthday_convert = new Date(Number(birthday)).toISOString().slice(0, 19).replace("T", " ");
    db.query(
      "UPDATE Users SET prefix = ?, fname = ?, lname = ?, birthday = ?, last_update = ? WHERE id = ?",
      [prefix, fname, lname, birthday_convert, last_update, id],
      (err, result) => {
        if (err) {
          return res.status(500).send({ status: false, message: err.message });
        }
        return res
          .status(200)
          .send({ status: true, message: "Data updated successfully" });
      }
    );
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
