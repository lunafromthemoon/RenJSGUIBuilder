const express = require("express"),
  router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const guisDir = '../guis/';
const buildDir = '../builds/';

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

function updateGuiList(name,resolution,preview){
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

router.get('/clone_gui/:toClone/:newName', (req, res, next) => {
  var toClone = req.params.toClone
  var newName = req.params.newName
  fs.readFile(guisDir+'guis.json', (err, data) => {
    let guis = (err) ? []  : JSON.parse(data);
    let gui = guis.find(x => x.name === toClone)
    guis.push({name:newName,resolution:gui.resolution,preview:gui.preview})
    fs.writeFileSync(guisDir+'guis.json', JSON.stringify(guis));
    ncp(guisDir+gui.name, guisDir+newName, function (err) {
      fs.readFile(`${guisDir}${newName}/gui_config.json`, (err, data) => {
        var newGuiConfig = JSON.parse(data);
        newGuiConfig.name = newName;
        fs.writeFileSync(`${guisDir}${newName}/gui_config.json`, JSON.stringify(newGuiConfig));
        res.json({"cloned":true})
      });
    });
  });
});

router.get('/remove_gui/:guiName', (req, res, next) => {
  fs.readFile(guisDir+'guis.json', (err, data) => {
    let guis = (err) ? []  : JSON.parse(data);
    guis.splice(guis.findIndex(item => item.name === req.params.guiName), 1)
    fs.writeFileSync(guisDir+'guis.json', JSON.stringify(guis));
    fs.rmdirSync(guisDir+req.params.guiName, { recursive: true });
    res.json({"removed":true})
  });
});

router.post('/save_gui/:guiName', (req, res, next) => {
  var gui = JSON.parse(req.body.gui)
  updateGuiList(gui.name,gui.resolution,gui.preview)
  fs.writeFileSync(guisDir+`${gui.name}/gui_config.json`, req.body.gui);
  res.json({"saved":true})
});

router.get('/generate_gui/:guiName', (req, res, next) => {
  var guiName = req.params.guiName
  fs.readFile(guisDir+`${guiName}/gui_config.json`, (err, data) => {
    generateGui(guiName,data);
    res.json({"generated":true})
  });
  
});

const ncp = require('ncp').ncp;
ncp.limit = 16;
 
const yaml = require('js-yaml');

function generateGui(guiName,gui) {
  gui.madeWithRenJSBuilder = true;
  gui.assetsPath = 'assets/gui/'
  var buildPath = buildDir + guiName + "/";
  fs.mkdirSync(buildPath+gui.assetsPath, { recursive: true });
  ncp(guisDir+guiName, buildPath+gui.assetsPath, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('done!');
    // check files and remove repeated
    fs.readdirSync(buildPath+gui.assetsPath).forEach(file => {
      console.log(file);
      var asset = findAsset(gui,file);
      if (!asset){
        fs.unlinkSync(file)
      } 
    });
    generateRenJSConfig(gui,buildPath,gui.assetsPath);
    generateFontsCss(gui,buildPath,gui.assetsPath);
    generateGuiYAML(gui,buildPath)
  });
}

// function findRepeatedAsset(gui,asset) {
//   if (asset.type == 'audio'){
//     return;
//   }
// }

function findAsset(gui,fileName) {
  var lists = ['images','spritesheets','fonts'];
  for (var j = lists.length - 1; j >= 0; j--) {
    
    for (var i = gui.assets[lists[j]].length - 1; i >= 0; i--) {
      if (gui.assets[lists[j]][i].fileName == fileName){
        return {name: gui.assets[lists[j]][i].name, type:lists[j], index:i};
      }
    }
  }
  for (var key in gui.assets.audio) {
    if (gui.assets.audio[key].fileName == fileName){
      return {name: key, type:'audio'};
    }
  }
  return null;
}

function generateGuiYAML(gui,buildPath){
  const doc = yaml.safeDump(gui);
  console.log(doc);
  fs.writeFileSync(buildPath+'GUI.yaml', doc);
}

function generateFontsCss(gui,buildPath,assetsPath) {
  var fontsCSS = "";
  for (var i = gui.assets.fonts.length - 1; i >= 0; i--) {
    var font = gui.assets.fonts[i];
    fontsCSS += `\
      @font-face {\
          font-family: '${font.name}';\
          src: url('/${assetsPath}/${font.fileName}');\
          src: url('/${assetsPath}/${font.fileName}').format('truetype');\
          font-weight: normal;\
          font-style: normal;\
      }\n`
  }
  fs.writeFileSync(buildPath+assetsPath+'fonts.css', fontsCSS);
}

function generateRenJSConfig(gui,buildPath,assetsPath) {
  var splash = {};
  if (gui.config.loader.background){
    splash.loadingScreen = `${assetsPath}/${gui.config.loader.background.fileName}`;
  }
  if (gui.config.loader['loading-bar']){
    splash.loadingBar = {
      asset: `${assetsPath}/${gui.config.loader['loading-bar'].fileName}`,
      position: {
        x: parseInt(gui.config.loader['loading-bar'].x),
        y: parseInt(gui.config.loader['loading-bar'].y)
      },
      size: {
        w: parseInt(gui.config.loader['loading-bar'].width),
        h: parseInt(gui.config.loader['loading-bar'].height)
      }
    }
  }
  var configFile = {
    w : gui.resolution[0],
    h : gui.resolution[1],
    mode: "AUTO",
    scaleMode: "SHOW_ALL",
    splash: splash,
    logChoices: true,
    fonts: `${assetsPath}/fonts.css`,
    guiConfig: "GUI.yaml",
    storySetup: "Setup.yaml",
    storyText: [ "YourStory.yaml" ],
  }
  fs.writeFileSync(buildPath+'config.json', JSON.stringify(configFile));
}


function sameFile(f1,f2) {
  var fileBuf1 = fs.readFileSync(f1);
  var fileBuf2 = fs.readFileSync(f2);
  return fileBuf1.equals(fileBuf2)
}

module.exports = router;
