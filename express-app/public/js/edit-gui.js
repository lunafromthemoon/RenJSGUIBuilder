
var listComponent = ['labels','sliders','images','buttons','animations','save-slots'];
var componentLabel = {
  background: "Background Image",
  backgroundMusic: "Background Music",
  'loading-bar': "Loading Bar",
  'message-box': "Message Box",
  'name-box': "Name Box",
  'ctc': "Click to Continue",
  'choice': "Choice Box",
  'interrupt': "Interrupt Box",
  'button': "Button",
  'label': "Label",
  'image': "Image",
  'animation': "Animation",
  'save-slot': "Save Slot",
  'slider': "Slider",
}

var debuggerInfo = null;

var screenScaled = false;

function scaleScreen(){
  if (screenScaled) return;
  // set it so it enters the screen properly
  game.scale.scaleMode = null;
   game.scale.setResizeCallback((scale,parentBounds)=>{
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight-100;

    // try to scale vertically first
    var newScale = windowHeight / gui.resolution[1];  
    var newHeight = windowHeight;
    var newWidth = gui.resolution[0]*newScale;
    if (newWidth>windowWidth){
        // width still doesn't fit, scale horizontally
        newScale = windowWidth / gui.resolution[0];
        newWidth = windowWidth;
        newHeight = gui.resolution[1]*newScale;
    }          
    scale.width = newWidth;
    scale.height = newHeight;
  },game)

  game.renderer.renderSession.roundPixels = true;
  // Phaser.Canvas.setImageRenderingCrisp(game.canvas);
  // game.stage.smoothed = false;
  // Phaser.Canvas.setSmoothingEnabled(game.context, false);


  game.scale.refresh();
  screenScaled = true;
}

var preloader = {

  init: scaleScreen,

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
    // changeMenu('loader');
  }
}

var gameLoader = {

  spriteRefs: {},

  init: scaleScreen,

  create: function () {
    game.stage.backgroundColor = gui.config.general.backgroundColor;

    if (gui.config[currentMenu].elements) {
      for (var i = 0; i < gui.config[currentMenu].elements.length; i++) {
        this.loadComponent(gui.config[currentMenu].elements[i].type,gui.config[currentMenu].elements[i]);
      }
    }
    
    if (gui.config[currentMenu].backgroundMusic){
      this.loadBackgroundMusic(gui.config[currentMenu].backgroundMusic);
    }
  },

  render: function(){
    // if (selected && selected.showDebugBox){
    //   console.log("showgin debug box")
    //   // game.debug.spriteBounds(selected,"#ffff00",true);
    // } else {
    //   game.debug.reset();
    // }
    
  },

  loadComponent: function(component,config) {
    // console.log("loading")
    // console.log(component)
    switch (component) {
      case 'background' : this.loadBackground(config); break;
      case 'loading-bar' : this.loadLoadingBar(config); break;
      case 'image' : this.loadImage(config); break;
      case 'animation' : this.loadImage(config); break;
      case 'button' : this.loadButton(config); break;
      case 'label' : this.loadLabel(config); break;
      case 'slider' : this.loadSlider(config); break;
      case 'choice' : this.loadChoice(config); break;
      case 'interrupt' : this.loadInterrupt(config); break;
      case 'name-box' : this.loadNameBox(config); break;
      case 'message-box' : this.loadMessageBox(config); break;
      case 'ctc' : this.loadCtc(config); break;
      case 'save-slot' : this.loadSaveSlot(config); break;
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
    // console.log("adding component to canvas")
    // console.log(component)
    // console.log(fileName)
    selected = null;
    var componentName = component;

    if (!gui.config[currentMenu].elements){
      gui.config[currentMenu].elements=[];
    }
    config.type = component;
    gui.config[currentMenu].elements.push(config);

    // if (listComponent.includes(component+'s')){
    //   componentName+='s';
    //   if (!(componentName in gui.config[currentMenu])){
    //     gui.config[currentMenu][componentName] = []
    //   }
    //   gui.config[currentMenu][componentName].push(config)
    // } else {
      if (this.spriteRefs[currentMenu+component]){
        // remove old unique component
        removeAsset(this.spriteRefs[currentMenu+component])
        this.spriteRefs[currentMenu+component].destroy();
      }
    //   gui.config[currentMenu][component] = config;
    // }
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
    if (callback){
      game.load.onLoadComplete.addOnce(callback, this);
    }
    game.load.start();
  },

  preloadSpritesheet: function(id,fileName,w,h,callback){
    gui.assets.spritesheets[id] = {name:id,fileName:fileName,w:parseInt(w),h:parseInt(h)}
    game.load.spritesheet(id, `assets/${gui.name}/${fileName}`,parseInt(w),parseInt(h));
    if (callback){
      game.load.onLoadComplete.addOnce(callback, this);  
    }
    
    game.load.start();
  },

  // show assets

  loadBackgroundMusic: function(name) {
    // if (this.spriteRefs[currentMenu+'backgroundMusic']){
    //   this.spriteRefs[currentMenu+'backgroundMusic'].destroy();
    // }
    
    if (name == 'none'){
      // delete this.spriteRefs[currentMenu+'backgroundMusic'];
      delete gui.config[currentMenu].backgroundMusic;
      return;
    }
    if (!gui.config[currentMenu].backgroundMusic){
      addBackgroundMusicTools();
    }
    // var music = game.add.audio(name);
    // this.spriteRefs[currentMenu+'backgroundMusic'] = music;
    gui.config[currentMenu].backgroundMusic = name;
    // if (play){
    //   music.play();  
    // }
  },

  loadBackground: function(config){
    var bg = game.add.sprite(0,0,config.id);
    bg.sendToBack();
    this.spriteRefs[currentMenu+'background'] = bg;
    bg.config = config;
    bg.component = 'background';
    bg.inputEnabled = true;

    let selectBG = ()=>{
      if(debuggerInfo) debuggerInfo.destroy();
      showTools('background');
      selected = bg;
    }

    bg.events.onInputDown.add(selectBG, this);

    const selectMenuItem = $(`<a class="dropdown-item background-item" 
                              href="#">Background</a>`);
    selectMenuItem.click(selectBG);
    $('#selectMenu').append(selectMenuItem);

  },

  loadLoadingBar: function(config){
    var sprite = game.add.sprite(config.x,config.y,config.id);
    this.spriteRefs[currentMenu+'loading-bar'] = sprite;
    sprite.config = config;
    sprite.component = 'loading-bar';
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
    var thumbnail = game.add.graphics(config['thumbnail-x'], config['thumbnail-y']);
    var randomColor = Math.floor(Math.random()*16777215);
    thumbnail.color = randomColor;
    thumbnail.beginFill(randomColor);
    thumbnail.drawRect(0, 0, config['thumbnail-width'], config['thumbnail-height'])
    thumbnail.endFill();
    thumbnail.visible = false;
    sprite.thumbnail = thumbnail;
    sprite.addChild(thumbnail)
    this.makeDraggable(sprite,'save-slot',['slot','thumbnail-x','thumbnail-y','thumbnail-width','thumbnail-height'])
  },

  loadCtc: function(config){
    var sprite = game.add.sprite(config.x,config.y,config.id);
    this.spriteRefs[currentMenu+'ctc'] = sprite;
    sprite.config = config;
    sprite.component = 'ctc';
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
    this.makeDraggable(image,'button',['binding','other-binding','slot','sfx'])
  },

  loadLabel: function(config) {
    config.id = genAssetId('label');
    var color = config.color ? config.color : "#ffffff"
    var text = game.add.text(config.x, config.y, config.text, {font: config.size+'px '+config.font, fill: color});
    text.lineSpacing = config.lineSpacing ? config.lineSpacing : 0;
    text.config = config;
    this.makeDraggable(text,'label',['text','color','size','font','lineSpacing'])
  },

  loadChoice: function(config) {
    config.sample = 2;
    // var x = (config.isBoxCentered) ? gui.resolution[0]/2 - config.width/2 : config.x;
    // var y = (config.isBoxCentered) ? gui.resolution[1]/2 - (config.height*config.sample + parseInt(config.separation)*(config.sample-1))/2 : config.y;
    var chBox = createChoiceBox('choice',0,config);
    chBox.config = config;
    chBox.nextChoices = []
    chBox.component = 'choice';
    this.spriteRefs[currentMenu+'choice'] = chBox;
    for (var i = 1; i < config.sample; i++) {
      var nextChoice = createChoiceBox('choice',i,config);
      chBox.addChild(nextChoice);
      chBox.nextChoices.push(nextChoice)
    }
    chBox.nextChoices[config.sample-2].tint = colorToSigned24Bit(config['chosen-color'])
    arrangeChoices(chBox);
    this.makeDraggable(chBox,'choice',['sample','sampleText','separation','alignment','sfx','font','color','chosen-color','lineSpacing','size','align','offset-x','offset-y'],config.isBoxCentered)
  },

  loadInterrupt: function (config) {
    const choiceConfig = gui.config.hud.elements.find(element=>element.type=='choice');
    if (choiceConfig && config.textStyleAsChoice) {
      config.size = choiceConfig.size
      config.color = choiceConfig.color
      config.font = choiceConfig.font
    }
    if (choiceConfig && config.textPositionAsChoice) {
      config.isTextCentered = choiceConfig.isTextCentered;
      config.align = choiceConfig.align
      config['offset-x'] = choiceConfig['offset-x']
      config['offset-y'] = choiceConfig['offset-y']
    }
    if (!config.x) config.x = 0;
    if (!config.y) config.y = 0;
    var intBox = createChoiceBox('interrupt',0,config);
    this.spriteRefs[currentMenu+'interrupt'] = intBox;
    intBox.component = 'interrupt';
    intBox.config = config;
    if (config.inlineWithChoice) {
      intBox.choice = this.spriteRefs[currentMenu+'choice'];
      this.spriteRefs[currentMenu+'choice'].interrupt = intBox;
      this.spriteRefs[currentMenu+'choice'].addChild(intBox);
      arrangeChoices(this.spriteRefs[currentMenu+'choice']);
    } 
    this.makeDraggable(intBox,'interrupt',['separation','alignment','font','sfx','color','size','lineSpacing','align','offset-x','offset-y'],config.inlineWithChoice)
  },

  loadNameBox: function(config) {
    var sprite = game.add.sprite(config.x,config.y,config.id);
    this.spriteRefs[currentMenu+'name-box'] = sprite;
    sprite.config = config;
    sprite.component = 'name-box';
    if (!config.sampleColor) config.sampleColor = "#FFFFFF"
    if (!config.sampleName) config.sampleName = "Char Name"
    var text = game.add.text(0,0, config.sampleName, {font: config.size+'px '+config.font, fill: config.sampleColor});
    changeTextPosition(sprite,text, config);

    sprite.name = text;
    sprite.addChild(text);
    setNameBoxSampleColor(sprite);
    this.makeDraggable(sprite,'name-box',['size','font','align','color','offset-x','offset-y','sampleName','sampleColor'])
  },

  loadMessageBox: function(config) {
    var sprite = game.add.sprite(config.x,config.y,config.id);
    this.spriteRefs[currentMenu+'message-box'] = sprite;
    sprite.config = config;
    sprite.component = 'message-box';
    if (!config.sample){
      config.sample = "Lorem (color:#f593e6)ipsum(end) (color:red)dolor(end) sit amet, (italic)consectetur adipiscing elit(end), sed do (bold)eiusmod(end) tempor incididunt ut labore et dolore magna aliqua."; 
    }
    var text = game.add.text(config['offset-x'],config['offset-y'], "", {font: config.size+'px '+config.font, fill: config.color});
    text.wordWrap = true;
    text.align = config.align;
    text.wordWrapWidth = config['text-width'];
    text.lineSpacing = config.lineSpacing ? config.lineSpacing : 0;
    setTextWithStyle(config.sample,text)
    sprite.message = text;
    sprite.addChild(text);
    this.makeDraggable(sprite,'message-box',['size','sample','font','sfx','color','align','offset-x','offset-y','text-width','lineSpacing'],config.locked)
  },

  makeDraggable: function(sprite,name,otherProps,notDraggable,locked){
    sprite.inputEnabled = true;
    sprite.input.dragDistanceThreshold = 3;
    // sprite.listComponent = name+'s';
    sprite.showDebugBox = true;
    function selectImage(){
      // create debugger info
      if (debuggerInfo){
        debuggerInfo.destroy();
      }
      debuggerInfo = game.add.graphics(0, 0);

      debuggerInfo.lineStyle(4, 0xFFAA00, 1)
      debuggerInfo.drawRect(0,0, sprite.width, sprite.height);
      debuggerInfo.endFill();
      sprite.addChild(debuggerInfo);

      selected = sprite;
      $(`.asset-x`).val(selected.x);
      $(`.asset-y`).val(selected.y);
      if (otherProps) {
        for (var i = 0; i < otherProps.length; i++) {
          var prop = otherProps[i];
          $(`#${sprite.config.type}-${prop}`).val(selected.config[prop]);
        }
      }

      showTools(sprite.config.type);
    }
    let label = `${componentLabel[sprite.config.type]} (${sprite.config.id})`;
    // if (listComponent.includes(sprite.listComponent)){
    //   label = componentLabel[sprite.listComponent];
    //   sprite.idx = $('#selectMenu').find(`.${name}`).length;
    //   sprite.selectorIdx=name+"_"+sprite.idx;
    //   label+=" #"+sprite.idx;
    // }
    const selectMenuItem = $(`<a class="dropdown-item" href="#" id="${sprite.config.id}-selector">${label}</a>`);
    selectMenuItem.click(selectImage);
    $('#selectMenu').append(selectMenuItem);

    sprite.events.onInputDown.add(selectImage, this);
    sprite.events.onDragStart.add(selectImage, this);
    sprite.events.onDragStop.add(function(){
      selected.x = Math.floor(selected.x);
      selected.y = Math.floor(selected.y);
      $(`.asset-x`).val(selected.x);
      $(`.asset-y`).val(selected.y);
      selected.config.x = selected.x;
      selected.config.y = selected.y;
    }, this);
    if (!notDraggable){
      sprite.input.enableDrag(true);
      sprite.draggableElement = true;
      if (sprite.config.locked){
        // component is locked
        sprite.input.disableDrag();
      }
    }

  },

  addFont: function (name, fileName) {
    gui.assets.fonts[name] = {fileName:fileName,name:name};
    game.add.text(gui.resolution[0], gui.resolution[1], name, {font: '42px '+name, fill: "#ffffff"});
  },

  addLabel: function(x,y,size,text,font,color,lineSpacing) {
    // if ( !('labels' in gui.config[currentMenu])){
    //   gui.config[currentMenu].labels = []
    // }
    var config = {x,y,size,text,font,color,lineSpacing,type:'label'};
    gui.config[currentMenu].elements.push(config);
    this.loadLabel(config)
  },
}

function setTextWithStyle(text,text_obj) {
  text_obj.clearFontValues();
  text_obj.clearColors()
  let styles = []
  while(true){
    let re = /\((color:((\w+|#(\d|\w)+))|italic|bold)\)/
    let match = text.match(re);
    if (match){
      let s = {
        start: text.search(re),
        style: match[1].includes("color") ? "color" : match[1]
      }
      if (s.style == "color"){
        s.color = match[2];
      }
      text = text.replace(re,"")
      let endIdx = text.indexOf("(end)");
      if (endIdx!=-1){
        text = text.replace("(end)","")
        s.end = endIdx;
        styles.push(s)
      }
    } else break;
  }
  styles.forEach(s=>{
    if (s.style=="italic"){
      text_obj.addFontStyle("italic", s.start);
      text_obj.addFontStyle("normal", s.end);
    }
    if (s.style=="bold"){
      text_obj.addFontWeight("bold", s.start);
      text_obj.addFontWeight("normal", s.end);
    }
    if (s.style=="color"){
      text_obj.addColor(s.color, s.start)
      text_obj.addColor(text_obj.fill, s.end)
    }
  })
  text_obj.text=text;
}

function addBackgroundMusicTools(){
  const selectMenuItem = $(`<a class="dropdown-item bg-music-item" 
                            href="#">Background Music</a>`);
  selectMenuItem.click(()=>{
    selected=null;
    if (debuggerInfo) debuggerInfo.destroy();
    showTools('background-music');
    $(`#background-music-select`).val(gui.config[currentMenu].backgroundMusic);
    
  });
  $('#selectMenu').append(selectMenuItem);
}

function setNameBoxSampleColor(nameBox){
  if (nameBox.config.tintStyle == 'box'){
    nameBox.tint = colorToSigned24Bit(nameBox.config.sampleColor);
    nameBox.name.fill = nameBox.config.color;
  } else {
    nameBox.tint = colorToSigned24Bit("#FFFFFF");
    nameBox.name.fill = nameBox.config.sampleColor;
  }
}
    

function findFont(name) {
  for (var i = gui.config[menu].elements.length - 1; i >= 0; i--) {
    if (gui.config[menu].elements[i].font == name) return gui.config[menu].elements[i].type;
  }
}

function findAudio(name) {
  if (gui.config.main.backgroundMusic == name) return 'main menu';
  if (gui.config.settings.backgroundMusic == name) return 'settings menu';
  if (gui.config.saveload.backgroundMusic == name) return 'saveload menu';
  for (var i = gui.config[menu].elements.length - 1; i >= 0; i--) {
    if (gui.config[menu].elements[i].sfx == name) return gui.config[menu].elements[i].type;
  }

  // if (gui.config.hud['message-box'] && gui.config.hud['message-box'].sfx == name) return 'message-box';
  // if (gui.config.hud['choice'] && gui.config.hud['choice'].sfx == name) return 'choice';
  // if (gui.config.hud['interrupt'] && gui.config.hud['interrupt'].sfx == name) return 'interrupt';
  // for (var menu in gui.config ) {
  //   if (gui.config[menu].buttons) {
  //     for (var i = gui.config[menu].buttons.length - 1; i >= 0; i--) {
  //       if (gui.config[menu].buttons[i].sfx == name) return menu+' menu button';
  //     }
  //   }
  // }
}

function createChoiceBox(choiceType,index,config) {
  // var separation = index*(parseInt(config.height)+parseInt(config.separation));
  var chBox = game.add.button(0, 0, config.id,function(){
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
  if (!config.sampleText){
    config.sampleText = `${choiceType} ${index}`;
  }
  var text = game.add.text(0,0, config.sampleText, {font: config.size+'px '+config.font, fill: config.color});
  changeTextPosition(chBox,text, config)
  chBox.text = text;
  chBox.addChild(text);
  return chBox;
}

function changeTextPosition(sprite,text, config) {
  text.lineSpacing = config.lineSpacing ? config.lineSpacing : 0;
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

function addMenuToSelectionList(menuName){
  const selectMenuItem = `<a class="dropdown-item" id="${menuName}Selector" href="#" onclick="changeMenu('${menuName}');">${menuName}</a>`
  $("#menuSelectionList").append(selectMenuItem);
}

function addMenu(){
  //create random name
  const menuName = "menu"+Date.now()
  //add new menu to config
  gui.config.menus[menuName] = []
  addMenuToSelectionList(menuName)
  changeMenu(menuName)
}

function changeMenuName(){
  const newName = "asdf"
  gui.config.menus[newName] = gui.config.menus[currentMenu] 
  delete gui.config.menus[currentMenu] 
  $(`#${currentMenu}Selector`).html(newName)
  $(`#${currentMenu}Selector`).attr("onclick",`changeMenu('${newName}')`);
  $(`#${currentMenu}Selector`).prop('id',`#${newName}Selector`)
  // TODO change menu title
}

window.clearMenu = function(){
  $('#confirm-button').unbind('click');
  $('#confirm-button').click(function(){
      // console.log("Removing contents of "+menu);
      if (currentMenu!='hud'){
        gui.config.menus[currentMenu] = []  
      } else {
        gui.config.hud = []
      }
      
      // reload menu
      changeMenu(currentMenu);
  });
  $("#confirm-contents").html(`This action will remove all contents in the ${currentMenu} menu, but will not delete the menu itself.`);
  $("#confirm-modal").modal('show');
}

window.deleteMenu = function(){
  $('#confirm-button').unbind('click');
  $('#confirm-button').click(function(){
      // remove from config
    delete gui.config.menus[currentMenu]
    // remove from selection list
    $(`#${currentMenu}Selector`).remove()
    changeMenu('general');
  });
  $("#confirm-contents").html(`This action will delete the ${currentMenu} menu and all its contents.`);
  $("#confirm-modal").modal('show');
}

function changeMenu(menu){
  if (menu!=currentMenu){
    $(`.general-help`).hide();
    $(".asset-add").hide();
    $(`.asset-${menu}`).show();
    $('.tools').hide()
    $(`.background-music`).hide();
    // $("#fonts-container").hide();
    $(".canvas-container").hide();
    // $('#selectMenu').html("")
    // $("#audio-container").hide();
    currentMenu = menu;
    selected = null;
    if(menu=="general"){
      $(`.menu-creation-toolbox`).hide();
      $(`.general-help`).show();
      $(`#general-container`).show();
      
      
    } else {
      $(`.menu-creation-toolbox`).show();
      if (menu!="loader") $(".asset-all").show();     

      // if (gui.config[menu].backgroundMusic){
      //   $(`#background-music`).val(gui.config[menu].backgroundMusic);
      // } else {
      //   $(`#background-music`).val('none');
      // }
      
      // $(`.background-music-${menu}`).show();
      $("#canvas-container").show();
      game.state.start('gameLoader');
    }
  }
}

function getThumbnail() {
  var canvas = document.createElement("canvas");
  let maxSize = 350;
  canvas.width = maxSize;
  canvas.height = (game.canvas.height * maxSize)/game.canvas.width;
  canvas.getContext("2d").drawImage(game.canvas, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg");
}

async function saveGUI(){
  return new Promise(resolve => {
    $('#btn-save-gui').html('Saving...');
    try {
      var preview = getThumbnail();
      // var preview = game.canvas.toDataURL();
    } catch(e) {
      console.log(e)
    }
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
            resolve()
          },
          error: function (xhr, status, error) {
              console.log('Error: ' + error.message);
          }
      });
  })
}

$('#btn-save-gui').on('click',function(e){
  saveGUI();
});

function genAssetId(asset) {
    gui.assetCounter++;
    return asset+gui.assetCounter;
  }

// -------------------------------------------------------------------------
// Init
// -------------------------------------------------------------------------



function init() {
  if (gui.isNew){
    gui.assetCounter = 0;
    gui.config = {
      hud: {},
      menus: {
        loader: {},
        main: {},  
      }
    }
    gui.assets = {
      images: {},
      spritesheets: {},
      fonts: {},
      audio: {},
    }
    delete gui.isNew;
  } 
  // add menus to menu selection list, hud is already added
  for (menuName in gui.config.menus){
    addMenuToSelectionList(menuName)
  }
  // window.toggleMenu = function(menu){
  //   $(`.menu-${menu}`).toggle();
  //   gui.config[menu].inactive=!gui.config[menu].inactive;
  // }
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
  
  game.state.add('preloader', preloader);
  // load fonts and assets to the html lists
  for (var key in gui.assets.fonts) {
    loadFont(key,gui.assets.fonts[key].fileName);
  }
  for (var key in gui.assets.audio) {
    loadAudio(key,gui.assets.audio[key].type,gui.assets.audio[key].fileName);
  }
  game.state.start('preloader')

  if (!gui.config.general){
    gui.config.general = {
      transitions: {
        defaults: {
          characters: "FADE",
          backgrounds: "FADE",
          cgs: "FADE",
          music: "FADE",
        },
        say: "CUT",
        visualChoices: "FADE",
        textChoices: "CUT",
        menus: "FADE",
        skippable: false
      },
      fadetime : 750,
      logChoices: true,
      backgroundColor: "#000000"
    }
  }
  
  $('#canvas-color').val(gui.config.general.backgroundColor);
  $('.colorpicker-component').colorpicker();
  $('#canvas-color').on('change',function(e){
    gui.config.general.backgroundColor = $(this).val();
    game.stage.backgroundColor = $(this).val();
  });

  $('#logChoicesInput').prop('checked',gui.config.general.logChoices);
  $('#logChoicesInput').on('change',function() {
    gui.config.general.logChoices = $(this).is(':checked');
  });

  console.log($(".transition-select[target='menus'")  )

  $(".transition-select[target='menus'").val(gui.config.general.transitions.menus);
  $(".transition-select[target='visualChoices'").val(gui.config.general.transitions.visualChoices);
  $(".transition-select[target='textChoices'").val(gui.config.general.transitions.textChoices);

  $('.transition-select').on('change',function(e){
    var target = $(this).attr('target')
    gui.config.general.transitions[target] = $(this).val();
  });


  $('[data-toggle="tooltip"]').tooltip()
  changeMenu('general');
  
}



function convertGUIElementsToList(){
  var menus = ['loader','main','settings','hud','saveload']
  for (const menu of menus){
    if (!gui.config[menu].elements){
      gui.config[menu].elements = [];
    }
    // if background present, convert to normal image
    if (gui.config[menu].background){
      gui.config[menu].background.type = 'image';
      gui.config[menu].elements.push(gui.config[menu].background);
      delete gui.config[menu].background
    }
    var singleComponents = ['choice', 'interrupt','message-box','ctc','name-box','loading-bar']
    for (const component of singleComponents){
      if (component in gui.config[menu]){
        // add type to component configuration
        gui.config[menu][component].type = component;
        // add component to elements list
        gui.config[menu].elements.push(gui.config[menu][component]);
        // remove from main menu configuration
        delete gui.config[menu][component];
      }
    }

    var listComponents = ['button','slider','label','save-slot','image','animation']
    for (const component of listComponents){
      const list = component+'s';
      if (list in gui.config[menu]) {
        for (var i = 0; i < gui.config[menu][list].length; i++) {
          gui.config[menu][list][i].type = component;
          gui.config[menu].elements.push(gui.config[menu][list][i]);
        }
        // remove from main menu configuration
        delete gui.config[menu][list];
      }
    }
    // console.log(menu)
    // console.log(gui.config[menu])
  }
}

// Audio




window.changeFontStyle = function(style){
  if (style=="normal"){
    $('.text-sample').css("font-style","normal");
    $('.text-sample').css("font-weight","normal");
  };
  if (style=="bold"){
    $('.text-sample').css("font-style","normal");
    $('.text-sample').css("font-weight","bold");
  }
  if (style=="italic"){
    $('.text-sample').css("font-style","italic");
    $('.text-sample').css("font-weight","normal");
  }
}

$('.font-text').on('input',function(e){
  $(".text-sample").html($(this).val());
})

// current state

var selected = null;
var currentMenu = null;
var audioSample = null;
// phaser game object
var game = null;
init();