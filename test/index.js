/**
 * Created by Administrator on 2016/10/17.
 */
var wheel = require('../wheel.js');
var request = require('request');

var functionArr = Array(2);
functionArr[0] = [];
functionArr[1] = [];
var syncFunction = function(cb){
    request('http://www.12306.com', function(error, response, body){
        if (!error && response.statusCode == 200) {
            cb(null, '12306');
        }else{
            cb(error, null);
        }
    });
}

var asyncFunction = function(cb){
    request('http://www.baidu.com', function(error, response, body){
        if (!error && response.statusCode == 200) {
            cb(null, 'baidu');
        }else{
            cb(error, null);
        }
    });
}

functionArr[0].push(syncFunction);
functionArr[1].push(asyncFunction);

describe('asyncAndSync', function(){
    it('test asyncAndSync', function(done){
        wheel.asyncAndSync(functionArr, function(err, result){
            if(result){
                console.log(result);
                done();
            }
            else{
                done();
            }
        })
    });
});