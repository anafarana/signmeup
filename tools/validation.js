/**
 * Created by afarook on 01/02/15.
 */

/**
* returns which fields are missing in an object
*/
exports.getMissingFields = function(object, fields) {
	var missingFields = [];

	fields.forEach(function(field) {
		console.log(object);
		if (!object.hasOwnProperty(field)) {
			missingFields.push(field);
		}
	});

	return missingFields;

}