process.env.NODE_ENV = 'test'
var app = require('../server.js');
var Browser = require('zombie');
var assert = require('assert');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

describe('User Page Tests', function() {

    before(function(done) {
        setTimeout(function() {
            done();
        }, 1000);
    });

    before(function() {
        this.browser = new Browser({site: 'http://localhost:3000'});
    });

    before(function(done) {
        this.browser.visit('', done);
    });

    it('should exist', function() {
        assert.ok(this.browser.success);
        this.browser.assert.text('title', 'Menuboard');
    });

    it('should show products', function() {
        var document = this.browser.document;
        var productList = document.getElementById('products');
        chai.assert(productList, 'Product list div does not exist');
        productList.children.length.should.be.above(0);
    });
});
