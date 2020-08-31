const express = require('express');
const Users = require('../models/Users').User;
const admin = require('../models/Users').admin;
const session = require('express-session');
const router = express.Router();


const redirecttoDashboard = (req, res, next) => {
    if (req.session.userid) {
        res.redirect('/home');
    } else {
        next();
    }
}

const protectHome = (req, res, next) => {
    if (!req.session.userid) {
        res.redirect('/login');
    } else {
        next();
    }
}

const protectadmin = (req,res,next) =>{
    if(!req.session.emailid){
        res.redirect('/admin');
    }else{
        next();
    }
}

const redirecttoadminDashboard = (req, res, next) => {
    if (req.session.emailid) {
        res.redirect('/adminhome');
    } else {
        next();
    }
}


router.get('/', redirecttoDashboard, (req, res) => {
    res.redirect('/login');
});

router.get('/home', protectHome, (req, res) => {
    const username = req.session.userid;
    res.render('home', { username ,title : username});
});

router.get('/login', redirecttoDashboard, (req, res) => {
    res.render('login',{title :'User login'});
});

router.get('/register', redirecttoDashboard, (req, res) => {
    res.render('register',{title :'Register User'});
});

router.get('/admin', redirecttoadminDashboard,(req, res) => {
    res.render('adminlogin',{title :'Admin login'});
})
router.get('/adminhome', protectadmin, (req, res) => {
    Users.find({}).lean()
        .exec((err, data) => { 
            res.render('adminhome', { users: data ,title :'Admin Page'});
        })
})



router.post('/admin', (req, res) => {
    const { email, password } = admin;
    if(req.body.email == email && req.body.password == password){
        req.session.emailid = req.body.email;
        res.redirect('/adminhome');
    }else{
        const msg = 'Invalid Password';
        res.render('adminlogin', { msg });
    }
})
router.post('/useredit', (req, res) => {
    const email = req.body.email;
    Users.findOne({ email: email }).lean()
        .exec((err, data) => {
            res.render('adminedit', { user: data });
        })
})

router.put('/usereditsave', (req, res) => {
    const { id, email, name, password } = req.body;
    const data = {
        id,
        email,
        name,
        password
    }
    Users.updateOne({ email: email }, data, (err, docs) => {
        if (err) throw err;
        res.redirect("/adminhome");
    })
})

router.delete('/deleteuser', (req, res) => {
    const email = req.body.email;
    Users.deleteOne({ email: email }, (err) => {
        if (err) throw err;
        res.redirect("/adminhome");
    })
})

router.post('/adminlogout', (req, res) => {
    req.session.destroy();
    res.clearCookie("sid");
    res.redirect("/login");
})

router.post('/register', (req, res) => {
    const newUser = {
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    }
   
    var newman = new Users(newUser);
    newman.save();
    res.redirect('/login');
});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Users.findOne({ email: email, password: password }, (err, user) => {
        if (!user) {
            const msg = 'Invalid Password';
            res.render('login', { msg });
        } else {
            req.session.userid = user.name;
            res.redirect('/home');
        }
    })
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/home');
        }
        res.clearCookie('sid');
        res.redirect('/');
    })
});

module.exports = router;
