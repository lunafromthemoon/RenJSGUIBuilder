const RenJSConfig =  {
  'w': GUI_W,
  'h': GUI_H,
  'guiConfig': 'story/GUI.yaml',
  'storySetup': 'story/Setup.yaml',
  'storyConfig': 'story/Config.yaml',
  'storyText': [
    'story/Story.yaml'
  ],
  'name': "GUI_NAME",
  'renderer': Phaser.AUTO, // become renderer
  'scaleMode': Phaser.ScaleManager.SHOW_ALL,
  'splash': GUI_SPLASH,
  'fonts': 'assets/gui/fonts.css'
}

const RenJSGame = new RenJS.game(RenJSConfig)
RenJSGame.launch()
