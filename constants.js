const path = require("path");

const NOT_FOUND_PATH = path.join(__dirname, "public/404.html");

// request status
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

module.exports.NOT_FOUND_PATH = NOT_FOUND_PATH;
module.exports.NOT_FOUND = NOT_FOUND;
module.exports.INTERNAL_SERVER_ERROR = INTERNAL_SERVER_ERROR;
