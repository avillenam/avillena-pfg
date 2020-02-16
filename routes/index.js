var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const db = require('../public/javascripts/queries');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', {
        title: 'Geolocalización de objetos móviles',
        message: req.flash('loginMessage')
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: 'Geolocalización de objetos móviles',
        message: req.flash('loginMessage')
    });
});

router.post('/login', db.login);

router.get('/register', function (req, res, next) {
    res.render('register', {
        title: 'Registro de usuario nuevo',
        message: req.flash('registerMessage')
    });
});

router.post('/register', db.register);

//map page
/*
router.get('/map', function (req, res, next) {
    res.render('map', {
        title: 'Geolocalización de objetos móviles',
        lat: 40.034,
        lng: -4.02
        // vehicles: respuesta
    });
});
*/


//*******************************************************************************
// Interacción con la base de datos a través de peticiones GET, POST, PUT, DELETE
//*******************************************************************************
//Crea un portador
router.post('/driver', db.createDriver);

//Crea un objeto
router.post('/createObject', db.createObject);

//Edita portador
router.post('/editDriver', db.editDriver);

//Crea un vehículo
router.post('/vehicle', db.createVehicle);

//Edita objeto
router.post('/editVehicle', db.editVehicle);

//Inserta una posición
router.post('/position', db.insertPosition);

//Obtiene todos los objetos
router.get('/getVehicles', db.getVehicles);

//Obtiene objeto por su id
router.get('/vehicle/:id_vehicle', db.getVehicleById);

//Elimina objeto por su id
router.delete('/deleteVehicle/:id_vehicle', db.deleteVehicleById);

//Obtiene portador por su id
router.get('/driverByIdVehicle/:id_vehicle', db.getDriverByIdVehicle);

//Obtiene todos los conductores
router.get('/getDrivers', db.getDrivers);

//Obtiene portador por su id
router.get('/driver/:id_driver', db.getDriverById);

//Elimina portador por su id
router.delete('/deleteDriver/:id_driver', db.deleteDriverById);

//Obtiene objeto a través de su id
router.get('/vehicleByIdDriver/:id_driver', db.getVehicleByIdDriver);

//Obtiene la posición de un portador por su id
router.get('/position-driver/:id_driver', db.getPositionByDriver);

//Selecciona la posición de un objeto a partir de su id y la fecha
router.get('/getPositionByObject/:id_vehicle/:date', db.getPositionByObject);

//Obtiene los dos últimos puntos de un objeto para un id dado
router.get('/getTwoLastPositionByVehicle/:id_vehicle', db.getTwoLastPositionByVehicle);

//Obtiene los 'n' últimos puntos de un objeto dados su id y la fecha
router.get('/getTailVehicle/:id_vehicle/:date', db.getTailVehicle); //Formato: DD-MM-YYYY

//Obtiene el último punto de un objeto, con sus atributos, dado su id
router.get('/getCurrentPointByVehicle/:id_vehicle', db.getCurrentPointByVehicle);

//Obtiene las fechas de las rutas de cada objeto a través de su id
router.get('/getRoutesByVehicle/:id_vehicle', db.getRoutesByVehicle);

//Obtiene la ruta de un objeto dados su id y la fecha
router.get('/getRouteOfVehicleByDate/:id_vehicle/:date', db.getRouteOfVehicleByDate);

//Establece la relación objeto-portador
router.post('/vehicleDriver', db.vehicleDriver);

//Elimina la relacion objeto-portador
router.post('/deleteVehicleDriver', db.deleteVehicleDriver);

//Establece la disponibilidad para el portador
router.post('/driverAvailability', db.availabilityDriver);

//Establece la disponibilidad para el objeto
router.post('/vehicleAvailability', db.availabilityVehicle);

//Establece la fecha de registro que se quiere mostrar
router.get('/time/:fecha_ini/:fecha_fin', db.dateRegistryToShow);

//Realiza la comprobación de usuario registrado
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

// Petición de prueba
router.post('/coords', function (req, res) {
    var coord_x = req.body.coord_x;
    var coord_y = req.body.coord_y;
    var pos = [coord_x, coord_y];
    var identifier = req.body.identifier;
    console.log('Identificador: ' + identifier);
    console.log('Coordenada X recibida: ' + coord_x);
    console.log('Coordenada Y recibida: ' + coord_y);

    res.json(pos);
});

module.exports = router;
