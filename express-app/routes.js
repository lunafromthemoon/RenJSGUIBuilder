const express = require("express"),
  router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const guisDir = '../guis/';

if (!fs.existsSync(guisDir)){
  fs.mkdirSync(guisDir);
}

router.use('/assets', express.static(__dirname + '/' + guisDir));

//GET home page.
router.get("/", function(req, res) {
  fs.readFile(guisDir+'guis.json', (err, data) => {
      let guis = (err) ? []  : JSON.parse(data);
      res.render("index", { title: "RenJS - Your GUIs", guis: JSON.stringify(guis) });
  });
});

router.get("/edit", function(req, res) {
  var name = req.query.name;
  fs.readFile(guisDir+'guis.json', (err, data) => {
      let guis = (err) ? []  : JSON.parse(data);
      let gui = guis.find(x => x.name === name);
      if (!gui) {
        gui = {name:name, resolution: [parseInt(req.query.w),parseInt(req.query.h)], isNew:true};
        res.render("edit", { title: "RenJS - "+name, name: name, gui: JSON.stringify(gui) });
      } else {
        fs.readFile(guisDir+`${name}/gui_config.json`, (err, data) => {
          res.render("edit", { title: "RenJS - "+name, name: name, gui: data });
        });
      }
      
  });
});

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
    console.log("Changing name")
    cb(null, req.params.asset + path.extname(file.originalname))
  }
})
 
var upload = multer({ storage: storage })

router.post('/upload_asset/:guiName/:asset', upload.single('file'), (req, res, next) => {
  const file = req.file
  if (!file) {
  	console.log("No file")
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  var ext = path.extname(file.originalname)
  var fileName = req.params.asset + ext
  console.log(fileName)
  res.json({"fileName":fileName})
  
});

function updateGuiList(name,res,preview){
  fs.readFile(guisDir+'guis.json', (err, data) => {
    let guis = (err) ? []  : JSON.parse(data);
    let gui = guis.find(x => x.name === name)
    if (!gui){
      guis.push({name:name,resolution:resolution,preview:preview});
    } else {
      gui.preview = preview;
    }
    fs.writeFileSync(guisDir+'guis.json', JSON.stringify(guis));
  });
}

router.post('/save_gui/:guiName', (req, res, next) => {
  var gui = JSON.parse(req.body.gui)
  updateGuiList(gui.name,gui.res,gui.preview)
  fs.writeFileSync(guisDir+`${gui.name}/gui_config.json`, req.body.gui);
  res.json({"saved":true})
});


function sameFile(f1,f2) {
  var fileBuf1 = fs.readFileSync(f1);
  var fileBuf2 = fs.readFileSync(f2);
  return fileBuf1.equals(fileBuf2)
}

module.exports = router;
