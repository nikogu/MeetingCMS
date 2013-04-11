//验证模块
function verify(type, value, value2) {
        switch ( type ) {
            case 'email':
                return !!(/[\w\d_\-\.]+@[\w\d_\-\.]+\.[\w]+/ig.test(value));
            break;

            case 'illegal':
                return !!/[\s%^&#$\/\\]+/ig.test(value);
            break;

            case 'null':
                return !!(value.replace(/\s*/ig, '').length > 0);
            break;

            case 'twice':
                return !!(value == value2);
            break;

            case 'length':
                return !!(value.length >= 6);
            break;

            default:
            break;
        }
    }

    module.exports = verify