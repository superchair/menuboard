'use strict';

var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

var routers = {
    products: require('./routers/products.router.js'),
    prices: require('./routers/prices.router.js')
};

function REST(){
    var self = this;
    self.connectMysql(3310);
};

REST.prototype.port = 3000;

REST.prototype.connectMysql = function(port) {
    var self = this;
    var pool = mysql.createPool({
        connectionLimit : 100,
        host     : 'localhost',
        port     : port,
        user     : 'root',
        password : 'edomtluda11',
        database : 'menuboard',
        debug    :  false
    });
    pool.getConnection(function(err,connection){
        if(err) {
            self.connectMysql(3306);
        } else {
            self.configureExpress(connection);
        }
    });
}

REST.prototype.configureExpress = function(connection) {
    var self = this;
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(busboy());
    app.use('/', express.static('public'));
    app.use('/admin', express.static('admin'));
    var router = express.Router();
    app.use('/api', router);

    var productsRouter = new routers.products.ProductsRouter(router, connection);
    var pricesRouter = new routers.prices.PricesRouter(router, connection);
    
    self.startServer();
}

REST.prototype.startServer = function() {
    var self = this;
    app.listen(self.port, function(){
        console.log('MenuBoard API - Port ' + self.port);
    });
}

REST.prototype.stop = function(err) {
    console.log('ISSUE WITH MYSQL n' + err);
    process.exit(1);
}

new REST();

var app = module.exports = express();
