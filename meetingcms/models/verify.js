//验证模块
function verify(type, value, value2) {
        switch ( type ) {
            case 'isEmail':
                return !!(/[\w\d_\-\.]+@[\w\d_\-\.]+\.[\w]+/ig.test(value));
            break;

            case 'isIllegal':
                return !!/[\s%^&#$\/\\]+/ig.test(value);
            break;

            case 'isNull':
                return !(value.replace(/\s*/ig, '').length > 0);
            break;

            case 'isTwiceEqual':
                return !!(value == value2);
            break;

            case 'isLengthOk':
                return !!(value.length >= 6);
            break;

            default:
            break;
        }
    }

    module.exports = verify