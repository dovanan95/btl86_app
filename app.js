var express = require('express');

var app = express();
const bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var http = require("http");
const server = http.createServer(app);
const cors = require('cors');

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function contract()
{
    const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
    const identity = await wallet.get('appUser');
    if (!identity) {
        console.log('An identity for the user "appUser" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

            // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

            // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
    const contract = network.getContract('fabcar');

    return contract;
}

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
    console.log("New client connected ->" + socket.id);
    const ID = socket.id // id property on the socket Object
    socketIo.to(ID).emit("getId", socket.id);
  
    socket.on("sendRoom", function(data) {
      console.log(data);
      
      //socketIo.emit(receiver, { 'data': data, 'socket': socket.id });
    })
    socket.on("sendMess", async function(data){
       console.log(data);

       const contract_ = await contract();
       await contract_.submitTransaction('savePrivateMessage', 'MessID'+ Date.now().toString(),
                    data.sender, data.sender_name, data.receiver, data.message, parseInt(Date.now()));
        await contract_.submitTransaction('updateCommandHistory', data.sender.toString(), data.receiver.toString(), 'private_message');
       //save message to server then response to receiver
       socketIo.emit(String(data.receiver),
        {'sender': data.sender, 
        'receiver': data.receiver, 
        'message': data.message, 
        'sender_name': data.sender_name,
        'docType': 'private_message'
    });
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
            userID: 'DVA',
            username: 'Do Van An',
            docType: 'private_message',
            message_block:
            [
                {
                    'sender': 'DVA',
                    'receiver': 'LTA',
                    'content': 'hello',
                    'timestamp': 1,
                    'docType': 'private_message'
                },
                {
                    'sender': 'LTA',
                    'receiver': 'DVA',
                    'content': 'bye',
                    'timestamp': 2,
                    'docType': 'private_message'
                },
                {
                    'sender': 'DVA',
                    'receiver': 'LTA',
                    'content': 'ahihi',
                    'timestamp': 3,
                    'docType': 'private_message'
                },
            ]
        },
        {
            
            userID: 'LTA',
            username: 'Le Thi Anh',
            docType: 'private_message',
            message_block:
            [
                {
                    'sender': 'LTA',
                    'receiver': 'DVA',
                    'content': 'Ok em',
                    'timestamp': 1,
                    'docType': 'private_message'
                },
                {
                    'sender': 'DVA',
                    'receiver': 'LTA',
                    'content': 'Vang',
                    'timestamp': 2,
                    'docType': 'private_message'
                },
                {
                    'sender': 'DVA',
                    'receiver': 'LTA',
                    'content': 'Em xin cam on',
                    'timestamp': 3,
                    'docType': 'private_message'
                },
                {
                    'sender': 'LTA',
                    'receiver': 'DVA',
                    'content': 'Khong co gi',
                    'timestamp': 4,
                    'docType': 'private_message'
                }
            ]
        }
    ];

app.get('/chat', function(req, res){
    console.log(req.query.userID);
    res.render('./views/chat');
})

app.post('/load_chat_history', async function(req, res){
    console.log(req.body.id);
    const contract_ = await contract();
    /*
    const query_private_message = {
        "selector":{
            "$or":[
                {"sender": 'DVA', "receiver": 'LTA'},
                {"sender": 'LTA', "receiver": 'DVA'}
            ],
            "timestamp": {"$gt": null}
        },
        "sort":[{"timestamp":"desc"}],
        "limit": 100,
        "skip":0,
        "use_index": ["_design/indexPrivMessDoc", "indexPrivMess"]
    }
    const result_6 = await contract_.evaluateTransaction('queryCustom',JSON.stringify(query_private_message));
    console.log('custom query 4:', result_6.toString());*/
    const chat_data = await contract_.evaluateTransaction('queryMessage', 'DVA', 'LTA', 'private_message', 100, 0);
    console.log(chat_data.toString());
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
    console.log( {'partner_ID': req.body.partner_ID, 'myID': req.body.myID});
})

//for user search result
app.get('/home', function(req, res){
    res.render('./views/home');
})

const sample_user_data_1 ={'userID': 001, 'username': 'Do Van An'};
//for user search
app.get('/searchUserByID', function(req, res){
    console.log(req.query.id);
    //neccessary to check if userID exist and response true/false
    if(req.query.id=='001') //only for test, change condition when finish develop chaincode
    {
        res.send(JSON.stringify({'data': sample_user_data_1}));
    }
    else
    {
        res.send(JSON.stringify({'data': 'no_data'}));
    }
})

app.get('/user_information', function(req, res){
    var user_id = req.query.id_user;
    var user_name = req.query.username;
    res.render('./views/profile',
    {'data':JSON.stringify({'user_id': user_id, 'user_name': user_name})});
})

server.listen(8082, () => {
    console.log('Server đang chay tren cong 8082');
 });