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
}

// Estilo para las rutas
var routeStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#00ff0d',
        width: 3
    })
})

// Crea la capa que contendrá las posiciones actuales de los vehículos
var vectorLayer;

function creaCapaPosicionVehiculos(geometrias) {
    vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(geometrias, {
                //dataProjection: 'EPSG:4326',
                //featureProjection: 'EPSG:3857'
            })
        }),
        style: style_function
    });

    map.addLayer(vectorLayer);

    // hace zoom a los elementos
    zoomToFeature(vectorLayer.getSource());
}

// Crea la capa para mostrar las rutas de los vehículos
var routesLayer;
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
        url = ROOT + '/getLastPositionByVehicle/' + idVehicle;
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
            last_date_registry = respuesta.feature[0].date_registry;
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
    map.getView().fit(polygon, {padding: [170, 50, 30, 150]});
}

// Hace zoom y ajusta la vista a la ruta seleccionada
function zoomToRoute(source) {
    var extent = source.getExtent();
    var polygon = new ol.geom.Polygon.fromExtent(extent);
    map.getView().fit(polygon, {padding: [5, 5, 5, 5]});
}

function seleccionaVehiculoActual(id) {
    var features = ultimasPosicionesVehiculos.features;

    for (i in features) {
        if (features[i].properties.id_vehicle == id) {
            console.log('Se ha seleccionado el objeto: ' + features[i].properties.matricula);
            currentVehicle = features[i];
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

    updateFunctions();
}
var ruta;
function muestraRutaPorFecha(id, fecha) {
    // Petición del conductor asignado
    var date = theUrl = ROOT + '/getRouteOfVehicleByDate/' + id + '/' + fecha;
    ruta = JSON.parse(httpGet(theUrl));

    // Separa la LineString obtenida en getRouteOfVehicleByDate según las tolerancias
    var multilinestring = separaLineStrings(ruta);

    var format = new ol.format.GeoJSON({ });
    var feature = format.readFeature(multilinestring, { });

    // Borra la ruta anterior
    routesLayer.getSource().clear();

    //Añade la ruta seleccionada
    routesLayer.getSource().addFeature(feature);

    //Hace zoom a la ruta mostrada
    zoomToRoute(routesLayer.getSource());

}

// Calcula la distancia entre dos puntos
function distanciaEntreDosPuntos(pto1, pto2){
    var line = new ol.geom.LineString([pto1, pto2])
    return line.getLength();
}

// Obtiene un MultiLineString
function separaLineStrings(line){
    var puntos = line.coordinates;
    var numPtos = puntos.length;
    var distMaxima = 3000;
    var distMinima = 5;

    var feature = {};
    feature.type="Feature";
    feature.geometry={};
    feature.geometry.type="MultiLineString";
    feature.geometry.coordinates=[];

    var ptoInicial=puntos[0];
    var lineString = [];
    lineString.push(ptoInicial);

    for (var i = 1; i< numPtos; i++){
        var distancia = distanciaEntreDosPuntos(puntos[i-1],puntos[i]);
        console.log();
        console.log('i-1: ' + (i-1) + ', i: ' + i + ', Distancia: ' +distancia);

        if(distancia>distMinima){
            if(distancia<distMaxima){
                lineString.push(puntos[i]);
            }else if(distancia>distMaxima){
                feature.geometry.coordinates.push(lineString);
                lineString = [];
                lineString.push(puntos[i]);
            }
        }
    }

    feature.geometry.coordinates.push(lineString);

    return feature;
}

