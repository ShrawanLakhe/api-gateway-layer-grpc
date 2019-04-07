'use strict';

((routers) => {

    const HTTPStatus = require('http-status');
    const helloWorldServiceClientHelper = require('../grpc-client-helpers/modules/hello-world-service')

    routers.init = (app) => {

        app.get('/api/v1/hello-world/get/:format', helloWorldServiceClientHelper.printHelloWorld);

        app.get('/api/v1/health-check', (req, res, next) => {
            res
                .status(HTTPStatus.OK)
                .json({
                    message: 'health is OK'
                });
        });

        // catch 404 and forward to error handler
        app.use('/api/v1/*', (req, res, next) => {
            res
                .status(HTTPStatus.NOT_FOUND)
                .json({
                    message: 'Api Route not available'
                });
        });

    };

})(module.exports);