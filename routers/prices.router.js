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


        self.router.get('/products/:product_id/currentprice', function(req, res) {
            console.log('Fetching prices for product id: ' + req.params.product_id);
            self.getProductById(req.params.product_id).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        var nowStamp = Math.floor((new Date()).getTime() / 1000);
                        console.log(nowStamp);
                        self.query(
                            'SELECT * FROM ?? WHERE ??=? AND ??>=? AND ??<?',
                            [
                                'prices',
                                'productId',
                                req.params.product_id,
                                'startTime',
                                nowStamp,
                                'endTime',
                                nowStamp
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
                            let price, type, startTime, endTime;

                            req.busboy.on(
                                'field',
                                function(fieldname, val, fieldnameTruncated, valTruncated) {
                                    switch(fieldname) {
                                        case 'price':
                                            price = val;
                                            break;

                                        case 'type':
                                            type = val;
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
                                    if(price %% type && startTime && endTime && startTime < endTime) {
                                        self.query(
                                            'INSERT INTO ??(??,??,??,??,??) VALUES (?,?,?,?,?)',
                                            [
                                                'prices',
                                                'price',
                                                'type',
                                                'startTime',
                                                'endTime',
                                                'productId',
                                                price,
                                                type,
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


        self.router.put('/products/:product_id/prices/:price_id', function(req, res) {
            console.log('Updating price id ' + req.params.price_id + ' for product id ' + req.params.product_id);

            self.getPriceById(req.params.price_id).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        if(req.busboy) {
                            let row = rows[0];
                            let price = row.price;
                            let type = row.type;
                            let startTime = row.startTime;
                            let endTime = row.endTime;

                            req.busboy.on(
                                'field',
                                function(fieldname, val, fieldnameTruncated, valTruncated) {
                                    switch(fieldname) {
                                        case 'price':
                                            price = val;
                                            break;

                                        case 'type':
                                            type = val;
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
                                    if(price && startTime && endTime && startTime < endTime) {
                                        self.query(
                                            'UPDATE ?? SET ??=?, ??=?, ??=?, ??=? WHERE ??=?',
                                            [
                                                'prices',
                                                'price',
                                                price,
                                                'type',
                                                type,
                                                'startTime',
                                                startTime,
                                                'endTime',
                                                endTime,
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
                                    } else {
                                        self.handleError(res, 'Bad parameters');
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

    getPriceById(id) {
        return this.query(
            'SELECT * FROM ?? WHERE ??=?',
            [
                'prices',
                'id',
                id
            ]
        );
    }
}
