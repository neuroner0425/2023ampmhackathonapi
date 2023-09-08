const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'jabcho.org',
    user: 'ampmuser1',
    password: 'pass12',
    database: 'ampmhackathon',
    connectionLimit: 2,
    waitForConnections: true,
    queueLimit: 0,
    keepAliveInitialDelay: 10000,
    enableKeepAlive: true,
})

async function queryDatabase(sql, params = []) {
    try {
        const [rows, fields] = await pool.execute(sql, params)
        return rows
    } catch (error) {
        console.error('DB error:', error)
        throw error
    }
}

module.exports = { queryDatabase };