require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const CONSTANT = require('./constant');
const app = express();

app.set("superSecret", process.env.superSecret)

module.exports =  (req, res, next) => {
  
    var token = req.body.token || req.query.token || req.headers.authorization
    
    if(token) {
        token = token.split(" ")[1];
        jwt.verify(token, app.get('superSecret'), function(err, decoded){
            if(err){
                return res.json({status: CONSTANT.FAIL, message:CONSTANT.MESSAGE.AUTHENTICATION_TOKEN_FAIL, error: err})
            } else {
                req.decoded = decoded
                next()
            }
        })
    } else {
        return res.status(403).send({status: CONSTANT.FAIL, message:CONSTANT.MESSAGE.NO_TOKEN_PROVIDED})
    }
}
