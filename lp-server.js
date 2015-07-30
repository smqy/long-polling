var http = require("http");

var polling = require("polling");

var uuid = require("uuid");

var events = require("events");
var ee = new events.EventEmitter();

var aa = "123"

var lpGenerator = function(config){
	var lp = new LP(config);
    return lp;
}

function LP(config){
	this.http = new LP_http();
    this.goodEvents = [
        "connection" ,
        "disconnection" ,
        "data"
    ];
}

LP.prototype.on = function(event ,callback){
    if(this.goodEvents.indexOf(event) < 0){
        throw new Error("invalid event type");
    }
    console.log(aa);
    ee.on(event ,callback);

    if(event.toUpperCase() == "CONNECTION"){
        this.init();
    }
}

LP.prototype.init = function(){
    this.http.init();
    this.listen();
}

LP.prototype.listen = function(port ,callback){
    this.http.listen(port ,callback);
}

function FakeSocket(){
    FakeSocket.prototype.entities.push(this);
}

FakeSocket.prototype.entities = [];

FakeSocket.prototype.on = function(event ,callback){
    ee.on([this.id,event].join("_"),callback);
}

FakeSocket.prototype.emit = function(event ,data){
    ee.emit([this.id,event].join("_") ,data);
}

FakeSocket.prototype.broadcast = function(event ,data){
    var that = this;
    this.entities.forEach(function(socket){
        if(socket !== that){
            ee.emit([socket.id ,event].join("_") ,data);
        }
    })
}

function LP_http(){
    this.server = null;
    this.fakeSockets = {};
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

        //data params
        var data = paras;

        if(method == "emit"){
            ee.emit(id + "_" + interface ,data);
            res.end();
        }else if(method == "on"){
            res.sett
            var pid = uuid.v1();

            polling.on(id,res)
            ee.on([id,interface].join("_"),function(data){
                polling.emit(pid,JSON.stringify(data));
            })
        }else if(method == "conn"){
            var currentClient = new FakeSocket();
            currentClient.id = uuid.v1();
            FakeSocket.prototype.fakeSockets.push(currentClient);

            ee.emit("connection" ,currentClient);
            res.end(currentClient.id);
        }else if(method == "disconn"){
            var fss = FakeSocket.prototype.fakeSockets;
            var length = fss.length;
            var i;
            for(i = 0 ; i < length ; i ++){
                if(id == fss[i].id){
                    fss.splice(i ,1);
                    break;
                }
            }
            res.end("disconnect");
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

module.exports = lpGenerator;