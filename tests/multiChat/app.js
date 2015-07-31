/**
 * Created by shaomingquan on 15/7/30.
 */
var fs = require("fs");
require("http").createServer(function(req,res){
    if(req.url == "/lp-client.js"){
        var page = fs.readFileSync("../../lp-client.js");
        res.end(page);
    }else{
        var page = fs.readFileSync("./index.html");
        res.end(page);
    }
}).listen(3002);