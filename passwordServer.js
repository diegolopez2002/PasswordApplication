
const fetch = require('node-fetch'); 
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config({ path: './passwordApp.env' });
const bcrypt = require('bcrypt');

const app = express();
const portNumber = process.argv[2];

if (isNaN(portNumber)) {
    console.error(`Invalid port number: ${portNumber}`);
    process.exit(1);
}



app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.resolve(__dirname, "templates"));
app.set('view engine', 'ejs');
const { MongoClient } = require('mongodb');
username = "dlopez22";
password = "Raven22radl!3";
dbName = "Password_Database";
collectionName = "Passwords";

const uri = `mongodb+srv://dlopez22:RcD3h7z36aH3Nql0@cluster0.b5gjdxi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

// Define your routes here
app.get("/signup", (request, response) => {
    response.render('signup', { port: portNumber });
}); 

app.get("/", (request, response) => {
    response.render('login');
}); 

app.get('/signeduppage', (request, response) => {
    response.render('signeduppage', { appSize: 'size-info' }); 
});

app.get('/signup.ejs', (request, response) => {
    response.render('signup' , {port: portNumber});
});

app.get("/password", (request, response) => {
    response.render('password', { port: portNumber });

}); 

app.post('/userinfo', async (request, response) => {
    response.render('signeduppage'); 
});

app.post('/encryption', async (request, response) => {


    if (!request.body.password) {
        return response.status(400).send("Password is required");
    } 

    let newpassword = await hashPassword(request.body.password);

    const appWords = {
        password: request.body.password,
        newpassword: newpassword,
    }

    const collection = client.db(dbName).collection(collectionName);
    const result = await collection.insertOne(appWords);


    response.render('encryption', appWords);

});

app.post('/newuser', async (request, response) => {


    const appWords1 = {

        username: request.body.username
        
    }
    const collection = client.db(dbName).collection(collectionName);
    const result = await collection.insertOne(appWords1);

    response.render('encryption', appWords1);

});

app.get('/displayTable', async (request, res) => {

    try {
        const collection = client.db(dbName).collection(collectionName);
        const passwords = await collection.find({}).toArray(); // Fetch data from MongoDB

        let passwordTable_ = '<table border="1">';
        passwordTable_ += '<tr><th>Passwords</th></tr><th><tr>Password</th></tr>';
        passwords.forEach(password => {
            passwordTable_ += `<tr><td>${password.newpassword}</td><td>${password.password}</td></tr>`;
        });
        passwordTable_ += '</table>';
        res.render('displayTable', {passwordTable: passwordTable_ }); 
    } catch (error) {
        res.status(500).send('Server error');
    }

});


app.post('/login', async (request, response) => {
    response.render('password'); 
});

app.listen(portNumber, () => {
    console.log(`Web server started and running at http://localhost:${portNumber}`);
    console.log('Type "stop" to shutdown the server');
});


process.stdin.setEncoding("utf8");
process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
        let command = dataInput.trim();
        if (command === "stop" || command === "Stop" || "STOP") {
            console.log("Shutting down the server");
            process.exit(0);
        } else {
            console.log("Invalid command: " + command);
        }
    }
});


async function hashPassword(password) {

    const saltRounds = 10; 
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

app.post('/resetDatabase', async (req, res) => {
    try {
        const collection = client.db(dbName).collection(collectionName);
        await collection.deleteMany({}); // This will delete all documents in the collection

        res.send('Database has been reset.'); // Or redirect to a confirmation page
    } catch (error) {
        console.error('Error resetting database:', error);
        res.status(500).send('Error resetting database');
    }
});

