const sendMessageToSocket = (socket, message) => {
  socket.emit("message", message);
};

function subscribe(payload) {
  console.log('subscribe', payload)
  if (payload !== undefined && payload !== "") {
    const socket = this;
    socket.join(payload.toLowerCase());
    sendMessageToSocket(
      socket,
      "Successfully joined: " + payload.toLowerCase()
    );
  }
}

// 服务器结构参考：https://socket.io/docs/v4/server-application-structure/
const start = (options) => {
  const io = require("socket.io")(strapi.server, options);

  // loading middleware ordered
  // io.use((socket, next) => {
    // if (socket.request.user) {
    //   next();
    // } else {
    //   next(new Error("unauthorized"))
    // }
  // });

  const onConnection = (socket) => {
    // socket.on("order:create", createOrder);
    // socket.on("order:read", readOrder);    //
    // socket.on("user:update-password", updatePassword);
    socket.on("subscribe", subscribe.bind(socket));
  }
  io.on("connection", onConnection);

  strapi.io = io;
  console.log('SocketIO Started', options);
}

const emit = (room, event, data) => {
  // console.log('emit', room, event, data);
  strapi.io.sockets.to(room).emit(event, data);
}

module.exports = {
  start,
  emit,
}
