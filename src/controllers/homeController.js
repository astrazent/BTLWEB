const connection = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const getHomePage = (req, res) => {
    if(req.user){
        return res.render('home.ejs', {status:"LoggedIn", user: req.user}); 
    }
    else{
        return res.render('home.ejs', {status:"LoggedOut"})
    }
}

const listUser = async (req, res) => {  
    let [results, fields] = await connection.query(`SELECT * FROM Persons`);
    return res.render('listUser.ejs', {listUsers: results}) 
}
const getUpdateUser = async (req, res) => {
    const userid = req.params.id;
    let [results, fields] = await connection.query(`SELECT * FROM Persons WHERE PersonID = ?`, [userid]);
    let user = results && results.length > 0 ? results[0] : {};
    return res.render('update.ejs', {userEdit: user})    
}

const postCreateUser = async (req, res) => {
    let {fname, lname, address, city} = req.body;

    // Using placeholders
    const [results, fields] = await connection.query(
    `INSERT INTO 
    Persons (Firstname, Lastname, Address, City) 
    VALUES (?, ?, ?, ?)`, [fname, lname, address, city]
    );  
    res.send('create user success!');
}

const postUpdateUser = async (req, res) => {
    let {id, fname, lname, address, city} = req.body;
    const [results, fields] = await connection.query(
    `UPDATE Persons
    SET Firstname = ?, Lastname = ?, Address = ?, City = ? 
    WHERE PersonID = ?`, [fname, lname, address, city, id]
    );  
    console.log(id, fname, lname, address, city);
    res.redirect('/');
}

const test = async (req, res) => {
    // const password = await bcrypt.hash("aaa", 8);
    // if(await bcrypt.compare("aaa", password)) console.log('false');
    console.log(new Date(Date.now()))
    console.log("OK")
    return res.render('test.ejs');
}

const loginPage = (req, res) => {
    return res.render('login.ejs');
}

const registerPage =  async (req, res) => {
    let {registerName, registerEmail, registerPassword} = req.body;
    if(!registerEmail || !registerPassword) return res.json({status: "error", message: "Please enter your infomation"});
    else{
        const [results, fields] = await connection.query('SELECT * FROM Users WHERE Name = ? OR Email = ?', [registerName, registerEmail]);
        if(results[0]) return res.json({status: "error", message: "information has already used"})
        else{
            try{
                const password = await bcrypt.hash(registerPassword, 8);
                const [results, fields] = await connection.query('INSERT INTO Users (Name, Email, Password) VALUES (?, ?, ? )', [registerName, registerEmail, password]);
                return res.json({status: "success", message: "Register success!"});
            }
            catch(err){
                console.log(err);
            }
        }
    }
    
}

const loginCheckPage = async (req, res) => {
    let {loginEmail, loginPassword} = req.body;
    if(!loginEmail || !loginPassword) return res.json({status: "error", message: "Please enter your Email or Password"});
    else{
        const [results, fields] = await connection.query('SELECT * FROM Users WHERE Email = ?', [loginEmail]);
        if(!results[0] || !await bcrypt.compare(loginPassword, results[0].Password)) return res.json({status: "error", message: "Incorrect Email or Password"})
        else{
            const token = jwt.sign({id: results[0].ID}, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE
            })
            const cookiesOptions = {
                expiresIn: new Date(Date.now() + process.env.COOKIES_EXPIRE * 24 * 60 * 60 * 100),
            }
            res.cookie("userRegistered", token, cookiesOptions);
            return res.redirect("/");
        }
    }
}

module.exports = {
    getHomePage, listUser, postCreateUser, getUpdateUser, postUpdateUser, test, loginPage, registerPage, loginCheckPage // export object
}