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

router.post('/', function(req, res, next) {
    const {text} = req.body;
    const sql = 'SELECT id, name, detail_url, icon, SIMILARITY(search, $1) as sml FROM geocoding.address.address where  search % $1 ORDER BY index, sml DESC LIMIT 5';
    pool.query(sql, [makeSortString(text)], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    });
});

router.patch('/', function(req, res, next) {
    const {id} = req.body;
    const select_sql = 'SELECT id, index FROM geocoding.address.address WHERE id=$1';
    pool.query(select_sql, [id], (error, results) => {
        if (error) {
            throw error
        }
        const data_id =  results.rows[0].id;
        let index = results.rows[0].index;
        index === null || index === 0 ? index = 1 : index = index + 1;
        const update_sql = 'UPDATE geocoding.address.address SET index = $1 WHERE id = $2';
        pool.query(update_sql, [index, data_id], (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json({"index": index});
        });
    });
});

module.exports = router;
