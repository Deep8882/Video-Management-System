require("dotenv").config();
var mongodb = require("mongodb");
var multer = require("multer");
const path = require('path');

const CONSTANT = require("./constant");
const ALGO = process.env.ALGO;
const ENCRYPT_KEY = process.env.ENCRYPT_KEY;
const crypto = require("crypto");

exports.isUndefinedOrNull = _isUndefinedOrNull;
exports.isObjEmpty = _isObjEmpty;
exports.isArrEmpty = _isArrEmpty;
exports.isValidObjId = _isValidObjId;
exports.encryptPassword = _encryptPassword;
exports.decryptPassword = _decryptPassword;
exports.isValidObjId = _isValidObjId;
exports.isvalidateEmail = _isvalidateEmail;
exports.isvalidatetitle = _isvalidatetitle;
exports.isvalidatedescription = _isvalidatedescription;
exports.isvalidatesize = _isvalidatesize;
exports.isvalidatecolor = _isvalidatecolor;
exports.isvalidateprice = _isvalidateprice;
exports.fileUploadfunction = _fileUploadfunction;


//To check id is valid or not.
function _isValidObjId(id) {
  if (!_isUndefinedOrNull(id)) {
    return mongodb.ObjectId.isValid(id);
  } else {
    return false;
  }
}


//valid title
function _isvalidatetitle(title) {
  if (/^[a-zA-Z ]+$/.test(title)) {
    return (true)
  }
  return (false)
}



//valid description
function _isvalidatedescription(description) {
  if (/^[a-zA-Z0-9,.!? ]{10,100}$/.test(description)) {
    return (true)
  }
  return (false)
}


//valid Price
function _isvalidateprice(price) {
  if ("^\d+(?:\.\d{1,2})?(?:,\d+)?$".test(price)) {
    return (true)
  }
  return (false)
}

//valid color
function _isvalidatecolor(color) {
  if (/^[a-z]{3}$/.test(color)) {
    return (true)
  }
  return (false)
}

//valid size
function _isvalidatesize(size) {
  if (/^[S|M|L|XL|XXL]$/.test(size)) {
    return (true)
  }
  return (false)
}





//Check Undefined and null value
function _isUndefinedOrNull(value) {
  if (typeof value == CONSTANT.UNDEFINED || value == null || value == "") {
    return true;
  } else {
    return false;
  }
}

//valid Email
function _isvalidateEmail(email) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return (true)
  }
  return (false)
}


//encrypt Password
function _encryptPassword(value, callback) {
  let iv = crypto.randomBytes(16)
  let cipher = crypto.createCipheriv(ALGO, Buffer.from(ENCRYPT_KEY), iv)
  let encrypted = cipher.update(value);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  callback(iv.toString("hex") + ":" + encrypted.toString("hex"))
}

//decrypt Password
function _decryptPassword(value, callback) {
  let values = value.split(":")
  let iv = Buffer.from(values.shift(), 'hex')
  let encryptedValue = Buffer.from(values.join(":"), 'hex')
  let decipher = crypto.createDecipheriv(ALGO, Buffer.from(ENCRYPT_KEY), iv)
  let decrypted = decipher.update(encryptedValue);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  callback(decrypted.toString())
}

/*
TYPE:GET
To array is undefined or null or empty.
*/
function _isArrEmpty(arr) {
  return (arr == null || typeof arr === "undefined" || arr.length <= 0)
}

/*
TYPE:GET
To value is undefined or null.
*/
function _isObjEmpty(obj) {
  return obj == null || typeof arr == "undefined" || Object.keys(obj).length <= 0;
}

/*
TYPE:GET
To check id is valid or not.
*/
function _isValidObjId(id) {
  if (!_isUndefinedOrNull(id)) {
    return mongodb.ObjectId.isValid(id);
  } else {
    return false;
  }
}

/*
Generate uniqueID  function
*/
function _UUID() {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// file uploading
function _fileUploadfunction(folder, req, res, callback) {
  var files = [];
  var file_name;
  var type;
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      var name = _UUID();
      var date = new Date().getTime();
      if (!req) {
        cb(null, file.fieldname + "-" + date + path.extname(file.originalname));
        file_name =
          file.fieldname + "-" + date + path.extname(file.originalname);
      } else {
        cb(null, name + date + path.extname(file.originalname));
        file_name = name + date + path.extname(file.originalname);
      }
      type = file.fieldname;
      if (type == CONSTANT.CATEGORY_IMAGE_ONE ||
        CONSTANT.SUB_CATEGORYIMAGE ||
        CONSTANT.POST_IMAGE||
        CONSTANT.POST_IMAGE_ONE ||
        CONSTANT.POST_IMAGE_TWO ) {
        files.push({
          filename: file_name,
          timestamp: date,
          extension: path.extname(file.originalname),
          originalname: file.originalname,
          fieldname: type
        });
      }
    }
  });
  var upload = multer({ storage: storage }).fields([
    { name: CONSTANT.CATEGORY_IMAGE_ONE },
    { name: CONSTANT.SUB_CATEGORYIMAGE },
    { name: CONSTANT.POST_IMAGE },
    { name: CONSTANT.POST_IMAGE_ONE },
    { name: CONSTANT.POST_IMAGE_TWO },
  ]);

  // // to declare some path to store your converted image
  upload(req, res, (err, i) => {
    if (err) {
      callback(err, []);
    } else {
      var res_files = [];
      res_files.push(files);
      callback(null, files);
    }
  });
}