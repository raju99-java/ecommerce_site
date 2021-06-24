require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const ejs = require('ejs');
const layout = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongodb-session')(session);
const Emitter = require('events');

//const jwt = require('jsonwebtoken');
const passport = require('passport');

app.use(express.urlencoded({extended:false}));
app.use(express.json());

//database connection
const url = process.env.DB_URL;

 mongoose.connect(url,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
}).then( ()=>{
    console.log('Database connection successful...');
}).catch( (err)=>{
    console.log('Connection Failed !');
});

//-------------------------------//


//session store
let mongoStore = new  MongoDbStore({
    uri : url,
    collection : 'sessions'
});

//--------------------------------//

// Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);


//session config
app.use(session({
    secret : process.env.COOKIE_SECRET_KEY,
    resave: false,
    store : mongoStore,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hrs
    }
}));

app.use(cookieParser());

app.use(flash());
//--------------------------------//


//passport config
const init = require("./app/config/passport");
init(passport);
app.use(passport.initialize());
app.use(passport.session());

//------------------------------//

//Global middleware
app.use((req, res, next) =>{
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
})




app.use(layout);
//set Template engine
const view_path = path.join(__dirname, '/resources/views');
app.set('view engine', 'ejs');
app.set('views', view_path);

app.use(express.static("public"));


require("./routes/web")(app);

// 404 page
app.get("*", (req, res)=>{
    res.render('error-404'); 
})

const server = app.listen(port, () =>{
    console.log(`Listening on port : ${port}`);
})

//socket

const io = require('socket.io')(server);

io.on('connection', (socket)=>{

    //join with the client
    //console.log(socket.id);
    socket.on('joinEvent', (orderId)=>{
        //console.log(orderId);
        socket.join(orderId);
    })

})

eventEmitter.on('orderUpdated', (data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated', data);
})

eventEmitter.on('orderPlaced', (data)=>{
    io.to('adminRoom').emit('orderPlaced', data);
})

