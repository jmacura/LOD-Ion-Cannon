/* JavaScript Document */
/** This Source Code Form is subject to the terms of the Mozilla Public
	* License, v. 2.0. If a copy of the MPL was not distributed with this
	* file, You can obtain one at http://mozilla.org/MPL/2.0/.
	* @author jmacura 2016, 2020 */

/** global variables */
var count = 0;
var dataBlob = null;
var limit = 10000;
var endpointUrl = '';

/**
 * 1st action
 * This just counts the number of results
 */
function getCount() {
	endpointUrl = $('#url').val();
	var query = $('#count').val();
	limit = $('#limit').val();
	showInfo(`Using ${endpointUrl} as a target endpoint`);
	var queryUrl = queryBuilder(endpointUrl, query, limit, -1);
	//console.log(queryUrl);
	showInfo("Retrieving count of results");
	$.ajax({
		dataType: "json",
		url: queryUrl,
	}).done(function (data) {
		count = data.results.bindings[0]["callret-0"].value;
		showInfo(`There are ${count} results for your query, which will be split into ${Math.ceil(count / limit)} partial queries`);
		showNextButton();
		console.log(count);
	}).fail(function (jqXHR, status, err) {
		showError(`${status}: ${err}`);
	});
}

/**
 * 2nd action
 * This just retrieves the data
 * @returns {void} Only if you use some ancient browser
 */
function retrieveData() {
	if (!window.Blob) {
		showError("Yo browsa no suporr blub!");
		return;
	}
	var query = $('#query').val();
	var iteration = 1;
	var successfull = 0;
	var resultsNumber = Math.ceil(count/limit);
	showInfo(`Sending ${query.slice(0, 30)}... query per partes`);
	showInfo(`Limit is set to ${limit}`);
	while(iteration <= resultsNumber) {
		console.log(iteration);
		$.ajax({
			dataType: "json",
			url: queryBuilder(endpointUrl, query, limit, iteration-1)
		}).done(function (_data) {
			successfull++;
			//console.log(_data);
			var results = convertToCSV(_data.results.bindings);
			if (dataBlob != null) {
				dataBlob = new Blob([dataBlob, new Blob([results])], { type: "text/csv;charset=utf-8" });
			}
			else {
				var vars = _data.head.vars;
				var str = '';
				for (var i in vars) {
					if (str != '') str += ',';
					str += vars[i];
				}
				str += "\r\n";
				dataBlob = new Blob([str, results], { type: "text/csv;charset=utf-8" });
			}
			//console.log(iteration, successfull);
			if (successfull >= resultsNumber) {
				showInfo(`${successfull} queries successfully finished.`);
				showNextButton();
			}
		}).fail(function (jqXHR, status, err) {
			showError(`${status}: ${err}`);
		});
		iteration++;
	}
	showInfo(`${resultsNumber} queries successfully fired.`);
}

/**
 * 3rd action
 * This just saves the data as a downloaded file
 */
function saveData() {
	var fname = $('#filename').val();
	saveAs(dataBlob, fname);
}

/**
 * Converter from JSON query result 2 CSV
 *
 * @private
 * @param {*} objArray
 * @returns {String}
 */
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
				else { line += array[i][index].value };
			//console.log(item);
		}
		str += line + '\r\n';
	}
	return str;
}

/**
 *
 * @private
 * @param {String} url URL of the endpoint
 * @param {String} queryBase The body of the query
 * @param {Number} limit Maximum number of result retreived in single query
 * @param {Number} iteration Current iteration, to align OFFSET setting accordingly
 * @returns {String} Full URL which will be sent over AJAX to the SPARQL endpoint
 */
function queryBuilder(url, queryBase, limit, iteration) {
	var q = queryBase;
	if (iteration && iteration > 0) {
		q += `LIMIT ${limit} OFFSET ${iteration * limit}`;
	}
	return url + "?query=" + encodeURIComponent(q) + "&format=json&callback=?";
}
