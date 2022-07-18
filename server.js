require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileupload = require("express-fileupload");

const apiRouter = require("./src/routes");

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
});
mongoose.Promise = global.Promise;

mongoose.connection.on("error", (error) => {
    console.log(error.message);
});

const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(fileupload());

server.use(express.static(__dirname + "/public"));

server.use("/", apiRouter);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
