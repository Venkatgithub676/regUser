const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const { open } = sqlite;
const path = require("path");
const bcrypt = require("bcrypt");
const dbPath = path.join(__dirname, "userData.db");
let db = null;
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at http://localhost:3000/`);
    });
  } catch (err) {
    console.log(`DB Error : ${err.message}`);
  }
};

initializeDBAndServer();

// register user api
app.post("/register/", async (request, response) => {
  const { name, username, password, gender, location } = request.body;
  const getUser = `select * from user where username='${username}';`;
  const hashedPassword = bcrypt.hash(password, 10);
  const dbUser = await db.get(getUser);
  if (dbUser === undefined) {
    if (password.length > 5) {
      const createUser = `insert into user(name,username,password,gender,location) 
            values('${name}','${username}','${hashedPassword}','${gender}','${location}')`;
      await db.run(createUser);
      response.send("User created successfully");
      response.status(200);
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
