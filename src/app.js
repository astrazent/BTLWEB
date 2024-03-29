// import express
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const webRoutes = require('./routes/web');
const connection = require('./config/database');
const cookie = require('cookie-parser');
//using .env file
require('dotenv').config();

//Build app using express
const app = express();
const port = process.env.PORT || 8081; // tham chiếu sang file .env
const hostname = process.env.HOST_NAME;

//config cookie
app.use(cookie());
//config req.body
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data


//config template engine
configViewEngine(app);

//Khai báo route
app.use('/api', webRoutes);
app.use('/', webRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})