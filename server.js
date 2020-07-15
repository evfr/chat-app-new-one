const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

const Message = mongoose.model('Message',{
  name : String,
  message : String
})

const User = mongoose.model('User',{
  name : String
})

const dbUrl = 'mongodb+srv://evfisher:evgeny@cluster0.ngbla.mongodb.net/PROJECT 0?retryWrites=true&w=majority'

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})

app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})

app.post('/messages', async (req, res) => {
  try{
    
    let message = new Message(req.body);
    User.findOne({name: message.name}, async (err, user) => {
      if (user){
        let savedMessage = await message.save()
        console.log('message saved');
        io.emit('message', req.body);
        res.sendStatus(200);
      } else {
        res.sendStatus(401);
      }
    })
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message posted')
  }
})

io.on('connection', () =>{
  console.log('a user is connected')
})

mongoose.connect(dbUrl ,{useMongoClient : true} ,(err) => {
  console.log('mongodb connected',err);
})

var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});

function initUsers(){
  users = [{name:'user1'}, {name:'user2'},{name:'user3'}, {name:'user4'}]
  User.create(users, async (err, createdUsers) => {
    console.log(createdUsers)
  })
}

initUsers();
