'use strict';


const EventEmitter = require('events');
const net = require('net');
const uuid = require('uuid/v4');

const port = process.env.PORT || 3001;
const server = net.createServer();
const eventEmitter = new EventEmitter();
const peoplePool = {};


let User = function(socket) {
  this.id = uuid();

  this.nickname = `User-${this.id}`;
  this.socket = socket;
};


server.on('connection', (socket) => {
  let user = new User(socket);
  peoplePool[user.id] = user;
  socket.on('data', (buffer) => dispatchAction(user.id, buffer));
});


let parse = (buffer) => {

  let text = buffer.toString().trim();
  if ( !text.startsWith('@') ) { return null; }
  let [command,payload] = text.split(/\s+(.*)/);
  let [target,message] = payload ? payload.split(/\s+(.*)/) : [];
  return {command,payload,target,message};

};


let dispatchAction = (userId, buffer) => {
  let entry = parse(buffer);
  entry && eventEmitter.emit(entry.command, entry, userId);
};



eventEmitter.on('@all', (data, userId) => {
  for( let connection in peoplePool ) {
    let user = peoplePool[connection];
    
    user.socket.write(`<${peoplePool[userId].nickname}>: ${data.payload}\n`);
  }
});

eventEmitter.on('@nick', (data, userId) => {
  peoplePool[userId].nickname = data.target;
});

eventEmitter.on('@dm', (data, userId) => {
  //var person = data.
 

});



server.listen(port, () => {
  console.log(`Chat Server up on ${port}`);
});
