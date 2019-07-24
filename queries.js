//var Pool = require("pg").Pool;
var pg = require("pg");

var conString = "postgres://postgres:postgres@localhost:5432/api";
// var conString = "postgres://wzkowhhekyvcbh:dbc37ca58c23fa2edf7ed4af8319e00316de9aaf1defbb8cac1fd86500704f6a@ec2-107-20-173-2.compute-1.amazonaws.com:5432/d2346t6en0926l";

const {Pool} = require('pg');
const pool = new Pool({
    connectionString: conString,
});
/*
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'api',
    password: 'postgres',
    port: 5432,
});
*/

function getNow(){
    var m = new Date();
    var dateString =
        m.getUTCFullYear() + "/" +
        ("0" + (m.getUTCMonth()+1)).slice(-2) + "/" +
        ("0" + m.getUTCDate()).slice(-2) + " " +
        ("0" + m.getUTCHours()).slice(-2) + ":" +
        ("0" + m.getUTCMinutes()).slice(-2) + ":" +
        ("0" + m.getUTCSeconds()).slice(-2);
    return dateString;
}
//Query functions
const insertPosition = (request, response) => {
    var date_registry = getNow();
    //to_timestamp('2019/06/20 17:15:27','YYYY/MM/DD HH24:MI:SS');
    const {id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments} = request.body;
    console.log(request.body);
    console.log(coord_x);
    console.log(coord_y);
    console.log(typeof (coord_x));
    console.log(typeof (coord_y));

    pool.query('INSERT INTO position (id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments, the_geom) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, ' +
        'st_geometryfromtext(\'POINT(' + coord_x + ' ' + coord_y + ')\',4326))',
        [driver, vehicle, coord_x, coord_y, origin, destiny, comments], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`Position added with ID: ${results.rows[0]}`);
            console.log(results.rows[0]);
        })
    //pool.end();
}

const getPositionByDriver = (request, response) => {
    pool.query('SELECT * FROM position WHERE driver=' + parseInt(request.params.id_driver) + ' ORDER BY gid ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows);
    })
}

const getPositionByVehicle = (request, response) => {
    pool.query('SELECT st_astext FROM position WHERE vehicle=' + parseInt(request.params.id_vehicle) + ' ORDER BY gid ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows);
    })
}


const createDriver = (request, response) => {
    const {name, surname, birthdate, genre, mobile_number, email, available} = request.body

    pool.query('INSERT INTO drivers ( name, surname, birthdate, genre, mobile_number, email, available) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, surname, birthdate, genre, mobile_number, email, available], (error, results) => {
            if (error) {
                throw error
            }
            //response.status(201).send(`Driver added with ID: ${results.rows[0]}`);
            //console.log(results.rows[0]);
            console.log(results.rows[0]);
            response.redirect("/map");
        })
    //pool.end();
}

const getDrivers =  (req, res) => {
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

                res.status(200).json(respuesta);
            }
        });
        done();
    })
}


const getTest = function () {
    var usuario = {nombre: "Antonio", username: "Tony"}
    return JSON.stringify(usuario);
}


const getDriverById = (request, response) => {
    pool.query('SELECT * FROM drivers WHERE id_driver=' + (request.params.id_driver).toString(), (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows[0]);
    })
}

const deleteDriverById = (request, response) => {
    pool.query('DELETE FROM drivers WHERE id_driver=' + (request.params.id_driver).toString(), (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows[0]);
    })
}

const createVehicle = (request, response) => {
    const {
        type, brand, model, passengers, fuel, available
    } = request.body;

    console.log(request.body);
    console.log(typeof (load_capacity));

    pool.query('INSERT INTO vehicles (type, brand, model, passengers, fuel, available) ' +
        'VALUES ($1, $2, $3, $4, $5, $6)',
        [type, brand, model, passengers, fuel, available], (error, results) => {
            if (error) {
                throw error
            }
            //response.status(201).send(`Vehicle added with ID: ${results.rows[0]}`);
            console.log(results.rows[0]);
            response.redirect("/map");
        })
}


const getVehicles = (req, res) => {
    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
    })

    pool.connect((err, client, done) => {
        if (err) throw err;
        client.query('SELECT * FROM vehicles ORDER BY id_vehicle ASC', (err, response) => {
            //done();
            if (err) {
                console.log(err.stack)
            } else {
                //console.log(res.rows[0])
                var respuesta = response.rows;
                //console.log(respuesta);
                //console.log(typeof (respuesta));

                res.status(200).json(respuesta);
            }
        });
        done();
    })
}

const getVehicleById = (request, response) => {
    pool.query('SELECT * FROM vehicles WHERE id_vehicle=' + (request.params.id_vehicle).toString(), (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows[0]);
    })
}

const deleteVehicleById = (request, response) => {
    pool.query('DELETE FROM vehicles WHERE id_vehicle=' + (request.params.id_vehicle).toString(), (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows[0]);
    })
}


const getDriverByIdVehicle = (request, response) => {
    pool.query('SELECT a.id_vehicle, b.id_driver, b.name, b.surname, a.date_registry FROM vehicle_driver a, drivers b WHERE a.id_driver=b.id_driver AND a.id_vehicle=' + request.params.id_vehicle, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows[0]);
    })
}


const getVehicleByIdDriver = (request, response) => {
    pool.query('SELECT a.id_driver, b.id_vehicle, b.brand, b.model, a.date_registry FROM vehicle_driver a, vehicles b WHERE a.id_vehicle=b.id_vehicle AND a.id_driver=' + request.params.id_driver, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows[0]);
    })
}

const vehicleDriver = (request, response) => {
    const { id_vehicle, id_driver } = request.body;

    console.log(request.body);

    pool.query('INSERT INTO vehicle_driver (id_vehicle, id_driver, date_registry) ' +
        'VALUES ($1, $2, localtimestamp)',
        [id_vehicle, id_driver], (error, results) => {
            if (error) {
                throw error
            }
            //response.status(201).send(`Vehicle added with ID: ${results.rows[0]}`);
            console.log(results.rows[0]);
            response.redirect("/map");
        })
}



module.exports = {
    insertPosition,
    createDriver,
    createVehicle,
    getVehicles,
    getVehicleById,
    getDrivers,
    getDriverById,
    deleteDriverById,
    getPositionByDriver,
    getPositionByVehicle,
    getDriverByIdVehicle,
    getVehicleByIdDriver,
    vehicleDriver,
    deleteVehicleById,
    getTest
}