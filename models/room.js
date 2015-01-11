/**
 * Created by afarook on 01/02/15.
 */

module.exports = function(mongoose, Schema) {
    var roomSchema = new Schema({
        name: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        IPAddress: {
            type: String,
            required: true
        }
    });

    return mongoose.model('room', roomSchema);
};