// "StAuth10065: I Brian Upward, 000228103 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else."

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)

const users = {}
const score = {}
const connections = []

app.get('/', function(req, res){  
    res.sendFile(__dirname + '/index.html');
});

app.get('/teacher', function(req, res){  
    res.sendFile(__dirname + '/teacher.html');
});

app.get('/student', function(req, res){  
    res.sendFile(__dirname + '/student.html');
});

app.get('/style.css', function(req, res){  
    res.sendFile(__dirname + '/style.css');
});

app.get('/background.js', function(req, res){  
    res.sendFile(__dirname + '/background.js');
});

http.listen(3000, function(){  console.log('listening on *:3000');});

io.on('connection', socket => {  
    connections.push(socket); 
    console.log('Connected: %s sockets connected', connections.length)  

    //Disconnect
    socket.on('disconnect', function(data){
        //users.splice(users.indexOf(socket.username), 1);
        //updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length)
    }) 
    
    // send message
    socket.on('send message', function(data){
        io.sockets.emit('new message', {msg: data, user: socket.username});
    })

    socket.on('multiple choice', function(data){
        io.sockets.emit('new multiple choice', data);
    })

    socket.on('matching', function(data){
        io.sockets.emit('new matching', data);
    })

    socket.on('student answered', function(data){
        if(data.correct){
            if(score[data.socketid] > 0){
                score[data.socketid] += parseInt(data.points);
            } else {
                score[data.socketid] = parseInt(data.points);
            }            
        } else { 
            if(score[data.socketid] > 0){
                // do nothing
            } else {
                // sets to zero if nothing has been scored 
                score[data.socketid] = 0;
            }
        }
        io.sockets.emit('send scores', { users: users, score: score } )   
        io.sockets.emit( 'get results', { users: users[data.socketid], correct: data.correct } )     
    }) 

    // new user
    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        users[data.socketid] = data.username;
    }) 
    
    socket.on('teacher connect', function(){
        updateUsernames();
    })

    function updateUsernames(){
        //io.sockets.emit('get users', { users: users, score: score });
    }
})



