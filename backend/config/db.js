const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campusconnect',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Vérifier la connexion immédiatement
pool.getConnection()
    .then((conn) => {
        console.log('Connexion à la base de données MySQL réussie.');
        conn.release();
    })
    .catch((err) => {
        console.error('Erreur de connexion à la base de données MySQL :', err.message);
    });

module.exports = pool;
