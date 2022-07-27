require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fileupload = require("express-fileupload");

const apiRouter = require("./src/routes");
const db = require("./src/db");

const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(fileupload());

server.use(express.static(__dirname + "/public"));

server.use("/", apiRouter);

db.authenticate();
db.sync()
    .then(console.log("Database connected"))
    .catch((err) => console.log(err));

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
