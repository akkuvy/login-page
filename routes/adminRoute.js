const express = require('express');
const Users = require('../models/Users').User;
const admin = require('../models/Users').admin;
const session = require('express-session');
const router = express.Router();

const protectadmin = (req,res,next) =>{
    if(!req.session.emailid){
        res.redirect('/admin/admin');
    }else{
        next();
    }
}


const redirecttoadminDashboard = (req, res, next) => {
    if (req.session.emailid) {
        res.redirect('/admin/adminhome');
    } else {
        next();
    }
}

router.get('/', redirecttoadminDashboard,(req, res) => {
    res.redirect('/admin/admin');
})

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
        res.redirect('/admin/adminhome');
    }else{
        const msg = 'Invalid Password';
        res.render('adminlogin', { msg });
    }
})
router.post('/useredit', (req, res) => {
    const id = req.body.id;
    Users.findOne({ id: id }).lean()
        .exec((err, data) => {
            res.render('adminedit', { user: data });
        })
})

router.put('/usereditsave', (req, res) => {
    const { id, email, name, password } = req.body;
    const data = {
        
        email,
        name,
        password
    }
    Users.updateOne({ id: id }, data, (err, docs) => {
        if (err) throw err;
        res.redirect("/admin/adminhome");
    })
})

router.delete('/deleteuser', (req, res) => {
    const email = req.body.email;
    Users.deleteOne({ email: email }, (err) => {
        if (err) throw err;
        res.redirect("/admin/adminhome");
    })
})

router.post('/adminlogout', (req, res) => {
    req.session.destroy();
    res.clearCookie("sid");
    res.redirect("/admin/admin");
})


module.exports=router;
