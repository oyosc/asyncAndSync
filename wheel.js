/**
 * Created by Administrator on 2016/10/9.
 */
var eventProxy = require('eventproxy');


var ep = new eventProxy();

function syncAndAsync(Tasks, callback){
    if(typeof Tasks != 'object'){
        err = "no functionArray";
        return callback(err, null);
    }
    var syncResult = {};
    var allResult = [];
    var asyncIndex = 0;
    var syncIndex = 0;
    var asyncLength = 0;
    var syncLength = 0;
    
    function eachOf(coll, iteratee, callback){
        var index = 0,
            length = coll.length;
        if(length == 0){
            callback(null);
        }
        
        function iterateeCallback(err){
            if(err){
                callback(err);
            }else if(++syncIndex == length){
                
                callback(null);
            }
        }
        
        for(; index < length; index++){
            iteratee(coll[index], index, onlyOnce(iterateeCallback));
        }
    }
    
    function nextTask(asyncTask, args){
        if(asyncIndex == asyncLength){
            allResult['async'] = [null].concat(args);
            ep.emit('asyncFinish', allResult);
            ep.on('syncFinish', function(data){
                console.log('11');
                return callback(null, data);
            })
            console.log('33');
            return;
        }
        var taskCallback = onlyOnce(baseRest(function(err, args){
            if(err){
                allResult['async'] = [err].concat(args);
                return callback(null, allResult);
            }
            nextTask(asyncTask, args);
        }));
        
        args.push(taskCallback);
        var task = asyncTask[asyncIndex++];
        task.apply(null, args);
    }
    
    for(var i = 0; i< Tasks.length; i++){
        if(i === 0){
            syncLength = Tasks[0].length;
        }else{
            asyncLength = Tasks[1].length
        }
    }
    
    
    for(var index = 0; index< Tasks.length; index++){
        if(index == 0){
            eachOf(Tasks[0], function(task, index, callback1){
                task(baseRest(function(err, args){
                    if(args.length <= 1){
                        args = args[0];
                    }
                    syncResult[index] = args;
                    callback1(err);
                }));
            }, function(err){
                allResult['sync'] = syncResult;
                if(err){
                    callback(err, allResult);
                }
                ep.emit('syncFinish', allResult);
                ep.on('asyncFinish', function(data){
                    console.log('22');
                    return callback(null, data);
                });
                console.log('44');
            });
        }
        else{
            nextTask(Tasks[1], []);
        }
    }
    
    
    
}

function onlyOnce(fn){
    return function(){
        if(fn === null)
            return
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    }
}


function baseRest(func){
    start = func.length -1;
    return function(){
        var args = arguments,
            index = -1,
            length = args.length - start,
            array = Array(length);
        while(++index < length){
            array[index] = args[index+start]
        }
        index = -1;
        var otherArgs = Array(start+1);
        while(++index< start){
            otherArgs[index] = args[index]
        }
        otherArgs[start] = array;
        return apply(func, this, otherArgs);
    }
}

function apply(func, thisArg, args){
    switch(args.length){
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
}

exports.asyncAndSync = syncAndAsync;
