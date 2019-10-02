//var Pool = require("pg").Pool;
var pg = require("pg");


//var conString = "postgres://postgres:postgres@localhost:5432/api";
var conString = "postgres://wzkowhhekyvcbh:dbc37ca58c23fa2edf7ed4af8319e00316de9aaf1defbb8cac1fd86500704f6a@ec2-107-20-173-2.compute-1.amazonaws.com:5432/d2346t6en0926l";

/*
const db = require('./public/javascripts/constants');
let connString = db.CONN_STRING;
*/
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
    //var date_registry = getNow();
    //to_timestamp('2019/06/20 17:15:27','YYYY/MM/DD HH24:MI:SS');
    const {id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments} = request.body;
    console.log(request.body);
    // console.log(coord_x);
    // console.log(coord_y);
    // console.log(typeof (coord_x));
    // console.log(typeof (coord_y));

    pool.query('INSERT INTO position (id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments, date_registry, the_geom) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, localtimestamp, ' +
        'st_geometryfromtext(\'POINT(' + coord_x + ' ' + coord_y + ')\',4326))',
        [id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments], (error, results) => {
            if (error) {
                throw error
            }
            // response.status(201).send(`Position added with ID: ${results.rows[0]}`);
            response.json(results.rows[0]);
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
    // pool.query('SELECT st_astext(the_geom) FROM position WHERE id_vehicle=' + parseInt(request.params.id_vehicle) + ' ORDER BY gid ASC', (error, results) => {
    pool.query("SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(lg.the_geom)::json As geometry, id_vehicle, id_driver, origin, destiny, \"comments\", date_registry As properties FROM \"position\" AS lg WHERE id_vehicle=" + parseInt(request.params.id_vehicle) + " ) AS f ) As fc;",
        (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows[0].row_to_json);
        console.log(results.rows[0].row_to_json);
    })
}


const createDriver = (request, response) => {
    const {email, password, name, surname, birthdate, genre, mobile_number} = request.body

    pool.query('INSERT INTO drivers ( email, password, name, surname, birthdate, genre, mobile_number, available) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, true)',
        [email, password, name, surname, birthdate, genre, mobile_number], (error, results) => {
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

const editDriver = (request, response) => {
    const {email, password, name, surname, birthdate, genre, mobile_number, id} = request.body;
    console.log(email + ', ' + name + ', ' + surname + ', ' + birthdate + ', ' + genre + ', ' + mobile_number + ', ' + email + ', ' + parseInt(id))


    pool.query('UPDATE drivers SET email=$1, password=$2, name=$3, surname=$4, birthdate=$5, genre=$6, mobile_number=$7 WHERE id_driver=$8;',
        [email, password, name, surname, birthdate, genre, mobile_number, id], (error, results) => {
            if (error) {
                throw error
            }

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
        client.query('SELECT id_driver, email, name, surname, birthdate, genre, mobile_number, available FROM drivers ORDER BY id_driver ASC', (err, response) => {
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
        // console.log(results.rows[0]);
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

const editVehicle = (request, response) => {
    const { type, brand, model, passengers, fuel, available, id } = request.body;

    pool.query('UPDATE vehicles SET type=$1, brand=$2, model=$3, passengers=$4, fuel=$5, available=$6 WHERE id_vehicle=$7;',
        [type, brand, model, passengers, fuel, available, id], (error, results) => {
            if (error) {
                throw error
            }

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
    // delete the vehicle from 'vehicles' table
    pool.query('DELETE FROM vehicles WHERE id_vehicle=' + (request.params.id_vehicle).toString() + ';', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows[0]);
    });


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

    //TODO: establecer available del Driver con id_driver = false
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


const deleteVehicleDriverByIdVehicle = (request, response) => {
// delete relation in 'vehicle_driver' relation
    pool.query('DELETE FROM vehicle_driver WHERE id_vehicle=' + (request.params.id_vehicle).toString() + ';', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        //console.log(results.rows[0]);
    });
}

const deleteVehicleDriverByIdDriver = (request, response) => {
// delete relation in 'vehicle_driver' relation
    pool.query('DELETE FROM vehicle_driver WHERE id_driver =' + (request.params.id_driver).toString() + ';', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        //console.log(results.rows[0]);
    });
}



module.exports = {
    insertPosition,
    createDriver,
    editDriver,
    createVehicle,
    editVehicle,
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
    deleteVehicleDriverByIdVehicle,
    deleteVehicleDriverByIdDriver,
    getTest
}