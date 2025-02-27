const express = require('express')
const mongoose = require('mongoose')
const app = express();


mongoose.connect()
app.get("/", (req, res) => {
    res.json({
        msg: "Hii there"
    })
})

app.listen(5000, () => {
    console.log("running on 5000")
})