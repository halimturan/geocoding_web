const express = require('express');
const router = express.Router();
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'geocodinguser',
    host: '10.6.129.25',
    database: 'geocoding',
    password: 'geocoding2021',
    port: 5432
})

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

const getQuery = (req, res) => {
    const {text} = req.body;
    const sql = 'select * from (select *, SIMILARITY(name, $1) as sml from geocoding.test.address where SIMILARITY(name, $1) > 0.2 limit 20) ahmet order by ahmet.sml DESC limit 5;'
    pool.query(sql, [text], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
}
router.post('/', function(req, res, next) {
    const {text} = req.body;
    const sql = 'select * from (select *, SIMILARITY(name, $1) as sml from geocoding.test.address where SIMILARITY(name, $1) > 0.2 limit 20) ahmet order by ahmet.sml DESC limit 5;'
    ///const sql = 'SELECT * FROM geocoding.test.address ORDER BY SIMILARITY(name, $1) DESC LIMIT 5';
    pool.query(sql, [text], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows);
    });
});
module.exports = {
    getQuery
}
