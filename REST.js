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
        res.json(
            {
                'Error': false,
                'Message': 'Status: OK'
            }
        );
    });

    router.post('/products', function(req, res) {
    });

    router.post('/product', function(req, res) {
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
                    if(err) {
                        res.json(
                            {
                                'Error': true,
                                'Message': 'Error executing MySQL query'
                            }
                        );
                    } else {
                        res.json(
                            {
                                'Error': false,
                                'Message': 'OK',
                                'product': {
                                    id: rows.insertId,
                                    name: name,
                                    img: imgPath + img
                                }
                            }
                        );
                    }
                });
            } else {
                res.json(
                    {
                        'Error': true,
                        'Message': 'A product \'name\' must be included'
                    }
                );
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
            res.json(
                {
                    'Error': true,
                    'Message': 'Could not parse form data'
                }
            );
        }

    });

    router.delete('/product', function(req, res) {
        var getQuery = 'SELECT * FROM ?? WHERE ??=?';
        var getTable = [
            'products',
            'name',
            req.body.name
        ];
        getQuery = mysql.format(getQuery, getTable);
        connection.query(getQuery,function(err, rows){
            if(err) {
                res.json(
                    {
                        'Error': true,
                        'Message': 'Error executing MySQL query'
                    }
                );
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
                        'name',
                        req.body.name
                    ];
                    delQuery = mysql.format(delQuery, delTable);
                    connection.query(delQuery,function(err, rows){
                        if(err) {
                            res.json(
                                {
                                    'Error': true,
                                    'Message': 'Error executing MySQL query'
                                }
                            );
                        } else {
                            res.json(
                                {
                                    'Error': false,
                                    'Message': 'OK',
                                    'product': {
                                        id: row.id,
                                        name: row.name,
                                        img: row.img
                                    }
                                }
                            );
                        }
                    });
                }
            }
        });
    });
}

module.exports = REST_ROUTER;
