const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();

app.enable("trust proxy");

app.use(helmet());
app.use(morgan("common"));
app.use(express.json());
app.use(express.static("./public"));

module.exports = app;
