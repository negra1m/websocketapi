const express = require('express'),
      app = express(),
      server = require('http').createServer(app);
      io = require('socket.io')(server);

const port=process.env.PORT || 3000;

let timerId = null,
    sockets = new Set();

//This example emits to individual sockets (track by sockets Set above).
//Could also add sockets to a "room" as well using socket.join('roomId')
//https://socket.io/docs/server-api/#socket-join-room-callback

app.use(express.static(__dirname + '/dist')); 

io.on('connection', socket => {

  sockets.add(socket);
  console.log(`Socket ${socket.id} added`);

  if (!timerId) {
    startTimer();
  }

  socket.on('clientdata', data => {
    console.log(data);
  });

  socket.on('disconnect', () => {
    console.log(`Deleting socket: ${socket.id}`);
    sockets.delete(socket);
    console.log(`Remaining sockets: ${sockets.size}`);
  });

});

function startTimer() {
  //Simulate stock data received by the server that needs 
  //to be pushed to clients
  timerId = setInterval(() => {
    if (!sockets.size) {
      clearInterval(timerId);
      timerId = null;
      console.log(`Timer stopped`);
    }
    var value = ((Math.random() * 50) + 1).toFixed(2);
    //See comment above about using a "room" to emit to an entire
    //group of sockets if appropriate for your scenario
    //This example tracks each socket and emits to each one
    for (const s of sockets) {
      console.log(`Emitting value: ${value}`);
      s.emit('data', { data: value });
    }

  }, 2000);
}

server.listen(port,() => {
console.log(`Server running at port `+port);
});
console.log('Visit http://localhost in your browser');
