const mysql = require("mysql2/promise")


const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mlmodelweb',
  timezone: "local",
  port: 3306
});


module.exports = db

