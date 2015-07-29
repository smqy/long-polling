/**
 * Created by shaomingquan on 15/7/29.
 */
var lp = require("../../lp-server");

var lpServer = lp();

lpServer.on("connection" ,function(sockect){
    console.log("someone join ,now there are ", lpServer.getUserAmount() ," users");
    sockect.on("clientMsg" ,function(data){
        sockect.broadcast(data);
    });
    sockect.on("disconnect" ,function(){
        console.log("someone leave ,now there are ", lpServer.getUserAmount() ," users");
    })
})