const express = require("express"),
  router = express.Router();

//GET home page.
router.get("/", function(req, res) {
  res.render("index", { title: "RenJS - Your GUIs" });
});

router.get("/edit", function(req, res) {
  res.render("edit", { title: "RenJS - New GUI" });
});

router.get("/pageThree", function(req, res) {
  res.render("pageThree", { title: "Page 3" });
});

router.get("/pageFour", function(req, res) {
  res.render("pageFour", { title: "Page 4" });
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const guisDir = '../guis/';
if (!fs.existsSync(guisDir)){
  fs.mkdirSync(guisDir);
}
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
  	var dir = guisDir+req.params.guiName;
  	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir);
	  }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    cb(null, req.params.asset + path.extname(file.originalname))
  }
})
 
var upload = multer({ storage: storage })

router.post('/upload_asset/:guiName/:asset', upload.single('file'), (req, res, next) => {
	console.log("")

  const file = req.file
  if (!file) {
  	console.log("No file")
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  var ext = path.extname(file.originalname)
  var fileName = req.params.asset + ext
  if (ext == '.ttf')
  res.json({"fileName":fileName})
  
});

module.exports = router;
