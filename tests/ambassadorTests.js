const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const supertest = require("supertest");
const apiUrl = supertest("http://localhost:7000")
let today = new Date();

describe("Ambassador", function(){
    it("should save customer as ambassador to the database and return a 201 response", function(done){
        apiUrl.post("/v1/ambassador")
        .set("Accept", "application/x-www-form-urlencoded")
        .send({
            _id: parseInt(Date.now(), 10),
            isAmbassador: true,
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
        apiUrl.get('/v1/ambassador/children/{id}')
        .expect(401)
        .end(function(err, res) {
            if (err) return done(err);
            done();
        });
    });
    
    var auth = {};
    before(getToken(auth));

    it("should not fetch invalid ambassador and return a 404 response", function(done){
        var id = parseInt(Date.now(), 10)
        apiUrl.get("/v1/ambassador/children/"+id)
        .set("Authorization", auth.token)
        .expect(404)
        .end(function(err, res){
            expect(res.body).should.be.an('object');
            expect(res.body).to.include.keys('code');
            expect(res.body).to.include.keys('message');
            done();
        })
    })

    it("should fetch n level of children and return a 202 response", function(done){
        apiUrl.get("/v1/ambassador/level/children")
        .set("Authorization", auth.token)
        .send({
            id: 12321212,
            level: 2,
          })
        .expect(200)
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