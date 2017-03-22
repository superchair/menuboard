var mysql = require('mysql');
var path = require('path');
var os = require('os');
var fs = require('fs');

var imgPath = '/tmp/menuboard/img/';

function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    router.get('/', function(req, res) {
        res.json({
            'Error': false,
            'Message': 'Status: OK'
        });
    });

    router.get('/products', function(req, res) {
        console.log('Fetching all products...');
        var query = 'SELECT * FROM ??';
        var table = [
            'products'
        ];

        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if(err) {
                var errStr = 'Error getting rows: ' + err;
                console.log(errStr);
                res.json({
                    'Error': true,
                    'Message': errStr
                });
            } else {
                var count = rows ? rows.length : 0;
                console.log('Got ' + count + ' rows');
                res.json({
                    'Error': false,
                    'Message': 'OK',
                    'count': count,
                    'products': rows
                });
            }
        });
    });

    router.get('/products/:product_id', function(req, res) {
        console.log('Fetching product with id: ' + req.params.product_id);
        var query = 'SELECT * FROM ?? WHERE ??=?';
        var table = [
            'products',
            'id',
            req.params.product_id
        ];

        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if(err) {
                var errStr = 'Error getting rows: ' + err;
                console.log(errStr);
                res.json({
                    'Error': true,
                    'Message': errStr
                });
            } else if(!rows || rows.length == 0) {
                res.json({
                    'Error': true,
                    'Message': 'Product id ' + req.params.product_id + ' does not exist'
                });
            } else {
                res.json({
                    'Error': false,
                    'Message': 'OK',
                    'products': rows[0]
                });
            }
        });
    });

    router.put('/products', function(req, res) {
        console.log('creating new product');
        function onFormParsed(res, name, img) {
            if(name) {
                var query = 'INSERT INTO ??(??,??) VALUES (?,?)';
                var table = [
                    'products',
                    'name',
                    'img',
                    name,
                    img 
                ];
                query = mysql.format(query, table);
                connection.query(query,function(err, rows){
                    if(err || !rows) {
                        var errStr = 'Error executing query';
                        console.log(errStr);
                        res.json({
                            'Error': true,
                            'Message': errStr
                        });
                    } else {
                        console.log('Product created with id: ' + rows.insertId);
                        res.json({
                            'Error': false,
                            'Message': 'OK',
                            'product': {
                                id: rows.insertId,
                                name: name,
                                img: img
                            }
                        });
                    }
                });
            } else {
                res.json({
                    'Error': true,
                    'Message': 'A product \'name\' must be included'
                });
            }
        }

        if(req.busboy) {
            var name, img;

            req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                var saveTo = path.join(imgPath, path.basename(filename));
                file.pipe(fs.createWriteStream(saveTo));
                img = filename;
            });

            req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
                if(fieldname == 'name') {
                    name = val;
                }
            });

            req.busboy.on('finish', function() {
                console.log('Done parsing');
                onFormParsed(res, name, img);
            });

            req.pipe(req.busboy);
        } else {
            var errStr = 'Could not parse form data';
            console.log(errStr);
            res.json({
                'Error': true,
                'Message': errStr
            });
        }

    });

    router.delete('/products/:product_id', function(req, res) {
        console.log('Deleting product with id: ' + req.params.product_id);
        var getQuery = 'SELECT * FROM ?? WHERE ??=?';
        var getTable = [
            'products',
            'id',
            req.params.product_id
        ];
        getQuery = mysql.format(getQuery, getTable);
        connection.query(getQuery,function(err, rows){
            if(err) {
                var errStr = 'Error executing query';
                console.log(errStr);
                res.json({
                    'Error': true,
                    'Message': errStr
                });
            } else if(!rows || rows.length == 0) {
                var errStr = 'Product id ' + req.params.product_id + ' does not exist';
                console.log(errStr);
                res.json({
                    'Error': true,
                    'Message': errStr
                });
            } else {
                // this should only return 1 row
                for(var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var img = row.img;
                    if(img) {
                        // delete the image associated
                        fs.unlink(imgPath + img, function(err, stats) {
                            if(err) {
                                console.log('error ' + err + ' deleting image ' + imgPath + img);
                            } else {
                                console.log('image ' + imgPath + img + ' successfully deleted');
                            }
                        });
                    }

                    var delQuery = 'DELETE FROM ?? WHERE ??=?';
                    var delTable = [
                        'products',
                        'id',
                        req.params.product_id
                    ];
                    delQuery = mysql.format(delQuery, delTable);
                    connection.query(delQuery,function(err, rows){
                        if(err) {
                            var errStr = 'Error executing query';
                            console.log(errStr);
                            res.json({
                                'Error': true,
                                'Message': errStr
                            });
                        } else {
                            res.json({
                                'Error': false,
                                'Message': 'OK',
                                'product': {
                                    id: row.id,
                                    name: row.name,
                                    img: row.img
                                }
                            });
                        }
                    });
                }
            }
        });
    });

    router.get('/products/:product_id/prices', function(req, res) {
        console.log('Getting prices for product id: ' + req.params.product_id);
        var query = 'SELECT * FROM ?? WHERE ??=?';
        var table = [
            'prices',
            'product_id',
            req.params.product_id
        ];

        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if(err) {
                var errStr = 'Error executing query';
                console.log(errStr);
                res.json({
                    'Error': true,
                    'Message': errStr
                });
            } else {
                res.json({
                    'Error': false,
                    'Message': 'OK',
                    'count': rows ? rows.length : 0,
                    'products': rows
                });
            }
        });
    });

    router.put('/products/:product_id/prices', function(req, res) {
        if(req.busboy) {
            var price;

            req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
                if(fieldname == 'price') {
                    price= val;
                }
            });

            req.busboy.on('finish', function() {
                if(!price) {
                    res.json({
                        'Error': true,
                        'Message': 'Need to include price value'
                    });
                } else {
                    var query = 'INSERT INTO ??(??,??) VALUES (?,?)';
                    var table = [
                        'prices',
                        'productId',
                        'price',
                        req.params.product_id,
                        price
                    ];

                    query = mysql.format(query, table);
                    connection.query(query, function(err, rows) {
                        if(err || !rows) {
                            console.log('Error when inserting into DB', err);
                        } else {
                            res.json(
                                {
                                    'Error': false,
                                    'Message': 'OK',
                                    'price': {
                                        'id': rows.insertId,
                                        'productId': req.params.product_id,
                                        'price': price
                                    }
                                }
                            );
                        }
                    });
                }
            });

            req.pipe(req.busboy);
        } else {
            res.json(
                {
                    'Error': true,
                    'Message': 'Could not parse form data'
                }
            );
        }
    });
}

module.exports = REST_ROUTER;
