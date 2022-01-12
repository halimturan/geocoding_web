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

var makeSortString = (function() {
    var translate_re = /[IİıÜüÖöŞşĞğÇç]/g;
    var translate = {
        "I": "i", "İ": "i", "ı": "i", "Ü": "u", "ü": "u", "Ö": "o", "ö": "o", "Ş": "s", "ş": "s", "ğ": "g", "Ğ": "g", "Ç": "c", "ç": "c"
    };
    return function(s) {
        return ( s.replace(translate_re, function(match) {
            return translate[match];
        }) );
    }
})();

const getQuery = (req, res) => {
    const {text} = req.body;
    const sql = 'SELECT name, detail_url, icon, SIMILARITY(search, $1) as sml FROM geocoding.address.address where  search % $1 ORDER BY index, sml DESC LIMIT 5';
    //const sql = 'SELECT name, detail_url, icon, address.search <-> $1 AS dist FROM address.address ORDER BY index, dist LIMIT 5;'
    pool.query(sql, [makeSortString(text)], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    });
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
