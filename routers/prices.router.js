'use strict';

var abstractRouter = require('./abstract.router.js');

module.exports.PricesRouter = class PricesRouter extends abstractRouter.AbstractRouter {
    constructor(router, connection) {
        super(router,connection);

        let self = this;

        self.router.get('/products/:product_id/prices', function(req, res) {
            console.log('Fetching prices for product id: ' + req.params.product_id);
            self.getProductById(req.params.product_id).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        self.query(
                            'SELECT * FROM ?? WHERE ??=?',
                            [
                                'prices',
                                'productId',
                                req.params.product_id
                            ]
                            ).then(
                                function(rows) {
                                    self.handleResponse(res, rows);
                                },
                                function(err) {
                                    self.handleError(res, err);
                                }
                            );
                    }
                },
                function(err) {
                    self.handleError(res, err);
                }
            );
        });


        self.router.get('/products/:product_id/prices/:price_id', function(req, res) {
            console.log('Fetching price id ' + req.params.price_id + ' for product id: ' + req.params.product_id);
            self.getProductById(req.params.product_id).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        self.query(
                            'SELECT * FROM ?? WHERE ??=?',
                            [
                                'prices',
                                'id',
                                req.params.price_id
                            ]
                            ).then(
                                function(rows) {
                                    self.handleResponse(res, rows);
                                },
                                function(err) {
                                    self.handleError(res, err);
                                }
                            );
                    }
                },
                function(err) {
                    self.handleError(res, err);
                }
            );
        });


        self.router.post('/products/:product_id/prices', function(req, res) {
            console.log('Creating new price for product id ' + req.params.product_id);

            self.getProductById(req.params.product_id).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        if(req.busboy) {
                            let price, startTime, endTime;

                            req.busboy.on(
                                'field',
                                function(fieldname, val, fieldnameTruncated, valTruncated) {
                                    switch(fieldname) {
                                        case 'price':
                                            price = val;
                                            break;

                                        case 'startTime':
                                            startTime = val;
                                            break;

                                        case 'endTime':
                                            endTime = val;
                                            break;
                                    }
                                }
                            );

                            req.busboy.on(
                                'finish',
                                function() {
                                    if(price) {
                                        self.query(
                                            'INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)',
                                            [
                                                'prices',
                                                'price',
                                                'startTime',
                                                'endTime',
                                                'productId',
                                                price,
                                                startTime,
                                                endTime,
                                                req.params.product_id
                                            ]
                                            ).then(
                                                function(rows) {
                                                    self.handleResponse(res, rows);
                                                },
                                                function(err) {
                                                    self.handleError(res, err);
                                                }
                                            );
                                    } else {
                                        self.handleError(res, '[POST] /products/:product_id/prices requires price');
                                    }
                                }
                            );

                            req.pipe(req.busboy);
                        } else {
                            self.handleError(res, 'Could not parse form data');
                        }
                    }
                },
                function(err) {
                    self.handleError(res, err);
                }
            );
        });


        self.router.delete('/products/:product_id/prices', function(req, res) {
            console.log('deleting all prices for product id: ' + req.params.product_id);
            self.getProductById(req.params.product_id).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        self.query(
                            'DELETE FROM ?? WHERE ??=?',
                            [
                                'prices',
                                'productId',
                                req.params.product_id
                            ]
                            ).then(
                                function(rows) {
                                    self.handleResponse(res, rows);
                                },
                                function(err) {
                                    self.handleError(res, err);
                                }
                            );
                    }
                },
                function(err) {
                    self.handleError(res, err);
                }
            );
        });


        self.router.delete('/products/:product_id/prices/:price_id', function(req, res) {
            console.log('deleting price id ' + req.params.price_id + ' for product id: ' + req.params.product_id);
            self.getProductById(req.params.product_id).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        self.query(
                            'DELETE FROM ?? WHERE ??=?',
                            [
                                'prices',
                                'id',
                                req.params.price_id
                            ]
                            ).then(
                                function(rows) {
                                    self.handleResponse(res, rows);
                                },
                                function(err) {
                                    self.handleError(res, err);
                                }
                            );
                    }
                },
                function(err) {
                    self.handleError(res, err);
                }
            );
        });
    }

    getProductById(id) {
        return this.query(
            'SELECT * FROM ?? WHERE ??=?',
            [
                'products',
                'id',
                id
            ]
        );
    }
}
