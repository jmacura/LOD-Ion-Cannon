/* JavaScript Document */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// @author: jmacura 2016

// global variables
var count = 2156000;
var dataBlob = null;

// **** This is just count the number of results ****
function getCount() {
	var queryUrl = queryBuilder("degrees_c");
	$.ajax({
		dataType: "json",
		url: queryUrl,
		success: function(data) {
			count = data.results.bindings[0]["callret-0"].value;
			console.log(count);
		}
	});
	//console.log("end"); nonsens - ajax is async
}

// **** This is just data retrieval fction ****
function retrieveData() {
	var iter = 1;
	var resultsNumber = Math.ceil(count/10000);
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
			else console.log("Yo browsa no suporr blub");
			//console.log(i, iter);
			iter++;
		}
	});
	}
	//console.log("done"); --async => is not relevant
}

function saveData() {
	saveAs(dataBlob, "all-dbp-lat+long.csv");
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
	if (type == "mayor") {
	var url = "http://lod.openlinksw.com/sparql";
	var query =
		"PREFIX : <http://www.wikidata.org/entity/>\n" +
		"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
		"SELECT DISTINCT ?lat ?lon ?citylabel ?mayorlabel WHERE {\n" +
		"?city :P31c/:P279c* :Q515 .\n" +
		"?city :P6s ?statement .\n" +
		"?statement :P6v ?mayor .\n" +
		"?mayor :P21c :Q6581072 .\n" +
		"FILTER NOT EXISTS { ?statement :P582q ?x }\n" +
		"?city :P1082s/:P1082v/<http://www.wikidata.org/ontology#numericValue> ?population .\n" +
		"OPTIONAL {\n" +
			"?city rdfs:label ?citylabel .\n" +
			"FILTER ( LANG(?citylabel) = \"cs\" )\n" +
		"}\n" +
		"OPTIONAL {\n" +
			"?city :P625c/<http://www.wikidata.org/ontology#latitude> ?lat .\n" +
			"?city :P625c/<http://www.wikidata.org/ontology#longitude> ?lon .\n" +
		"}\n" +
		"OPTIONAL {\n" +
			"?mayor rdfs:label ?mayorlabel .\n" +
			"FILTER ( LANG(?mayorlabel) = \"en\" )\n" +
		"}} ORDER BY DESC(?population) LIMIT 100";
	console.log(query);
	}
	else if (type == "latlon_c") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"select count(distinct ?place) where {\n" +
			latlong_base2 +
			"}";
		console.log(query);
	}
	else if (type == "latlong") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"select distinct ?place ?lat ?lon where {\n" +
			latlong_base +
			"} LIMIT 10000";
			if (iteration && iteration > 0) {
				query += "OFFSET " + (iteration*10000);
			}
		console.log(query);
	}
	else if (type == "latdlongd") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"select distinct ?place ?lat ?lon where {\n" +
			latlong_base2 +
			"} LIMIT 10000";
			if (iteration && iteration > 0) {
				query += "OFFSET " + (iteration*10000);
			}
		console.log(query);
	}
	else if (type == "geometry_c") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT count(distinct ?place) where {\n" +
			"?place geo:geometry ?wkt .\n" +
			"}";
		console.log(query);
	}
	else if (type == "geometry") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT distinct ?place ?wkt where {\n" +
			"?place geo:geometry ?wkt.\n" +
			"} LIMIT 10000";
			if (iteration && iteration > 0) {
				query += " OFFSET " + (iteration*10000);
			}
		console.log(query);
	}
	else if (type == "georss_c") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT count(distinct ?place) where {\n" +
			"?place georss:point ?point.\n" +
			"}";
		console.log(query);
	}
	else if (type == "georss") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT distinct ?place ?point where {\n" +
			"?place georss:point ?point.\n" +
			"} LIMIT 10000";
			if (iteration && iteration > 0) {
				query += " OFFSET " + (iteration*10000);
			}
		console.log(query);
	}
	else if (type == "degrees_c") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT count(distinct ?place) where {\n" +
			"?place dbp:latDegrees ?lat.\n" +
			"?place dbp:longDegrees ?lon.\n" +
			"}";
		console.log(query);
	}
	else if (type == "degrees") {
		var url = "http://dbpedia.org/sparql";
		var query =
			"SELECT distinct ?place ?lat ?lon where {\n" +
			"?place dbp:latDegrees ?lat.\n" +
			"?place dbp:longDegrees ?lon.\n" +
			"} LIMIT 10000";
				if (iteration && iteration > 0) {
				query += " OFFSET " + (iteration*10000);
			}
		console.log(query);
	}
	else if (type == "wd") {
		var url = "http://lod.openlinksw.com/sparql";
		var query =
			"PREFIX : <http://www.wikidata.org/entity/>\n" +
			"PREFIX wdo: <http://www.wikidata.org/ontology#>\n" +
			"SELECT distinct ?place ?lat ?lon WHERE {\n" +
			"?place :P625c ?coords .\n" +
			"?coords wdo:latitude ?lat .\n" +
			"?coords wdo:longitude ?lon .\n" +
			"?coords wdo:globe :Q2 .\n" +
			"} LIMIT 10000";
			if (iteration && iteration > 0) {
				query += " OFFSET " + (iteration*10000);
			}
		console.log(query);
	}
	else console.log("query type unknown");
	var queryUrl = url+"?query="+encodeURIComponent(query)+"&format=json&callback=?";
	return queryUrl;
}

/*
 UNION\n" +
			"{\n" +
				"?place dbp:latd ?lat .\n" +
				"?place dbp:longd ?lon .\n" +
			"} UNION\n" +
			"{\n" +
				"?place dbp:latD ?lat .\n" +
				"?place dbp:longD ?lon .\n" +
			"}\n"
*/
