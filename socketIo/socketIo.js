//SOCKET IO BACK-END CONFIGURATION
const express = require("express"); // EXPRESS FRAMEWORK
const http = require('http').createServer(express);
const frontAddress = process.env.REACT_APP_ADDRESS;
const jwt = require('jsonwebtoken');

const io = require("socket.io")(http,
    {
        cors: 
        {
            origin: frontAddress,
            methods: ["GET", "POST"],
            credentials: true
        },
    });

io.use((socket, next) => 
{  
    jwt.verify(socket.handshake?.query?.refreshToken, process.env.REF_JWT_SEC, (err, decoded) =>
    {
        if(decoded?._id && !err) 
        {
            socket.decoded = decoded._id;
            return next();
        }
        else
        {
            let err = new Error('authentication_error')
            err.data = { content : 'refreshToken error!' };
            return next(err);
        }
    });
});

io.on("connection", (socket) =>
{
    console.log("An user with _id "+ socket.decoded +" is connected to the socket.io chat!");
    
    socket.on('message', ({text, id, refreshToken, room}) =>
    {
        jwt.verify(refreshToken, process.env.REF_JWT_SEC, (err, decoded) =>
        {
            if(decoded?._id && !err)
            {
                let sender = decoded._id;
                io.emit("message", ({text, id, sender, room}));
            }
            else
            {
                let err  = new Error('authentication_error!');
                err.data = { content : 'refreshToken error!' };
                io.emit('error', {err, room});
            }
        });
    })
})

http.listen(4000, () => {console.log("Socket.io listening on port 4000!");})

module.exports = {io, http};