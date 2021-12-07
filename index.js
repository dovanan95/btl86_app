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
}

 socketIo.on("connection", (socket) => {
    console.log("New client connected" + socket.id);
    const ID = socket.id // id property on the socket Object
    socketIo.to(ID).emit("getId", socket.id);
  
    socket.on("sendDataClient", function(data) {
      console.log(data);
      
      //socketIo.emit("sendDataServer", { 'data': data, 'socket': socket.id });
    })
    socket.on("sendMess", function(data){
       console.log(data);
       var sender_name = await queryNameUser(data.sender);
       socketIo.emit(String(data.receiver),
        {'sender': data.sender, 
        'receiver': data.receiver, 
        'message': data.message, 
        'sender_name': sender_name});
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
app.post('/login', function(req, res){
    console.log(req.body);
    res.send('OK');
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
    res.render('./views/chat', {'data': JSON.stringify(sample_chat_data)});
})

app.get('chat_peer', function(req, res){
    console.log(req.query.partner_ID);
})

app.get('/home', function(req, res){
    res.send('home');
})

server.listen(8082, () => {
    console.log('Server đang chay tren cong 8082');
 });