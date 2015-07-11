// long-polling.js

//tcp server 
var net = require("net");

var tcpServer = net.createServer();

var sockets = [];

tcpServer.on("connection" ,function(socket){

	sockets.push(socket);

	console.log("join... now there is ",sockets.length ," client");

	socket.on("data" ,function(data){

		sockets.forEach(function(currentSocket){
			if(socket != currentSocket){
				currentSocket.write(data);
			}
		})

	});

	socket.on("close" ,function(){
		var index = sockets.indexOf(socket);
		sockets.splice(index ,1);
		console.log("disconnect... now there is ",sockets.length ," client");
	})

})

tcpServer.listen(3001);


//http server

var polling = require("polling");

var uuid = require("uuid");

var fs = require("fs");

var conns = {};

var httpServer = require("http").createServer(function(req ,res){

	var url,ID,conn;

	url = req.url;

	if(url == "/"){


		ID = uuid.v1();

		conn = net.createConnection("3001" ,"localhost");

		conns[ID] = conn;

		fs.readFile(__dirname + "/polling.html" ,function(err ,data){
			data = data.toString();
			res.end(data.replace("XXXXX" ,ID));
		})

	}else if(url.indexOf("/getMsg") >= 0){

		var ID = getParams(url).ID;

		res.setTimeout(60*60*1000);

		polling.on(ID ,res);
		
		conns[ID].on("data" ,function(data){
			polling.emit(ID,data);
		})
	}else if(url.indexOf("/sendMsg") >= 0){

		var params = getParams(url);

		ID = params["ID"];

		delete params.ID;

		params = JSON.stringify(params);

		conns[ID].write(params);

		res.end();

	}else if(url.indexOf("/kill") >= 0){
		ID = getParams(url).ID;

		conns[ID].end();

		delete conns[ID];

		res.end();
	}else{
		res.end("no that resource");
	}

});

function getParams(url){
	var qs = url.split("?")[1];
	var pms = qs.split("&");
	var pmLength = pms.length;
	var currentPm = []
	var result = {};
	for(var i = 0; i < pmLength ; i++){
		currentPm = pms[i].split("=");
		result[currentPm[0]] = currentPm[1];
	}
	return result;
}

httpServer.listen(3000);

