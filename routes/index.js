var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const db = require('../queries');

// var pg = require("pg");position-vehicle
//var conString = "postgres://postgres:postgres@localhost:5432/api";
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

//*******************************************************************************
// Interacción con la base de datos a través de peticiones GET, POST, PUT, DELETE
//*******************************************************************************
//Crea un conductor
router.post('/driver', db.createDriver);

//Crea un objeto
router.post('/createObject', db.createObject);

//Edita conductor
router.post('/editDriver', db.editDriver);

//Crea un vehículo
router.post('/vehicle', db.createVehicle);

//Edita Vehículo
router.post('/editVehicle', db.editVehicle);

//Inserta una posición
router.post('/position', db.insertPosition);

//Selecciona vehículos
router.get('/getVehicles', db.getVehicles);

//Selecciona vehículo por id_vehicle
router.get('/vehicle/:id_vehicle', db.getVehicleById);

//Elimina vehículo por id_driver
router.delete('/deleteVehicle/:id_vehicle', db.deleteVehicleById);

//Selecciona conductor por id_vehicle
router.get('/driverByIdVehicle/:id_vehicle', db.getDriverByIdVehicle);

//Seleccioma conmductores
router.get('/getDrivers', db.getDrivers);

//Selecciona conductor por id_driver
router.get('/driver/:id_driver', db.getDriverById);

//Elimina conductor por id_driver
router.delete('/deleteDriver/:id_driver', db.deleteDriverById);

//Selecciona vehículo a través de id_driver
router.get('/vehicleByIdDriver/:id_driver', db.getVehicleByIdDriver);

//Obtiene la posicion de un conductor
router.get('/position-driver/:id_driver', db.getPositionByDriver);

//Selecciona la posicion de un vehículo
router.get('/getPositionByObject/:id_vehicle/:date', db.getPositionByObject);

//Obtiene los dos últimos puntos para un id_vehicle dado
router.get('/getTwoLastPositionByVehicle/:id_vehicle', db.getTwoLastPositionByVehicle);

//Obtiene los n últimos puntos para un id_vehicle dado
router.get('/getTailVehicle/:id_vehicle/:date', db.getTailVehicle); //Formato: DD-MM-YYYY

//Obtiene el último punto, con sus atributos, para un id_vehicle dado
router.get('/getCurrentPointByVehicle/:id_vehicle', db.getCurrentPointByVehicle);

// Obtiene las fechas de las rutas de cada vehículo a través de su id_vehicle
router.get('/getRoutesByVehicle/:id_vehicle', db.getRoutesByVehicle);

// Obtiene la ruta de un vehículo para una fecha dada
router.get('/getRouteOfVehicleByDate/:id_vehicle/:date', db.getRouteOfVehicleByDate);

//Establecer relación driver-vehicle
router.post('/vehicleDriver', db.vehicleDriver);

//Eliminar relacion driver-vehicle
router.post('/deleteVehicleDriver', db.deleteVehicleDriver);

// Establece available para el conductor
router.post('/driverAvailability', db.availabilityDriver);

// Establece available para el vehiculo
router.post('/vehicleAvailability', db.availabilityVehicle);

// Establece la fecha de registro que se quiere mostrar
router.get('/time/:fecha_ini/:fecha_fin', db.dateRegistryToShow);

//Login Driver in system
router.get('/loginDriver/:email/:password', db.loginDriver);

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
