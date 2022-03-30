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
            
            socket.on('createRoom', async({roomId, token}) =>
            {
                console.log(`createRoom roomId = `, roomId)
                console.log(`token = `, token)
                const senderRoom = await Room.findOne({_id: roomId});
                
                if(senderRoom)
                {
                    jwt.verify(token, process.env.REF_JWT_SEC, (err, decoded) =>
                    {
                        if(decoded?._id && !err)
                        {
                            let sender = decoded._id;
                            let roomMembers = senderRoom.members;
                            
                            if(roomMembers.includes(ObjectId(sender)))
                            {
                                console.log("All verification ok for createRoom!");

                                socket.join(roomId);
                                let roomCreated = true;
                                socket.to(roomId).emit('createRoom', roomCreated);
                            }
                            else
                            {
                                let roomCreated = false;
                                socket.to(roomId).emit('createRoom', roomCreated);
                            }
                        }
                        else
                        {
                            let roomCreated = false;
                            socket.to(roomId).emit('createRoom', roomCreated);
                        }
                    });
                }
                else
                {
                    let roomCreated = false;
                    socket.to(roomId).emit('createRoom', roomCreated);
                }
            });
            
            socket.on('chatting', async({text, id, token, roomId}) =>
            {
                console.log(`chatting roomId = `, roomId)
                console.log(`token = `, token)

                const senderRoom = await Room.findOne({_id: roomId})

                let err  = new Error('authentication_error!');

                if(senderRoom)
                {
                    jwt.verify(token, process.env.REF_JWT_SEC, (err, decoded) =>
                    {
                        if(decoded?._id && !err)
                        {
                            let sender = decoded._id;
                            let roomMembers = senderRoom.members;

                            if(roomMembers.includes(ObjectId(sender)))
                            {
                                console.log("All verification ok for message!");

                                socket.join(roomId);
                                socket.to(roomId).emit("chatting", ({text, id, sender}));
                            }
                            else
                            {
                                err.data = { content : 'user is not part of the room!' };
                                socket.emit('error', {err, roomId});
                            }
                        }
                        else
                        {
                            err.data = { content : 'refreshToken error!' };
                            socket.emit('error', {err, roomId});
                        }
                    });
                }
                else
                {
                    err.data = { content : 'room not found!' };
                    socket.emit('error', {err, roomId});
                }
                
            });
        })
    }catch(err){console.log(err)}
    
}