//SOCKET IO BACK-END CONFIGURATION
const express = require("express"); // EXPRESS FRAMEWORK
const frontAddress = process.env.REACT_APP_ADDRESS;
const jwt = require('jsonwebtoken');
const Room = require("../models/Chat");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

let io;
exports.socketConnection = (io) =>
{   
    // io.use((socket, next) => 
    // {  
    //     console.log(socket.handshake?.query?.refreshToken);
    //     console.log(socket.handshake?.query);
    //     console.log(socket.handshake);
    //     jwt.verify(socket.handshake?.query?.refreshToken, process.env.REF_JWT_SEC, (err, decoded) =>
    //     {
    //         if(decoded?._id && !err) 
    //         {
    //             socket.decoded = decoded._id;
    //             return next();
    //         }
    //         else
    //         {
    //             let err = new Error('authentication_error')
    //             err.data = { content : 'refreshToken error!' };
    //             return next(err);
    //         }
    //     });
    // });
    
    io.on("connection", (socket) =>
    {
        console.log("An user is connected to the socket.io chat!");
        
        socket.on('message', ({text, id, refreshToken, room}) =>
        {
            const senderRoom = Room.findOne({_id: room})
            
            if(senderRoom)
            {
                jwt.verify(refreshToken, process.env.REF_JWT_SEC, (err, decoded) =>
                {
                    if(decoded?._id && !err)
                    {
                        let sender = decoded._id;
                        let roomMembers = senderRoom.members;
    
                        if(roomMembers.includes(ObjectId(sender)))
                        {
                            io.to(room).emit("message", ({text, id, sender}));
                        }
                        else
                        {
                            let err  = new Error('authentication_error!');
                            err.data = { content : 'user is not part of the room!' };
                            io.emit('error', {err, room});
                        }
                    }
                    else
                    {
                        let err  = new Error('authentication_error!');
                        err.data = { content : 'refreshToken error!' };
                        io.emit('error', {err, room});
                    }
                });
            }
            else
            {
                let err  = new Error('authentication_error!');
                err.data = { content : 'room not found!' };
                io.emit('error', {err, room});
            }
            
        })
    })
}