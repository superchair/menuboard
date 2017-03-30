var server = require('../server.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);

describe('Products', function() {
    it('should get all products', function(done) {
        chai.request(server)
            .get('/api/products')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('should get a product by id', function(done) {
        chai.request(server)
            .get('/api/products')
            .end((err, res) => {
                if(err) {
                    done(err);
                }

                res.body.should.be.an('object');
                res.body.should.include.keys('data');

                var data = res.body.data;

                data.should.be.an('array');
                data.length.should.be.above(0);

                var product = data[0];
                product.should.include.keys('id');
                product.should.include.keys('name');
                product.should.include.keys('img');
                product.should.include.keys('ordinal');

                var id = product.id;

                chai.request(server).get('/api/products/' + id)
                    .end((err, res) => {
                        if(err) {
                            done(err);
                        }

                        res.body.should.be.an('object');
                        res.body.should.include.keys('data');

                        var data = res.body.data;
                        data.should.be.an('array');
                        data.length.should.be.above(0);

                        var productB = data[0];
                        productB.should.include.keys('id');
                        productB.should.include.keys('name');
                        productB.should.include.keys('img');
                        productB.should.include.keys('ordinal');

                        productB.id.should.be.equal(product.id);
                        productB.name.should.be.equal(product.name);
                        productB.img.should.be.equal(product.img);

                        done();
                    });
            });
    })
});
