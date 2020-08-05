
var preloader = {
  preload: function() {
    for (var key in gui.assets.audio){
      var fileName = gui.assets.audio[key].fileName
      game.load.audio(key,`assets/${gui.name}/${fileName}`);
    }
    for (var key in gui.assets.images){
      var asset = gui.assets.images[key];
      game.load.image(asset.name, `assets/${gui.name}/${asset.fileName}`);
    }
    for (var key in gui.assets.spritesheets){
      var asset = gui.assets.spritesheets[key];
      game.load.spritesheet(asset.name, `assets/${gui.name}/${asset.fileName}`,asset.w,asset.h);
    }
  },

  create: function(argument) {
    changeMenu('loader');
  }
}

var gameLoader = {

  spriteRefs: {},

  create: function () {
    var singleComponents = ['loading-bar','name-box','message-box','ctc','interrupt','choice','background']
    for (var i = singleComponents.length - 1; i >= 0; i--) {
      if (singleComponents[i] in gui.config[currentMenu]){
        this.loadComponent(singleComponents[i],gui.config[currentMenu][singleComponents[i]])
      }
    }
    var components = ['images','animations','buttons','sliders','labels','saveslot']
    for (var j = components.length - 1; j >= 0; j--) {
      if (components[j] in gui.config[currentMenu]) {
        for (var i = gui.config[currentMenu][components[j]].length - 1; i >= 0; i--) {
          var config = gui.config[currentMenu][components[j]][i];
          this.loadComponent(components[j],config)
        }
      }
    }
    if (gui.config[currentMenu].backgroundMusic){
      this.loadBackgroundMusic(gui.config[currentMenu].backgroundMusic);
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
      case 'interrupt' : this.loadInterrupt(config); break;
      case 'name-box' : this.loadNameBox(config); break;
      case 'message-box' : this.loadMessageBox(config); break;
      case 'ctc' : this.loadCtc(config); break;
      case 'saveslot' : this.loadSaveSlot(config); break;
    }
  },

  addAudio: function(name,audioType,fileName) {
    if(!gui.assets.audio) {
      gui.assets.audio = {};
    }
    gui.assets.audio[name] = {fileName:fileName,name:name,type:audioType};
    this.preloadAudio(name,fileName);
  },

  addComponent: function(component,config,fileName) {
    var listComponent = ['slider','image','button','animations'];
    var componentName = component;
    if (listComponent.includes(component)){
      componentName+='s';
      if (!(componentName in gui.config[currentMenu])){
        gui.config[currentMenu][componentName] = []
      }
      gui.config[currentMenu][componentName].push(config)
    } else {
      if (this.spriteRefs[currentMenu+component]){
        // remove old unique component
        removeAsset(this.spriteRefs[currentMenu+component])
        this.spriteRefs[currentMenu+component].destroy();
      }
      gui.config[currentMenu][component] = config;
    }
    if (component == 'ctc' && config.animationStyle == 'tween'){
      delete config.width
      delete config.height
    }
    if (config.width && config.height){
      config.assetType = "spritesheets";
      this.preloadSpritesheet(config.id,fileName,config.width,config.height,function(){
        this.loadComponent(componentName,config);
      });
    } else {
      config.assetType = "images";
      this.preloadImage(config.id,fileName,function(){
        this.loadComponent(componentName,config);
      });
    }
  },

  // preload assets

  preloadAudio: function(id, fileName, callback) {
    game.load.audio(id, `assets/${gui.name}/${fileName}`);
    if (callback){
      game.load.onLoadComplete.addOnce(callback, this);
    }
    game.load.start();
  },

  preloadImage: function(id,fileName,callback){
    gui.assets.images[id] = {name:id,fileName:fileName};
    game.load.image(id, `assets/${gui.name}/${fileName}`);
    game.load.onLoadComplete.addOnce(callback, this);
    game.load.start();
  },

  preloadSpritesheet: function(id,fileName,w,h,callback){
    gui.assets.spritesheets[id] = {name:id,fileName:fileName,w:parseInt(w),h:parseInt(h)}
    game.load.spritesheet(id, `assets/${gui.name}/${fileName}`,parseInt(w),parseInt(h));
    game.load.onLoadComplete.addOnce(callback, this);
    game.load.start();
  },

  // show assets

  loadBackgroundMusic: function(name,play) {
    if (this.spriteRefs[currentMenu+'backgroundMusic']){
      this.spriteRefs[currentMenu+'backgroundMusic'].destroy();
    }
    if (name == 'none'){
      delete this.spriteRefs[currentMenu+'backgroundMusic'];
      delete gui.config[currentMenu].backgroundMusic;
      return;
    }
    var music = game.add.audio(name);
    this.spriteRefs[currentMenu+'backgroundMusic'] = music;
    gui.config[currentMenu].backgroundMusic = name;
    if (play){
      music.play();  
    }
  },

  loadBackground: function(){
    var bg = game.add.sprite(0,0,currentMenu+'background');
    bg.sendToBack();
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

  loadSaveSlot: function(config){
    var sprite = game.add.sprite(config.x,config.y,config.id);
    sprite.config = config;
    this.makeDraggable(sprite,'saveslot',['slot'])
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
      if (config.sfx && config.sfx != 'none') {
        var sfx = game.add.audio(config.sfx);
        sfx.onStop.addOnce(sfx.destroy);
        sfx.play()
      }
    },1,0,2,0);
    if (image.animations.frameTotal == 2){
      image.setFrames(1,0,1,0)
    }
    image.config = config;
    this.makeDraggable(image,'button',['binding','slot','sfx'])
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
    var chBox = createChoiceBox('choice',x,y,0,config);
    chBox.config = config;
    chBox.nextChoices = []
    this.spriteRefs[currentMenu+'choice'] = chBox;
    for (var i = 1; i < config.sample; i++) {
      var nextChoice = createChoiceBox('choice',0,0,i,config);
      chBox.addChild(nextChoice);
      chBox.nextChoices.push(nextChoice)
      
    }
    chBox.nextChoices[config.sample-2].tint = config['chosen-color'];
    this.makeDraggable(chBox,'choice',['sample','separation','sfx','font','color','chosen-color','size','align','offset-x','offset-y'],config.isBoxCentered)
  },

  loadInterrupt: function (config) {
    if (config.textStyleAsChoice) {
      config.size = gui.config.hud.choice.size
      config.color = gui.config.hud.choice.color
      config.font = gui.config.hud.choice.font
    }
    if (config.textPositionAsChoice) {
      config.isTextCentered = gui.config.hud.choice.isTextCentered;
      config.align = gui.config.hud.choice.align
      config['offset-x'] = gui.config.hud.choice['offset-x']
      config['offset-y'] = gui.config.hud.choice['offset-y']
    }
    if (!config.x) config.x = 0;
    if (!config.y) config.y = 0;
    var intBox = createChoiceBox('interrupt',config.x,config.y,0,config);
    this.spriteRefs[currentMenu+'interrupt'] = intBox;
    intBox.config = config;
    if (config.inlineWithChoice) {
      this.spriteRefs[currentMenu+'choice'].interrupt = intBox;
      this.spriteRefs[currentMenu+'choice'].addChild(intBox);
      arrangeChoices(this.spriteRefs[currentMenu+'choice']);
    } 
    this.makeDraggable(intBox,'interrupt',['separation','font','sfx','color','size','align','offset-x','offset-y'],config.inlineWithChoice)
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
    this.makeDraggable(sprite,'message-box',['size','font','sfx','color','align','offset-x','offset-y','text-width'])
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
    gui.assets.fonts[name] = {fileName:fileName,name:name};
    game.add.text(gui.resolution[0], gui.resolution[1], name, {font: '42px '+name, fill: "#ffffff"});
  },

  addLabel: function(x,y,size,text,font,color) {
    if ( !('labels' in gui.config[currentMenu])){
      gui.config[currentMenu].labels = []
    }
    var config = {x:x,y:y,size:size,text:text,font:font,color:color};
    gui.config[currentMenu].labels.push(config);
    this.loadLabel(config)
  },
}

function findFont(name) {
  if (gui.config.hud['name-box'] && gui.config.hud['name-box'].font == name) return 'name-box';
  if (gui.config.hud['message-box'] && gui.config.hud['message-box'].font == name) return 'message-box';
  if (gui.config.hud['choice'] && gui.config.hud['choice'].font == name) return 'choice';
  if (gui.config.hud['interrupt'] && gui.config.hud['interrupt'].font == name) return 'interrupt';
  for (var menu in gui.config ) {
    if (gui.config[menu].labels) {
      for (var i = gui.config[menu].labels.length - 1; i >= 0; i--) {
        if (gui.config[menu].labels[i].font == name) return 'label';
      }
    }
  }
}

function findAudio(name) {
  if (gui.config.main.backgroundMusic == name) return 'main menu';
  if (gui.config.settings.backgroundMusic == name) return 'settings menu';
  if (gui.config.saveload.backgroundMusic == name) return 'saveload menu';
  if (gui.config.hud['message-box'] && gui.config.hud['message-box'].sfx == name) return 'message-box';
  if (gui.config.hud['choice'] && gui.config.hud['choice'].sfx == name) return 'choice';
  if (gui.config.hud['interrupt'] && gui.config.hud['interrupt'].sfx == name) return 'interrupt';
  for (var menu in gui.config ) {
    if (gui.config[menu].buttons) {
      for (var i = gui.config[menu].buttons.length - 1; i >= 0; i--) {
        if (gui.config[menu].buttons[i].sfx == name) return menu+' menu button';
      }
    }
  }
}

function createChoiceBox(choiceType,start_x,start_y,index,config) {
  var separation = index*(parseInt(config.height)+parseInt(config.separation));
  console.log(separation)
  var chBox = game.add.button(start_x, start_y+separation, choiceType,function(){
      console.log(`click on ${choiceType} ${index}`);
      if (config.sfx && config.sfx != 'none') {
        var sfx = game.add.audio(config.sfx);
        sfx.onStop.addOnce(sfx.destroy);
        sfx.play();
      }
    },1,0,2,0);
  if (chBox.animations.frameTotal == 2 || chBox.animations.frameTotal == 4){
    chBox.setFrames(1,0,1,0)
  }
  console.log("chBox.animations.frameTotal")
  console.log(chBox.animations.frameTotal)
  var text = game.add.text(0,0, `${choiceType} ${index}`, {font: config.size+'px '+config.font, fill: config.color});
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
    $(`.background-music`).hide();
    $("#fonts-container").hide();
    $("#canvas-container").hide();
    $("#audio-container").hide();
    currentMenu = menu;
    if(menu == "fonts" || menu =='audio'){
      $(`#${menu}-container`).show();
    } else {
      if (menu!="loader") $(".asset-all").show();
      if (gui.config[menu].backgroundMusic){
        $(`#background-music`).val(gui.config[menu].backgroundMusic);
      } else {
        $(`#background-music`).val('none');
      }
      
      $(`.background-music-${menu}`).show();
      $("#canvas-container").show();
      game.state.start('gameLoader');
    }
  }
}

$('#btn-save-gui').on('click',function(e){
  try {
    var preview = game.canvas.toDataURL();
  } catch(e) {
    console.log(e)
  }
  
  $('#btn-save-gui').html('Saving...');
  $.ajax({
        url: `/save_gui/${gui.name}` ,
        data: {gui:JSON.stringify(gui),preview:preview},
        dataType: 'json',
        type: 'POST',
        // processData: false,
        // contentType: false,
        success: function (dataR) {
          $('#btn-save-gui').html('Saved!');
          setTimeout(function() {
            $('#btn-save-gui').html('<i class="fas fa-save"></i> Save');
  }, 2000);
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
});

function genAssetId(asset) {
    gui.assetCounter++;
    return asset+gui.assetCounter;
  }

// -------------------------------------------------------------------------
// Init
// -------------------------------------------------------------------------

$('.colorpicker-component').colorpicker();

function init() {
  var loaded = false;
  if (gui.isNew){
    gui.assetCounter = 0;
    gui.config = {
      loader: {},
      main: {},
      settings: {},
      hud: {},
      saveload: {}
    }
    gui.assets = {
      images: {},
      spritesheets: {},
      fonts: {},
      audio: {},
    }
    delete gui.isNew;
  } else {
    // gui = JSON.parse(gui)
    loaded = true;
  }
  $('#btn-generate-gui').click(function(){
    $('#generating-modal').find('.fa-cog').show();
    $('#generating-modal').find('p').hide();
    $('#open-dir').hide()
    $('#generating-modal').modal('show');
    $.ajax({
          url: `/generate_gui/${gui.name}` ,
          type: 'GET',
          success: function (dataR) {
            $('#generating-modal').find('.fa-cog').hide();
            $('#generating-modal').find('p').show();
            $('#open-dir').attr('target',name)
            $('#open-dir').show()
          },
          error: function (xhr, status, error) {
              console.log('Error: ' + error.message);
          }
      });
  });

  $('#open-dir').click(function (argument) {
    $.ajax({
          url: `/open_dir/${gui.name}` ,
          type: 'GET',
          success: function (dataR) {
            console.log(dataR)
          },
          error: function (xhr, status, error) {
              console.log('Error: ' + error.message);
          }
        });
  })



  game = new Phaser.Game(gui.resolution[0], gui.resolution[1], Phaser.AUTO, "preload-canvas");
  game.preserveDrawingBuffer = true;
  game.state.add('gameLoader', gameLoader);
  
  if (loaded){
    game.state.add('preloader', preloader);
    for (var key in gui.assets.fonts) {
    // for (var i = gui.assets.fonts.length - 1; i >= 0; i--) {
      loadFont(key,gui.assets.fonts[key].fileName);
    }
    for (var key in gui.assets.audio) {
      loadAudio(key,gui.assets.audio[key].type,gui.assets.audio[key].fileName);
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
// phaser game object
var game = null;
init();