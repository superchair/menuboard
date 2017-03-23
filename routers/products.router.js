'use strict';

var abstractRouter = require('./abstract.router.js');

module.exports.ProductsRouter = class ProductsRouter extends abstractRouter.AbstractRouter {
    constructor(router, connection) {
        super(router,connection);

        let self = this;

        self.router.get('/products', function(req, res) {
            console.log('Fetching all products...');
            self.query(
                'SELECT * FROM ?? ORDER BY ?? ASC',
                [
                    'products',
                    'ordinal'
                ]
            ).then(
                function(rows) {
                    self.updateOrdering();
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
                let name, imgPath;

                req.busboy.on(
                    'file',
                    function(fieldname, file, filename, encoding, mimetype) {
                        if(fieldname == 'img') {
                            imgPath = filename;
                            self.writeFile(filename, file);
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
                        if(name && imgPath) {
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
                                        self.updateOrdering().then(
                                            function() {
                                                self.handleResponse(res, rows);
                                            },
                                            function() {
                                                self.handleResponse(res, rows);
                                            }
                                        );
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
                                let nName, nFile, nFilename, nOrdinal;

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
                                        switch(fieldname) {
                                            case 'name':
                                                nName = val;
                                                break;

                                            case 'ordinal':
                                                nOrdinal = val;
                                                break;
                                        }
                                    }
                                );

                                req.busboy.on(
                                    'finish',
                                    function() {
                                        let name = nName ? nName : row.name;
                                        let imgPath = nFilename ? nFilename : row.img;
                                        let ordinal = nOrdinal ? nOrdinal : row.ordinal;
                                        if(imgPath !== row.img) {
                                            self.writeFile(nfilename, nFile);
                                        }
                                        self.query(
                                            'UPDATE ?? SET ??=?, ??=?, ??=? WHERE ??=?',
                                            [
                                                'products',
                                                'name',
                                                name,
                                                'img',
                                                imgPath,
                                                'ordinal',
                                                ordinal,
                                                'id',
                                                req.params.product_id
                                            ]
                                            ).then(
                                                function(rows) {
                                                    self.updateOrdering().then(
                                                        function() {
                                                            self.handleResponse(res, rows);
                                                        },
                                                        function() {
                                                            self.handleResponse(res, rows);
                                                        }
                                                    );
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
                                    self.updateOrdering().then(
                                        function() {
                                            self.handleResponse(res, rows);
                                        },
                                        function() {
                                            self.handleResponse(res, rows);
                                        }
                                    );
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

    updateOrdering() {
        console.log('Updating product order...');
        let query1 = 'SET @ordinal_inc=10';
        let query2 = 'SET @new_ordinal=0';
        let query3 = 'UPDATE products SET ordinal=(@new_ordinal := @new_ordinal + @ordinal_inc) ORDER BY ordinal ASC';
        let self = this;

        return new Promise(
            (resolve, reject) => {
                self.connection.query(query1, function(err, rows) {
                    if(err) {
                        console.log(err);
                        reject()
                    } else {
                        self.connection.query(query2, function(err, rows) {
                            if(err) {
                                console.log(err);
                                reject();
                            } else {
                                self.connection.query(query3, function(err, rows) {
                                    if(err) {
                                        console.log(err);
                                        reject()
                                    } else {
                                        console.log('Updating product order complete!');
                                        resolve();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        );
    }
}
