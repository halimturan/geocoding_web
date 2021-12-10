mapboxgl.accessToken = 'pk.eyJ1IjoiaGFsaW10dXJhbiIsImEiOiJjamQybTR5d2Ywb2xzMzNvcXpqdTg3OGVyIn0.WODE8x7l6SGSjh0jinS1dQ';
let map = null;
$.getJSON("root.json", function(json) {

    map = new mapboxgl.Map({
        container: 'map', // container id
        style: json,
        // style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [29.038691, 41.055667], // starting position [lng, lat]
        zoom: 12,
        maxZoom: 20,
        minZoom:0,
        bearing: 10,
        pitch: 70
    });
});
var typewatch = function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    }
}();
function defineDataType(url) {
    if(map.getSource('geocode_source')) {
        map.removeLayer('geocode_layer');
        map.removeSource('geocode_source');
    }
    $.getJSON(url, function(json) {
        const data_type = json.features[0].geometry.type;
        if (data_type === "Polygon") {
            drawPolygon(json);
        } else if(data_type === "LineString") {
            drawLineString(json)
        } else if(data_type === "Point") {
            drawPoint(json)
        }
    });
}

function drawPolygon(geojson){
    map.addSource('geocode_source', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        'id': 'geocode_layer',
        'type': 'fill',
        'source': 'geocode_source', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#0080ff', // blue color fill
            'fill-opacity': 0.5
        }
    });

    var coordinates = geojson.features[0].geometry.coordinates[0];
    var bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
        padding: 20
    });
}

function drawLineString(geojson){
    map.addSource('geocode_source', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        'id': 'geocode_layer',
        'type': 'line',
        'source': 'geocode_source',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#BF93E4',
            'line-width': 5
        }
    });
    const coordinates = geojson.features[0].geometry.coordinates;
    const bounds = new mapboxgl.LngLatBounds(
        coordinates[0],
        coordinates[0]
    );

    for (const coord of coordinates) {
        bounds.extend(coord);
    }

    map.fitBounds(bounds, {
        padding: 20
    });
}

function drawPoint(geojson) {
    map.addSource('geocode_source', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        'id': 'geocode_layer',
        'type': 'circle',
        'source': 'geocode_source',
        'paint': {
            'circle-radius': 6,
            'circle-color': '#B42222'
        }
    });
    const coordinates = geojson.features[0].geometry.coordinates;
    map.flyTo({
        center: coordinates,
        zoom: 16,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
}

// $("#search_input").on("change paste keyup", function() {
//     if($(this).val().length > 2) {
//         $.ajax({
//             type: "POST",
//             url: "/api",
//             data: {"text": $(this).val()},
//             dataType: "json",
//             success: function(resultData){
//                 $('#search_result_list').empty();
//                 resultData.map(e => {
//                     $('#search_result_list').append(`<li data-url="${e.detail_url}" onclick="defineDataType(this.dataset.url)" style="padding: 5px;; cursor: pointer">${e.name}</li>`);
//                 })
//             }
//         });
//     } else {
//         $('#search_result_list').empty();
//     }
// });


