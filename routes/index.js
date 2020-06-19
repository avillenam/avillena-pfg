const express = require("express");
const { pool } = require("../dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require('path');
const db = require('../public/javascripts/queries');

// require("dotenv").config();
const app = express();


const initializePassport = require("../passportConfig");

initializePassport(passport);


app.use(
    session({
        // Key we want to keep secret which will encrypt all of our information
        secret: 'geoloc',
        // secret: process.env.SESSION_SECRET,
        // Should we resave our session variables if nothing has changes which we dont
        resave: false,
        // Save empty value if there is no vaue which we do not want to do
        saveUninitialized: false
    })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/register", checkAuthenticated, (req, res) => {
    res.render("register");
});

app.get("/login", checkAuthenticated, (req, res) => {
    // flash sets a messages variable. passport sets the error message
    console.log(req.session.flash.error);
    res.render("login");
});

app.get("/map", checkNotAuthenticated, (req, res) => {
    console.log(req.isAuthenticated());
    res.render("map", {
        user: req.user.name,
        message: ""
    });
});

app.get("/logout", (req, res) => {
    req.logout();
    res.render("login", { message: "Has finalizado la sesión correctamente." });
});

/*
app.post("/register", async(req, res) => {
    let { email, password, name, surname, birthdate, genre, mobile_number } = req.body;

    let errors = [];

    console.log({
        name,
        email,
        password
    });

    if (!name || !email || !password) {
        errors.push({ message: "Por favor, rellena todos los campos obligatorios." });
    }

    if (password.length < 3) {
        errors.push({ message: "La contraseña ha de tener, al menos, 4 caracteres." });
    }

    if (errors.length > 0) {
        res.render("register", { errors, name, email, password });
    } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        // Validation passed
        pool.query(
            `SELECT * FROM drivers
                WHERE email = $1`, [email],
            (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results.rows);

                if (results.rows.length > 0) {
                    return res.render("register", {
                        message: "Email ya registrado en el sistema."
                    });
                } else {
                    pool.query(
                        `INSERT INTO drivers (email, password, name, surname, birthdate, genre, mobile_number, available)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                            RETURNING id_driver, password`, [email, hashedPassword, name, surname, birthdate, genre, mobile_number],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Usuario registrado correctamente. Por favor autentícate.");
                            res.redirect("/login");
                        }
                    );
                }
            }
        );
    }
});
*/
app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/map",
        failureRedirect: "/login",
        failureFlash: true
    })
);

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/map");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

//*******************************************************************************
// Interacción con la base de datos a través de peticiones GET, POST, PUT, DELETE
//*******************************************************************************
//Crea un portador
// app.post('/driver', db.createDriver);
app.post("/register", async(req, res) => {
    let { email, password, name, surname, birthdate, genre, mobile_number } = req.body;

    let errors = [];

    console.log({
        name,
        email,
        password
    });

    if (!name || !email || !password) {
        errors.push({ message: "Por favor, rellena todos los campos obligatorios." });
    }

    if (password.length < 3) {
        errors.push({ message: "La contraseña ha de tener, al menos, 4 caracteres." });
    }

    if (errors.length > 0) {
        res.render("register", { errors, name, email, password });
    } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        regex = /\d{2}\/\d{2}\/\d{4}/;

        if (regex.test(birthdate)) { // para la APP geoloc
            // code=0 Si el usuario ya existe en el sistema
            // code=1 Usuario registrado correctamente
            // code=2 Error de formato
            pool.query(
                `SELECT * FROM drivers
                WHERE email = $1`, [email],
                (err, results) => {
                    if (err) {
                        console.log(err);
                        registry_code.code = 2;
                        registry_code.mensaje = 'Error de formato.';

                        res.status(200).json(registry_code);
                    }
                    console.log(results.rows);

                    if (results.rows.length > 0) {
                        var registry_code = new Object();
                        registry_code.code = 0;
                        registry_code.mensaje = 'Email ya registrado en el sistema.';

                        res.status(200).json(registry_code);

                    } else {
                        pool.query(
                            `INSERT INTO drivers (email, password, name, surname, birthdate, genre, mobile_number, available)
                            VALUES ($1, $2, $3, $4, TO_DATE($5, \'DD/MM/YYYY\'), $6, $7, true)
                            RETURNING id_driver, password`, [email, hashedPassword, name, surname, birthdate, genre, mobile_number],
                            (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                console.log(results.rows);
                                var registry_code = new Object();
                                registry_code.code = 1;
                                registry_code.mensaje = 'Usuario registrado correctamente';

                                res.status(200).json(registry_code);
                            }
                        );
                    }
                }
            );
        } else { // para el cliente web
            // Validation passed
            pool.query(
                `SELECT * FROM drivers
                WHERE email = $1`, [email],
                (err, results) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(results.rows);

                    if (results.rows.length > 0) {
                        return res.render("register", {
                            message: "Email ya registrado en el sistema."
                        });
                    } else {
                        pool.query(
                            `INSERT INTO drivers (email, password, name, surname, birthdate, genre, mobile_number, available)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                            RETURNING id_driver, password`, [email, hashedPassword, name, surname, birthdate, genre, mobile_number],
                            (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                console.log(results.rows);
                                req.flash("success_msg", "Usuario registrado correctamente. Por favor autentícate.");
                                res.redirect("/login");
                            }
                        );
                    }
                }
            );
        }
    }
});

//Crea un objeto
app.post('/createObject', db.createObject);

//Crea un objeto para la app geoloc
app.post('/createNewObject', db.createNewObject);


//Edita portador
// app.post('/editDriver', db.editDriver);
app.post('/editDriver', async(req, res) => {
    const { email, password, name, surname, birthdate, genre, mobile_number, id } = req.body;
    console.log(email + ', ' + name + ', ' + surname + ', ' + birthdate + ', ' + genre + ', ' + mobile_number + ', ' + email + ', ' + parseInt(id))

    hashedPassword = await bcrypt.hash(password, 10);
    console.log('hashedPassword: ' + hashedPassword);

    pool.query('UPDATE drivers SET email=$1, password=$2, name=$3, surname=$4, birthdate=TO_DATE($5, \'YYYY-MM-DD\'), genre=$6, mobile_number=$7 WHERE id_driver=$8;', [email, hashedPassword, name, surname, birthdate, genre, mobile_number, id], (error, results) => {
        if (error) {
            throw error
        }

        var registry_code = new Object();
        registry_code.code = 1;
        registry_code.mensaje = 'Usuario editado correctamente';

        //res.status(200).json(registry_code);

        res.redirect("/map");
    })
});

//Crea un vehículo
app.post('/vehicle', db.createVehicle);

//Edita objeto
app.post('/editVehicle', db.editVehicle);

//Inserta una posición
app.post('/position', db.insertPosition);

//Obtiene todos los objetos
app.get('/getVehicles', db.getVehicles);

//Obtiene objeto por su id
app.get('/vehicle/:id_vehicle', db.getVehicleById);

//Elimina objeto por su id
app.delete('/deleteVehicle/:id_vehicle', db.deleteVehicleById);

//Obtiene portador por su id
app.get('/driverByIdVehicle/:id_vehicle', db.getDriverByIdVehicle);

//Obtiene todos los conductores
app.get('/getDrivers', db.getDrivers);

//Obtiene portador por su id
app.get('/driver/:id_driver', db.getDriverById);

//Elimina portador por su id
app.delete('/deleteDriver/:id_driver', db.deleteDriverById);

//Obtiene objeto a través de su id
app.get('/vehicleByIdDriver/:id_driver', db.getVehicleByIdDriver);

//Obtiene la posición de un portador por su id
app.get('/position-driver/:id_driver', db.getPositionByDriver);

//Selecciona la posición de un objeto a partir de su id y la fecha
app.get('/getPositionByObject/:id_vehicle/:date', db.getPositionByObject);

//Obtiene los dos últimos puntos de un objeto para un id dado
app.get('/getTwoLastPositionByVehicle/:id_vehicle', db.getTwoLastPositionByVehicle);

//Obtiene los 'n' últimos puntos de un objeto dados su id y la fecha
app.get('/getTailVehicle/:id_vehicle/:date', db.getTailVehicle); //Formato: DD-MM-YYYY

//Obtiene el último punto de un objeto, con sus atributos, dado su id
app.get('/getCurrentPointByVehicle/:id_vehicle', db.getCurrentPointByVehicle);

//Obtiene las fechas de las rutas de cada objeto a través de su id
app.get('/getRoutesByVehicle/:id_vehicle', db.getRoutesByVehicle);

//Obtiene la ruta de un objeto dados su id y la fecha
app.get('/getRouteOfVehicleByDate/:id_vehicle/:date', db.getRouteOfVehicleByDate);

//Establece la relación objeto-portador
app.post('/vehicleDriver', db.vehicleDriver);

//Establece la relación objeto-portador para la APP
app.post('/vehicleDriverApp', db.vehicleDriverApp);

//Elimina la relacion objeto-portador
app.post('/deleteVehicleDriver', db.deleteVehicleDriver);

//Establece la disponibilidad para el portador
app.post('/driverAvailability', db.availabilityDriver);

//Establece la disponibilidad para el objeto
app.post('/vehicleAvailability', db.availabilityVehicle);

//Establece la fecha de registro que se quiere mostrar
app.get('/time/:fecha_ini/:fecha_fin', db.dateRegistryToShow);

//Realiza la comprobación de usuario registrado
// app.get('/loginDriver/:email/:password', db.loginDriver);

app.post("/loginDriver", async(req, res) => {
    let { email, password } = req.body;

    let errors = [];

    console.log({
        email,
        password
    });

    if (!email || !password) {
        errors.push({ message: "Por favor, rellena todos los campos obligatorios." });
    }

    if (errors.length > 0) {
        // res.render("register", { errors, email, password });
    } else {
        // Validation passed
        pool.query(
            `SELECT * FROM drivers WHERE email = $1`, [email],
            (err, results) => {
                if (err) {
                    throw err;
                }
                console.log(results.rows);
                // code=0 Si el usuario es incorrecto o no existe
                // code=1 Si el usuario y la contraseña son correctos
                // code=2 Si el usuario es correcto y la contraseña incorrecta
                var code = 0;
                var id_driver = 999;

                if (results.rows.length > 0) {
                    const user = results.rows[0];
                    console.log('user: ' + user.id_driver + ', ' + user.name);

                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log('isMatch: ' + isMatch);
                        if (isMatch) {
                            // Si el usuario y la contraseña son correctos
                            console.log('Usuario y contraseña introducidos correctamente');
                            code = 1;
                            id_driver = user.id_driver;
                            var login_code = new Object();
                            console.log('code: ' + code);
                            login_code.code = code;
                            login_code.id_driver = id_driver;

                            res.status(200).json(login_code);
                        } else {
                            // Si el usuario es correcto y la contraseña incorrecta
                            console.log('El password es incorrecto');
                            code = 2;
                            var login_code = new Object();
                            console.log('code: ' + code);
                            login_code.code = code;
                            login_code.id_driver = id_driver;

                            res.status(200).json(login_code);
                        }
                    });

                } else {
                    // Si el usuario es incorrecto o no existe
                    console.log('El usuario no existe o es incorrecto');
                    // return done(null, false, {
                    //     message: "No existe el usuario introducido en el sistema"
                    // });
                    var login_code = new Object();
                    console.log('code: ' + code);
                    login_code.code = code;
                    login_code.id_driver = id_driver;

                    res.status(200).json(login_code);
                }
            }
        );
    }
});



module.exports = app;