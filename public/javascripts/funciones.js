/***********************/
// --------CAPAS--------
/***********************/

var vehiclesLayer; // Capa para las ultimas posiciones de los objetos
var tailsLayer; // Capa para las colas de las rutas de los objetos
var routesLayer; // Capa para las rutas de los objetos

var ruta;

// Crea la capa que contendrá las posiciones actuales de los objetos
function creaCapaPosicionVehiculos() {
    vehiclesLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            /*
            features: (new ol.format.GeoJSON()).readFeatures(geometrias, {
                //dataProjection: 'EPSG:4326',
                //featureProjection: 'EPSG:3857'
            })
             */
        }),
        style: style_function,
        zIndex: 1000
    });

    map.addLayer(vehiclesLayer);

}


// Crea la capa para mostrar las colas de los objetos
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


// Crea la capa para mostrar las rutas de los objetos
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
        style: style_route_function
            // style: styles_multipoint
    });
    temporalPreviusPoint = [0, 0];
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

// Obtiene todos los objetos
function getVehicles() {
    //console.log('peticion enviada');
    var theUrl = ROOT + '/getVehicles';
    vehiclesJSON = JSON.parse(httpGet(theUrl));
    return vehiclesJSON;
}

// Obtiene todos los portadores
function getPortadores() {
    var theUrl = ROOT + '/getDrivers';
    driversJSON = JSON.parse(httpGet(theUrl));
    numDrivers = driversJSON.length;
    return driversJSON;
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

// Obtiene todos los portadores y crea los elementos HTML
//TODO: separar el obtener los objetos de los portadores de la creación de los HTML como en getVehicles()
function getDrivers() {
    // consulta a lanzarse
    theUrl = ROOT + '/getDrivers';

    // petición http para obtener los portadores
    driversJSON = JSON.parse(httpGet(theUrl));
    numDrivers = driversJSON.length;

    //console.log('driversJSON: ' + JSON.stringify(driversJSON));

    //Variables para alojar los items
    var myItems = [];

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

        // Petición de objeto asignado
        theUrlVehicle = ROOT + '/vehicleByIdDriver/' + id;
        var response = httpGet(theUrlVehicle);
        //console.log('Ha hecho la petición: ' + theUrlVehicle );
        //console.log('response: ' + response );
        var resVehicleAssigned = JSON.parse(response);
        //console.log('resVehicleAssigned: ' + resVehicleAssigned);
        //console.log('resVehicleAssigned: ' + JSON.stringify(resVehicleAssigned));
        //console.log('resVehicleAssigned.length: ' + resVehicleAssigned.length);
        // variable para establecer el icono del tipo de objeto asignado. Por defecto: 'coche'
        var vehicle_mini_icon = 'f1b2';
        var id_vehicle;
        var visibility;
        if (resVehicleAssigned.length != 0) {
            //console.log('resVehicleAssigned.length == !0');
            var vehicle = resVehicleAssigned[0];
            id_vehicle = vehicle['id_vehicle'] + ': ' + vehicle['brand'] + ' ' + vehicle['model'];
            var vehicle_type = vehicle['type'];
            visibility = vehicle['visibility'];
            //console.log(id_vehicle);
        } else {
            id_vehicle = 'No asignado.';
            visibility = false;
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

        // Icono para el tipo de objeto asignado
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
            case 'Objeto':
                vehicle_mini_icon = 'f1b2';
                break;
            default:
                vehicle_mini_icon = 'f1b2'
        }

        // Establece el icono de visibilidad
        var eye = '';
        if (visibility == 'false') {
            eye = 'fa-eye';
        } else {
            eye = 'fa-eye-slash';
        }

        // Crea un elemento por cada portador
        myItems.push("" +
            "<div class='resultItem'>" +
            "<img class='list-thumbnail' src='/images/" + gender_icon + "' width='50' alt='icon result'>" +
            "<div href='#" + id + "' class='details'>" +
            "<div class='list-group-item-heading'><i class='fa fa-hashtag'></i>" + id + "</div>" +
            "<div title='Email'><i class='fa fa-at'></i>" + email + "</div>" +
            "<div title='Nombre de portador'><i class='glyphicon glyphicon-user'></i>" + name + " " + surname + "</div>" +
            "<div title='Fecha de nacimiento'><i class='glyphicon glyphicon-calendar'></i>" + birthdate + "</div>" +
            "<div title='Género'><i class='fa fa-genderless'></i>" + genre + "</div>" +
            "<div title='Número de móvil'><i class='fa fa-mobile-alt'></i>" + mobile_number + "</div>" +
            "<div title='Objeto Móvil'><i class='fa'>&#x" + vehicle_mini_icon + "</i>" + id_vehicle + "</div>" +
            "</div>" +
            "<div class='tileActions'>" +
            "<a title='Eliminar portador' class='deleteIcon delete-driver' data-id=" + id + "><i class='fa fa-trash'></i></a>" +
            "<a title='Editar portador' class='editIcon edit-driver' data-toggle='modal' data-target='#editFormDriver' " +
            " data-id=" + id + " data-name=" + name + " data-surname=" + surname + " data-birthdate= " + birthdate +
            " data-genre=" + genre + " data-mobile_number= " + mobile_number + " data-email=" + email +
            " data-available=" + available +
            ">" +
            "<i class='fa fa-edit'></i>" +
            "</a>" +
            "</div>" +
            "</div>");
    }
    $('#drivers_results').html(myItems.join(''));
    //console.log('portadores capturados: ')
    //console.log(driversJSON);
    updateFunctions();
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
    return Math.atan2(dy, dx);
}

// Petición GET dada una URL
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

// Petición POST dada una URL
function httpPost(theUrl, id_driver, available) {
    var xmlHttp = new XMLHttpRequest();

    var formData = new FormData();

    formData.append("id_driver", id_driver);
    formData.append("availability", available);

    xmlHttp.open("POST", theUrl, false); // false for synchronous request
    xmlHttp.send(formData);
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

// Función que crea el estilo para los puntos que indican la posición actual de los objetos
style_function = function(feature) {
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

// Función que crea el estilo para los puntos que indican la posición actual de los objetos
style_tail_function = function(feature) {
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

    geometry.forEachSegment(function(start, end) {
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
var temporalPreviusPoint = [0, 0];
style_route_function = function(feature) {
    var geometry = feature.getGeometry();

    var styles = [
        // linestring
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#180eee',
                width: 3
            })
        })
    ];

    //Estilo para MultiLineString
    if (feature.getGeometry().getType() == 'MultiLineString') {
        console.log(feature.getGeometry().getType());

        var lineStrings = feature.getGeometry().getLineStrings();
        for (var i = 0; i < lineStrings.length; i++) {
            var line = lineStrings[i];
            var longitud = line.getLength();
            var coordenadasPuntos = line.getCoordinates();
            var numPuntos = coordenadasPuntos.length;
            var ratio = (longitud / numPuntos) * .2;

            // Simplifica el LineString para que no sature el mapa de flechas
            line = line.simplify(ratio);

            // Simpología para los puntos de parada
            var ptoParada1 = line.getFirstCoordinate();
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(ptoParada1),
                image: new ol.style.Icon({
                    src: '/images/route_stop.png',
                    anchor: [.5, .5],
                    rotateWithView: true
                })
            }));

            if (i !== (lineStrings.length - 1)) {
                var ptoParada2 = line.getLastCoordinate();
                styles.push(new ol.style.Style({
                    geometry: new ol.geom.Point(ptoParada2),
                    image: new ol.style.Icon({
                        src: '/images/route_stop.png',
                        anchor: [.5, .5],
                        rotateWithView: true
                    })
                }));
            }

            // Diferente simbología para los puntos inicial y final
            var ptoInicio = geometry.getFirstCoordinate();
            var ptoFinal = geometry.getLastCoordinate();
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(ptoFinal),
                image: new ol.style.Icon({
                    src: '/images/route_start.png',
                    anchor: [.5, .5],
                    rotateWithView: true
                })
            }));

            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(ptoInicio),
                image: new ol.style.Icon({
                    src: '/images/route_end.png',
                    anchor: [.5, .5],
                    rotateWithView: true
                })
            }));

        }
    } else if (feature.getGeometry().getType() == 'Point') { //Estilo para Point

        // Punto actual
        var currentPoint = feature.getGeometry().getCoordinates();

        var rotation = 0;
        var distance = 0;
        if (temporalPreviusPoint[0] != 0) {
            // calcula la rotación del punto respecto del anterior
            var dx = currentPoint[0] - temporalPreviusPoint[0];
            var dy = currentPoint[1] - temporalPreviusPoint[1];
            rotation = Math.atan2(dy, dx);

            //calcula la distancia del punto respecto del anterior
            distance = distanciaEntreDosPuntos(currentPoint, temporalPreviusPoint);
        }

        temporalPreviusPoint = currentPoint;

        if (distance >= TOLERANCIA_MINIMA_DISTANCIA_ENTRE_PUNTOS) {
            // almacena las coordenadas para que el sigueinte lo use para calcular la rotación

            // arrows
            styles.push(new ol.style.Style({
                geometry: feature.getGeometry(),
                image: new ol.style.Icon({
                    src: '/images/Red_Arrow_small.png',
                    anchor: [.5, .5],
                    rotateWithView: true,
                    // rotation: (Math.PI - rotation)
                    rotation: (-rotation)
                })
            }));
        }
    }

    return styles;

};

// var lineString = new ol.geom.LineString;

styles_multipoint = function(feature) {

    var styles = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: 'orange'
                })
            })
        })
    ];

    // console.log('feature: ' + feature);
    // console.log('geometry: ' + feature.getGeometry());
    console.log('geometryType: ' + feature.getGeometry().getType());
    if (feature.getGeometry().getType() == 'Point') {

    } else if (feature.getGeometry().getType() == 'LineString') {

    }

    return styles;
}


var highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.7)'
    }),
    stroke: new ol.style.Stroke({
        color: '#3399CC',
        width: 3
    })
});

//Función que obtiene las últimas posiciones de todos los objetos
function obtienePosicionActualVehiculos(vehicles) {
    let url;
    let lastTwoPoints = {};
    let ultimasPosicionesVehiculos = {};
    ultimasPosicionesVehiculos.type = 'FeatureCollection';
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
        // let brand = null;
        // let model = null;
        // let passengers = 0;
        // let fuel = null;
        let id_driver = null;
        // let matricula = null;
        let available = false;
        let last_date_registry = null;
        let respuesta;
        // petición GET para obtener los dos últimos puntos del objeto
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

        // Petición GET para obtener el último punto del objeto y sus atributos
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
    map.getView().fit(polygon, { padding: [170, 50, 30, 150], minResolution: 1.19 });
}

// Hace zoom y ajusta la vista a la ruta seleccionada
function zoomToRoute(source) {
    var extent = source.getExtent();
    var polygon = new ol.geom.Polygon.fromExtent(extent);
    map.getView().fit(polygon, { padding: [5, 5, 5, 5], minResolution: 0.59 });
}

function seleccionaVehiculoActual(id) {
    var features = ultimasPosicionesVehiculos.features;

    for (let i in features) {
        if (features[i].properties.id_vehicle == id) {
            console.log('Se ha seleccionado el objeto: ' + features[i].properties.matricula);
            currentVehicle = features[i];
            idCurrentVehicle = currentVehicle.properties.id_vehicle;
        }
    }
}


// Crea elementos HTLM con la información del objeto seleccionado como actual
function createVehicleHTMLinfo() {
    var myItems = [];

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
    } else {
        coordenadas = 'Coordenadas desconocidas'
    }

    // Petición del portador asignado
    theUrlDriver = ROOT + '/driverByIdVehicle/' + id;
    var resDriverAssigned = JSON.parse(httpGet(theUrlDriver));
    var conductor_asignado;
    if (resDriverAssigned.length == !0) {
        var driver = resDriverAssigned[0];
        conductor_asignado = driver['id_driver'] + ': ' + driver['name'] + ' ' + driver['surname'];
    } else {
        address = "Dirección desconocida";
        conductor_asignado = 'No asignado.';
    }

    // Icono para el tipo de objeto
    var vehicle_mini_icon = 'f1b2';
    // Icono para el tipo de objeto asignado
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
        case 'Objeto':
            vehicle_mini_icon = 'f1b2';
            break;
        default:
            vehicle_mini_icon = 'f1b2'
    }


    // Crea elementos HTML para cada objeto
    myItems.push("" +
        "<div>" +
        "<h3 class='mb-1 font-weight-semi-bold' title='Código objeto'>" + matricula + "</h3>" +
        "<h5 title='Última dirección registrada del objeto'>" + address + "</h5>" +
        "<h5 title='Ultimas coordenadas registradas del objeto'>Lon/Lat: " + coordenadas + "</h5>" +
        "</div>" +
        "<hr style='color: #566167;'/>" +
        "<div>" +
        "<h4 title='Objeto Móvil' style='font-weight: bold'>Datos del Objeto Móvil</h4>" +
        "<div class='tileActions'>" +
        "<a title='Editar Vehiculo' class='editIcon edit-vehicle' data-toggle='modal' data-target='#editFormVehicle' " +
        " data-id=" + parseInt(id) +
        " data-type=" + type +
        " data-brand=" + marca +
        " data-model=" + modelo +
        " data-passengers=" + pasajeros +
        " data-fuel=" + fuel +
        " data-available=" + available +
        ">" +
        "<i class='fa fa-edit'></i>" +
        "</a>" +
        "<a title='Eliminar vehiculo' class='deleteIcon delete-vehicle' data-id=" + id + "><i class='fa fa-trash'></i></a>" +
        "</div>" +
        "<h4><i class='fa'>&#x" + vehicle_mini_icon + "</i> [" + id + "]: " + marca + ", " + modelo + "</h4>" +
        "<p title='Pasajeros' Pasageros: " + pasajeros + "</p>" +
        "<p title='Tipo de combustible'>Combustible: " + fuel + "</p>" +
        "<p class='align-middle' title='Última veolicidad registrada Velocidad'>Velocidad: " + velocidad + " km/h</p>" +
        "</div>" +
        "<hr style='color: #566167;'/>" +
        "<div>" +
        "<h4 style='font-weight: bold'>Portador Asignado:</h4>" +
        "<div class='tileActions'>" +
        "<a title='Crear relación Objeto-Portador' class='relationIcon create-relation' id='btnRelacionObjetoPortador' data-toggle='modal' data-target='#formVehicleDriver'><i class='fa fa-plus-square'></i></a>" +
        "<a title='Editar relación Objeto-Portador' class='editRelationIcon edit-relation' data-toggle='modal' data-target='#editRelationVehicleDriver'><i class='fa fa-edit'></i></a>" +
        "<a title='Eliminar relación Objeto-Portador' class='deleteIcon delete-relation' data-id=" + id + "><i class='fa fa-trash'></i></a>" +
        "</div>" +
        "<p class='mb-0' title='Portador'>" + conductor_asignado + "</p>" +
        "</div>"
    );

    // Añade los elementos al div #info_result
    $('#info_result').html(myItems.join(''));

}


function createVehicleHTMLrutas() {
    var myItems = [],
        $vehicles_results = $('#rutas_result');

    var vehiculo = currentVehicle;
    var id = vehiculo.properties.id_vehicle;
    var matricula = vehiculo.properties.matricula;

    myItems.push("" +
        "<h3 class='mb-1 font-weight-semi-bold' title='Código del objeto'>" + matricula + "</h3>" +
        "<hr style='color: #566167;'/>" +
        "<table class='table-dashboard mb-0 table table-borderless vehicles-table' id='tabla-rutas'>" +
        "<thead class='bg-light'>" +
        "<tr>" +
        "<th><h4>Ruta Nº</h4></th>" +
        "<th><h4>Fecha</h4></th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>");

    // Petición del portador asignado
    theUrl = ROOT + '/getRoutesByVehicle/' + id;
    var rutas = JSON.parse(httpGet(theUrl));
    var fechas_rutas;
    if (rutas.length != 0) {

        for (ruta in rutas) {
            // Crea elementos HTML para cada objeto
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


// Muestra la ruta completa de un objeto dados su 'id' y la 'fecha'
function muestraRutaPorFecha(id, fecha) {
    // var ruta;

    // Petición del portador asignado
    // var date = theUrl = ROOT + '/getRouteOfVehicleByDate/' + id + '/' + fecha;
    var date = theUrl = ROOT + '/getPositionByObject/' + id + '/' + fecha;
    ruta = JSON.parse(httpGet(theUrl));

    // console.log(ruta);

    // añade propiedades a la respuesta
    /*
    ruta.properties = {};
    ruta.properties.id_vehicle = id;
    ruta.properties.fecha = fecha;

     */

    // Separa la LineString obtenida en getRouteOfVehicleByDate según las tolerancias
    // var multilinestring = separaLineStrings(ruta);

    var format = new ol.format.GeoJSON({});
    // var feature = format.readFeature(multilinestring, {});
    // var feature = format.readFeature(ruta);
    var points = format.readFeatures(ruta);
    // console.log('points');
    // console.log(points);


    // General el LineString
    var numPuntos = ruta.features.length;
    var coordinates = [];
    var line = new ol.geom.LineString();
    for (var i = 0; i < numPuntos; i++) {
        // coordinates.push(ruta.features[i].geometry.coordinates)
        line.appendCoordinate(ruta.features[i].geometry.coordinates);
    }

    // var lineString = new ol.geom.LineString(coordinates);
    // console.log(lineString);

    var lineString = new ol.Feature({
        geometry: line,
        name: 'Line'
    });

    var linestringSeparada = separaLineStrings(lineString);
    var multilinestring = new ol.Feature({
        geometry: linestringSeparada,
        name: 'MultiLineString'
    });


    // Borra la ruta anterior
    routesLayer.getSource().clear();

    //Añade la ruta seleccionada
    // routesLayer.getSource().addFeature(lineString);
    routesLayer.getSource().addFeature(multilinestring);
    routesLayer.getSource().addFeatures(points);
}

// Muestra la cola de la ruta del objeto seleccionado
function muestraColaVehiculo(id) {

    //var fecha_ultimo_registro = (getVehicle(id).properties.last_date_registry).substring(0, 10);    // formato DD-MM-YYYY
    var fecha_ultimo_registro = getVehicle(id).properties.last_date_registry; // formato DD-MM-YYYY

    // Petición del portador asignado
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
        alert("El objeto móvil con código: " + getVehicle(id).properties.matricula + " no tiene coordenadas registradas.")
        currentVehicle = {};
        idCurrentVehicle = null;
    }

    // Marca y selecciona la ruta seleccionada para pintarla en el mapa
    $('#tabla-rutas tbody tr').click(function() {
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
        if (routesLayer.getVisible() == false) { // Si la capa de rutas está apagada, la enciende
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

    updateFunctions();
}


// Calcula la distancia entre dos puntos
function distanciaEntreDosPuntos(pto1, pto2) {
    var line = new ol.geom.LineString([pto1, pto2])
    return line.getLength();
}

// Obtiene un MultiLineString
function separaLineStrings(line) {
    var puntos = line.getGeometry().getCoordinates();
    var numPtos = puntos.length;

    var ptoInicial = puntos[0];
    var lineStrings = [];
    var lineString = new ol.geom.LineString();
    var multiLineString = new ol.geom.MultiLineString();

    lineString.appendCoordinate(ptoInicial);

    for (var i = 1; i < numPtos; i++) {
        var distancia = distanciaEntreDosPuntos(puntos[i - 1], puntos[i]);

        if (distancia > TOLERANCIA_MINIMA_DISTANCIA_ENTRE_PUNTOS) {
            if (distancia < TOLERANCIA_MAXIMA_DISTANCIA_ENTRE_PUNTOS) {
                lineString.appendCoordinate(puntos[i]);
            } else if (distancia > TOLERANCIA_MAXIMA_DISTANCIA_ENTRE_PUNTOS) {
                // lineStrings.push(lineString);
                multiLineString.appendLineString(lineString);
                lineString = new ol.geom.LineString();
                lineString.appendCoordinate(puntos[i]);
            }
        }
    }

    multiLineString.appendLineString(lineString);

    console.log('multiLineString: ' + multiLineString.getLineStrings());

    return multiLineString;

    /*
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

     */
}

// Muestra la información de las entidades del mapa
var displayFeatureInfo = function(pixel) {
    info.css({
        left: pixel[0] + 'px',
        top: (pixel[1] - 15) + 'px'
    });
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
        return feature;
    });
    if (feature) {
        var informacion = null;
        if (feature.getGeometry().getType() == 'Point') {
            var id_vehicle = feature.getProperties().id_vehicle;
            if (id_vehicle != undefined) {
                var object = getVehicle(id_vehicle);
                var matricula = object.properties.matricula;
                var brand = object.properties.brand;
                var model = object.properties.model;
                var id_driver = feature.getProperties().id_driver;
                var accuracy = feature.getProperties().accuracy;
                var speed = feature.getProperties().speed;
                var conductor = getDriver(id_driver);
                if (feature.getProperties().date_registry != undefined) {
                    var fecha = feature.getProperties().date_registry.substring(11, 19);
                } else if (feature.getProperties().last_date_registry != undefined) {
                    var fecha = feature.getProperties().last_date_registry.substring(0, 10);
                }
                var informacion = '[' + id_vehicle + '].- ' + matricula + ', \n' + brand + ',\n ' + model + ', \n' + conductor.name + ' ' + conductor.surname + ', Velocidad: ' + speed + ' km/h , Precisión: ' + accuracy + 'm, ' + fecha;
            }

        } else if (feature.getGeometry().getType() == 'MultiLineString') {
            /*
            var id_vehicle = feature.getProperties().id_vehicle;
            var fecha = feature.getProperties().fecha;
            var informacion = 'Id objeto: ' + id_vehicle + ', Fecha ruta: ' + fecha;

             */
        } else if (feature.getGeometry().getType() == 'LineString') {

        }


        info.tooltip('hide')
            .attr('data-original-title', informacion)
            .attr('html', true)
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


// Funcionalidad al pasar el ratón por encima de un elemento se ilumine en el panel de resultados


/*
map.on('pointermove', function(e) {
    if (selected !== null) {
        selected.setStyle(undefined);
        selected = null;
    }

    map.forEachFeatureAtPixel(e.pixel, function(f) {
        selected = f;
        f.setStyle(highlightStyle);
        return true;
    });

    if (selected) {
        console.log(selected.get('matricula'));
    } else {
        console.log();
    }
});

 */