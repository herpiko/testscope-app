/**
 * Validate required fields
 * @param {object} state - the state of the form component
 * @returns {object} result - contains isValid and refreshed validationFields object 
 *
 *  Define validationFields object in state. The keys are the fields that are required. They has some properti:
 *  - type - the type of the value, whether it's string, date bool or number
 *  - isInvalid - the bool state of whether the form is valid or not, to be used in eui component
 *  - errors - the error message that should be shown if the value is invalid, in array
 *  - isValidFunc - (optionl) function to check customized validation, return true if valid
 *
 *  Example:

      this.state = {
        productName: '',
        slug: '',
        value: '',
        status: true,
        date: moment(),
        fixture: false, // for unit testing purpose

        validationFields: {
          productName: {
            type: 'string',
            isInvalid: false,
            errors: ['Nama produk tidak boleh kosong'],
          },
          date: {
            type: 'date',
            isInvalid: false,
            errors: ['Tanggal harus lebih anyar dari 2018'],
            isValidFunc: function(value) {
              let date = new Date(value)
              return (date.getFullYear() > 2018);
            }
          },
          slug: {
            type: 'string',
            isInvalid: false,
            errors: ['Slug hanya boleh mengandung karakter alfabet dengan huruf kecil dan strip (-)'],
            isValidFunc: function(value) {
              let exp = new RegExp('^[a-z](-?[a-z])*$', 'g')
              return exp.test(value) ? true : false;
            }
          },
        }
      }

  ...

  onSave(){
  let state = {...this.state}
  utils.validateFields(state)
  .then((result) => {
    this.setState({validationFields: result.validationFields})
    if (!result.isValid) {
      throw new Error("Invalid");
    }
 ...

 *
 */
const validateFields = state => {
  return new Promise((resolve, reject) => {
    try {
      let fields = { ...state.validationFields };
      let invalids = Object.keys(fields).filter(field => {
        let value = state[field];
        switch (fields[field].type) {
          case "string":
            if (fields[field].isValidFunc) {
              let isValid = fields[field].isValidFunc(value);
              fields[field].isInvalid = isValid ? false : true;
            } else {
              fields[field].isInvalid =
                value && value.length > 0 ? false : true;
            }
            return fields[field].isInvalid ? true : false;
          case "date":
            if (fields[field].isValidFunc) {
              let isValid = fields[field].isValidFunc(value);
              fields[field].isInvalid = isValid ? false : true;
            } else {
              fields[field].isInvalid =
                value && value._isAMomentObject ? false : true;
            }
            return fields[field].isInvalid ? true : false;
          case "bool":
            if (fields[field].isValidFunc) {
              let isValid = fields[field].isValidFunc(value);
              fields[field].isInvalid = isValid ? false : true;
            } else {
              return false;
            }
            return fields[field].isInvalid ? true : false;
          case "number":
            if (fields[field].isValidFunc) {
              let isValid = fields[field].isValidFunc(value);
              fields[field].isInvalid = isValid ? false : true;
            } else {
              return false;
            }
            return fields[field].isInvalid ? true : false;
          default:
            return false;
        }
      });
      resolve({
        isValid: invalids.length > 0 ? false : true,
        validationFields: fields
      });
    } catch (err) {
      reject(err);
    }
  });
};

const copyStringToClipboard = (str) => {
  var el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style = {position: 'absolute', left: '-9999px'};
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}


const Utils = {
  validateFields,
  copyStringToClipboard
};

export default Utils;
