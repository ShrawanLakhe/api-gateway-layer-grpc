'use strict';

const path = require('path');
require('dotenv').config({path: path.join(__dirname, "conf/.env")});

global.__serviceDir = __dirname;

const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const hpp = require('hpp');
const uuidv4 = require('uuid/v4');
const useragent = require('useragent');
const requestIp = require('request-ip');
const device = require('express-device');
const HTTPStatus = require('http-status');
const messageConfig = require('./lib/configs/message.config');
const logWriter = require('./lib/helpers/application-log-writer.helper.js');
const router = require('./lib/routes');
const cors = require('cors');

const app = express();
app.use(cors());
app.options('*', cors());

app.use(device.capture());

// Middleware for checking the logged in status
app.use((req, res, next) => {
    req.root_dir = __dirname;
    req.client_ip_address = requestIp.getClientIp(req);
    req.client_device = `${req.device.type} ${req.device.name}`;

    req.debug_id = uuidv4();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization,x-access-token,Accept');
    // Set cache control header to eliminate cookies from cache
    res.setHeader('Cache-Control', 'no-cache="Set-Cookie, Set-Cookie2"');

    next();
});

//fetch live from the remote servers to keep useragent upto date
useragent(true);
logWriter.init(app);

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: true}));
// create application/json parser
app.use(bodyParser.json());
app.use(hpp());

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }

}));


// if server behind proxy, then below should be uncommented
app.set('trust proxy', 1) // trust first proxy
//Map the Routes
router.init(app);

// development and production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    if (err) {
        console.log("\x1b[41m", err);
    }
    if(!res.headersSent) {
        return res
            .status(HTTPStatus.INTERNAL_SERVER_ERROR)
            .json({
                message: (app.get('env') === 'development') ? err : messageConfig.errorMessage.internalServerError
            });
    }
});

module.exports = app;