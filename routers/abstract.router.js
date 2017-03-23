'use strict';

var mysql = require('mysql');
var path = require('path');
var fs = require('fs');

module.exports.AbstractRouter = class AbstractRouter {
    constructor(router, connection) {
        this.router = router;
        this.connection = connection;
        this.imgPath = '/tmp/menuboard/img/';
    }

    handleError(res, errStr) {
        console.error(errStr);
        res.json({
            'error': true,
            'message': errStr
        });
    }

    handleResponse(res, resObj, message) {
        message = message ? message : 'ok';
        res.json({
            'error': false,
            'message': message,
            'data': resObj
        });
    }

    query(query, table) {
        let self = this;
        return new Promise(
            (resolve, reject) => {
                query = mysql.format(query, table);
                console.log('Query: ' + query);
                self.connection.query(query, function(err, rows) {
                    if(err) {
                        reject('Error performing query: ' + err);
                    } else {
                        resolve(rows);
                    }
                });
            }
        );
    }

    writeFile(filename, file) {
        let self = this;
        var saveTo = path.join(self.imgPath, path.basename(filename));
        if(!fs.existsSync(saveTo)) {
            file.pipe(fs.createWriteStream(saveTo));
        } else {
            file.resume();
        }
    }
}
