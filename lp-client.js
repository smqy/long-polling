/**
 * Created by shaomingquan on 15/7/29.
 */
(function(W){
    function LP(port ,host){
        this.server = "http://" + host + ":" + port;
        //get the uuid
        var xhr = new XMLHttpRequest();
        xhr.open("GET" ,this.server + "/conn" ,false);
        xhr.send();
        this.id = xhr.responseText;
        this.entities.push(this);
    }

    LP.prototype.entities = [];

    LP.prototype.on = function(interface ,callback){
        var data = {
            interface : interface ,
            id : this.id
        }
        //recurrencail ask
        callbackOrigin = callback;
        callback = function(res){
            callbackOrigin(res);
            console.log(this.server)
            ajaxGet(data ,this.server ,"on" ,callback);
        }.bind(this);
        ajaxGet(data ,this.server ,"on" ,callback);
    }

    LP.prototype.emit = function(interface ,data){
        data.interface = interface;
        data.id = this.id;
        ajaxGet(data ,this.server ,"emit");
    }

    LP.prototype.disconn = function(){
        var xhr = new XMLHttpRequest();
        xhr.open("GET" ,this.server + "/disconn?id=" + this.id ,true);
        xhr.send();
    }

    function ajaxGet(data ,server ,interface ,callback){
        var dataString = "";
        for(x in data){
            dataString += "&" + x + "=" + data[x];
        }
        dataString = "?" + dataString.substring(1);

        var xhr = new XMLHttpRequest();
        xhr.open("GET" ,server + "/" + interface + dataString ,true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    callback && callback(eval("("+xhr.responseText+")"));
                }
            }
        }
        xhr.send();
    }

    var oldUnload = window.onbeforeunload;
    var newUnload = function(){
        var i;
        var lpes = LP.prototype.entities;
        var length = lpes.length;
        for(i = 0 ; i < length ; i++){
            lpes[i].disconn();
        }
        oldUnload();
    }
    window.onbeforeunload = newUnload;

    W.LP = LP;

})(window)
