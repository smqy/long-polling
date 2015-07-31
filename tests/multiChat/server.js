/**
 * Created by shaomingquan on 15/7/29.
 */
var lp = require("../../lp-server");

var lpServer = lp();

lpServer.on("connection" ,function(sockect){
    console.log("someone join ,now there are new user");
    sockect.on("clientMsg" ,function(data){
        console.log("clientMsg trigger" ,data);
        sockect.broadcast("serverMsg",data);
    });
    sockect.on("disconnect" ,function(){
        console.log("someone leave ,now there someone leave");
    })
})

lpServer.listen(3000 ,function(){
    console.log("server listen on port 3000");
});