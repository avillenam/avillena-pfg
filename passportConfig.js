const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
    console.log("Initialized");

    const authenticateUser = (email, password, done) => {
        console.log(email, password);
        pool.query(
            `SELECT * FROM drivers WHERE email = $1`, [email],
            (err, results) => {
                if (err) {
                    throw err;
                }
                console.log(results.rows);

                if (results.rows.length > 0) {
                    const user = results.rows[0];

                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            //La contraseña es incorrecta
                            return done(null, false, { message: "La contraseña es incorrecta" });
                        }
                    });
                } else {
                    // No existe el usuario introducido en el sistema
                    return done(null, false, {
                        message: "No existe el usuario introducido en el sistema"
                    });
                }
            }
        );
    };

    passport.use(
        new LocalStrategy({ usernameField: "email", passwordField: "password" },
            authenticateUser
        )
    );

    passport.serializeUser((user, done) => done(null, user.id_driver));

    passport.deserializeUser((id, done) => {
        pool.query(`SELECT * FROM drivers WHERE id_driver = $1`, [id], (err, results) => {
            if (err) {
                return done(err);
            }
            // console.log(`ID is ${results.rows[0].id_driver}`);
            return done(null, results.rows[0]);
        });
    });
}

module.exports = initialize;