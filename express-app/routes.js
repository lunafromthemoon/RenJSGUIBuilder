const express = require("express"),
  router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf')
const ncp = require('ncp').ncp;
ncp.limit = 16;
const yaml = require('js-yaml');
const unzipper = require('unzipper');


let workspaceDir, guisDir, buildDir,exportDir;
let workspaceReady = false;


function loadWorkspace() {
  if (fs.existsSync('workspace_config.json')){
    fs.readFile('workspace_config.json', (err, data) => {
      let workspaceConfig = JSON.parse(data);
      workspaceDir = workspaceConfig.path;
      createWorkspace();
    });
  } else {
    workspaceDir = path.join(__dirname,'../../../DATA/');
    createWorkspace();
  }
}

function createWorkspace(callback) {
  try {
    if (!callback) callback = ()=>{console.log("Workspace Created!")};
    guisDir = path.join(workspaceDir,'guis/');
    buildDir = path.join(workspaceDir,'builds/');
    exportDir = path.join(workspaceDir,'exports/');

    if (!fs.existsSync(guisDir)){
      fs.mkdirSync(guisDir, { recursive: true });
    }
    var contents = fs.readdirSync(guisDir);
    if (!contents || contents.length == 0){
      fs.copyFileSync(path.join(__dirname,'/templates/workspace.zip'), path.join(guisDir,'workspace.zip'));
      fs.createReadStream(path.join(guisDir,'workspace.zip'))
        .pipe(unzipper.Extract({ path: guisDir })
        .on('finish',callback));
    }

    router.use('/assets', express.static(guisDir));
    workspaceReady = true;
  } catch(error){
    console.log("Error creating workspace");
    console.log(error);
    workspaceReady = false;
  }
  
}

loadWorkspace();

//GET home page.
router.get("/", function(req, res) {
  if (!workspaceReady){
    res.render("index", { title: "RenJS - Your GUIs", workspace: 'error' });
  } else {
    fs.readFile(path.join(guisDir,'guis.json'), (err, data) => {
      let guis = (err) ? []  : JSON.parse(data);
      res.render("index", { title: "RenJS - Your GUIs", guis: JSON.stringify(guis), workspace: workspaceDir });
    });
  }
});

router.get("/edit", function(req, res) {
  var name = req.query.name;
  fs.readFile(path.join(guisDir,'guis.json'), (err, data) => {
      let guis = (err) ? []  : JSON.parse(data);
      let gui = guis.find(x => x.name === name);
      if (!gui) {
        gui = {name:name, resolution: [parseInt(req.query.w),parseInt(req.query.h)], isNew:true};
        res.render("edit", { title: "RenJS - "+name, name: name, gui: JSON.stringify(gui) });
      } else {
        fs.readFile(path.join(guisDir,`${name}/gui_config.json`), (err, data) => {
          res.render("edit", { title: "RenJS - "+name, name: name, gui: data });
        });
      }
  });
});

// SET STORAGE
var assetsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
  	var dir = path.join(guisDir,req.params.guiName);
  	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir, { recursive: true });
	  }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    cb(null, req.params.asset + path.extname(file.originalname))
  }
})
 
var uploadAssets = multer({ storage: assetsStorage })

router.post('/upload_asset/:guiName/:asset', uploadAssets.single('file'), (req, res, next) => {
  const file = req.file
  if (!file) {
  	console.log("No file")
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  var ext = path.extname(file.originalname)
  var fileName = req.params.asset + ext
  // console.log(fileName)
  res.json({"fileName":fileName})
  
});

var uploadGUI = multer({ dest: guisDir })

router.post('/import_gui', uploadGUI.single('file'), (req, res, next) => {
  const file = req.file
  if (!file) {
    console.log("No file")
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  const guiName = file.originalname.replace(".zip","");
  const guiPath = path.join(guisDir,guiName)
  if (fs.existsSync(guiPath)){
    removeGUI(guiName);
  }

  fs.createReadStream(file.path)
    .pipe(unzipper.Extract({ path: guiPath })
    .on('finish',()=>{
      fs.unlinkSync(file.path);
      // zip file extracted, add gui_list.json data to guis.json
      let guiData = JSON.parse(fs.readFileSync(path.join(guiPath,'gui_list.json')));
      updateGuiList(guiData.name,guiData.resolution,guiData.preview);
      res.json({"imported":true})
    }));
});

function updateGuiList(name,resolution,preview){
  let guis = JSON.parse(fs.readFileSync(path.join(guisDir,'guis.json')));
  let gui = guis.find(x => x.name === name)
  if (!gui){
    guis.push({name:name,resolution:resolution,preview:preview,date: new Date()});
  } else {
    gui.preview = preview;
    gui.date = new Date();
  }
  fs.writeFileSync(path.join(guisDir,'guis.json'), JSON.stringify(guis));
}

router.get('/clone_gui/:toClone/:newName', (req, res, next) => {
  var toClone = req.params.toClone
  var newName = req.params.newName
  fs.readFile(path.join(guisDir,'guis.json'), (err, data) => {
    let guis = (err) ? []  : JSON.parse(data);
    let gui = guis.find(x => x.name === toClone)
    guis.push({name:newName,resolution:gui.resolution,preview:gui.preview, date: gui.date})
    fs.writeFileSync(path.join(guisDir,'guis.json'), JSON.stringify(guis));
    ncp(path.join(guisDir,gui.name), path.join(guisDir,newName), function (err) {
      var guiConfigFile = path.join(guisDir,`${newName}/gui_config.json`) ;
      fs.readFile(guiConfigFile, (err, data) => {
        var newGuiConfig = JSON.parse(data);
        newGuiConfig.name = newName;
        fs.writeFileSync(guiConfigFile, JSON.stringify(newGuiConfig));
        res.json({"cloned":true})
      });
    });
  });
});

var zipdir = require('zip-dir');

router.get('/export_gui/:toExport', (req, res, next) => {
  const toExport = req.params.toExport
  const zipFile = path.join(exportDir,toExport+'.zip');
  // create exports dir if it doesn't exist
  if (!fs.existsSync(exportDir)){
    fs.mkdirSync(exportDir, { recursive: true });
  }
  if (fs.existsSync(zipFile)){
    fs.unlinkSync(zipFile)
  }

  const data = fs.readFileSync(path.join(guisDir,'guis.json'));
  let guis = (!data) ? []  : JSON.parse(data);
  // console.log(guis);
  let gui = guis.find(x => x.name === toExport);
  // console.log("gui config");
  // console.log(gui);
  // save gui list data inside the directory
  fs.writeFileSync(path.join(guisDir,toExport,'gui_list.json'), JSON.stringify(gui));
  // zip whole gui directory and save in exports directory
  zipdir(path.join(guisDir,toExport), { saveTo: zipFile }, function (err, buffer) {
    process.send({action:"open_dir",path:exportDir});
    res.json({"exported":true})
  });
});

router.get('/remove_gui/:guiName', (req, res, next) => {
  removeGUI(req.params.guiName);
  res.json({"removed":true})
});

function removeGUI(guiName){
  const data = fs.readFileSync(path.join(guisDir,'guis.json'));
  let guis = (!data) ? []  : JSON.parse(data);
  let idx = guis.findIndex(item => item.name === guiName);
  if (idx!=-1){
    guis.splice(idx, 1);
    fs.writeFileSync(path.join(guisDir,'guis.json'), JSON.stringify(guis));
    rimraf.sync(path.join(guisDir,guiName));
  }
}

router.post('/save_gui/:guiName', (req, res, next) => {
  var gui = JSON.parse(req.body.gui)
  updateGuiList(gui.name,gui.resolution,req.body.preview)
  fs.writeFileSync(path.join(guisDir,`${gui.name}/gui_config.json`), req.body.gui);
  res.json({"saved":true})
});

const process = require('process');

router.get('/change_workspace', (req, res, next) => {
  process.send({action:"select_dir"});
  process.on('message', message => {
    if (message.path){
      fs.writeFileSync('workspace_config.json', JSON.stringify({path: message.path}));
      workspaceDir = message.path;
      createWorkspace(()=>{
        res.json({"workspace":workspaceDir});
      });
    } else {
      res.json({"workspace":workspaceDir,"error":message.error});
    }
  });
});

router.get('/open_workspace', (req, res, next) => {
  if (fs.existsSync(workspaceDir)){
    process.send({action:"open_dir",path:workspaceDir});
    res.json({"opened":true});
  } else {
    res.json({"opened":false});
  }
});

router.get('/open_dir/:guiName', (req, res, next) => {
  var dir = path.join(buildDir,req.params.guiName);
  if (fs.existsSync(dir)){
    process.send({action:"open_dir",path:dir});
    res.json({"opened":true});
  } else {
    res.json({"opened":false});
  }
});

router.get('/generate_gui/:guiName', (req, res, next) => {
  var guiName = req.params.guiName
  fs.readFile(path.join(guisDir,`${guiName}/gui_config.json`), (err, data) => {
    generateGui(guiName,JSON.parse(data));
    res.json({"generated":true})
  });
});

function generateGui(guiName,gui) {
  for (var menu in gui.config){
    if (gui.config[menu].inactive){
      gui.config[menu] = {};
    } else {
      // remove unnecesary values and correct 'other' binding
      if (gui.config[menu].buttons){
        for (var i = gui.config[menu].buttons.length - 1; i >= 0; i--) {
          if (gui.config[menu].buttons[i].binding == 'other'){
            gui.config[menu].buttons[i].binding = gui.config[menu].buttons[i]['other-binding'];
            delete gui.config[menu].buttons[i]['other-binding'];
            delete gui.config[menu].buttons[i].height;
            delete gui.config[menu].buttons[i].width;
          }
        }
      }
    }
  }
  gui.madeWithRenJSBuilder = true;
  gui.assetsPath = 'assets/gui/'
  var buildPath = path.join(buildDir,guiName);
  var assetsPath = path.join(buildPath,gui.assetsPath)
  if (fs.existsSync(buildPath)){
    rimraf.sync(buildPath);
  }
  fs.mkdirSync(assetsPath, { recursive: true });
  ncp(path.join(guisDir,guiName), assetsPath, function (err) {
    if (err) {
      return console.error(err);
    }
    // check files and remove repeated
    fs.readdirSync(assetsPath).forEach(file => {
      var asset = findAsset(gui,file);
      if (!asset){
        fs.unlinkSync(path.join(assetsPath,file))
      } else {
        deleteRepeatedAsset(gui,asset,assetsPath);
      }
    });
    generateRenJSConfig(gui,buildPath,gui.assetsPath);
    generateFontsCss(gui,buildPath,gui.assetsPath);
    generateGuiYAML(gui,buildPath)
  });
}

function deleteRepeatedAsset(gui,asset,path) {
  var repeats = findRepeatedAsset(gui,asset,path);
  for (var i = repeats.length - 1; i >= 0; i--) {
    delete gui.assets[asset.type][repeats[i]];
    for (var menu in gui.config){
      for (var component in gui.config[menu]){
        if (gui.config[menu][component] instanceof Array){
          for (var j = gui.config[menu][component].length - 1; j >= 0; j--) {
            if (gui.config[menu][component][j].id == repeats[i]){
              gui.config[menu][component][j].id = asset.name;
            }
          }
          continue;
        } 
        if (component == "backgroundMusic") {
          if (gui.config[menu][component] == repeats[i]){
            gui.config[menu][component] = asset.name;
          }
          continue;
        } 
        if (gui.config[menu][component].id == repeats[i]){
          gui.config[menu][component].id = asset.name;
        }
      }
    }
  }
}

function findRepeatedAsset(gui,asset,path) {
  var repeats = []
  for (var key in gui.assets[asset.type]) {
    if (asset.name != key && sameFile(path+asset.fileName,path+gui.assets[asset.type][key].fileName)){
      repeats.push(key);
    }
  }
  return repeats;
}

function sameFile(f1,f2) {
  var fileBuf1 = fs.readFileSync(f1);
  var fileBuf2 = fs.readFileSync(f2);
  return fileBuf1.equals(fileBuf2)
}

function findAsset(gui,fileName) {
  for (var type in gui.assets){
    for (var key in gui.assets[type]) {
      if (gui.assets[type][key].fileName == fileName){
        return {name: key, type:type,fileName:fileName};
      }
    }
  }
  return null;
}

function generateGuiYAML(gui,buildPath){
  fs.mkdirSync(path.join(buildPath,'story'), { recursive: true });
  console.log("GUI")
  console.log(gui)
  fs.writeFileSync(path.join(buildPath,'story','GUI.json'), JSON.stringify(gui));
  fs.writeFileSync(path.join(buildPath,'story','GUI.yaml'), yaml.dump(gui));
  fs.copyFileSync(path.join(__dirname,'/templates/SetupTemplate.yaml'), path.join(buildPath,"story",'Setup.yaml'));
  fs.copyFileSync(path.join(__dirname,'/templates/StoryTemplate.yaml'), path.join(buildPath,"story",'Story.yaml'));
  fs.copyFileSync(path.join(__dirname,'/templates/ConfigTemplate.yaml'), path.join(buildPath,"story",'Config.yaml'));
  fs.copyFileSync(path.join(__dirname,'/templates/ReadmeTemplate.txt'), path.join(buildPath,'Readme.txt'));
  fs.copyFileSync(path.join(__dirname,'/templates/indexTemplate.html'), path.join(buildPath,'index.html'));
}

function generateFontsCss(gui,buildPath,assetsPath) {
  var fontsCSS = "";
  for (var key in gui.assets.fonts) {
    var font = gui.assets.fonts[key];
    fontsCSS += `\n
      @font-face {\n
          font-family: '${font.name}';\n
          src: url('${font.fileName}');\n
          src: url('${font.fileName}').format('truetype');\n
          font-weight: normal;\n
          font-style: normal;\n
      }\n`
  }
  fs.writeFileSync(path.join(buildPath,assetsPath,'fonts.css'), fontsCSS);
}

function generateRenJSConfig(gui,buildPath,assetsPath) {

  fs.readFile(path.join(__dirname,'/templates/bootTemplate.js'),'utf8', (err, data) => {
    data = data.replace("GUI_W",gui.resolution[0])
    data = data.replace("GUI_H",gui.resolution[1])
    data = data.replace("GUI_NAME",gui.name);
    if (gui.config.loader){
      var splash = {};
      if (gui.config.loader.background){
        var asset = gui.assets.images[gui.config.loader.background.id]
        splash.background = `${assetsPath}${asset.fileName}`;
      }
      if (gui.config.loader['loading-bar']){
        asset = gui.assets[gui.config.loader['loading-bar'].assetType][gui.config.loader['loading-bar'].id]
        splash.loadingBar = {
          asset: `${assetsPath}${asset.fileName}`,
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
      data = data.replace("GUI_SPLASH",JSON.stringify(splash,null,"  "))
      delete gui.config.loader;
    } else {
      // remove loading screen
      data = data.replace("'loadingScreen': GUI_SPLASH,","");
    }
    
    
    fs.writeFileSync(path.join(buildPath,'boot.js'), data);
  });

}

module.exports = router;
