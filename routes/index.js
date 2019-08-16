var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

const db = require('../queries');

// var pg = require("pg");
// var conString = "postgres://postgres:postgres@localhost:5432/api";
// var conString = "postgres://wzkowhhekyvcbh:dbc37ca58c23fa2edf7ed4af8319e00316de9aaf1defbb8cac1fd86500704f6a@ec2-107-20-173-2.compute-1.amazonaws.com:5432/d2346t6en0926l";

// const {Pool} = require('pg');


// const pool = new Pool({
//     connectionString: conString,
// });

/* GET home page. */
router.get('/', function (req, res, next) {
    // res.render('index', {title: 'Express'});
    res.json({info: 'Node.js, Express, and Postgres API'});
});

//map page
router.get('/map', function (req, res, next) {
    // pool.on('error', (err, client) => {
    //     console.error('Unexpected error on idle client', err)
    //     process.exit(-1)
    // })

    // pool.connect((err, client, done) => {
    //     if (err) throw err;
    //     client.query('SELECT * FROM vehicles ORDER BY id_vehicle ASC', (err, response) => {
            //done();

            // if (err) {
            //     console.log(err.stack)
            // } else {
                //console.log(res.rows[0])
                // var respuesta = response.rows;
                //console.log(respuesta);
                //console.log(typeof (respuesta));

                res.render('map', {
                    title: ' Geolocalización de objetos móviles',
                    lat: 40.034,
                    lng: -4.02
                    // vehicles: respuesta
                });
            // }
        // })
        // done();
    // })

});

router.get('/test', function (req, res, next) {
    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
    })

    pool.connect((err, client, done) => {
        if (err) throw err;
        client.query('SELECT * FROM drivers ORDER BY id_driver ASC', (err, response) => {
            //done();

            if (err) {
                console.log(err.stack)
            } else {
                //console.log(res.rows[0])
                var respuesta = response.rows;
                //console.log(respuesta);
                //console.log(typeof (respuesta));

                res.render('test',{
                    title: 'Catálogo',
                    drivers: (respuesta)
                });
            }
        })
        done();
    })
});

//Interaction with database through GET, POST, PUT, DELETE

//Create a driver
router.post('/driver', db.createDriver);

//Edit driver
router.post('/editDriver', db.editDriver);

//Create a vehicle
router.post('/vehicle', db.createVehicle);

//Edit vehicle
router.post('/editVehicle', db.editVehicle);

//Insert a position
router.post('/position', db.insertPosition);

//Select vehicles
router.get('/getVehicles', db.getVehicles);

//Select vehicle by id_vehicle
router.get('/vehicle/:id_vehicle', db.getVehicleById);

//Delete vehicle by id_driver
router.delete('/deleteVehicle/:id_vehicle', db.deleteVehicleById);

//Select driver by id_vehicle
router.get('/driverByIdVehicle/:id_vehicle', db.getDriverByIdVehicle);

//Select drivers
router.get('/getDrivers', db.getDrivers);

//Select driver by id_driver
router.get('/driver/:id_driver', db.getDriverById);

//Delete driver by id_driver
router.delete('/deleteDriver/:id_driver', db.deleteDriverById);

//Select vehicle by id_driver
router.get('/vehicleByIdDriver/:id_driver', db.getVehicleByIdDriver);

//Get position by driver
router.get('/position-driver/:id_driver', db.getPositionByDriver);

//Select position of vehicle
router.get('/position-vehicle/:id_vehicle', db.getPositionByVehicle);

//Insert a vhicleDriver relation
router.post('/vehicleDriver', db.vehicleDriver);

//Delete vehicleDriver relation by id_vehicle
router.post('/deleteVehicleDriverByIdVehicle/:id_vehicle', db.deleteVehicleDriverByIdVehicle);

//Delete vehicleDriver relation by id_driver
router.post('/deleteVehicleDriverByIdDriver/:id_driver', db.deleteVehicleDriverByIdDriver);

router.post('/pos', function (req, res) {
    console.log(res);
    res.send(req.body);
});

router.get('/send_coord', function (req, res) {
    res.send('<html>'
        + '<body>'
        + '<form method="post" action="/coords">'
        + '<h1>Posición del objeto: </h1>'
        + '<p>Identificador <input type="text" name="identifier"/></p>'
        + '<p>Coord X <input type="text" name="coord_x"/></p>'
        + '<p>Coord Y <input type="text" name="coord_y"/></p>'
        + '<input type="submit" value="Send"/>'
        + '</form>'
        + '</body>'
        + '</html>'
    );
});

router.post('/coords', function (req, res) {
    var coord_x = req.body.coord_x;
    var coord_y = req.body.coord_y;
    var pos = [coord_x, coord_y];
    var identifier = req.body.identifier;
    console.log('Identificador: ' + identifier);
    console.log('Coordenada X recibida: ' + coord_x);
    console.log('Coordenada Y recibida: ' + coord_y);

    res.json(pos);


    /*
    res.send('<html>'
        +       '<body>'
        +           '<form method="post" action="/check">'
        +               '<p>Las coordenadas introducidas son: </p>'
        +               '<p>Identificador:' + identifier + '</p>'
        +               '<p>Coord X:' + coord_x + '</p>'
        +               '<p>Coord Y:' + coord_y + '</p>'
        +               '<a href="/send_coord">Introduce coordenadas de nuevo</a>'
        +           '</form>'
        +       '</body>'
        +   '</html>'
    );
    */
});

module.exports = router;
