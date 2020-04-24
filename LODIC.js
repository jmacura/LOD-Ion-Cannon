/* JavaScript Document */
/** This Source Code Form is subject to the terms of the Mozilla Public
	* License, v. 2.0. If a copy of the MPL was not distributed with this
	* file, You can obtain one at http://mozilla.org/MPL/2.0/.
	* @author jmacura 2016 */

// global variables
var count = 0;
var dataBlob = null;
var limit = 10000;

// **** This is just count the number of results ****
function getCount() {
	var queryUrl = queryBuilder("degrees_c");
	showInfo("Retrieving count of results");
	$.ajax({
		dataType: "json",
		url: queryUrl,
		success: function(data) {
			count = data.results.bindings[0]["callret-0"].value;
			showInfo(`There are ${count} results for your query.`);
			showNextButton();
			console.log(count);
		}
	});
}

// **** This is just data retrieval fction ****
function retrieveData() {
	var iter = 1;
	var resultsNumber = Math.ceil(count/limit);
	for(var i = 1; i <= resultsNumber; i++) {
	//console.log(i);
	$.ajax({
		dataType: "json",
		url: queryBuilder("degrees", i-1),
		success: function(_data) {
			//console.log(_data);
			var results = convertToCSV(_data.results.bindings);
			if (dataBlob != null) {
				dataBlob = new Blob([dataBlob, new Blob([results])], {type: "text/csv;charset=utf-8"});
			}
			else if (window.Blob) {
				var vars = _data.head.vars;
				var str = '';
				for (var i in  vars) {
					if (str != '') str += ',';
					str += vars[i];
				}
				str += "\r\n";
				dataBlob = new Blob([str, results], {type: "text/csv;charset=utf-8"});
			}
			else showWarning("Yo browsa no suporr blub");
			//console.log(i, iter);
			if (iter < resultsNumber) {
				iter++;
			} else {
				showInfo(`${iter} queries sucessfully finished.`);
				showNextButton();
			}
		}
	});
	}
	showInfo(`${resultsNumber} queries sucessfully fired.`);
}

function saveData() {
	saveAs(dataBlob, "all-dbp-points.csv");
}

// *** Converter from JSON query result 2 CSV ****
function convertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	//console.log(array);
	var str = '';
	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ',';
			//var item = array[i][index];
			//if (item.datatype)
				if (array[i][index].type = "literal") {
					line += '"' + array[i][index].value + '"';
				}
				else {line += array[i][index].value};
			//console.log(item);
		}
		str += line + '\r\n';
	}
	return str;
}

// this might be separated into standalone file in the future
function queryBuilder(type, iteration) {
	var latlong_base =
			"{\n" +
				"?place geo:lat ?lat .\n" +
				"?place geo:long ?lon .\n" +
			"}";
	var latlong_base2 =
			"{\n" +
				"?place dbp:latd ?lat .\n" +
				"?place dbp:longd ?lon .\n" +
			"} UNION\n" +
			"{\n" +
				"?place dbp:latD ?lat .\n" +
				"?place dbp:longD ?lon .\n" +
			"}";
	if (type === "latlong_c") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT COUNT(DISTINCT ?place) WHERE {\n" +
			latlong_base +
			"}";
		console.log(query);
	}
	else if (type === "latlong") {
		var url = "http://dbpedia.org/sparql";
		var query =
			`SELECT DISTINCT ?place SAMPLE(?lat) AS ?lat SAMPLE(?lon) AS ?lon WHERE {\n
			${latlong_base}
			} GROUP BY ?place\n
			LIMIT ${limit}`;
		if (iteration && iteration > 0) {
			query += "OFFSET " + (iteration*limit);
		}
		console.log(query);
	}
	else if (type === "latdlongd") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT DISTINCT ?place SAMPLE(?lat) AS ?lat SAMPLE(?lon) AS ?lon WHERE {\n" +
			latlong_base2 +
			"} GROUP BY ?place\n" +
			"LIMIT 10000";
			if (iteration && iteration > 0) {
				query += "OFFSET " + (iteration*limit);
			}
		console.log(query);
	}
	else if (type === "geometry_c") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT COUNT(DISTINCT ?place) WHERE {\n" +
			"?place geo:geometry ?wkt .\n" +
			"}";
		console.log(query);
	}
	else if (type === "geometry") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT DISTINCT ?place SAMPLE(?wkt) AS ?wkt WHERE {\n" +
			"?place geo:geometry ?wkt.\n" +
			"} GROUP BY ?place\n" +
			"LIMIT 10000";
			if (iteration && iteration > 0) {
				query += " OFFSET " + (iteration*limit);
			}
		console.log(query);
	}
	else if (type === "georss_c") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT COUNT(DISTINCT ?place) WHERE {\n" +
			"?place georss:point ?point.\n" +
			"}";
		console.log(query);
	}
	else if (type === "georss") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT DISTINCT ?place SAMPLE(?point) AS ?point WHERE {\n" +
			"?place georss:point ?point.\n" +
			"} GROUP BY ?place\n" +
			"LIMIT 10000";
			if (iteration && iteration > 0) {
				query += " OFFSET " + (iteration*limit);
			}
		console.log(query);
	}
	else if (type === "degrees_c") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT COUNT(DISTINCT ?place) WHERE {\n" +
			"?place dbp:latDegrees ?lat.\n" +
			"?place dbp:longDegrees ?lon.\n" +
			"}";
		console.log(query);
	}
	else if (type === "degrees") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT DISTINCT ?place SAMPLE(?lat) AS ?lat SAMPLE(?lon) AS ?lon WHERE {\n" +
			"?place dbp:latDegrees ?lat.\n" +
			"?place dbp:longDegrees ?lon.\n" +
			"} GROUP BY ?place\n" +
			"LIMIT 10000";
				if (iteration && iteration > 0) {
				query += " OFFSET " + (iteration*limit);
			}
		console.log(query);
	}
	else if (type === "wd") {
		var url = "http://lod.openlinksw.com/sparql";
		var query =
			"PREFIX : <http://www.wikidata.org/entity/>\n" +
			"PREFIX wdo: <http://www.wikidata.org/ontology#>\n" +
			"SELECT DISTINCT ?place ?lat ?lon WHERE {\n" +
			"?place :P625c ?coords .\n" +
			"?coords wdo:latitude ?lat .\n" +
			"?coords wdo:longitude ?lon .\n" +
			"?coords wdo:globe :Q2 .\n" +
			"} LIMIT 10000";
			if (iteration && iteration > 0) {
				query += " OFFSET " + (iteration*limit);
			}
		console.log(query);
	}
	else showWarning("Query type unknown");
	var queryUrl = url+"?query="+encodeURIComponent(query)+"&format=json&callback=?";
	return queryUrl;
}
