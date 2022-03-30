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
            

            socket.on('createRoom', ({token}) =>
            {   
                let err  = new Error('createRoom_error!');
                
                jwt.verify(token, process.env.REF_JWT_SEC, async(err, decoded) =>
                {
                    if(decoded?._id && !err)
                    {
                        let userId = decoded._id;                        
                        const senderRooms = await Room.find({members: {$in: [userId]}},).sort({updatedAt:-1});
                        
                        if(senderRooms && senderRooms.length > 0)
                        {
                            console.log("All verification ok for createRoom!");
                            
                            senderRooms.forEach(senderRoom => 
                                {
                                    let roomCreated = true;
                                    socket.join("senderRoom:" + senderRoom._id);
                                    socket.to(senderRoom._id).emit('createRoom', roomCreated);
                                });
                        }
                        else
                        {
                            let roomCreated = false;
                            err.data = { content : 'No room found for user ' + userId + '!' };
                            socket.emit('createRoom', {err, roomCreated});
                        }
                    }
                    else
                    {
                        let roomCreated = false;
                        err.data = { content : 'token error!' };
                        socket.emit('createRoom', {err, roomCreated});
                    }
                });
            });
            
            socket.on('chatting', ({text, id, token}) =>
            {
                let err  = new Error('authentication_error!');

                jwt.verify(token, process.env.REF_JWT_SEC, async(err, decoded) =>
                {
                    if(decoded?._id && !err)
                    {
                        let userId = decoded._id;                        
                        const senderRooms = await Room.find({members: {$in: [userId]}},).sort({updatedAt:-1});
                        
                        if(senderRooms && senderRooms.length > 0)
                        {
                            console.log("All verification ok for message!");
                            
                            senderRooms.forEach(senderRoom => 
                                {
                                    socket.join(roomId);
                                    socket.to(roomId).emit("chatting", ({text, id, sender}));
                                });
                        }
                        else
                        {
                            err.data = { content : 'No room found for user ' + userId + '!' };
                            socket.emit('error', err);
                        }
                    }
                    else
                    {
                        err.data = { content : 'token error!' };
                        socket.emit('error', err);
                    }
                });
            });
        })
    }catch(err){console.log(err)}
    
}