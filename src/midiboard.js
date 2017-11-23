module.exports = function Midiboard(){
  const midi = require('midi');
  var mb = {};

  mb.daw = null;

  mb.incoming = function(msg){
    //console.log(arguments);
  };

  mb.outgoing = function(){
    var x = arguments[0];
    var y = arguments[1];
    var z = arguments[2];

    if(Array.isArray(x)){
      mb.output.sendMessage(x);
    } else {
      mb.output.sendMessage([x,y,z]);
    }
  };

  mb.dawOut = function(){
    var x = arguments[0];
    var y = arguments[1];
    var z = arguments[2];

    if(Array.isArray(x)){
      mb.daw.sendMessage(x);
    } else {
      mb.daw.sendMessage([x,y,z]);
    }
  };

  mb.bind = function(){
    mb.input.on('message', mb.incoming);
  };

  mb.connect = function(){
    var input = new midi.input();
    var output = new midi.output();
    var apc_regex = /APC/;
    var num_in = input.getPortCount();
    var num_out = output.getPortCount();
    for(var i = 0; i < num_in; i++){
      var this_port = input.getPortName(i);
      if(apc_regex.test(this_port)){
        input.openPort(i);
        mb.input = input;
        console.log("CONNECTED");
      }
    }
    for(var i = 0; i < num_out; i++){
      var this_port = output.getPortName(i);
      if(apc_regex.test(this_port)){
        output.openPort(i);
        mb.output = output;
      }
    }

    var output = new midi.output();
    output.openVirtualPort("Omnichord");
    mb.daw = output;

    mb.bind();
    return mb;
  };

  return mb.connect();

};
