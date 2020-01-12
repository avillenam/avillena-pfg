/***********************/
// --------CAPAS--------
/***********************/

var vehiclesLayer;    // Capa para las ultimas posiciones de los vehículos
var tailsLayer;     // Capa para las colas de las rutas de los vehículos
var routesLayer;    // Capa para las rutas de los vehículos

// Crea la capa que contendrá las posiciones actuales de los vehículos
function creaCapaPosicionVehiculos(geometrias) {
    vehiclesLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            /*
            features: (new ol.format.GeoJSON()).readFeatures(geometrias, {
                //dataProjection: 'EPSG:4326',
                //featureProjection: 'EPSG:3857'
            })
             */
        }),
        style: style_function
    });

    map.addLayer(vehiclesLayer);

};


// Crea la capa para mostrar las colas de los vehículos
function creaCapaColasVehiculos() {
    tailsLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            /*
            features: (new ol.format.GeoJSON()).readFeatures(geometrias, {
                //dataProjection: 'EPSG:4326',
                //featureProjection: 'EPSG:3857'
            })
             */
        }),
        style: style_tail_function
    });

    map.addLayer(tailsLayer);
}


// Crea la capa para mostrar las rutas de los vehículos
function creaCapaRutasVehiculos() {
    routesLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            /*
            features: (new ol.format.GeoJSON()).readFeatures(geometrias, {
                //dataProjection: 'EPSG:4326',
                //featureProjection: 'EPSG:3857'
            })
             */
        }),
        style: routeStyle
    });
    map.addLayer(routesLayer);
}

// Obtiene un color aleatorio de la matriz COLORS
/*
function generateColor() {
    // generate random color for each object
    var R = Math.floor(Math.random() * 256);
    return COLORS[Math.floor(Math.random() * COLORS.length)];
    //console.log('array styles creado: ' + styles.length + ' styles');
}
 */

// Obtiene todos los vehículos
function getVehicles() {
    //console.log('peticion enviada');
    theUrl = ROOT + '/getVehicles';
    vehiclesJSON = JSON.parse(httpGet(theUrl));
    return vehiclesJSON;
}

// Obtiene un objeto JSON a partir de su id
function getVehicle(id) {
    var numVehiculos = ultimasPosicionesVehiculos.features.length;
    var vehiculo = {};
    for (var i = 0; i < numVehiculos; i++) {
        var temp = ultimasPosicionesVehiculos.features[i];
        if (temp.properties.id_vehicle == id) {
            vehiculo = temp;
        }
    }
    return vehiculo;
}

// Obtiene todos los conductores y crea los elementos HTML
//TODO: separar el obtener los objetos de los conductores de la creación de los HTML como en getVehicles()
function getDrivers() {
    // consulta a lanzarse
    theUrl = ROOT + '/getDrivers';

    // petición http para obtener los conductores
    driversJSON = JSON.parse(httpGet(theUrl));
    numDrivers = driversJSON.length;

    //console.log('driversJSON: ' + JSON.stringify(driversJSON));

    //Variables para alojar los items
    var myItems = [], $drivers_results = $('#drivers_results');

    // Buclque para crear cada elemento en el panel del visualizador
    for (var i = 0; i < numDrivers; i++) {
        //console.log('i: ' + i);
        var id = driversJSON[i]['id_driver'];
        var name = driversJSON[i]['name'];
        var surname = new String(driversJSON[i]['surname']);
        var birthdate = (new Date(driversJSON[i]['birthdate']));
        birthdate = birthdate.getDate() + "/" + birthdate.getMonth() + "/" + birthdate.getFullYear();
        var genre = driversJSON[i]['genre'];
        var mobile_number = driversJSON[i]['mobile_number'];
        var email = driversJSON[i]['email'];
        var available = driversJSON[i]['available'];

        // Petición de vehículo asignado
        theUrlVehicle = ROOT + '/vehicleByIdDriver/' + id;
        var response = httpGet(theUrlVehicle);
        //console.log('Ha hecho la petición: ' + theUrlVehicle );
        //console.log('response: ' + response );
        var resVehicleAssigned = JSON.parse(response);
        //console.log('resVehicleAssigned: ' + resVehicleAssigned);
        //console.log('resVehicleAssigned: ' + JSON.stringify(resVehicleAssigned));
        //console.log('resVehicleAssigned.length: ' + resVehicleAssigned.length);
        // variable para establecer el icono del tipo de vehículo asignado. Por defecto: 'coche'
        var vehicle_mini_icon = 'f5de';
        var id_vehicle;
        if (resVehicleAssigned.length == !0) {
            //console.log('resVehicleAssigned.length == !0');
            var vehicle = resVehicleAssigned[0];
            id_vehicle = vehicle['id_vehicle'] + ': ' + vehicle['brand'] + ' ' + vehicle['model'];
            var vehicle_type = vehicle['type'];
            var visibility = vehicle['visibility'];
            //console.log(id_vehicle);
        } else {
            id_vehicle = 'No asignado.';
            var visibility = false;
            //console.log(id_vehicle);
        }

        // Icono para el tipo de género
        var gender_icon;
        switch (genre) {
            case 'Masculino':
                gender_icon = 'masculino_icon.png';
                break;
            case 'Femenino':
                gender_icon = 'femenino_icon.png';
                break;
            default:
                gender_icon = 'interrogacion_icon.png';
        }

        // Icono para el tipo de vehículo asignado
        switch (vehicle_type) {
            case 'Coche':
                vehicle_mini_icon = 'f5de';
                break;
            case 'Furgoneta':
                vehicle_mini_icon = 'f5b6';
                break;
            case 'Camión':
                vehicle_mini_icon = 'f0d1';
                break;
            case 'Bicicleta':
                vehicle_mini_icon = 'f206';
                break;
            case 'Motocicleta':
                vehicle_mini_icon = 'f21c';
                break;
            case 'Scooter Eléctrico':
                vehicle_mini_icon = 'f0e7';
                break;
            default:
                vehicle_mini_icon = 'f5de'
        }

        // Establece el icono de visibilidad
        var eye = '';
        if (visibility == 'false') {
            eye = 'fa-eye';
        } else {
            eye = 'fa-eye-slash';
        }

        // Crea un elemento por cada conductor
        myItems.push("" +
            "<div class='resultItem'>" +
            "<img class='list-thumbnail' src='/images/" + gender_icon + "' width='50'>" +
            "<div href='#" + id + "' class='details'>" +
            "<div class='list-group-item-heading'><i class='fa fa-hashtag'></i>" + id + "</div>" +
            "<div title='Email'><i class='fa fa-at'></i>" + email + "</div>" +
            "<div title='Nombre de conductor'><i class='glyphicon glyphicon-user'></i>" + name + " " + surname + "</div>" +
            "<div title='Fecha de nacimiento'><i class='glyphicon glyphicon-calendar'></i>" + birthdate + "</div>" +
            "<div title='Género'><i class='fa fa-genderless'></i>" + genre + "</div>" +
            "<div title='Número de móvil'><i class='fa fa-mobile-alt'></i>" + mobile_number + "</div>" +
            "<div title='Vehículo'><i class='fa'>&#x" + vehicle_mini_icon + "</i>" + id_vehicle + "</div>" +
            "<a title='Eliminar conductor' class='deleteIcon delete-driver' data-id=" + id + "><i class='fa fa-trash'></i></a>" +
            "<a title='Editar conductor' class='editIcon edit-driver' data-toggle='modal' data-target='#editFormDriver' " +
            " data-id=" + id + " data-name=" + name + " data-surname=" + surname + " data-birthdate= " + birthdate +
            " data-genre=" + genre + " data-mobile_number= " + mobile_number + " data-email=" + email +
            " data-available=" + available +
            ">" +
            "<i class='fa fa-edit'></i>" +
            "</a>" +
            "<a class='btn visualize-vehicle' title='Mostrar vehículo asociado' data-id=" + id + "><i class='fas " + eye + "'></i></a>" +
            "<a class='btn zoom-vehicle' title='Zoom a vehículo asociado' data-id=" + id + "><i class='fas fa-bullseye'></i></a>" +
            "</div>" +
            "</div>");

    }
    $('#drivers_results').html(myItems.join(''));
    //console.log('Conductores capturados: ')
    //console.log(driversJSON);
    //updateFunctions();
}

// Obtiene un objeto JSON a partir de su id
function getDriver(id) {
    var numConductores = driversJSON.length;
    var conductor = {};
    for (var i = 0; i < numConductores; i++) {
        var temp = driversJSON[i];
        if (temp.id_driver == id) {
            conductor = temp;
        }
    }
    return conductor;
}

// Extrae la rotación entre dos coordenadas
function extractRotation(coordinates) {
    var end = coordinates[0];
    var start = coordinates[1];
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    return Math.atan2(dy, dx);
};

// Petición GET dada una URL
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

//var color = generateColor();

custom_styles = {
    'Point': new ol.style.Style({
        image: new ol.style.Icon({
            opacity: 1,
            scale: 1,
            //color: color,
            crossOrigin: 'anonymous',
            src: '/images/geolocation_marker_heading.png',
            rotateWithView: true
        })
    })
};

// Función que crea el estilo para los puntos que indican la posición actual de los vehículos
style_function = function (feature) {
    var rotation = feature.getProperties().rotacion;
    style_nr = feature.getGeometry().getType();
    //console.log(feature.getProperties().rotacion);
    var style = new ol.style.Style({
        image: new ol.style.Icon({
            opacity: 1,
            scale: 1.2,
            //color: color,
            crossOrigin: 'anonymous',
            src: '/images/geolocation_marker_heading.png',
            rotateWithView: true
        })
    });
    style.getImage().setRotation(-rotation + (Math.PI / 2));
    return style;
};

// Función que crea el estilo para los puntos que indican la posición actual de los vehículos
style_tail_function = function (feature) {
    var geometry = feature.getGeometry();
    var styles = [
        // linestring
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00ff0d',
                width: 2
            })
        })
    ];

    geometry.forEachSegment(function (start, end) {
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        var rotation = Math.atan2(dy, dx);
        // arrows
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(end),
            image: new ol.style.Icon({
                src: '/images/Blue_Arrow_small.png',
                anchor: [.5, .5],
                rotateWithView: true,
                rotation: (Math.PI - rotation)
            })
        }));
    });

    return styles;
};

// Estilo para las rutas
var routeStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#180eee',
        width: 3
    })
});


//Función que obtiene las últimas posiciones de todos los vehículos
function obtienePosicionActualVehiculos(vehicles) {
    let url;
    let lastTwoPoints = {};
    let ultimasPosicionesVehiculos = {};
    ultimasPosicionesVehiculos.type = 'FeatureCollection'
    ultimasPosicionesVehiculos.features = [];

    let numVehicles = vehicles.length;

    for (var i = 0; i < numVehicles; i++) {
        let ptoActual = null;
        let rotacion = 0;
        let speed = 0;
        let address = "";
        let accuracy = null;
        let feature = {};
        let idVehicle = null;
        let brand = null;
        let model = null;
        let passengers = 0;
        let fuel = null;
        let id_driver = null;
        let matricula = null;
        let available = false;
        let last_date_registry = null;
        let respuesta;
        // petición GET para obtener los dos últimos puntos del vehículo
        idVehicle = vehicles[i].id_vehicle;
        url = ROOT + '/getTwoLastPositionByVehicle/' + idVehicle;
        lastTwoPoints = JSON.parse(httpGet(url));
        if (lastTwoPoints.geometry != null) {
            if (lastTwoPoints.geometry.coordinates.length == 2) {
                rotacion = extractRotation(lastTwoPoints.geometry.coordinates);
            } else {
                rotacion = 0;
            }
        }

        // Petición GET para obtener el último punto del vehículo y sus atributos
        url = ROOT + '/getCurrentPointByVehicle/' + idVehicle;
        respuesta = JSON.parse(httpGet(url));
        if (respuesta.feature != null) {
            ptoActual = respuesta.feature[0].geometry;
            speed = respuesta.feature[0].speed;
            address = respuesta.feature[0].address;
            accuracy = respuesta.feature[0].accuracy;
            id_driver = respuesta.feature[0].id_driver;
            last_date_registry = respuesta.feature[0].date;
        }

        feature.type = "Feature";
        feature.geometry = ptoActual;
        feature.properties = {};
        feature.properties.vehicleType = vehicles[i].type;
        feature.properties.matricula = vehicles[i].matricula;
        feature.properties.brand = vehicles[i].brand;
        feature.properties.model = vehicles[i].model;
        feature.properties.passengers = vehicles[i].passengers;
        feature.properties.fuel = vehicles[i].fuel;
        feature.properties.id_vehicle = idVehicle;
        feature.properties.id_driver = id_driver;
        feature.properties.rotacion = rotacion;
        feature.properties.speed = speed;
        feature.properties.address = address;
        feature.properties.accuracy = accuracy;
        feature.properties.last_date_registry = last_date_registry;
        feature.properties.available = available;

        ultimasPosicionesVehiculos.features.push(feature);
    }

    return ultimasPosicionesVehiculos;
}

// Hace zoom y ajusta la vista a las features
function zoomToFeature(source) {
    var extent = source.getExtent();
    var polygon = new ol.geom.Polygon.fromExtent(extent);
    map.getView().fit(polygon, {padding: [170, 50, 30, 150], minResolution: 1.19});
}

// Hace zoom y ajusta la vista a la ruta seleccionada
function zoomToRoute(source) {
    var extent = source.getExtent();
    var polygon = new ol.geom.Polygon.fromExtent(extent);
    map.getView().fit(polygon, {padding: [5, 5, 5, 5], minResolution: 0.59});
}

function seleccionaVehiculoActual(id) {
    var features = ultimasPosicionesVehiculos.features;

    for (i in features) {
        if (features[i].properties.id_vehicle == id) {
            console.log('Se ha seleccionado el objeto: ' + features[i].properties.matricula);
            currentVehicle = features[i];
            idCurrentVehicle = currentVehicle.properties.id_vehicle;
        }
    }
}


// Crea elementos HTLM con la información del bvehículo seleccionado como actual
function createVehicleHTMLinfo() {
    var myItems = [], $vehicles_results = $('#info_result');

    var vehiculo = currentVehicle;
    var matricula = vehiculo.properties.matricula;
    var id = vehiculo.properties.id_vehicle;
    var marca = vehiculo.properties.brand;
    var modelo = vehiculo.properties.model;
    var pasajeros = vehiculo.properties.passengers;
    var fuel = vehiculo.properties.fuel;
    var id_driver = vehiculo.properties.id_driver;
    var type = vehiculo.properties.vehicleType;
    var address = vehiculo.properties.address;
    var available = vehiculo.properties.available;
    var velocidad = vehiculo.properties.speed;
    if (vehiculo.geometry != null) {
        var coordenadasLonLat = ol.proj.toLonLat(vehiculo.geometry.coordinates);
        var coordenadas = Number(coordenadasLonLat[0].toFixed(2)) + ', ' + Number(coordenadasLonLat[1].toFixed(2));
    }

    // Petición del conductor asignado
    theUrlDriver = ROOT + '/driverByIdVehicle/' + id;
    var resDriverAssigned = JSON.parse(httpGet(theUrlDriver));
    var conductor_asignado;
    if (resDriverAssigned.length == !0) {
        var driver = resDriverAssigned[0];
        conductor_asignado = driver['id_driver'] + ': ' + driver['name'] + ' ' + driver['surname'];
    } else {
        conductor_asignado = 'No asignado.';
    }

    // Icono para el tipo de vehículo
    var vehicle_mini_icon = 'f5de';
    // Icono para el tipo de vehículo asignado
    switch (type) {
        case 'Coche':
            vehicle_mini_icon = 'f5de';
            break;
        case 'Furgoneta':
            vehicle_mini_icon = 'f5b6';
            break;
        case 'Camión':
            vehicle_mini_icon = 'f0d1';
            break;
        case 'Bicicleta':
            vehicle_mini_icon = 'f206';
            break;
        case 'Motocicleta':
            vehicle_mini_icon = 'f21c';
            break;
        case 'Scooter Eléctrico':
            vehicle_mini_icon = 'f0e7';
            break;
        default:
            vehicle_mini_icon = 'f5de'
    }


    // Crea elementos HTML para cada vehículo
    myItems.push("" +
        "<h3 class='mb-1 font-weight-semi-bold' title='Matrícula vehículo'>" + matricula + "</h3>" +
        "<h5 title='dirección'>" + address + "</h5>" +
        "<h5 title='coordenadas'>Lon/Lat: " + coordenadas + "</h5>" +
        "<hr style='color: #566167;'/>" +
        "<div title='Vehículo'><i class='fa'>&#x" + vehicle_mini_icon + "</i>" +
        "<h4>" + id + ": " + marca + ", " + modelo + ", " + "</h4>" +
        "<p>Pasageros: " + pasajeros + "</p>" +
        "<p>Combustible: " + fuel + "</p>" +
        "</div>" +
        "<div class='align-middle' title='Última veolicidad registrada Velocidad'>Velocidad: " + velocidad + " km/h</div><hr style='color: #566167;'/>" +
        "<div><h5>Conductor Asignado:</h5><p class='mb-0' title='Conductor'>" + conductor_asignado + "</p></div>"
    );

    // Añade los elementos al div #info_result
    $('#info_result').html(myItems.join(''));
}


function createVehicleHTMLrutas() {
    var myItems = [], $vehicles_results = $('#rutas_result');

    var vehiculo = currentVehicle;
    var id = vehiculo.properties.id_vehicle;
    var matricula = vehiculo.properties.matricula;

    myItems.push("" +
        "<h3 class='mb-1 font-weight-semi-bold' title='Matrícula vehículo'>" + matricula + "</h3>" +
        "<hr style='color: #566167;'/>" +
        "<table class='table-dashboard mb-0 table table-borderless vehicles-table' id='tabla-rutas'>" +
        "<thead class='bg-light'>" +
        "<tr>" +
        "<th><h4>Ruta Nº</h4></th>" +
        "<th><h4>Fecha</h4></th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>");

    // Petición del conductor asignado
    theUrl = ROOT + '/getRoutesByVehicle/' + id;
    var rutas = JSON.parse(httpGet(theUrl));
    var fechas_rutas;
    if (rutas.length != 0) {

        for (ruta in rutas) {
            // Crea elementos HTML para cada vehículo
            myItems.push("" +
                "<tr>" +
                "<td class='align-items-center align-middle' title='Número Ruta'>" +
                "<h5>[" + ruta + "]: " + "</h5>" +
                "</td>" +
                "<td class='align-middle' title='Fecha Ruta'><h5>" + rutas[ruta].date + "</h5></td>" +
                "</tr>");
        }
        myItems.push("</tbody></table>");
    } else {
        fechas_rutas = 'No hay rutas disponibles.';

        myItems.push("" +
            "<tr>" +
            "<td class='align-items-center align-middle' title='Número Ruta'>" +
            "<h4>[--]: " + "</h4>" +
            "</td>" +
            "<td class='align-middle' title='Fecha Ruta'>" + fechas_rutas + "</td>" +
            "</tr></tbody></table>");
    }

// Añade los elementos al div #info_result
    $('#rutas_result').html(myItems.join(''));

    //updateFunctions();
}


function muestraPosicionVehiculos(features) {
    var features = (new ol.format.GeoJSON()).readFeatures(features, {
        //dataProjection: 'EPSG:4326',
        //featureProjection: 'EPSG:3857'
    });
    // Borra las anteriores features
    vehiclesLayer.getSource().clear();

    //Añade las features
    vehiclesLayer.getSource().addFeatures(features);

}


// Muestra la ruta completa de un vehículo dados su 'id' y la 'fecha'
function muestraRutaPorFecha(id, fecha) {
    var ruta;

    // Petición del conductor asignado
    var date = theUrl = ROOT + '/getRouteOfVehicleByDate/' + id + '/' + fecha;
    ruta = JSON.parse(httpGet(theUrl));

    // añade propiedades a la respuesta
    ruta.properties = {};
    ruta.properties.id_vehicle = id;
    ruta.properties.fecha = fecha;

    // Separa la LineString obtenida en getRouteOfVehicleByDate según las tolerancias
    var multilinestring = separaLineStrings(ruta);

    var format = new ol.format.GeoJSON({});
    var feature = format.readFeature(multilinestring, {});

    // Borra la ruta anterior
    routesLayer.getSource().clear();

    //Añade la ruta seleccionada
    routesLayer.getSource().addFeature(feature);


}

// Muestra la cola de la ruta del vehículo seleccionado
function muestraColaVehiculo(id) {

    //var fecha_ultimo_registro = (getVehicle(id).properties.last_date_registry).substring(0, 10);    // formato DD-MM-YYYY
    var fecha_ultimo_registro = getVehicle(id).properties.last_date_registry;    // formato DD-MM-YYYY

    // Petición del conductor asignado
    if (fecha_ultimo_registro != null) {
        fecha_ultimo_registro = fecha_ultimo_registro.substring(0, 10);
        var theUrl = ROOT + '/getTailVehicle/' + id + '/' + fecha_ultimo_registro;
        var respuesta = JSON.parse(httpGet(theUrl));

        if (respuesta.geometry != null) {

            var format = new ol.format.GeoJSON({});
            var feature = format.readFeature(respuesta, {});

            // Borra la ruta anterior
            tailsLayer.getSource().clear();

            //Añade la ruta seleccionada
            tailsLayer.getSource().addFeature(feature);

        }
    } else {
        alert ("El vehículo con matrícula: " + getVehicle(id).properties.matricula + " no tiene posiciones registradas.")
        currentVehicle = {};
        idCurrentVehicle = null;
    }

    // Marca y selecciona la ruta seleccionada para pintarla en el mapa
    $('#tabla-rutas tbody tr').click(function () {
        $(this).addClass('bg-success').siblings().removeClass('bg-success');
        var fecha = $(this).find("td[title='Fecha Ruta']>h5").text();
        ultimaFechaCurrentVehicle = fecha;
        //var id = currentVehicle.properties.id_vehicle;

        // Si la capa de colas tiene alguna entidad la elimina
        if (tailsLayer.getSource().getFeatures().length != 0) {
            tailsLayer.getSource().clear();
            currentVehicle = {};
            tailsLayer.setVisible(false);

            //Tambien apaga el botón de las colas
            if ($('#btn-mostrar-colas').hasClass('btn-primary')) {
                $('#btn-mostrar-colas').removeClass('btn-primary');
                $('#btn-mostrar-colas').addClass('btn-default');
            }
        }

        // Hace la petición para mostrar la ruta con el id_vehicle y la fecha de la ruta seleccionada
        if (routesLayer.getVisible() == false) {   // Si la capa de rutas está apagada, la enciende
            routesLayer.setVisible(true);
        }
        muestraRutaPorFecha(idCurrentVehicle, fecha);

        //Hace zoom a la ruta mostrada
        zoomToRoute(routesLayer.getSource());

        // Enciende el botón '#btn-mostrar-rutas'
        if ($('#btn-mostrar-rutas').hasClass('btn-default')) {
            $('#btn-mostrar-rutas').removeClass('btn-default');
            $('#btn-mostrar-rutas').addClass('btn-primary');
        }
        //toggleBtnMostrarRutas();

        console.log('Fecha seleccionada: ' + fecha);

    });

}


// Calcula la distancia entre dos puntos
function distanciaEntreDosPuntos(pto1, pto2) {
    var line = new ol.geom.LineString([pto1, pto2])
    return line.getLength();
}

// Obtiene un MultiLineString
function separaLineStrings(line) {
    var puntos = line.coordinates;
    var numPtos = puntos.length;
    var distMaxima = 3000;
    var distMinima = 5;

    var feature = {};
    feature.type = "Feature";
    feature.geometry = {};
    feature.geometry.type = "MultiLineString";
    feature.geometry.coordinates = [];
    feature.properties = {};
    feature.properties.id_vehicle = line.properties.id_vehicle;
    feature.properties.fecha = line.properties.fecha;

    var ptoInicial = puntos[0];
    var multiLineString = [];
    multiLineString.push(ptoInicial);

    for (var i = 1; i < numPtos; i++) {
        var distancia = distanciaEntreDosPuntos(puntos[i - 1], puntos[i]);

        //console.log('i-1: ' + (i - 1) + ', i: ' + i + ', Distancia: ' + distancia);

        if (distancia > distMinima) {
            if (distancia < distMaxima) {
                multiLineString.push(puntos[i]);
            } else if (distancia > distMaxima) {
                feature.geometry.coordinates.push(multiLineString);
                multiLineString = [];
                multiLineString.push(puntos[i]);
            }
        }
    }

    feature.geometry.coordinates.push(multiLineString);

    return feature;
}

// Muestra la información de las entidades del mapa
var displayFeatureInfo = function (pixel) {
    info.css({
        left: pixel[0] + 'px',
        top: (pixel[1] - 15) + 'px'
    });
    var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });
    if (feature) {
        var informacion = null;
        if (feature.getGeometry().getType() == 'Point') {
            var id_vehicle = feature.getProperties().id_vehicle;
            var matricula = feature.getProperties().matricula;
            var brand = feature.getProperties().brand;
            var model = feature.getProperties().model;
            var id_driver = feature.getProperties().id_driver;
            var conductor = getDriver(id_driver);
            var informacion = '[' + id_vehicle + '].- ' + matricula + ', ' + brand + ', ' + model + ', ' + conductor.name + ' ' + conductor.surname;
        } else if (feature.getGeometry().getType() == 'MultiLineString') {
            var id_vehicle = feature.getProperties().id_vehicle;
            var fecha = feature.getProperties().fecha;
            var informacion = 'Id vehículo: ' + id_vehicle + ', Fecha ruta: ' + fecha;
        } else if (feature.getGeometry().getType() == 'LineString') {

        }


        info.tooltip('hide')
            .attr('data-original-title', informacion)
            .tooltip('fixTitle')
            .tooltip('show');
    } else {
        info.tooltip('hide');
    }
};


function toggleBtnMostrarColas() {
    if ($('#btn-mostrar-colas').hasClass('btn-default')) {
        $('#btn-mostrar-colas').removeClass('btn-default');
        $('#btn-mostrar-colas').addClass('btn-primary');
        // Enciende la capa vehiclesLayer
        if (tailsLayer.getVisible() == false) {
            tailsLayer.setVisible(true);
        }

    } else {
        $('#btn-mostrar-colas').removeClass('btn-primary');
        $('#btn-mostrar-colas').addClass('btn-default');
        // Apaga la capa vehiclesLayer
        if (tailsLayer.getVisible() == true) {
            tailsLayer.setVisible(false);
        }

    }
}

function toggleBtnMostrarRutas() {
    if ($('#btn-mostrar-rutas').hasClass('btn-default')) {
        $('#btn-mostrar-rutas').removeClass('btn-default');
        $('#btn-mostrar-rutas').addClass('btn-primary');
        // Enciende la capa vehiclesLayer
        if (routesLayer.getVisible() == false) {
            routesLayer.setVisible(true);
        }

    } else {
        $('#btn-mostrar-rutas').removeClass('btn-primary');
        $('#btn-mostrar-rutas').addClass('btn-default');
        // Apaga la capa vehiclesLayer
        if (routesLayer.getVisible() == true) {
            routesLayer.setVisible(false);
        }
    }
}

