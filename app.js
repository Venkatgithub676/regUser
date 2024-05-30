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
  const hashedPassword = await bcrypt.hash(password, 10);
  const dbUser = await db.get(getUser);
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const createUser = `insert into user(name,username,password,gender,location) 
            values('${name}','${username}','${hashedPassword}','${gender}','${location}')`;
      await db.run(createUser);
      response.send("User created successfully");
      response.status(200);
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  //   console.log(password);
  //   console.log(hashedPassword);
  const getUser = `select *  from user where username='${username}';`;
  const dbUser = await db.get(getUser);
  console.log(dbUser);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const comparePassword = await bcrypt.compare(password, dbUser.password);
    if (comparePassword) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password/", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const getUser = `select * from user where username='${username}';`;
  const dbUser = await db.get(getUser);
  const comparePass = await bcrypt.compare(oldPassword, dbUser.password);
  if (comparePass) {
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const updateUserPass = `update user set password='${hashedPassword}' where username='${username}';`;
      const res = await db.run(updateUserPass);
      response.send("Password updated");
      response.status(200);
    }
  } else {
    response.status(400);
    response.send("Invalid current password");
  }
});

module.exports = app;
