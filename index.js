
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const connect = require('./config/db-config');

const path = require('path');


const Group = require('./models/group');
const Chat = require('./models/chat');


app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.set('view engine', 'ejs'); 


io.on('connection', (socket)=>{
    console.log('A user connected.', socket.id);

    socket.on('disconnect', ()=>{
        console.log('a user disconnected', socket.id);
    });

    socket.on('join_room', (data) =>{
        console.log("joining a room", data.roomid);
        socket.join(data.roomid);
    });

    socket.on('new_msg', async (data) =>{
        const chat = await Chat.create({
            roomid: data.roomid,
            sender: data.sender,
            content: data.message
        })
        io.to(data.roomid).emit('msg_rcvd', data);
    });
});



app.get('/chat/:roomid/:user', async (req, res)=>{
    const group = await Group.findById(req.params.roomid);
    const chats = await Chat.find({
        roomid: req.params.roomid
    });

    res.render('index', {
        roomid: req.params.roomid,
        user: req.params.user,
        groupname: group.name,
        previousmsgs: chats
    });
});


app.get('/group', async (req, res) => {
    res.render('group');
});


app.post('/group', async (req, res) => {
    console.log(req.body);
    await Group.create({
        name: req.body.name
    });
    res.redirect('/group');
});




server.listen(3005, async () => {
    console.log('server running at http://localhost:3005');
    await connect();
    console.log("DB connected");
});









