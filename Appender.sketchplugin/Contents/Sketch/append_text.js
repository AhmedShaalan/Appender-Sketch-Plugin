var nonTextSelected = 0

function onRun(context) {

  // "An NSApplication object manages an app’s main event loop in addition to resources used by all of that app’s objects." - Apple
  var app = [NSApplication sharedApplication]

  // get sketch context
  var sketch = context.api()

  // get document
  var document = context.document

  // get selection
  var selection = context.selection

  // number of layers selected
  var numOfLayers = selection.count()

  // check if there are no layers selected
  if (!numOfLayers) {
    [app displayDialog:"Select me some text layers, Please :/" withTitle:"Appender"]
    return
  }

  // check if the user is editing text layer
  // always layer number 0 will be the one in edit mode
  var layer = selection[0]
  if (layer.class() == MSTextLayer && layer.isEditingText()) {
    [app displayDialog:"I can't append text while you are in edit mode :s" withTitle:"Appender"]
    return
  }

  // get user input
  var userInput = getUserInput(sketch)

  // get pressed button
  var userPressedButton = userInput[0] == 1000 ? "Append" : "Cancel"

  // get user text input
  var userTextInput = userInput[1]

  // check if user pressed append
  if (userPressedButton == "Append") {

    // call append function
    doTheThing (selection, numOfLayers, userTextInput)

    // notify if there are any non text layer selected
    if (nonTextSelected) {
      document.hideMessage()  // hide previous message
      document.showMessage("Non-text layer selected, nothing happened to them ^_^")
    }

    // save userInput to use it in appendAgain
    sketch.setSettingForKey("userTextInput", userTextInput)
  }

}


// append previous input to current selection
function appendAgain(context) {

  // "An NSApplication object manages an app’s main event loop in addition to resources used by all of that app’s objects." - Apple
  var app = [NSApplication sharedApplication]

  // get sketch context
  var sketch = context.api()

  // get document & selection
  var document = context.document
  var selection = context.selection

  // number of layers selected
  var numOfLayers = selection.count()

  // check if some layers selected
  if (!numOfLayers) {
    [app displayDialog:"Select me some text layers, Please :/" withTitle:"Appender - Append Again"]
    
    return
  }

  // get previous user input
  var previousUserInput = sketch.settingForKey("userTextInput")

  // check if its null
  if (previousUserInput == null) {
    [app displayDialog:"I don't remember that you asked me to append text before :-|" withTitle:"Appender"]
    
    return
  }

  // append text
  doTheThing (selection, numOfLayers, previousUserInput)
}



// brain function
function doTheThing (selection, numOfLayers, userTextInput)
{
  // check layer class, then append text if its a text layer
  var item
  for (item = 0; item < numOfLayers; item++) {

    // get current layer & its class
    var layer = selection[item]
    var layerClass = layer.class()

    // check layer class if Text layer then append text
    if (layerClass == MSTextLayer) {
      var newText =  layer.stringValue + userTextInput
      layer.stringValue = layer.stringValue() + userTextInput

    } else {
      nonTextSelected = 1
    }
  }

}



// show dialog to get user input
function getUserInput(sketch){

  // create new dialog
  var alert = COSAlertWindow.new()

  // dialog title & description
  alert.setMessageText("Appender")
  // alert.setInformativeText("")

  // create text field and its lable
  alert.addTextLabelWithValue("Text to append:")
  alert.addTextFieldWithValue(sketch.settingForKey("userTextInput"))

  // set it as first responder
  var textField = alert.viewAtIndex(1)
  alert.alert().window().setInitialFirstResponder(textField)

  // action buttons
  alert.addButtonWithTitle('Append') // 1000
  alert.addButtonWithTitle('Cancel') // 1001

  // show dialog
  var buttonPressed =  alert.runModal()

  // get user input
  var userInput = alert.viewAtIndex(1).stringValue()

  // return user input
  return [buttonPressed, userInput]
}
