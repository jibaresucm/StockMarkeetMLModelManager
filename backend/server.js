const express = require('express')
const path = require('path')
const auth = require("./Routers/auth.js")
const api = require("./Routers/api.js")
const cookieParser = require('cookie-parser')

const PORT = 5050

const app = express()

app.use(express.json())//Hace el parse de los datos como json
app.use(express.static(path.join(__dirname, '../frontend/dist')))//Permite servir datos estaticamente
app.use(express.urlencoded({ extended: true }))//De la url al body
app.use(cookieParser())//Parsea cookies y las guarda en req cookies

//Añadir llamadas a la api
app.use("/api" , api)

//Añadir el servicio de auth
app.use("/auth" ,auth)

//Para usar el react router
app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, '/../frontend/dist/index.html')
  );
});

app.listen(port= PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})