//Fechas por defecto
var ahora = new Date();
var fecha_ini = '20190901'; // fecha inicio 1 de septiembre de 2019
var fecha_fin = '' + ahora.getFullYear() + (ahora.getMonth() + 1) + ahora.getDate(); // fecha hasta hoy

const { pool } = require("../../dbConfig");

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

    const { id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments, accuracy, address, speed } = request.body;
    console.log(request.body);


    pool.query('INSERT INTO position (id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments, accuracy, address, speed, date_registry, the_geom) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, round($8::numeric, 2), $9, round($10::numeric, 2), localtimestamp, ' +
        'st_geometryfromtext(\'POINT(' + coord_x + ' ' + coord_y + ')\',4326))', [id_vehicle, id_driver, coord_x, coord_y, origin, destiny, comments, accuracy, address, speed], (error, results) => {
            if (error) {
                throw error
            }

            var login_code = new Object();
            login_code.code = 1;
            response.status(200).json(login_code);

            console.log(results.rows[0]);
        })
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

            response.status(200).json(featureCollection);
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
            response.status(200).json(results.rows[0].st_asgeojson);
        })
}

const createDriver = (request, response) => {
    const { email, password, name, surname, birthdate, genre, mobile_number } = request.body

    console.log(birthdate)
    console.log()

    regex = /\d{2}\/\d{2}\/\d{4}/;

    if (regex.test(birthdate)) {
        // formato de fecha para cuando recibe una petición GET de la APP geoloc
        console.log('formato de fecha: DD/MM/YYYY');
        pool.query('INSERT INTO drivers ( email, password, name, surname, birthdate, genre, mobile_number, available) ' +
            'VALUES ($1, $2, $3, $4, TO_DATE($5, \'DD/MM/YYYY\'), $6, $7, true)', [email, password, name, surname, birthdate, genre, mobile_number], (error, results) => {
                if (error) {
                    throw error
                }
                console.log(results.rows[0]);
                response.redirect("/map");
            })
    } else {
        // formato de fecha para cuando recibe una petición GET del cliente web
        console.log('formato de fecha: YYYY-MM-DD');
        pool.query('INSERT INTO drivers ( email, password, name, surname, birthdate, genre, mobile_number, available) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, true)', [email, password, name, surname, birthdate, genre, mobile_number], (error, results) => {
                if (error) {
                    throw error
                }
                console.log(results.rows[0]);
                response.redirect("/map");
            })
    }


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
                var respuesta = response.rows;

                res.status(200).json(respuesta);
            }
        });
        done();
    })
}


const getTest = function() {
    var usuario = { nombre: "Antonio", username: "Tony" }
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
    })
}

const createVehicle = (request, response) => {
    const {
        type,
        brand,
        model,
        passengers,
        fuel,
        available
    } = request.body;

    console.log(request.body);
    console.log(typeof(load_capacity));

    pool.query('INSERT INTO vehicles (type, matricula, brand, model, passengers, fuel, available) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7)', [type, matricula, brand, model, passengers, fuel, available], (error, results) => {
            if (error) {
                throw error
            }
            console.log(results.rows[0]);
            response.redirect("/map");
        })
}

// Crea un objeto nuevo para el entorno del cliente web
const createObject = (request, response) => {
    const { type, matricula, brand, model } = request.body;

    console.log(request.body);
    console.log(typeof(load_capacity));

    pool.query('INSERT INTO vehicles (type, matricula, brand, model, available) VALUES ($1, $2, $3, $4, true)', [type, matricula, brand, model], (error, results) => {
        if (error) {
            throw error
            registry_code.code = 2;
            registry_code.mensaje = 'Error en la consulta.';

            res.status(200).json(registry_code);
        }
        console.log(results.rows[0]);
        response.redirect("/map");
    })
}

// Crea un objeto nuevo para el entorno de la APP geoloc
const createNewObject = (request, response) => {
    const { type, matricula, brand, model } = request.body;

    console.log(request.body);
    console.log(typeof(load_capacity));

    if (!type || !matricula) {
        errors.push({ message: "Por favor, rellena todos los campos obligatorios." });
    }

    pool.query('INSERT INTO vehicles (type, matricula, brand, model, available) VALUES ($1, $2, $3, $4, true)', [type, matricula, brand, model], (error, results) => {
        if (error) {
            throw error;
            var registry_code = new Object();
            registry_code.code = 2;
            registry_code.mensaje = 'Ha ocurrido un problema';

            response.status(200).json(registry_code);
        }
        console.log(results.rows);
        var registry_code = new Object();
        registry_code.code = 1;
        registry_code.mensaje = 'Objeto registrado correctamente';

        response.status(200).json(registry_code);
    })
}

const editVehicle = (request, response) => {
    const { type, matricula, brand, model, id } = request.body;

    pool.query('UPDATE vehicles SET type=$1, matricula=$2, brand=$3, model=$4 WHERE id_vehicle=$5;', [type, matricula, brand, model, id], (error, results) => {
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
        client.query('SELECT id_vehicle, matricula, type, brand, model, available FROM vehicles ORDER BY id_vehicle ASC', (err, response) => {
            if (err) {
                console.log(err.stack)
            } else {
                var respuesta = response.rows;

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
    });
}


const getDriverByIdVehicle = (request, response) => {
    pool.query('SELECT a.id_vehicle, b.id_driver, b.name, b.surname, a.date_registry FROM vehicle_driver a, drivers b WHERE a.id_driver=b.id_driver AND a.id_vehicle=' + request.params.id_vehicle + ' ORDER BY date_registry DESC  LIMIT 1', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}


const getVehicleByIdDriver = (request, response) => {
    pool.query('SELECT a.id_driver, b.id_vehicle, b.matricula, b.type, b.brand, b.model, b.passengers, b.fuel, b.available, a.date_registry FROM vehicle_driver a, vehicles b WHERE a.id_vehicle=b.id_vehicle AND a.id_driver=' + request.params.id_driver, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

// Petición POST dada una URL
function httpPost(theUrl, id, available) {
    var xmlHttp = new XMLHttpRequest();

    var formData = new FormData();

    formData.append("id", id);
    formData.append("availability", available);

    xmlHttp.open("POST", theUrl, false); // false for synchronous request
    xmlHttp.send(formData);
    return xmlHttp.responseText;
}

const vehicleDriver = (request, response) => {
    const { id_vehicle, id_driver } = request.body;

    // Validation passed
    pool.query(
        // `SELECT * FROM vehicle_driver WHERE id_vehicle = $1 AND id_driver = $2`, [id_vehicle, id_driver],
        'SELECT * FROM vehicle_driver WHERE id_vehicle = $1', [id_vehicle],
        (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log(results.rows);
            console.log("Las relaciones del Objeto: " + id_vehicle + ", con cualquier portador se eliminan previamente");

            if (results.rows.length > 0) { //Relación ya existente en el sistema
                var status = new Object();
                status.code = 1;
                status.id_driver = id_driver;
                status.id_vehicle = id_vehicle;

                // Hace bucle recorriendo todos los resultados y los elimina
                for (var i = 0; i < results.rows.length; i++) {
                    console.log('Eliminando relación i: ' + i);
                    pool.query('DELETE FROM vehicle_driver WHERE id_vehicle=' + id_vehicle, (error, results) => {
                        if (error) {
                            throw error
                        }
                    });

                    // Establece disponibilidad del Portador a true
                    pool.query(
                        'UPDATE drivers SET available=$2 WHERE id_driver=$1;', [results.rows[i]['id_driver'], true],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log('Cambiada la disponibilidad del id_driver: ' + id_driver + ' de manera correcta.');
                        }
                    );

                    // Establece disponibilidad del Objeto a true
                    pool.query(
                        'UPDATE vehicles SET available=$2 WHERE id_vehicle=$1;', [id_vehicle, true],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log('Cambiada la disponibilidad del id_vehicle: ' + id_vehicle + ' de manera correcta.');
                        }
                    );
                }
                pool.query( // Relación establecida correctamente
                    'INSERT INTO vehicle_driver (id_vehicle, id_driver, date_registry) ' +
                    'VALUES ($1, $2, localtimestamp)', [id_vehicle, id_driver],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }

                        // Establece disponibilidad del Portador a false
                        pool.query(
                            'UPDATE drivers SET available=$2 WHERE id_driver=$1;', [id_driver, false],
                            (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                console.log('Cambiada la disponibilidad del id_driver: ' + id_driver + ' de manera correcta.');
                            }
                        );

                        // Establece disponibilidad del Objeto a false
                        pool.query(
                            'UPDATE vehicles SET available=$2 WHERE id_vehicle=$1;', [id_vehicle, false],
                            (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                console.log('Cambiada la disponibilidad del id_vehicle: ' + id_vehicle + ' de manera correcta.');
                            }
                        );

                        console.log(results.rows[0]);
                        request.flash("success_msg", "Relación registrada correctamente.");
                        var status = new Object();
                        status.code = 1;
                        status.id_driver = id_driver;
                        status.id_vehicle = id_vehicle;
                        // response.status(200).json(status);
                        response.redirect("/map");
                    }
                );
            } else {
                pool.query( // Relación establecida correctamente
                    'INSERT INTO vehicle_driver (id_vehicle, id_driver, date_registry) ' +
                    'VALUES ($1, $2, localtimestamp)', [id_vehicle, id_driver],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }

                        // Establece disponibilidad del Portador a false
                        pool.query(
                            'UPDATE drivers SET available=$2 WHERE id_driver=$1;', [id_driver, false],
                            (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                console.log('Cambiada la disponibilidad del id_driver: ' + id_driver + ' de manera correcta.');
                            }
                        );


                        // Establece disponibilidad del Objeto a false
                        pool.query(
                            'UPDATE vehicles SET available=$2 WHERE id_vehicle=$1;', [id_vehicle, false],
                            (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                console.log('Cambiada la disponibilidad del id_vehicle: ' + id_vehicle + ' de manera correcta.');
                            }
                        );

                        console.log(results.rows[0]);
                        request.flash("success_msg", "Relación registrada correctamente.");
                        var status = new Object();
                        status.code = 1;
                        status.id_driver = id_driver;
                        status.id_vehicle = id_vehicle;
                        // response.status(200).json(status);
                        response.redirect("/map");
                    }
                );
            }
        }
    );
}



const vehicleDriverApp = (request, response) => {
    const { id_vehicle, id_driver } = request.body;

    console.log(request.body);
    pool.query(
        `SELECT * FROM vehicle_driver WHERE id_vehicle = $1 AND id_driver = $2`, [id_vehicle, id_driver],
        (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log(results.rows);

            if (results.rows.length > 0) { //Relación ya existente en el sistema
                var status = new Object();
                status.response = "Relación ya existente en el sistema";

                response.status(200).json(status);

            } else {
                pool.query('INSERT INTO vehicle_driver (id_vehicle, id_driver, date_registry) ' +
                    'VALUES ($1, $2, localtimestamp)', [id_vehicle, id_driver], (error, results) => {
                        if (error) {
                            throw error
                        }
                        console.log(results.rows[0]);

                        var status = new Object();

                        status.response = "Relación [" + id_vehicle + "-" + id_driver + "] generada correctamente";

                        response.status(200).json(status);
                    }
                )
            }
        }
    );

}
const deleteVehicleDriver = (request, response) => {
    const { id_driver } = request.body;

    pool.query('DELETE FROM vehicle_driver WHERE id_driver=$1;', [id_driver], (error, results) => {
        if (error) {
            throw error
        }
        console.log(results.rows[0]);

        console.log('Eliminación de las relaciones conductor(' + id_driver + ') con cualquier vehiculo de manera satisfactoria.');

        console.log(results.rows[0]);
        var message = new Object();
        message.response = 'Eliminación de la relación del conductor(' + id_driver + ') con el objeto satisfactoria.';

        response.status(200).json(message);
    })
}

const deleteVehicleDriverById = (request, response) => {
    pool.query(
        'SELECT * FROM vehicle_driver WHERE id_driver=' + (request.params.id_driver).toString(),
        (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log(results.rows);

            if (results.rows.length > 0) { //Relación ya existente en el sistema
                var id_driver = results.rows[0]['id_driver'];
                var id_vehicle = results.rows[0]['id_vehicle'];

                pool.query('DELETE FROM vehicle_driver WHERE id_driver=' + id_driver, (error, results) => {
                    if (error) {
                        throw error
                    }

                    // Establece disponibilidad del Portador a false
                    pool.query(
                        'UPDATE drivers SET available=$2 WHERE id_driver=$1;', [id_driver, true],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log('Cambiada la disponibilidad del id_driver: ' + id_driver + ' de manera correcta.');
                        }
                    );

                    // Establece disponibilidad del Objeto a false
                    pool.query(
                        'UPDATE vehicles SET available=$2 WHERE id_vehicle=$1;', [id_vehicle, true],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log('Cambiada la disponibilidad del id_vehicle: ' + id_vehicle + ' de manera correcta.');
                        }
                    );

                    response.status(200).json(results.rows);
                })

            } else {


                var status = new Object();
                status.code = 1;
                status.id_driver = results.rows['id_driver'];
                status.id_vehicle = results.rows['id_vehicle'];
            }
        }
    );
}

const availabilityDriver = (request, response) => {
    const { id, availability } = request.body;

    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
    })

    pool.connect((err, client, done) => {
        if (err) throw err;
        client.query('UPDATE drivers SET available=$2 WHERE id_driver=$1;', [id, availability], (error, results) => {
            if (error) {
                throw error
            }

            console.log(results.rows[0]);

            console.log(results.rows[0]);
            var message = new Object();
            message.response = 'Modificación del atributo \'available\' del conductor id_driver:' + id + ' a \'' + availability + '\' de manera satisfactoria.';

            response.status(200).json(message);

            done();
        });
    })
}

const availabilityVehicle = (request, response) => {
    const { id, availability } = request.body;

    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
    })

    pool.connect((err, client, done) => {
        if (err) throw err;
        client.query('UPDATE vehicles SET available=$2 WHERE id_vehicle=$1;', [id, availability], (error, results) => {
            if (error) {
                throw error
            }

            console.log(results.rows[0]);
            var message = new Object();
            message.response = "Modificación del atributo \'available\' del vehiculo id_vehicle:' + id + ' a \'' + availability + '\' de manera satisfactoria.";

            response.status(200).json(message);
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
    });
}

const deleteVehicleDriverByIdDriver = (request, response) => {
    // delete relation in 'vehicle_driver' relation
    pool.query('DELETE FROM vehicle_driver WHERE id_driver =' + (request.params.id_driver).toString() + ';', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    });
}

const dateRegistryToShow = (req, response) => {
    if (req.params.fecha_ini) {
        fecha_ini = req.params.fecha_ini;
        fecha_fin = req.params.fecha_fin;
        console.log("se ha cambiado la fecha de registro a mostrar desde el día: " + fecha_ini + ' al día ' + fecha_fin);
        response.status(200).send({ msg: 'Se van a mostrar los vehículos con fecha desde: ' + fecha_ini + ' hasta el día: ' + fecha_fin });
    }
}


module.exports = {
    insertPosition,
    createDriver,
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
    vehicleDriverApp,
    deleteVehicleById,
    deleteVehicleDriverByIdVehicle,
    deleteVehicleDriverByIdDriver,
    deleteVehicleDriver,
    deleteVehicleDriverById,
    availabilityDriver,
    availabilityVehicle,
    dateRegistryToShow,
    createObject,
    createNewObject,
    getTest
}