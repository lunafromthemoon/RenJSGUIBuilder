
var preloader = {
  preload: function() {
    for (var menu in gui.assets ) {
      if (menu=='fonts') continue;
      var singleImgs = ['name-box','message-box','background']
      for (var i = singleImgs.length - 1; i >= 0; i--) {
        if (singleImgs[i] in gui.assets[menu]) {
          var asset = gui.assets[menu][singleImgs[i]];
          var key = singleImgs[i];
          if (key == 'background') key = menu+key;
          game.load.image(key, `assets/${gui.name}/${asset.fileName}`);
        }
      }
      var singleSpr = ['loading-bar','choice','interrupt'];
      for (var i = singleSpr.length - 1; i >= 0; i--) {
        if (singleSpr[i] in gui.assets[menu]) {
          var asset = gui.assets[menu][singleSpr[i]];
          var w = parseInt(asset.width)
          var h = parseInt(asset.height)
          game.load.spritesheet(singleSpr[i], `assets/${gui.name}/${asset.fileName}`,w,h);
        }
      }
      
      if ('images' in gui.assets[menu]) {
        for (var i = gui.assets[menu].images.length - 1; i >= 0; i--) {
          var asset = gui.assets[menu].images[i];
          game.load.image(asset.id,`assets/${gui.name}/${asset.fileName}`)
        }
      }
      var spritesheets = ['animations','buttons','sliders']
      for (var j = spritesheets.length - 1; j >= 0; j--) {
        if (spritesheets[j] in gui.assets[menu]){
          for (var i = gui.assets[menu][spritesheets[j]].length - 1; i >= 0; i--) {
            var asset = gui.assets[menu][spritesheets[j]][i];
            var w = parseInt(asset.width)
            var h = parseInt(asset.height)
            game.load.spritesheet(asset.id,`assets/${gui.name}/${asset.fileName}`,w,h)
          }
        }
      }
    }
  },

  create: function(argument) {
    changeMenu('loader');
  }
}

var gameLoader = {

  spriteRefs: {},

  create: function () {
    var singleComponents = ['background','loading-bar','name-box','message-box','ctc','choice','interrupt']
    for (var i = singleComponents.length - 1; i >= 0; i--) {
      if (singleComponents[i] in gui.assets[currentMenu]){
        this.loadComponent(singleComponents[i],gui.assets[currentMenu][singleComponents[i]])
      }
    }
    // if ('background' in gui.assets[currentMenu]) this.loadBackground();
    // if ('loading-bar' in gui.assets[currentMenu]) this.loadLoadingBar(gui.assets[currentMenu]['loading-bar']);
    // if ('name-box' in gui.assets[currentMenu]) this.loadNameBox(gui.assets[currentMenu]['name-box']);
    // if ('message-box' in gui.assets[currentMenu]) this.loadMessageBox(gui.assets[currentMenu]['message-box']);
    // if ('ctc' in gui.assets[currentMenu]) this.loadMessageBox(gui.assets[currentMenu]['ctc']);
    var components = ['images','animations','buttons','sliders','labels']
    for (var j = components.length - 1; j >= 0; j--) {
      if (components[j] in gui.assets[currentMenu]) {
        for (var i = gui.assets[currentMenu][components[j]].length - 1; i >= 0; i--) {
          var config = gui.assets[currentMenu][components[j]][i];
          this.loadComponent(components[j],config)
        }
      }
    }

  },

  loadComponent: function(component,config) {
    switch (component) {
      case 'background' : this.loadBackground(); break;
      case 'loading-bar' : this.loadLoadingBar(config); break;
      case 'images' : this.loadImage(config); break;
      case 'animations' : this.loadImage(config); break;
      case 'buttons' : this.loadButton(config); break;
      case 'labels' : this.loadLabel(config); break;
      case 'sliders' : this.loadSlider(config); break;
      case 'choice' : this.loadChoice(config); break;
      case 'interrupt' : this.loadChoice(config); break;
      case 'name-box' : this.loadNameBox(config); break;
      case 'message-box' : this.loadMessageBox(config); break;
      case 'ctc' : this.loadCtc(config); break;
    }
  },

  addComponent: function(component,config) {
    var listComponent = ['slider','image','button','animations'];
    var componentName = component;
    if (listComponent.includes(component)){
      componentName+='s';
      if (!(componentName in gui.assets[currentMenu])){
        gui.assets[currentMenu][componentName] = []
      }
      gui.assets[currentMenu][componentName].push(config)
    } else {
      if (this.spriteRefs[currentMenu+component]){
        // remove old unique component
        this.spriteRefs[currentMenu+component].destroy();
      }
      gui.assets[currentMenu][component] = config;
    }
    if (component == 'ctc' && config.animationStyle == 'tween'){
      delete config.width
      delete config.height
    }
    this.preloadSpritesheet(config.id,config.fileName,config.width,config.height,function(){
      this.loadComponent(componentName,config);
    })
  },

  // preload assets

  preloadImage: function(id,fileName,callback){
    game.load.image(id, `assets/${gui.name}/${fileName}`);
    game.load.onLoadComplete.addOnce(callback, this);
    game.load.start();
  },

  preloadSpritesheet: function(id,fileName,w,h,callback){
    game.load.spritesheet(id, `assets/${gui.name}/${fileName}`,parseInt(w),parseInt(h));
    game.load.onLoadComplete.addOnce(callback, this);
    game.load.start();
  },

  // show assets

  loadBackground: function(){
    var bg = game.add.sprite(0,0,currentMenu+'background');
    this.spriteRefs[currentMenu+'background'] = bg;
    bg.config = {id: 'background'};
    bg.inputEnabled = true;
    bg.events.onInputDown.add(function(){
      showTools('background');
      selected = bg;
    }, this);
  },

  loadLoadingBar: function(config){
    var sprite = game.add.sprite(config.x,config.y,'loading-bar');
    this.spriteRefs[currentMenu+'loading-bar'] = sprite;
    sprite.config = config;
    sprite.config.id = 'loading-bar'
    this.makeDraggable(sprite,'loading-bar')
  },

  loadSlider: function(config){
    var sprite = game.add.sprite(config.x,config.y,config.id);
    sprite.config = config;
    this.makeDraggable(sprite,'slider',['binding'])
  },

  loadImage: function(config){
    var image = game.add.sprite(config.x,config.y,config.id);
    image.config = config;
    this.makeDraggable(image,'image')
    if (config.isAnimation){
      image.animations.add('do').play(true)
    }
  },

  loadCtc: function(config){
    var sprite = game.add.sprite(config.x,config.y,'ctc');
    this.spriteRefs[currentMenu+'ctc'] = sprite;
    sprite.config = config;
    this.makeDraggable(sprite,'ctc')
    if (config.animationStyle == 'spritesheet'){
      sprite.animations.add('do').play(true)
    } else {
      sprite.alpha = 0;
      sprite.tween = game.add.tween(sprite).to({ alpha: 1 }, 400, Phaser.Easing.Linear.None,true,0,-1);
    }
  },

  loadButton: function(config){
    var image = game.add.button(config.x,config.y,config.id,function(){
      console.log('click on button')
    },0,1,2,0);
    image.config = config;
    this.makeDraggable(image,'button',['binding','slot'])
  },

  loadLabel: function(config) {
    var color = config.color ? config.color : "#ffffff"
    var text = game.add.text(config.x, config.y, config.text, {font: config.size+'px '+config.font, fill: color});
    text.config = config;
    this.makeDraggable(text,'label',['text','color','size','font'])
  },

  loadChoice: function(config) {
    config.sample = 2;
    var x = (config.isBoxCentered) ? gui.resolution[0]/2 - config.width/2 : config.x;
    var y = (config.isBoxCentered) ? gui.resolution[1]/2 - (config.height*config.sample + parseInt(config.separation)*(config.sample-1))/2 : config.y;
    var chBox = createChoiceBox(x,y,0,config);
    chBox.config = config;
    chBox.nextChoices = []
    this.spriteRefs[currentMenu+config.choiceType] = chBox;
    for (var i = 1; i < config.sample; i++) {
      console.log("Adding 1 choice")
      var nextChoice = createChoiceBox(0,0,i,config);
      chBox.addChild(nextChoice);
      chBox.nextChoices.push(nextChoice)
      
    }
    chBox.nextChoices[config.sample-2].text.fill = config['chosen-color'];
    if (!config.isBoxCentered){
      this.makeDraggable(chBox,'choice',['sample','separation','font','color','chosen-color','size','align','offset-x','offset-y'])
    } else {
      this.makeDraggable(chBox,'choice',['sample','separation','font','color','chosen-color','size','align','offset-x','offset-y'],true)
    }
  },

  loadNameBox: function(config) {
    var sprite = game.add.sprite(config.x,config.y,'name-box');
    this.spriteRefs[currentMenu+'name-box'] = sprite;
    sprite.config = config;
    var text = game.add.text(0,0, "Char Name", {font: config.size+'px '+config.font, fill: config.color});
    changeTextPosition(sprite,text, config)
    sprite.name = text;
    sprite.addChild(text);
    this.makeDraggable(sprite,'name-box',['size','font','color','align','offset-x','offset-y'])
  },

  loadMessageBox: function(config) {
    var sprite = game.add.sprite(config.x,config.y,'message-box');
    this.spriteRefs[currentMenu+'message-box'] = sprite;
    sprite.config = config;
    var textSample = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    var text = game.add.text(config['offset-x'],config['offset-y'], textSample, {font: config.size+'px '+config.font, fill: config.color});
    text.wordWrap = true;
    text.align = config.align;
    text.wordWrapWidth = config['text-width'];
    sprite.message = text;
    sprite.addChild(text);
    this.makeDraggable(sprite,'message-box',['size','font','color','align','offset-x','offset-y','text-width'])
  },

  makeDraggable: function(sprite,name,otherProps,notDraggable){
    sprite.inputEnabled = true;
    sprite.input.dragDistanceThreshold = 3;
    sprite.listComponent = name+'s';
    function selectImage(){
      selected = sprite;
      $(`.asset-x`).val(selected.x);
      $(`.asset-y`).val(selected.y);

      if (otherProps) {
        for (var i = 0; i < otherProps.length; i++) {
          var prop = otherProps[i];
          console.log(prop)
          console.log(selected.config[prop])
          $(`#${name}-${prop}`).val(selected.config[prop]);
        }
      }
      showTools(name);
    }

    sprite.events.onInputDown.add(selectImage, this);
    sprite.events.onDragStart.add(selectImage, this);
    sprite.events.onDragStop.add(function(){
      $(`.asset-x`).val(selected.x);
      $(`.asset-y`).val(selected.y);
      selected.config.x = selected.x;
      selected.config.y = selected.y;
    }, this);
    if (!notDraggable) sprite.input.enableDrag(true);
  },

  addFont: function (name, fileName) {
    gui.assets[currentMenu].push({fileName:fileName,name:name});
    game.add.text(gui.resolution[0], gui.resolution[1], name, {font: '42px '+name, fill: "#ffffff"});
  },

  addLabel: function(x,y,size,text,font,color) {
    if ( !('labels' in gui.assets[currentMenu])){
      gui.assets[currentMenu].labels = []
    }
    var config = {x:x,y:y,size:size,text:text,font:font,color:color};
    gui.assets[currentMenu].labels.push(config);
    this.loadLabel(config)
  },
}

function createChoiceBox(start_x,start_y,index,config) {
  var separation = index*(parseInt(config.height)+parseInt(config.separation));
  console.log(separation)
  var chBox = game.add.button(start_x, start_y+separation, config.choiceType,function(){
      console.log(`click on ${config.choiceType} ${index}`)
    },0,1,2,0);
  var text = game.add.text(0,0, `Option ${index}`, {font: config.size+'px '+config.font, fill: config.color});
  changeTextPosition(chBox,text, config)
  chBox.text = text;
  chBox.addChild(text);
  return chBox;
}

function changeTextPosition(sprite,text, config) {
  if (config.isTextCentered) {
      text.setTextBounds(0,0, sprite.width, sprite.height);
      text.boundsAlignH = 'center';
      text.boundsAlignV = 'middle';
    } else {
      var offsetX = parseInt(config['offset-x']);
      var offsetY = parseInt(config['offset-y']);
      text.setTextBounds(offsetX,offsetY, sprite.width, sprite.height);
      text.boundsAlignH = config.align;
      text.boundsAlignV = 'top'
    }
}

function changeMenu(menu){
  if (menu!=currentMenu){
    $(".menu-section").removeClass('active');
    $(".menu-title").html($(`.menu-${menu} > a`).html());
    $(`.menu-${menu}`).addClass('active');
    $(".asset-add").hide();
    $(`.asset-${menu}`).show();
    $('.tools').hide()
    currentMenu = menu;
    if(menu == "fonts"){
      $("#canvas-container").hide();
      $("#fonts-container").show();
    } else{
      $(".asset-all").show();
      $("#fonts-container").hide();
      $("#canvas-container").show();
      game.state.start('gameLoader');
    }
  }
}

$('#btn-save-gui').on('click',function(e){
  var str = JSON.stringify(gui);
  window.localStorage.setItem(gui.name,str)
  var guiList = JSON.parse(window.localStorage.getItem('RenJSGuiList'));
  if (!guiList.includes(gui.name)){
    guiList.push(gui.name);
    window.localStorage.setItem('RenJSGuiList',JSON.stringify(guiList))
  }
  $('#btn-save-gui').html('Saved!');
  setTimeout(function() {
    $('#btn-save-gui').html('Save');
  }, 2000);
})

function genAssetId(asset) {
    gui.assetCounter++;
    return asset+gui.assetCounter;
  }

// -------------------------------------------------------------------------
// Init
// -------------------------------------------------------------------------

$('.colorpicker-component').colorpicker();

function init(guiName,resolution) {
  gui = window.localStorage.getItem(guiName)
  var loaded = false;
  if (!gui){
    var res = resolution.split(",")
    gui = {
      resolution : [parseInt(res[0]),parseInt(res[1])],
      name: guiName,
      assetCounter: 0
    };
    gui.assets = {
      loader: {},
      main: {},
      settings: {},
      hud: {},
      saveload: {},
      fonts: []
    }
  } else {
    gui = JSON.parse(gui)
    loaded = true;
  }
  game = new Phaser.Game(gui.resolution[0], gui.resolution[1], Phaser.AUTO, "preload-canvas");
  game.state.add('gameLoader', gameLoader);
  
  if (loaded){
    game.state.add('preloader', preloader);
    for (var i = gui.assets.fonts.length - 1; i >= 0; i--) {
      loadFont(gui.assets.fonts[i].name,gui.assets.fonts[i].fileName);
    }
    game.state.start('preloader')
  } else {
    changeMenu('loader');
  }
  
}

// current state
var lastUpload = null;
var selected = null;
var currentMenu = null;
// gui info
var gui = {};
// phaser game object
var game = null;
console.log(guiName)
console.log(resolution)
init(guiName,resolution);