/**
 * Created by afarook on 01/02/15.
 */

/**
* creates error reponse and returns it
*/
exports.returnError = function(code, message, response) {
	var error = {
        code: code,
        msg: message
    };

    console.error('[', new Date(), ']\t', message);
    response.status(code).send(error).end();
    return;
}