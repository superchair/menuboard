'use strict';

var abstractRouter = require('./abstract.router.js');

module.exports.ProductsRouter = class ProductsRouter extends abstractRouter.AbstractRouter {
    constructor(router, connection) {
        super(router,connection);

        let self = this;

        self.router.get('/products', function(req, res) {
            console.log('Fetching all products...');
            self.query(
                'SELECT * FROM ??',
                [
                    'products'
                ]
            ).then(
                function(rows) {
                    self.handleResponse(res, rows);
                },
                function(err) {
                    self.handleError(res, err);
                }
            );
        });


        self.router.post('/products', function(req, res) {
            console.log('Creating product...');

            if(req.busboy) {
                let name, imgPath, errStr;

                req.busboy.on(
                    'file',
                    function(fieldname, file, filename, encoding, mimetype) {
                        console.log(fieldname);
                        if(fieldname == 'img') {
                            self.writeFile(filename, file);
                            imgPath = filename;
                        }
                    }
                );

                req.busboy.on(
                    'field',
                    function(fieldname, val, fieldnameTruncated, valTruncated) {
                        if(fieldname == 'name') {
                            name = val;
                        }
                    }
                );

                req.busboy.on(
                    'finish',
                    function() {
                        if(errStr) {
                            self.handleError(res, errStr);
                        } else if(name && imgPath) {
                            self.query(
                                'INSERT INTO ??(??,??) VALUES (?,?)',
                                [
                                    'products',
                                    'name',
                                    'img',
                                    name,
                                    imgPath 
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
                            self.handleError(res, '[POST] /products requires name and image');
                        }
                    }
                );

                req.pipe(req.busboy);
            } else {
                self.handleError(res, 'Could not parse form data');
            }
        });

        self.router.get('/products/:product_id', function(req, res) {
            console.log('Fetching product id: ' + req.params.product_id);
            self.query(
                'SELECT * FROM ?? WHERE ??=?',
                [
                    'products',
                    'id',
                    req.params.product_id
                ]
            ).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        self.handleResponse(res, rows);
                    }
                },
                function(err) {
                    self.handleError(res, err);
                }
            );
        });

        self.router.put('/products/:product_id', function(req, res) {
            console.log('Updating product id: ' + req.params.product_id);
            self.query(
                'SELECT * FROM ?? WHERE ??=?',
                [
                    'products',
                    'id',
                    req.params.product_id
                ]
                ).then(
                    function(rows) {
                        // we got a row back
                        if(!rows || rows.length == 0) {
                            self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                        } else {
                            let row = rows[0];

                            if(req.busboy) {
                                let nName, nFile, nFilename;

                                req.busboy.on(
                                    'file',
                                    function(fieldname, file, filename, encoding, mimetype) {
                                        console.log(fieldname);
                                        if(fieldname == 'img') {
                                            nFile = file;
                                            nFilename = filename;
                                        }
                                    }
                                );

                                req.busboy.on(
                                    'field',
                                    function(fieldname, val, fieldnameTruncated, valTruncated) {
                                        if(fieldname == 'name') {
                                            nName = val;
                                        }
                                    }
                                );

                                req.busboy.on(
                                    'finish',
                                    function() {
                                        let name = nName ? nName : row.name;
                                        let imgPath = nFilename ? nFilename : row.img;
                                        if(imgPath !== row.img) {
                                            self.writeFile(nfilename, nFile);
                                        }
                                        self.query(
                                            'UPDATE ?? SET ??=?, ??=? WHERE ??=?',
                                            [
                                                'products',
                                                'name',
                                                name,
                                                'img',
                                                imgPath,
                                                'id',
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


        self.router.delete('/products/:product_id', function(req, res) {
            console.log('Delete product id: ' + req.params.product_id);
            self.query(
                'SELECT * FROM ?? WHERE ??=?',
                [
                    'products',
                    'id',
                    req.params.product_id
                ]
            ).then(
                function(rows) {
                    if(!rows || rows.length == 0) {
                        self.handleError(res, 'Product id ' + req.params.product_id + ' does not exist');
                    } else {
                        self.query(
                            'DELETE FROM ?? WHERE ??=?',
                            [
                                'products',
                                'id',
                                req.params.product_id
                            ]
                        ).then(
                            function(rows) {
                                if(!rows) {
                                    self.handleError(res, 'Error performing query');
                                } else {
                                    console.log(rows);
                                    self.handleResponse(res, rows);
                                }
                            },
                            function(err) {
                                self.handleError(res, err);
                            }
                        )
                    }
                },
                function(err) {
                    self.handleError(res, err);
                }
            );
        });
    }
}
