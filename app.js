const express = require('express');
const sessions = require('express-session');
const exphbs = require('express-handlebars');
const { urlencoded } = require('express');
const PORT = process.env.PORT || 3000;
const homerouter = require('./routes/home.router');
const mongoose = require('mongoose');
const mongoStore = require('connect-mongo')(sessions);
const app = express();
const methodOverride = require('method-override');
const MONGODB = process.env.MONGODB || 'mongodb://localhost/myusers';
const adminRoute= require('./routes/adminRoute')


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

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    next();
  })

app.use('/',homerouter);
app.use('/admin',adminRoute)


app.listen(PORT,()=>{console.log(`http://localhost:${PORT}`)});