var http = require("http");
var urltool = require("urlencode");
var polling = require("polling");

var uuid = require("uuid");

var events = require("events");
var ee = new events.EventEmitter();

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
    ee.on(event ,callback);
    //init when register connection
    if(event.toUpperCase() == "CONNECTION"){
        this.http.init();
    }
}

LP.prototype.listen = function(port ,callback){
    //LP listen -> http listen
    this.http.listen(port ,callback);
}

function Socket(){
    //add this to collection
    Socket.prototype.entities.push(this);
}

Socket.prototype.entities = [];

Socket.prototype.on = function(event ,callback){
    ee.on([this.id,event].join("_"),callback);
}

Socket.prototype.emit = function(event ,data){
    ee.emit([this.id,event].join("_") ,data);
}

Socket.prototype.broadcast = function(event ,data){
    //trigger all socket's event ,except this
    var that = this;
    this.entities.forEach(function(socket){
        if(socket !== that){
            ee.emit([socket.id ,event].join("_") ,data);
        }
    })
}

function LP_http(){
    this.server = null;
}

LP_http.prototype.listen = function(port ,callback){
    this.server.listen(port ,callback);
}

LP_http.prototype.init = function(){
    var lp_http = this;
    this.server = http.createServer(function(req ,res){
        //get url
        var url = req.url.substring(1);

        //method is on or emit or conn or disconn
        var method = url.split("?")[0];
        var paras = getParams(url);

        //get config params and kill
        var interface = paras.interface;
        delete paras.interface;
        var id = paras.id;
        delete paras.id;

        //data params
        var data = paras;

        //if same server but not same port, allow cross origin
        var origin = req.headers.origin;
        var host = req.headers.host;
        if(origin.indexOf(host.split(":")[0]) > 0){
            res.setHeader("Access-Control-Allow-Origin" ,origin);
        }

        if(method == "emit"){
            //if emit trigger the event that listening
            ee.emit(id + "_" + interface ,data);
            res.end();
        }else if(method == "on"){
            //remind pending 1 day
            res.setTimeout(24*60*60*1000);

            //if on blocking
            var pid = uuid.v1();
            polling.on(pid,res);
            //event triggered that res end
            ee.on([id,interface].join("_"),function(data){
                polling.emit(pid,JSON.stringify(data));
            })
        }else if(method == "conn"){
            //new "socket"
            var currentClient = new Socket();
            currentClient.id = uuid.v1();

            //send the "socket" to the connetion callback, then socket run
            ee.emit("connection" ,currentClient);

            //client need the id
            res.end(currentClient.id);
        }else if(method == "disconn"){
            //kick the id socket
            var fss = Socket.prototype.entities;
            var length = fss.length;
            var i;
            for(i = 0 ; i < length ; i ++){
                if(id == fss[i].id){
                    fss.splice(i ,1);
                    break;
                }
            }
            //trigger its disconn event
            ee.emit(id + "_disconnect");
            res.end("disconnect");
        }else{
            throw new Error("invalid request");
        }
    })
}

//get param obj
function getParams(url){
    url = urltool.decode(url ,"utf-8");
    var qs = url.split("?")[1];
    if(qs == undefined){return {}}
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