const express = require('express');
const sessions = require('express-session');
const exphbs = require('express-handlebars');
const { urlencoded } = require('express');
const PORT = process.env.PORT || 9000;
const homerouter = require('./routes/home.router');
const mongoose = require('mongoose');
const mongoStore = require('connect-mongo')(sessions);
const app = express();
const methodOverride = require('method-override');
const MONGODB = process.env.MONGIDBURI || 'mongodb://localhost/myusers';


mongoose.connect(MONGODB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

app.use(express.urlencoded({extended : true}));

app.engine('handlebars',exphbs({defaultLayout : 'main'}));
app.set('view engine','handlebars');
app.use(methodOverride('_method'));

app.use(sessions({
    name : 'sid',
    secret : 'secretkey',
    store:new mongoStore({mongooseConnection:mongoose.connection}),
    resave :false,
    saveUninitialized : false,
    cookie :{maxAge : 1000*60*60*24}
}));

app.use('/',homerouter);


app.listen(PORT,()=>{console.log(`http://localhost:${PORT}`)});