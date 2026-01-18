const express = require('express')
const app = express()
const path = require('path');

const PORT = 5050

app.use(express.json())


app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, '/../frontend/index.html')
  );
});

app.listen(port= PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})