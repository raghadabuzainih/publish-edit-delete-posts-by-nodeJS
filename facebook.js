const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
let doneEmail = ''

var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

const Log = require('./models/log');
const Post = require('./models/post');

let accounts = []

const app = express();
let loginId;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const urldb = 'mongodb+srv://username:password@cluster0.5j4sjdd.mongodb.net/dbname?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(urldb)
    .then(() => app.listen(3000))
    .catch((error) => console.log(error));

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    accounts = getAccounts()
    res.render('sign_in', {'users' : accounts});
});

app.get('/register', (req, res) => {
    res.render('sign_up');
});

function saveAcoounts(){
    localStorage.setItem('acc', JSON.stringify(accounts))
}

function getAccounts(){
    return JSON.parse(localStorage.getItem('acc')) || [];
}

app.post('/homepage', async (req, res) => {
    let { email, password } = req.body;

    try {
        if(doneEmail != '') email = doneEmail
        const user = await Log.findOne({ email });
        if (!user) {
            res.send('email not exists');
            return;
        }
        if (!email) {
            res.send('email is required');
            return;
        }
        if (!password) {
            res.send('password is required');
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.send('invalid email or password');
            return;
        }
        loginId = user._id
        accounts = getAccounts()
        let arr = []
        accounts.forEach(account =>{
            if(account.fullName != user.fullName) arr.push(account)
            else localStorage.removeItem('acc')
        })
        accounts = arr
        accounts.unshift(user)
        saveAcoounts()
        const users = await Log.find().sort({ createdAt: -1 });
        doneEmail = ''
        res.render('users', { 'user1' : user , 'users' : users });
    } catch (err) {
        console.log(err);
    }
});

app.get('/putPassword/:id', async(req, res)=>{
    let id = req.params.id
    let user = await Log.findById(id)
    doneEmail = user.email
    res.render('put_password', {user})
})

app.put('/homepage', (req, res)=>{
    res.json({ redirect : '/' })
})

app.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const existingUser = await Log.findOne({ email });
        if (existingUser) {
            res.send('this email exists, please sign in');
            return;
        }
        if (!email) {
            res.send('please enter your email');
            return;
        }
        if (!fullName) {
            res.send('please enter your full name');
            return;
        }
        if (!password) {
            res.send('please enter your password');
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Log({ fullName, email, password: hashedPassword });
        await newUser.save();

        loginId = newUser._id

        const users = await Log.find().sort({ createdAt: -1 });
        res.render('users', { 'user1' : newUser , 'users' : users });
    } catch (err) {
        console.log(err);
    }
});

app.get('/posts/:id', async (req, res) => {
    try {
        const id = req.params.id;  
        const user = await Log.findById(id);
        const posts = await Post.find({ user_id: id }).sort({ createdAt: -1 });
        
        if(id == loginId) res.render('create_post', { user, posts });
        else res.render('view_posts', {posts})
    } catch (err) {
        console.log(err);
    }
});

app.post('/posts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const new_post = req.body.new_post;
        const newPost = new Post({ new_post, user_id: id });
        await newPost.save();
        res.redirect(`/posts/${id}`);
    } catch (err) {
        console.log(err);
    }
});


app.delete('/posts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Post.findByIdAndDelete(id);

        const user_id = req.body.user_id;
        res.json({ redirect: `/posts/${user_id}` });
    } catch (err) {
        console.log(err);
    }
});


app.put('/posts/:id', async(req, res)=>{
    try {
        const id = req.params.id
        await Post.findByIdAndUpdate(id, {new_post: req.body.new_post}, {new: true})

        const user_id = req.body.user_id
        res.json({redirect: `/posts/${user_id}`})
    } catch (error) {
        console.log(error)
    }
})