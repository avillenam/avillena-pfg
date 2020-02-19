// var conString = "postgres://postgres:postgres@localhost:5432/api";
// var conString = "postgres://wzkowhhekyvcbh:dbc37ca58c23fa2edf7ed4af8319e00316de9aaf1defbb8cac1fd86500704f6a@ec2-107-20-173-2.compute-1.amazonaws.com:5432/d2346t6en0926l";

const {url} = require('../../config/database');

//Fechas por defecto
var ahora = new Date();
var fecha_ini = '20190901';  // fecha inicio 1 de septiembre de 2019
var fecha_fin = '' + ahora.getFullYear() + (ahora.getMonth() + 1) + ahora.getDate();  // fecha hasta hoy

/*
const db = require('./public/javascripts/constants');
let connString = db.CONN_STRING;
*/
const {Pool} = require('pg');
const pool = new Pool({
    connectionString: url,
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

function getNow() {
    var m = new Date();
    var dateString =
        m.getUTCFullYear() + "/" +
        ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" +
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
    const {id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments, accuracy, address, speed} = request.body;
    console.log(request.body);
    // console.log(coord_x);
    // console.log(coord_y);
    // console.log(typeof (coord_x));
    // console.log(typeof (coord_y));

    pool.query('INSERT INTO position (id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments, accuracy, address, speed, date_registry, the_geom) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, round($8::numeric, 2), $9, round($10::numeric, 2), localtimestamp, ' +
        'st_geometryfromtext(\'POINT(' + coord_x + ' ' + coord_y + ')\',4326))',
        [id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments, accuracy, address, speed], (error, results) => {
            if (error) {
                throw error
            }

            var login_code = new Object();
            login_code.code = 1;
            response.status(200).json(login_code);

            //response.status(201).send(`Position added with ID: ${results.rows[0]}`);
            //response.json(results.rows[0]);
            console.log(results.rows[0]);
        })
    //pool.end();
}

const getPositionByDriver = (request, response) => {
    pool.query('SELECT * FROM position WHERE id_driver=' + parseInt(request.params.id_driver) + ' ORDER BY gid ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        console.log(results.rows);
    })
}

const getPositionByObject = (request, response) => {
    var id_vehicle = request.params.id_vehicle;
    var date = request.params.date;

    // pool.query('SELECT st_astext(the_geom) FROM position WHERE id_vehicle=' + parseInt(request.params.id_vehicle) + ' ORDER BY gid ASC', (error, results) => {
    // pool.query("SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.the_geom,3857))::json As geometry, id_vehicle, id_driver, origin, destiny, comments, date_registry, accuracy, address, speed FROM position AS lg WHERE id_vehicle=" + parseInt(request.params.id_vehicle) + " AND TO_DATE(TO_CHAR(date_registry, 'DDMMYYYY'),'DDMMYYYY') = to_date('" + date + "','DD-MM-YYYY')  order by date_registry ASC LIMIT 10) AS f ) As fc;",
    // pool.query("SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.the_geom,3857))::json As geometry, row_to_json(lp) AS properties  FROM position AS lg INNER JOIN (SELECT id_vehicle, id_driver, origin, destiny, comments, date_registry, accuracy, address, speed FROM position WHERE id_vehicle=" + id_vehicle + " AND TO_DATE(TO_CHAR(date_registry, 'DDMMYYYY'),'DDMMYYYY') = to_date('" + date + "','DD-MM-YYYY')) AS lp ON lg.id_vehicle = lp.id_vehicle) AS f) AS fc LIMIT 5;",
    pool.query("SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(the_geom,3857))::json As geometry, id_vehicle, id_driver, origin, destiny, comments, date_registry, accuracy, address, speed FROM position WHERE id_vehicle=" + id_vehicle + " AND TO_DATE(TO_CHAR(date_registry, 'DDMMYYYY'),'DDMMYYYY') = to_date('" + date + "','DD-MM-YYYY')) AS f) AS fc;",
        //pool.query("SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(lg.the_geom)::json As geometry, id_vehicle, id_driver, origin, destiny, \"comments\", date_registry As properties FROM \"position\" AS lg WHERE id_vehicle=" + parseInt(request.params.id_vehicle) + " order by date_registry ASC) AS f ) As fc;",
        (error, results) => {
            if (error) {
                throw error
            }

            var featureCollection = results.rows[0].row_to_json;
            var temp = featureCollection.features;
            featureCollection.features = {};
            var arrayTemp = [];
            for (var i = 0; i < temp.length; i++) {
                var feature = {};
                feature.type = temp[i].type;
                feature.geometry = temp[i].geometry;
                feature.properties = {};
                feature.properties.id_vehicle = temp[i].id_vehicle;
                feature.properties.id_driver = temp[i].id_driver;
                feature.properties.date_registry = temp[i].date_registry;
                feature.properties.accuracy = temp[i].accuracy;
                feature.properties.address = temp[i].address;
                feature.properties.speed = temp[i].speed;
                arrayTemp.push(feature);
            }

            featureCollection.features = arrayTemp;

            featureCollection.crs = {};
            featureCollection.crs.type = 'name';
            featureCollection.crs.properties = {};
            featureCollection.crs.properties.name = 'EPSG:3857';

            // response.status(200).json(featureCollection);
            response.status(200).json(featureCollection);


            // response.status(200).json(results.rows[0].row_to_json);
            //console.log(results.rows[0].row_to_json);
        })
}

// Obtiene los dos últimos puntos de un vehículo
const getTwoLastPositionByVehicle = (request, response) => {
    // pool.query('SELECT st_astext(the_geom) FROM position WHERE id_vehicle=' + parseInt(request.params.id_vehicle) + ' ORDER BY gid ASC', (error, results) => {
    //pool.query("SELECT row_to_json(f) FROM (SELECT " + parseInt(request.params.id_vehicle) + " as id_vehicle, ST_AsGeoJSON(ST_Multi(ST_Union(fc.the_geom)))::json AS geometry FROM (SELECT * from position WHERE id_vehicle=" + parseInt(request.params.id_vehicle) +" ORDER BY date_registry DESC LIMIT 2) AS fc)AS f;",
    pool.query("SELECT row_to_json(f) FROM (SELECT " + parseInt(request.params.id_vehicle) + " as id_vehicle, ST_AsGeoJSON(ST_Multi(ST_Union(ST_Transform(fc.the_geom,3857))))::json AS geometry FROM (SELECT * from position WHERE id_vehicle=" + parseInt(request.params.id_vehicle) + " ORDER BY date_registry DESC LIMIT 2) AS fc)AS f;",
        //pool.query("SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(lg.the_geom)::json As geometry, id_vehicle, id_driver, origin, destiny, \"comments\", date_registry As properties FROM \"position\" AS lg WHERE id_vehicle=" + parseInt(request.params.id_vehicle) + " order by date_registry ASC) AS f ) As fc;",
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows[0].row_to_json);
            //console.log(results.rows[0].row_to_json);
        })
}

// Obtiene los 'n' últimos puntos de la ruta de un vehículo
const getTailVehicle = (request, response) => {
    var id_vehicle = request.params.id_vehicle;
    var fecha_ultima_ruta = request.params.date;
    var n = 15;

    pool.query("SELECT row_to_json(f) FROM (SELECT " + parseInt(id_vehicle) + " as id_vehicle, ST_AsGeoJSON(ST_MakeLine(ST_Transform(the_geom,3857)))::json AS geometry FROM (SELECT * from position WHERE id_vehicle=" + parseInt(id_vehicle) + " AND to_char(date_registry,'DD-MM-YYYY') = '" + fecha_ultima_ruta + "' ORDER BY date_registry DESC LIMIT " + n + ") AS fc)AS f;",
        (error, results) => {
            if (error) {
                throw error
            }

            var feature = {};
            feature.type = 'Feature';
            feature.geometry = results.rows[0].row_to_json.geometry;
            feature.properties = {};
            feature.properties.id_vehicle = id_vehicle;
            feature.properties.fecha = fecha_ultima_ruta;

            response.status(200).json(feature);

            //response.status(200).json(results.rows[0].row_to_json);
            //console.log(results.rows[0].row_to_json);
        })
}


// Obtiene el punto con la posición actual del vehículo
const getCurrentPointByVehicle = (request, response) => {
    // pool.query('SELECT st_astext(the_geom) FROM position WHERE id_vehicle=' + parseInt(request.params.id_vehicle) + ' ORDER BY gid ASC', (error, results) => {
    pool.query("SELECT row_to_json(fc) FROM (SELECT array_to_json(array_agg(f)) As feature FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.the_geom,3857))::json As geometry, id_vehicle, id_driver, to_char(date_registry,'DD-MM-YYYY; HH24:MI:SS') AS date, accuracy, address, speed FROM position AS lg WHERE id_vehicle=" + parseInt(request.params.id_vehicle) + " order by date_registry DESC LIMIT 1) AS f) As fc;",
        //pool.query("SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(lg.the_geom)::json As geometry, id_vehicle, id_driver, origin, destiny, \"comments\", date_registry As properties FROM \"position\" AS lg WHERE id_vehicle=" + parseInt(request.params.id_vehicle) + " order by date_registry ASC) AS f ) As fc;",
        (error, results) => {
            if (error) {
                throw error
            }

            response.status(200).json(results.rows[0].row_to_json);
            //console.log(results.rows[0].row_to_json);
        })
}

// Obtiene las fechas de las rutas de cada vehículo a través de su id_vehicle
const getRoutesByVehicle = (request, response) => {
    pool.query("SELECT distinct TO_CHAR(fc.date_registry, 'DD-MM-YYYY') as date FROM (SELECT date_registry FROM position WHERE id_vehicle=" + parseInt(request.params.id_vehicle) + "  ORDER BY date_registry DESC) AS fc;",
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
            //console.log(results.rows[0].row_to_json);
        })
}

// Obtiene la ruta de un vehículo para una fecha dada
const getRouteOfVehicleByDate = (request, response) => {
    var id_vehicle = request.params.id_vehicle;
    var date = request.params.date;

    pool.query("SELECT ST_AsGeoJSON(ST_MakeLine(ST_Transform(fc.the_geom,3857)))::json FROM (SELECT the_geom FROM position WHERE id_vehicle=" + id_vehicle + " AND TO_DATE(TO_CHAR(date_registry, 'DDMMYYYY'),'DDMMYYYY') = to_date('" + date + "','DD-MM-YYYY') order by date_registry desc) AS fc;",
        (error, results) => {
            if (error) {
                throw error
            }
            /*
            var feature = {};
            feature.type = 'Feature';
            feature.geometry = results.rows[0].st_asgeojson;

             */

            response.status(200).json(results.rows[0].st_asgeojson);
            //response.status(200).json(feature);

        })
}

const createDriver = (request, response) => {
    const {email, password, name, surname, birthdate, genre, mobile_number} = request.body

    console.log(birthdate)
    console.log()

    regex = /\d{2}\/\d{2}\/\d{4}/;

    if (regex.test(birthdate)) {
        // formato de fecha para cuando recibe una petición GET de la APP geoloc
        console.log('formato de fecha: DD/MM/YYYY');
        pool.query('INSERT INTO drivers ( email, password, name, surname, birthdate, genre, mobile_number, available) ' +
            'VALUES ($1, $2, $3, $4, TO_DATE($5, \'DD/MM/YYYY\'), $6, $7, true)',
            [email, password, name, surname, birthdate, genre, mobile_number], (error, results) => {
                if (error) {
                    throw error
                }
                //response.status(201).send(`Driver added with ID: ${results.rows[0]}`);
                //console.log(results.rows[0]);
                console.log(results.rows[0]);
                response.redirect("/map");
            })
    } else {
        // formato de fecha para cuando recibe una petición GET del cliente web
        console.log('formato de fecha: YYYY-MM-DD');
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
    }


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

const getDrivers = (req, res) => {
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

    pool.query('INSERT INTO vehicles (type, matricula, brand, model, passengers, fuel, available) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [type, matricula, brand, model, passengers, fuel, available], (error, results) => {
            if (error) {
                throw error
            }
            //response.status(201).send(`Vehicle added with ID: ${results.rows[0]}`);
            console.log(results.rows[0]);
            response.redirect("/map");
        })
}

const createObject = (request, response) => {
    const {type, matricula, brand, model} = request.body;

    console.log(request.body);
    console.log(typeof (load_capacity));

    pool.query('INSERT INTO vehicles (type, matricula, brand, model) VALUES ($1, $2, $3, $4)',
        [type, matricula, brand, model], (error, results) => {
            if (error) {
                throw error
            }
            //response.status(201).send(`Vehicle added with ID: ${results.rows[0]}`);
            console.log(results.rows[0]);
            response.redirect("/map");
        })
}

const editVehicle = (request, response) => {
    const {type, brand, model, passengers, fuel, available, id} = request.body;

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
        //console.log(results.rows[0]);
    });
}


const getDriverByIdVehicle = (request, response) => {
    pool.query('SELECT a.id_vehicle, b.id_driver, b.name, b.surname, a.date_registry FROM vehicle_driver a, drivers b WHERE a.id_driver=b.id_driver AND a.id_vehicle=' + request.params.id_vehicle, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        //console.log(results.rows[0]);
    })
}


const getVehicleByIdDriver = (request, response) => {
    pool.query('SELECT a.id_driver, b.id_vehicle, b.matricula, b.type, b.brand, b.model, b.passengers, b.fuel, b.available, a.date_registry FROM vehicle_driver a, vehicles b WHERE a.id_vehicle=b.id_vehicle AND a.id_driver=' + request.params.id_driver, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
        //console.log(results.rows);
    })
}


const vehicleDriver = (request, response) => {
    const {id_vehicle, id_driver} = request.body;

    //console.log(request.body);

    pool.query('INSERT INTO vehicle_driver (id_vehicle, id_driver, date_registry) ' +
        'VALUES ($1, $2, localtimestamp)',
        [id_vehicle, id_driver], (error, results) => {
            if (error) {
                throw error
            }
            //response.status(201).send(`Vehicle added with ID: ${results.rows[0]}`);
            console.log(results.rows[0]);

            var status = new Object();
            status.code = 'ok';
            status.id_driver = id_driver;
            status.id_vehicle = id_vehicle;
            //var myString = JSON.stringify(login_code);

            //response.send({ msg: 'Establecida relación conductor (' + id_driver + ') - vehículo(' + id_vehicle + ')  de manera satisfactoria.'});
            //response.status(200).json(status);
            //response.status(200);
            response.redirect("/map");
        })
}

const deleteVehicleDriver = (request, response) => {
    const {id_driver} = request.body;

    //console.log(request.body);

    pool.query('DELETE FROM vehicle_driver WHERE id_driver=$1;',
        [id_driver], (error, results) => {
            if (error) {
                throw error
            }
            //response.status(201).send(`Vehicle added with ID: ${results.rows[0]}`);
            console.log(results.rows[0]);

            // var status = new Object();
            // status.code = 'ok';
            // status.id_driver = id_driver;
            // status.id_vehicle = id_vehicle;
            //var myString = JSON.stringify(login_code);

            response.send({msg: 'Eliminación de las relaciones conductor(' + id_driver + ') con cualquier vehiculo de manera satisfactoria.'});
            //response.status(200).json(status);
            //response.redirect("/map");
        })
}

const availabilityDriver = (request, response) => {
    const {id_driver, availability} = request.body;
    //console.log(id_driver + ', ' + availability);

    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
    })

    pool.connect((err, client, done) => {
        if (err) throw err;
        client.query('UPDATE drivers SET available=$2 WHERE id_driver=$1;',
            [id_driver, availability], (error, results) => {
                if (error) {
                    throw error
                }

                console.log(results.rows[0]);
                response.send({msg: 'Modificación del atributo \'available\' del conductor id_driver:' + id_driver + ' a \'' + availability + '\' de manera satisfactoria.'});
                //response.redirect("/map");
                done();
            });
    })
}

const availabilityVehicle = (request, response) => {
    const {id_vehicle, availability} = request.body;
    //console.log(id_vehicle + ', ' + availability);

    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
    })

    pool.connect((err, client, done) => {
        if (err) throw err;
        client.query('UPDATE vehicles SET available=$2 WHERE id_vehicle=$1;',
            [id_vehicle, availability], (error, results) => {
                if (error) {
                    throw error
                }

                console.log(results.rows[0]);
                response.send({msg: 'Modificación del atributo \'available\' del vehiculo id_vehicle:' + id_vehicle + ' a \'' + availability + '\' de manera satisfactoria.'});
            });
        done();
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

const loginDriver = (request, response) => {
    //Method that test if a user is registered in the system
    // return
    // code=0 if user incorrect or not exist
    // code=1 if user and password are correct
    // code=2 if user is correct and password is incorrect
    var email = request.params.email;
    var password = request.params.password;
    //const {email, password} = request.body;

    //console.log(request);
    // console.log("parámetro recibido email: " + email);
    // console.log("parámetro recibido password: " + password);

    // console.log("request.body: ")
    // console.log(request.body);

    pool.query('select drivers.id_driver, drivers.email, drivers.password from drivers;', (error, results) => {
        if (error) {
            throw error
        }
        var respuesta = results.rows;
        console.log("respuesta: " + respuesta);
        console.log(typeof (respuesta));

        // Test user and password
        //loop
        var code = 0;
        var id_driver = 999;
        for (var i = 0; i < respuesta.length; i++) {
            if (respuesta[i].email == email && respuesta[i].password == password) {
                code = 1;
                id_driver = respuesta[i].id_driver;
            } else if (respuesta[i].email == email && respuesta[i].password != password) {
                code = 2;
            }
        }

        var login_code = new Object();
        login_code.code = code;
        login_code.id_driver = id_driver;
        //var myString = JSON.stringify(login_code);

        response.status(200).json(login_code);
        //console.log(results.rows[0]);
    });
}


const login = (request, response) => {
    //Method that test if a user is registered in the system
    // return
    // code=0 if user is incorrect or not exist
    // code=1 if user and password are correct
    // code=2 if user is correct and password is incorrect
    const {email, password} = request.body
    //const {email, password} = request.body;

    //console.log(request);
    console.log("parámetro recibido email: " + email);
    console.log("parámetro recibido password: " + password);

    console.log("request.body: ")
    console.log(request.body);

    pool.query('select drivers.id_driver, drivers.email, drivers.password from drivers;', (error, results) => {
        if (error) {
            throw error
        }
        var respuesta = results.rows;
        console.log(typeof (respuesta));

        // Test user and password
        //loop
        var code = 0;
        var id_driver = 999;
        for (var i = 0; i < respuesta.length; i++) {
            if (respuesta[i].email == email && respuesta[i].password == password) {
                code = 1;
                id_driver = respuesta[i].id_driver;
            } else if (respuesta[i].email == email && respuesta[i].password != password) {
                code = 2;
            }
        }

        var login_code = new Object();
        login_code.code = code;
        login_code.id_driver = id_driver;
        //var myString = JSON.stringify(login_code);

        // response.status(200).json(login_code);
        console.log('login_code' + login_code);
        if (login_code.code == 1) {
            // response.redirect("/map");
            response.render('map', {
                title: 'Geolocalización de objetos móviles',
                lat: 40.034,
                lng: -4.02
                // vehicles: respuesta
            });
        } else{
            response.redirect("/login");
        }
        // response.status(200).json(login_code);
        //console.log(results.rows[0]);
    });
}

const register = (request, response) => {
    const {email, password, name, surname, birthdate, genre, mobile_number} = request.body

    console.log(birthdate)
    console.log()

    regex = /\d{2}\/\d{2}\/\d{4}/;

    if (regex.test(birthdate)) {
        // formato de fecha para cuando recibe una petición GET de la APP geoloc
        console.log('formato de fecha: DD/MM/YYYY');
        pool.query('INSERT INTO drivers ( email, password, name, surname, birthdate, genre, mobile_number, available) ' +
            'VALUES ($1, $2, $3, $4, TO_DATE($5, \'DD/MM/YYYY\'), $6, $7, true)',
            [email, password, name, surname, birthdate, genre, mobile_number], (error, results) => {
                if (error) {
                    throw error
                }
                //response.status(201).send(`Driver added with ID: ${results.rows[0]}`);
                //console.log(results.rows[0]);
                console.log(results.rows[0]);
                response.redirect("/login");
            })
    } else {
        // formato de fecha para cuando recibe una petición GET del cliente web
        console.log('formato de fecha: YYYY-MM-DD');
        pool.query('INSERT INTO drivers ( email, password, name, surname, birthdate, genre, mobile_number, available) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, true)',
            [email, password, name, surname, birthdate, genre, mobile_number], (error, results) => {
                if (error) {
                    throw error
                }
                //response.status(201).send(`Driver added with ID: ${results.rows[0]}`);
                //console.log(results.rows[0]);
                console.log(results.rows[0]);
                response.redirect("/login");
            })
    }


}

const dateRegistryToShow = (req, response) => {
    if (req.params.fecha_ini) {
        fecha_ini = req.params.fecha_ini;
        fecha_fin = req.params.fecha_fin;
        console.log("se ha cambiado la fecha de registro a mostrar desde el día: " + fecha_ini + ' al día ' + fecha_fin);
        response.status(200).send({msg: 'Se van a mostrar los vehículos con fecha desde: ' + fecha_ini + ' hasta el día: ' + fecha_fin});
    }
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
    getPositionByObject,
    getTwoLastPositionByVehicle,
    getTailVehicle,
    getCurrentPointByVehicle,
    getRoutesByVehicle,
    getRouteOfVehicleByDate,
    getDriverByIdVehicle,
    getVehicleByIdDriver,
    vehicleDriver,
    deleteVehicleById,
    deleteVehicleDriverByIdVehicle,
    deleteVehicleDriverByIdDriver,
    loginDriver,
    deleteVehicleDriver,
    availabilityDriver,
    availabilityVehicle,
    dateRegistryToShow,
    createObject,
    getTest,
    login,
    register
}