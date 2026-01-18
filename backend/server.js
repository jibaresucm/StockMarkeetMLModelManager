const express = require('express')
const app = express()

const PORT = 47321

app.use(express.json())

app.get("*", (res, rep) =>{
    
})

app.listen(port= PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})