/**
 * Created by drawat on 12/26/14.
 */

module.exports = function(mongoose, Schema) {
    var courseSchema = new Schema({
        course: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        isActive: {
            type: Boolean,
            required: true,
            default: false
        },
        turnTime: {
            type: Number,
            required: true,
            default: 0
        },
        isRemoteSignupEnabled: {
            type: Boolean,
            required: true,
            default: false
        },
        isQuestionMandatory: {
            type: Boolean,
            required: true,
            default: false
        }
    });

    return mongoose.model('course', courseSchema);
};