const express = require('express');
const url = require('url');
const fs = require('fs');
var template = require('./temp.js');
const db = require('./db');

const app = express()
const port = 8080

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
const uri = "";
const client = new MongoClient(uri);


app.get('/', (req, res) => {
    res.send('이 사이트는 해커톤을 위한 사이트입니다! :)');
});

async function login_fetchDataFromDatabase(userid, password) {
    try {
        const sql = 'SELECT * FROM userTable WHERE userid = ? AND password = ?';
        const result = await db.queryDatabase(sql, [userid, password]);
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

app.get('/login', function (req, res) {
    var title = '로그인';
    var html = template.HTML(title, `
    <h2>로그인</h2>
    <form action="/login_process" method="post">
    <p><input class="login" type="text" name="userid" placeholder="아이디"></p>    
    <p><input class="login" type="password" name="pwd" placeholder="비밀번호"></p>
    <p><input class="btn" type="submit" value="로그인"></p>
    </form>            
    `, '');
    res.send(html);
});

app.post('/login_process', async (req, res) => {
    const userid = req.body.userid;
    const password = req.body.pwd;
    if (userid && password) {
        try {
            const results = await login_fetchDataFromDatabase(userid, password);
            if (results.length > 0) {
                const user = results[0]
                res.status(200).send(`${user.id} : ${user.username}`)
            } else {
                res.status(400).send(`로그인 정보 오류`);
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).send('서버에 오류가 발생했습니다.');
        }
    } else {
        res.status(400).send(`입력되지 않은 정보가 있습니다.`);
    }
});


async function register_insertDataIntoDatabase(userid, username, password) {
    try {
        const sql = 'SELECT * FROM userTable WHERE username = ?';
        const results = await db.queryDatabase(sql, [username]);

        if (results.length === 0) {
            const insertSql = 'INSERT INTO userTable (userid, username, password) VALUES (?, ?, ?)';
            await db.queryDatabase(insertSql, [userid, username, password]);
            return 'SUCCESS';
        } else {
            throw new Error('USERNAME_EXISTS');
        }
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}

app.get('/register', function (req, res) {
    var title = '회원가입';
    var html = template.HTML(title, `
    <h2>회원가입</h2>
    <form action="/register_process" method="post">
    <p><input class="login" type="text" name="username" placeholder="유저명"></p>
    <p><input class="login" type="text" name="userid" placeholder="아이디"></p>    
    <p><input class="login" type="password" name="pwd" placeholder="비밀번호"></p>
    <p><input class="btn" type="submit" value="제출"></p>
    </form>            
    <p><a href="/login">로그인화면으로 돌아가기</a></p>
    `, '');
    res.send(html);
});

app.post('/register_process', async (req, res) => {
    const userid = req.body.userid;
    const username = req.body.username;
    const password = req.body.pwd;
    console.log(userid, username, password)

    if (userid && username && password) {
        try {
            const result = await register_insertDataIntoDatabase(userid, username, password);
            if (result === 'SUCCESS') {
                res.send(`회원가입이 완료되었습니다!`);
            }
        } catch (error) {
            if (error.message === 'USERNAME_EXISTS') {
                res.status(400).send(`이미 존재하는 아이디입니다.`);
            } else {
                console.error('Register error:', error);
                res.status(500).send('서버에 오류가 발생했습니다.');
            }
        }
    } else {
        res.status(400).send(`입력되지 않은 정보가 있습니다.`);
    }
});

async function userinfo_fetchDataFromDatabase(id) {
    try {
        const sql = 'SELECT * FROM userInfo WHERE userId = ?';
        const result = await db.queryDatabase(sql, [id]);
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

app.get('/userinfo', async (req, res) => {
    const queryData = url.parse(req.url, true).query;
    const _id = queryData.id;
    if (_id) {
        try {
            const results = await userinfo_fetchDataFromDatabase(_id);
            if (results.length > 0) {
                console.log(results);
                res.status(200).send(`${JSON.stringify(results)}`)
            } else {
                res.status(400).send(`오류`);
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).send('서버에 오류가 발생했습니다.');
        }
    } else {
        res.status(400).send(`잘못된 접근.`);
    }
});


app.post('/write_dorm', async (req, res) => {
    const _dorm = req.body.dorm;
    const _college = req.body.college;
    const _cigar = req.body.cigar;
    const _nose = req.body.nose;
    const _sleep = req.body.sleep;
    try {
        await client.connect();
        const database = client.db('ampmhackathon');
        const collection = database.collection('dormmatelist');

        const doc = { dorm: `${_dorm}`, college: _college, cigar: _cigar, nose: _nose, sleep: _sleep };
        const result = await collection.insertOne(doc);

        console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } finally {
        await client.close();
    }
});

app.get('/read_dorm', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ampmhackathon');
        const collection = database.collection('dormmatelist');

        const query = {};
        const cursor = collection.find(query);

        const resultArray = await cursor.toArray();


        const resultString = JSON.stringify(resultArray, null, 2);
        console.log(resultString);
        res.status(200).send(`${resultString}`)
    } finally {
        await client.close();
    }
});

app.post('/write_curfewmate', async (req, res) => {
    const _dorm = req.body.dorm;
    const _time = req.body.time;
    if (true) {
        try {
            await client.connect();
            const database = client.db('ampmhackathon');
            const collection = database.collection('curfewmatelist');

            const doc = { dorm: `${_dorm}`, time: _time };
            const result = await collection.insertOne(doc);

            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        } finally {
            await client.close();
        }
    } else {
        res.status(400).send(`입력되지 않은 정보가 있습니다.`);
    }
});

app.get('/read_curfewmate', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ampmhackathon');
        const collection = database.collection('curfewmatelist');

        const query = {};
        const cursor = collection.find(query);

        const resultArray = await cursor.toArray();


        const resultString = JSON.stringify(resultArray, null, 2);
        console.log(resultString);
        res.status(200).send(`${resultString}`)
    } finally {
        await client.close();
    }
});

app.post('/write_delivery', async (req, res) => {
    const _dorm = req.body.dorm;
    const _store = req.body.store;
    const _time = req.body.time;
    if (true) {
        try {
            await client.connect();
            const database = client.db('ampmhackathon');
            const collection = database.collection('deliverymatelist');

            const doc = { dorm: `${_dorm}`, store: _store, time: _time };
            const result = await collection.insertOne(doc);

            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        } finally {
            await client.close();
        }
    } else {
        res.status(400).send(`입력되지 않은 정보가 있습니다.`);
    }
});

app.get('/read_delivery', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ampmhackathon');
        const collection = database.collection('deliverymatelist');

        const query = {};
        const cursor = collection.find(query);

        const resultArray = await cursor.toArray();


        const resultString = JSON.stringify(resultArray, null, 2); 
        console.log(resultString);
        res.status(200).send(`${resultString}`)
    } finally {
        await client.close();
    }
});

app.post('/write_taxi', async (req, res) => {
    const _departure = req.body.departure;
    const _arrival = req.body.arrival;
    const _time = req.body.time;
    if (true) {
        try {
            await client.connect();
            const database = client.db('ampmhackathon');
            const collection = database.collection('taximatelist');

            const doc = { departure: `${_departure}`, arrival: _arrival, time: _time };
            const result = await collection.insertOne(doc);

            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        } finally {
            await client.close();
        }
    } else {
        res.status(400).send(`입력되지 않은 정보가 있습니다.`);
    }
});

app.get('/read_taxi', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ampmhackathon');
        const collection = database.collection('taximatelist');

        const query = {};
        const cursor = collection.find(query);

        const resultArray = await cursor.toArray();


        const resultString = JSON.stringify(resultArray, null, 2);
        console.log(resultString);
        res.status(200).send(`${resultString}`)
    } finally {
        await client.close();
    }
});

app.use(express.static('public'))

app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/public/404.html')
})

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).sendFile(__dirname + '/public/500.html')
})

app.listen(port, () => {
    console.log(`포트 : ${port} 에서 실행 중`)
})