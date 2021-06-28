const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./server/routes');
const http = require("http");
const cors = require('cors');

const app = express();

//cors
app.use(cors())
// bodyparser
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Server 
const server = http.createServer(app);

// Routes
app.use('/', routes);

// Handles any requests that do not match the ones above

const PORT = process.env.PORT || 5000;

server.listen(PORT, (err) => {
    if (!err) {
        console.log('site is live');
    }
    else {
        console.log(err);
    };
});