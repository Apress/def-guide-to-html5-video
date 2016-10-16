  var ws = require("./websocket-server/lib/ws");
  var sys = require("sys");

  var server = ws.createServer();

  server.addListener("listening", function(){
    sys.log("Listening on port 8080 for connections.");
  });

  server.addListener("connection", function(conn){
    conn.send("** Connected as: "+conn.id);
    conn.addListener("message", function(msg){
      server.broadcast("<"+conn.id+"> "+msg);
    });
  });

  server.addListener("close", function(conn){
    server.broadcast("<"+conn.id+"> disconnected");
  });

  server.listen(8080);