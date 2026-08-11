const fs = require("fs");
const log = fs.readFileSync("filter.log", "utf-8");
console.log(log.slice(0, 1500));