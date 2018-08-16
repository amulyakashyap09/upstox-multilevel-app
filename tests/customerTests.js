const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const supertest = require("supertest");
const apiUrl = supertest("http://localhost:7000")
let today = new Date();

describe("Customer", function(){
    it("should save customer to the database and return a 201 response", function(done){
        apiUrl.post("/v1/customer")
        .set("Accept", "application/x-www-form-urlencoded")
        .send({
            _id: parseInt(Date.now(), 10),
            isAmbassador: false,
            email: "amulyakashyap09@gmail.com",
            joiningDate: today,
            lastUpdated: today
        })
        .expect(201)
        .end(function(err, res){
            expect(res.body).should.be.an('object');
            expect(res.body).to.include.keys('code');
            expect(res.body).to.include.keys('message');
            expect(res.body).to.include.keys('data');
            done()
        })
    })
    
    it('should require authorization', function(done) {
        apiUrl.get('/v1/customers')
        .expect(401)
        .end(function(err, res) {
            if (err) return done(err);
            done();
        });
    });
    
    var auth = {};
    before(getToken(auth));

    it("should fetch all customers and return a 200 response", function(done){
        apiUrl.get("/v1/customers")
        .set("Authorization", auth.token)
        .expect(200)
        .end(function(err, res){
            expect(res.body).should.be.an('object');
            expect(res.body).to.include.keys('code');
            expect(res.body).to.include.keys('message');
            expect(res.body).to.include.keys('data');
            expect(res.body.data).to.be.instanceof('array');
            done();
        })
    })
    
    it("should not update invalid customer to ambassador and return a 200 response", function(done){
        var id = parseInt(Date.now(), 10)
        apiUrl.put("/v1/customer/ambassador/"+id)
        .set("Accept", "application/x-www-form-urlencoded")
        .set("Authorization", auth.token)
        .expect(200)
        .end(function(err, res){
            expect(res.body).should.be.an('object');
            expect(res.body).to.include.keys('code');
            expect(res.body).to.include.keys('message');
            expect(res.body).to.include.keys('data');
            done()
        })
    })

    it("should not update invalid customer using invalid referral id and return a 500 response", function(done){
        apiUrl.put("/v1/customer/referral")
        .set("Accept", "application/x-www-form-urlencoded")
        .set("Authorization", auth.token)
        .send({
            id: parseInt(Date.now(), 10),
            referralId: parseInt(Date.now(), 10),
        })
        .expect(500)
        .end(function(err, res){
            expect(res.body).should.be.an('object');
            expect(res.body).to.include.keys('code');
            expect(res.body).to.include.keys('message');
            done()
        })
    })
    
    it("should not fetch customer children by invalid id and return a 404 response", function(done){
        var id = parseInt(Date.now(), 10)
        apiUrl.get("/v1/customer/children/"+id)
        .expect(404)
        .end(function(err, res){
            expect(res.body).should.be.an('object');
            expect(res.body).to.include.keys('code');
            expect(res.body).to.include.keys('message');
            done();
        })
    })
})

function getToken(auth) {
    return function(done) {
        apiUrl.post("/v1/customer")
        .set("Accept", "application/x-www-form-urlencoded")
        .send({
            _id: parseInt(Date.now(), 10),
            isAmbassador: false,
            email: "amulyakashyap09@gmail.com",
            joiningDate: today,
            lastUpdated: today
        })
        .expect(201)
        .end(function(err, res){
            auth.token = res.body.data.token;
            return done()
        })
    };
}