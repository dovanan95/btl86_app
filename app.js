var express = require('express');

var app = express();
const bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var http = require("http");
const server = http.createServer(app);
const cors = require('cors');


const socketIo = require("socket.io")(server, {
   cors: {
       origin: "*",
   }
 });
//const socketIo = require("socket.io")(server);

async function queryNameUser(id){
    //query chaincode
    return("name_test");
}

 socketIo.on("connection", (socket) => {
    console.log("New client connected" + socket.id);
    const ID = socket.id // id property on the socket Object
    socketIo.to(ID).emit("getId", socket.id);
  
    socket.on("sendRoom", function(data) {
      console.log(data);
      
      //socketIo.emit("sendDataServer", { 'data': data, 'socket': socket.id });
    })
    socket.on("sendMess", async function(data){
       console.log(data);
       //var sender_name = await queryNameUser(data.sender);
       socketIo.emit(String(data.receiver),
        {'sender': data.sender, 
        'receiver': data.receiver, 
        'message': data.message, 
        'sender_name': data.sender_name});
    })
  
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });


app.set('view engine', 'ejs');
app.set('views', __dirname);
 
app.use(upload.array()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname + '/views'));

//code

app.get('/', function(req, res){
    res.render('./views/index', {'data':'Commander System'});
})
app.post('/login',async function(req, res){
    console.log(req.body);
    var username = await queryNameUser(req.body.id);
    res.send({'result': 'OK', 'username': username});
})

var sample_chat_data = [
        {   
            userID: '001',
            username: 'LTE',
            message_block:
            [
                {
                    'sender': '001',
                    'receiver': 'myID',
                    'content': 'hello',
                    'timestamp': 1
                },
                {
                    'sender': 'myID',
                    'receiver': '001',
                    'content': 'bye',
                    'timestamp': 2
                }
            ]
        },
        {
            
            userID: '002',
            username: 'LTA',
            message_block:
            [
                {
                    'sender': '002',
                    'receiver': 'myID',
                    'content': 'Ok em',
                    'timestamp': 1
                },
                {
                    'sender': 'myID',
                    'receiver': '002',
                    'content': 'Vang',
                    'timestamp': 2
                },
                {
                    'sender': 'myID',
                    'receiver': '002',
                    'content': 'Em xin cam on',
                    'timestamp': 3
                },
                {
                    'sender': '002',
                    'receiver': 'myID',
                    'content': 'Khong co gi',
                    'timestamp': 4
                }
            ]
        }
    ];

app.get('/chat', function(req, res){
    console.log(req.query.userID);
    res.render('./views/chat');
})

app.post('/load_chat_history', function(req, res){
    console.log(req.body.id);
    res.send(JSON.stringify(sample_chat_data));
})

//for chat one to one from chat history
app.post('/chat_peer', function(req, res){
    console.log({'partner_ID': req.body.partner_ID, 'my_ID': req.body.my_ID});
})

//for chat room (dev in future)
app.post('/chat_room', function(req, res){
    console.log({'room_ID': req.body.room_ID, 'docType':req.body.type});
})

//for begin chat with one user from query
app.post('/init_new_chat', function(req, res){
    console.log(req.body.partner_ID);
})

//for user search result
app.get('/home', function(req, res){
    res.render('./views/home');
})

//for user search
app.get('/searchUserByID', function(req, res){
    console.log(req.query.id);
    res.send(JSON.stringify({'data': req.query.id}));
})

server.listen(8082, () => {
    console.log('Server đang chay tren cong 8082');
 });