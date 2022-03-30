//SOCKET IO BACK-END CONFIGURATION
const express = require("express"); // EXPRESS FRAMEWORK
const jwt = require('jsonwebtoken');
const Room = require("../models/Chat");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

let io;
exports.socketConnection = async(io) =>
{   
    try
    {
        console.log("socketConnection entered");
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
            
            socket.on('message', async({text, id, refreshToken, room}) =>
            {
                const senderRoom = await Room.findOne({_id: room})
                
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
                                console.log("All verification ok!");
                                socket.join(room);
                                socket.to(room).emit("message", ({text, id, sender}));
                            }
                            else
                            {
                                let err  = new Error('authentication_error!');
                                err.data = { content : 'user is not part of the room!' };
                                socket.emit('error', {err, room});
                            }
                        }
                        else
                        {
                            let err  = new Error('authentication_error!');
                            err.data = { content : 'refreshToken error!' };
                            socket.emit('error', {err, room});
                        }
                    });
                }
                else
                {
                    let err  = new Error('authentication_error!');
                    err.data = { content : 'room not found!' };
                    socket.emit('error', {err, room});
                }
                
            })
        })
    }catch(err){console.log(err)}
    
}