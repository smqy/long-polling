var net = require("net");
var http = require("http");
var polling = require("polling");
var uuid = require("uuid");
var ee = new require("events").EventEmitter();

var lpGenerator = function(config){
	var lp = new LP(config);
    return {
        on : lp.on ,
        listen : lp.listen
    }
}

function LP(config){
	this.net = new LP_net(config.netPort);
	this.http = new LP_http();
    this.goodEvents = [
        "connection" ,
        "disconnection" ,
        "data"
    ];
    this.events = []
}

LP.prototype.on = function(event ,callback){
    if(this.goodEvents.indexOf(event) < 0){
        throw new Error("invalid event type");
    }
    ee.on(event ,callback);
    this.events.push(event);

    if(events.toUpperCase() == "CONNECTION"){
        this.init();
    }
}

LP.prototype.init = function(){

}

LP.prototype.listen = function(port ,callback){
    this.http.listen(port ,callback);
}

function LP_net(port){
	this.port = port;
	this.server = net.createServer();
}

LP_net.prototype.listen = function(callback){
	this.server.listen(port ,callback || null);
}

function LP_net_client(port ,server){
    this.client = net.createConnection(port ,server);
    this.connections.push(this);

}

LP_net_client.prototype._on = function(callback){
    this.client.on("data" ,callback);
}

LP_net_client.prototype._write = function(data){
    this.client.write(data)
}

LP_net_client.prototype.on = function(event ,callback){
    ee.on(event ,callback);
}

LP_net_client.prototype.emit = function(event ,data){
    this.client.write(JSON.stringify(data));
}

LP_net_client.prototype.broadcast = function(event ,data){

}

function LP_http(){
    this.server = null;
    this.LP_n_cs = {};
}

LP_http.prototype.listen = function(port ,callback){
    this.server.listen(port ,callback);
}

LP_http.prototype.init = function(){
    var lp_http = this;
    this.server = http.createServer(function(req ,res){
        var url = req.url;
        //method is on or emit or conn or disconn
        var method = url.split("?")[0];
        var paras = getParams(url);

        //config params
        var interface = paras.interface;
        delete paras.interface;
        var id = paras.id;
        delete paras.id;
        var port = data.port;
        delete paras.port;
        var server = data.server;
        delete paras.server;

        //data params
        var data = paras;

        if(method == "emit"){
            ee.emit(interface ,data);
            res.end();
        }else if(method == "on"){
            polling.on(id ,res);
            var lp_n_c = that.LP_n_cs[id];

            lp_n_c._on(function(data){
                polling.emit(ID,data);
            })
        }else if(method == "conn"){
            var ID = uuid.v1();
            var currentClient = that.LP_n_cs[ID] = new LP_net_client(port ,server);
            ee.emit("connection" ,currentClient);
        }else if(method == "disconn"){

        }else{
            throw new Error("invalid request");
        }
    })
}

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

