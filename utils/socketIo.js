//SOCKET IO BACK-END CONFIGURATION
const jwt = require('jsonwebtoken');
const appFunctions = require('../app');

// MODELS
const Room = require("../models/Chat");

exports.socketConnection = async(io) =>
{   
    try
    {
        console.log("socketConnection entered");
        io.use((socket, next) => 
        {  
            jwt.verify(socket.handshake?.query?.token, process.env.REF_JWT_SEC, (err, decoded) =>
            {
                if(decoded?._id && !err) 
                {
                    socket.decoded = decoded._id;
                    console.log("token verification successful");
                    return next();
                }
                else 
                {
                    let err = new Error('authentication_error')
                    err.data = { content : 'token error!' };
                    socket.emit('error', err);
                }
            });
        });
        
        io.on("connection", (socket, next) =>
        {
            console.log("An user is connected to the socket.io chat!");

            socket.on('createRoom', ({token}) =>
            {   
                console.log("Entered createRoom");
                jwt.verify(token, process.env.REF_JWT_SEC, async(err, decoded) =>
                {
                    if(decoded?._id && !err)
                    {
                        let userId = appFunctions.ObjectId(decoded._id);                       
                        const senderRooms = await Room.find({members: {$in: [userId]}},).sort({updatedAt:-1});
                        
                        if(senderRooms && senderRooms.length > 0)
                        {
                            console.log("All verification ok for createRoom!");
                                                        
                            senderRooms.forEach(senderRoom => 
                                {
                                    let senderRoomId = (senderRoom._id).toString();
                                    socket.join(senderRoomId); // JOIN
                                });
                            let roomCreated = true;
                            socket.emit('createRoom', roomCreated); // EMIT
                        }
                        else
                        {
                            let roomCreated = false;
                            let err  = new Error('createRoom_error!');
                            err.data = { content : 'No room found for user ' + userId + '!' };
                            socket.emit('createRoom', {err, roomCreated});
                        }
                    }
                    else
                    {
                        let roomCreated = false;
                        let err  = new Error('createRoom_error!');
                        err.data = { content : 'token error!' };
                        socket.emit('createRoom', {err, roomCreated});
                    }
                });
            });
            
            socket.on('chatting', ({text, id, token, roomId}) =>
            {
                console.log("Entered chatting");
                jwt.verify(token, process.env.REF_JWT_SEC, async(err, decoded) =>
                {
                    if(decoded?._id && !err)
                    {
                        const senderRoom = await Room.findOne({_id: roomId});
                        let sender = decoded._id;
                        
                        if(senderRoom && sender)
                        {
                            console.log("All verification ok for message!");
                            console.log(`roomId = `, roomId);
                            socket.join(roomId); // JOIN
                            socket.to(roomId).emit("chatting", ({text, id, sender, roomId})); // EMIT
                        }
                        else
                        {
                            let err  = new Error('authentication_error!');
                            err.data = { content : 'No room with _id '+ roomId +' found for user ' + sender + '!' };
                            socket.emit('error', err);
                        }
                    }
                    else
                    {                
                        let err  = new Error('authentication_error!');
                        err.data = { content : 'token error!' };
                        socket.emit('error', err);
                    }
                });
            });
        })
    }catch(err){console.log(err)}
    
}