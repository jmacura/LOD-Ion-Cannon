/* JavaScript Document */
/** This Source Code Form is subject to the terms of the Mozilla Public
	* License, v. 2.0. If a copy of the MPL was not distributed with this
	* file, You can obtain one at http://mozilla.org/MPL/2.0/.
	* @author jmacura 2020 */

/**
	* Displays button for a following action.
	*
	*/
function showNextButton() {
	if ($('#button-query').css('visibility') === 'hidden') {
		$('#button-query').css('visibility', 'visible')
	} else if ($('#button-save').css('visibility') === 'hidden') {
		$('#button-save').css('visibility', 'visible')
	}
}

/**
	* Adds an info text to the log.
	*
	* @param {String} infoMsg Information which should be displayed to the user
	*/
function showInfo(infoMsg) {
	showMessage(infoMsg, 'info');
}

/**
	* Adds a warning text to the log.
	*
	* @param {String} warnMsg Warning which should be displayed to the user
	*/
function showWarning(warnMsg) {
	showMessage(warnMsg, 'warn');
}

/**
 * Adds an error text to the log.
 *
 * @param {String} errorMsg Error message which should be displayed to the user
 */
function showError(errorMsg) {
	showMessage(errorMsg, 'error');
}

/**
 * Private function to be used by specific logging functions.
 * Updates information block element.
 *
 * @private
 * @param {String} message Message which should be appended to the log
 * @param {String} type One of 'error', 'warn', 'info'
 */
function showMessage(message, type) {
	var color;
	switch (type) {
		case 'info': color = '#11dd11'; break;
		case 'warn': color = '#eeee99'; break;
		case 'error': color = '#ee1111'; break;
		default: break;
	}
	var $msg = $(`<p>&nbsp;${message}</p>`).css('border-color', color);
	var infoBlock = $('#info-block');
	//infoBlock.empty(); //remove existing information
	infoBlock.find('p').css('border-color', '#777777');
	infoBlock.prepend($msg); //add new information
}
