const mysql = require("mysql2/promise")

const MYSQL_HOST = process.env.MYSQL_HOST || "localhost"

const db = mysql.createPool({
  host: MYSQL_HOST,
  user: 'root',
  password: 'password',
  database: 'mlmodelweb',
  timezone: "local",
  port: 3306
});


module.exports = db

