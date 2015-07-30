/**
 * Created by shaomingquan on 15/7/29.
 */
(function(){
    function LP(port ,host){
        this.server = "http://" + host + ":" + port;
        //get the uuid
        var xhr = new XMLHttpRequest();
        xhr.open("GET" ,this.server + "/conn" ,false);
        xhr.send();
        this.id = xhr.responseText;
    }

    LP.prototype.on = function(interface ,callback){
        var data = {
            interface : interface ,
            id : this.id
        }
        ajaxGet(data ,this.server ,"on" ,callback);
    }

    LP.prototype.emit = function(interface ,data){
        data.interface = interface;
        data.id = this.id;
        ajaxGet(data ,this.server ,"emit" ,callback);
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
                    callback(eval("("+xhr.responseText+")"));
                }
            }
        }
    }

})()
