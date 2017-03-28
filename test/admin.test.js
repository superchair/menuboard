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
        this.browser.visit('/admin', done);
    });

    it('should exist', function() {
        assert.ok(this.browser.success);
        this.browser.assert.text('title', 'Menuboard - Administration');
    });

    it('should have a confirm delete modal', function() {
        var document = this.browser.document;

        var modal = document.getElementById('confirmDelete');
        chai.assert(modal, 'Confirm Delete modal does not exist');
    });

    it('should have a product entry modal', function() {
        var document = this.browser.document;

        var modal = document.getElementById('productModal');
        chai.assert(modal, 'Product entry modal does not exist');
    });

    it('should have a price entry modal', function() {
        var document = this.browser.document;

        var modal = document.getElementById('priceModal');
        chai.assert(modal, 'Price entry modal does not exist');
    });

    it('should show a product list', function() {
        var document = this.browser.document;

        var productList = document.getElementById('products');
        chai.assert(productList, 'Product list div does not exist');
        productList.children.length.should.be.above(0);
    });
});
