/* JavaScript Document */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* @author: jmacura 2020 */

function showNextButton() {
	if ($('#button-query').css('visibility') === 'hidden') {
		$('#button-query').css('visibility', 'visible')
	} else if ($('#button-save').css('visibility') === 'hidden') {
		$('#button-save').css('visibility', 'visible')
	}
}
