// Obtiene un color aleatorio de la matriz COLORS
function generateColor() {
    // generate random color for each object
    var R = Math.floor(Math.random() * 256);
    return COLORS[Math.floor(Math.random() * COLORS.length)];
    //console.log('array styles creado: ' + styles.length + ' styles');
}

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

var color = generateColor();

var pointStyle = new ol.style.Style({
    image: new ol.style.Icon({
        opacity: 1,
        scale: 1,
        //color: color,
        crossOrigin: 'anonymous',
        src: '/images/geolocation_marker_heading.png',
        rotateWithView: true
    })
});


custom_styles = {
    'Point': new ol.style.Style({
        image: new ol.style.Icon({
            opacity: 1,
            scale: 1,
            color: color,
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
            color: color,
            crossOrigin: 'anonymous',
            src: '/images/geolocation_marker_heading.png',
            rotateWithView: true
        })
    });
    style.getImage().setRotation(-rotation + (Math.PI / 2));
    return style;
}

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

