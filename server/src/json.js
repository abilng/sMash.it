/*
 * Json used for geting a value from a jsonText;
 * Version:1.0
 * (c) 2012-2013 
 */
TypeEnum = {
    STRING: "string",
    NUMBER: "number",
    //INTEGER: "integer",
    BOOLEAN: "boolean",
    OBJECT: "object",
    ARRAY: "array",
    NULL: "null",
    ANY: "any",
    UNDEFINED: "undefined"
    
};
function RealTypeOf(v) {
    if (typeof(v) == TypeEnum.OBJECT) {

        if (v === null) {
            return TypeEnum.NULL;
        }
        if (v.constructor == (new Array).constructor) {
            return TypeEnum.ARRAY;
        }
        return TypeEnum.OBJECT;
    }
    return typeof(v);
}


var Json = new function() {

    /**
     * get value from Array
     *
     * @param: aJsonArray - []
     * @param: keymatch @optinal - is Key matched for parent
     * @note:if MULTIPLE is set get4Array will return Array (if key match found)
     */
    function get4Array (aJsonArray,keymatch) {
        if(keymatch&&keymatch == true){
            if(Json.TYPE == undefined ||Json.TYPE == TypeEnum.ANY ||Json.TYPE == TypeEnum.ARRAY){
                return aJsonArray;
            }
        }
        var result = null;
        if(Json.MULTIPLE)
            result = new Array();

        var keys = Object.keys(aJsonArray);
        for (k in keys) {
            var propertyKey = keys[k];
            var propertyValue = aJsonArray[propertyKey];
            var propertyValueType = RealTypeOf(propertyValue);

            var itemret;

            if (propertyValueType == TypeEnum.OBJECT) {
                itemret = get4Object(propertyValue);
            } else {
                itemret = get4Value(propertyValue);
            }
            if (itemret != null){
                if(Json.MULTIPLE){
                    result.push(itemret);
                } else {
                    result = itemret;
                    break;
                }
            }
        }
        if(Json.MULTIPLE){
            if(result.length == 0) return null;
        } 
        return result;
    }

    /**
     * get value from Primitive Value
     *
     * @param: aJsonValue - string/boolean/number
     * @param: keymatch - is Key matched for parent
     */
    function get4Value (aJsonValue,keymatch) {
        if(keymatch&&keymatch == true){
            if(isTypeMatch(aJsonValue)){
                return aJsonValue;
            }
        }
        return null;
    }

    /**
     * get value from Object(Dict.)
     *
     * @param: aJsonObject - {}
     * @param: keymatch @optinal - is Key matched for parent
     */
	function get4Object (aJsonObject,keymatch) {
        if(keymatch&&keymatch == true){
            if(Json.TYPE == undefined ||Json.TYPE == TypeEnum.ANY || Json.TYPE == TypeEnum.OBJECT){
                return aJsonObject;
            }
        }

        var result = null;
        var keys = Object.keys(aJsonObject);

        for (k in keys) {
            var keymatch = false;
            var retval = null;
            var propertyKey = keys[k];
            var propertyValue = aJsonObject[propertyKey];
            var propertyValueType = RealTypeOf(propertyValue);

            if(propertyKey == Json.KEY){
                keymatch = true;
            }
            
            if (propertyValueType == TypeEnum.OBJECT) {
                retval = get4Object(propertyValue,keymatch);

            } else if (propertyValueType == TypeEnum.ARRAY) {
                retval = get4Array(propertyValue,keymatch);

            } else {
                retval = get4Value(propertyValue,keymatch);
            }
            if(retval != null){
                result = retval;
                break;
            }
        }
        return result;
	}

    function isTypeMatch(v) {
        if(!Json.TYPE || Json.TYPE == TypeEnum.ANY ){
            return true;
        }else {
            return (RealTypeOf(v)==Json.TYPE);
        }
    }

	// ---------- Public Objects ---------- //
    /**
     * Get value of a key in json
     *
     * @param json - JSON in Text(String)
     * @param key - Key
     * @param @optinal type - type of  Value expected.
     * @param @optinal islist - if multiple matches should be return;
     *
     */
    this.Get = function(json,key,type,islist) {
        var jsonObject = null;
        var result = null;

        this.INPUT_JSON_TEXT = json;
        this.TYPE = type;
        this.KEY = key;
        this.MULTIPLE = islist;

        try {
            jsonObject = JSON.parse(Json.INPUT_JSON_TEXT);
        } catch (err) {
            throw (err);
        }

        result = get4Object(jsonObject);
        return result;
    }
};