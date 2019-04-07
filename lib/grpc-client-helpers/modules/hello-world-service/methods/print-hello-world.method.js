'use strict';

(() => {

    const HTTPStatus = require('http-status');
    const grpcClient = require('../../../grpc-client.helper');
    const client = grpcClient.init("0.0.0.0", 50051, "hello.proto", "HelloWorldRpc");
    const HelloWorldPb = require(`${global.__serviceDir}/protos/build/hello_pb`);

    module.exports = async (req, res, next) => {
        try {
            console.log('req.debug_id', req.debug_id)
            const payload = {
                debug: {
                    debugId: req.debug_id
                }
            };
            client.printHelloWorld(payload, (err, response) => {
                if (err) {
                    console.error('Error while logging in => ', err.stack);
                }

                console.log(">>>>>>>>>>>> response <<<<<<<<<<<<<<<<<", response.success);
                if(req.params && req.params.format === 'json') {
                    return res
                        .status(HTTPStatus.OK)
                        .json({
                            msg: response.msg,
                            success: response.success
                        });
                } else {
                    const helloWorldMessage = new HelloWorldPb.HelloWorldResponse();
                    helloWorldMessage.setMsg(response.msg);
                    helloWorldMessage.setSuccess(response.success);
                    // Serializes to a UInt8Array.
                    const bytes = helloWorldMessage.serializeBinary();
                    console.log('bytes', bytes);
                    return res
                        .status(HTTPStatus.OK)
                        .set('Content-Type', 'application/protobuf')
                        .send(Buffer.from(bytes));
                }
            });
        } catch (err) {
            console.error('Error while logging in => ', err.stack);
            return next(err);
        }
    };

})();
