const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require('path');
const db = require('./public/javascripts/queries')

require("dotenv").config();
const app = express();


const PORT = process.env.PORT || 3000;

const initializePassport = require("./passportConfig");

initializePassport(passport);

// Middleware

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'jade');
// app.set("view engine", "ejs");

app.use(
    session({
        // Key we want to keep secret which will encrypt all of our information
        secret: process.env.SESSION_SECRET,
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
    res.render("map", { user: req.user.name });
});

app.get("/logout", (req, res) => {
    req.logout();
    res.render("login", { message: "Has terminado la sesión correctamente." });
});

app.post("/register", async(req, res) => {
    let { name, email, password } = req.body;

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
                        `INSERT INTO drivers (name, email, password)
                        VALUES ($1, $2, $3)
                        RETURNING id_driver, password`, [name, email, hashedPassword],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Ya estás registrado. Por favor autentícate.");
                            res.redirect("/login");
                        }
                    );
                }
            }
        );
    }
});

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
app.post('/driver', db.createDriver);

//Crea un objeto
app.post('/createObject', db.createObject);

//Edita portador
app.post('/editDriver', db.editDriver);

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

//Elimina la relacion objeto-portador
app.post('/deleteVehicleDriver', db.deleteVehicleDriver);

//Establece la disponibilidad para el portador
app.post('/driverAvailability', db.availabilityDriver);

//Establece la disponibilidad para el objeto
app.post('/vehicleAvailability', db.availabilityVehicle);

//Establece la fecha de registro que se quiere mostrar
app.get('/time/:fecha_ini/:fecha_fin', db.dateRegistryToShow);

//Realiza la comprobación de usuario registrado
app.get('/loginDriver/:email/:password', db.loginDriver);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});