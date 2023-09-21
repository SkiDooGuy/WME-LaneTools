// ==UserScript==
// @name         WME LaneTools
// @namespace    https://github.com/SkiDooGuy/WME-LaneTools
// @version      2023.09.20.01
// @description  Adds highlights and tools to WME to supplement the lanes feature
// @author       SkiDooGuy, Click Saver by HBiede, Heuristics by kndcajun
// @updateURL    https://github.com/SkiDooGuy/WME-LaneTools/raw/master/WME-LaneTools.user.js
// @downloadURL  https://github.com/SkiDooGuy/WME-LaneTools/raw/master/WME-LaneTools.user.js
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @grant        GM_xmlhttpRequest
// @connect       greasyfork.org
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// ==/UserScript==

/* global W */
/* global WazeWrap */
/* global OpenLayers */
/* global I18n */
/* global _ */
/* jshint esversion:6 */
/* eslint-disable */

(function main() {
  "use strict";

  const constantStrings = {
    divStr : "<div>",
    checkedStr : "checked",
    htmlStr : "html",
    translationSpreadSheetBaseURL :
    "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Translations!A2:C?key=",
    angleSpreadSheetBaseURL :
    "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Angles!A2:B?key=",
    RBSAccessSheetBaseURL :
    "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/RBS_Access!A2:C?key=",
    revLanesInstructionsFromCSS :
    ".rev-lanes > div > div > div.lane-instruction.lane-instruction-from > div.instruction",
    fwdLanesInstructionsFromCSS :
    ".fwd-lanes > div > div > div.lane-instruction.lane-instruction-from > div.instruction",
    editPanelCSS : "#edit-panel > div > div > div > div.segment-edit-section > wz-tabs > wz-tab.lanes-tab",
    fwdLanesDivInstructionCSS : ".fwd-lanes > div > div > div.lane-instruction.lane-instruction-from > div.instruction",
    fwdLanesNthChild :
    ".fwd-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.edit-region > div > div > div:nth-child(1) > div",
    revLanesNthChild :
    ".rev-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.edit-region > div > div > div:nth-child(1) > div",
    fwdLanesDirectionControlEditCSS :
    ".fwd-lanes > div > div > .lane-instruction.lane-instruction-to > .instruction > .lane-edit > .edit-region > div > .controls.direction-lanes-edit",
    fwdLanesLaneInstrunctionToCSS :
    ".fwd-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.edit-region > div > div > div:nth-child(1)",
    revLanesInstructionsToCSS :
    ".rev-lanes > div > div > .lane-instruction.lane-instruction-to > .instruction > .lane-edit > .edit-region > div > .controls.direction-lanes-edit",
    wazeFontLink : "https://editor-assets.waze.com/production/font/aae5ed152758cb6a9191b91e6cedf322.svg",
    segmentEditLanes :
    "#segment-edit-lanes > div > div > div.fwd-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.lane-arrows > div"
  };
  const LANETOOLS_VERSION = "" + GM_info.script.version,
        GF_LINK = "https://github.com/SkiDooGuy/WME-LaneTools/blob/master/WME-LaneTools.user.js",
        FORUM_LINK = "https://www.waze.com/forum/viewtopic.php?f=819&t=30115",
        LI_UPDATE_NOTES = "<b>NEW:</b><br>\n<b>FIXES:</b><br><br>\n", LANETOOLS_DEBUG_LEVEL = 0x1, configArray = {},
        RBSArray = {failed : false}, IsBeta = location.href.indexOf("beta.waze.com") !== -0x1, TRANSLATIONS = {
          default : {
            enabled : "Enabled",
            disabled : "Disabled",
            toggleShortcut : "Toggle Shortcut",
            UIEnhance : "Tab UI Enhancements",
            autoWidth : "Auto-open road width",
            autoOpen : "Auto-open lanes tab",
            autoExpand : "Auto-expand lane editor",
            autoFocus : "Auto-focus lane input",
            reOrient : "Re-orient lane icons",
            enClick : "Enable ClickSaver",
            clickStraight : "All straight lanes",
            clickTurn : "default",
            mapHighlight : "Map Highlights",
            laneLabel : "Lane labels",
            nodeHigh : "Node Highlights",
            LAOHigh : "Lane angle overrides",
            CSOHigh : "Continue straight overrides",
            heuristics : "Lane heuristics candidates",
            posHeur : "Positive heuristics candidate",
            negHeur : "Negative heuristics candidate",
            highColor : "Highlight Colors",
            colTooltip : "Click to toggle color inputs",
            selAllTooltip : "Click on turn name to toggle all lane associations",
            fwdCol : "Fwd (A>B)",
            revCol : "Rev (B>A)",
            labelCol : "Labels",
            errorCol : "Lane errors",
            laneNodeCol : "Nodes with lanes",
            nodeTIOCol : "Nodes with TIOs",
            LAOCol : "Segs with TIOs",
            viewCSCol : "View only CS",
            hearCSCol : "View and hear CS",
            heurPosCol : "Lane heuristics likely",
            heurNegCol : "Lane heuristics - not qualified",
            devTools : "Tools/Features Under Development",
            quickTog : "Quick toggle all lanes",
            showRBS : "Use RBS heuristics",
            delFwd : "Delete FWD Lanes",
            delRev : "Delete Rev Lanes",
            delOpp : "This segment is one-way but has lanes set in the opposite direction. Click here to delete them",
            csIcons : "Highlight CS Icons",
            highlightOverride : "Only highlight if segment layer active",
            addTIO : "Include TIO in lanes tab",
            labelTIO : "TIO",
            defaultTIO : "Waze Selected",
            noneTIO : "None",
            tlTIO : "Turn Left",
            trTIO : "Turn Right",
            klTIO : "Keep Left",
            krTIO : "Keep Right",
            conTIO : "Continue",
            elTIO : "Exit Left",
            erTIO : "Exit Right",
            uturnTIO : "U-Turn",
            enIcons : "Display lane icons on map",
            IconsRotate : "IconsRotate",
          },
        },
        Direction = {REVERSE : -1, ANY : 0, FORWARD : 1}, LT_ROAD_TYPE = {
          NARROW_STREET : 22,
          STREET : 1,
          PRIMARY_STREET : 2,
          RAMP : 4,
          FREEWAY : 3,
          MAJOR_HIGHWAY : 6,
          MINOR_HIGHWAY : 7,
          DIRT_ROAD : 8,
          FERRY : 14,
          PRIVATE_ROAD : 17,
          PARKING_LOT_ROAD : 20,
          WALKING_TRAIL : 5,
          PEDESTRIAN_BOARDWALK : 10,
          STAIRWAY : 16,
          RAILROAD : 18,
          RUNWAY : 19,
        },
        DisplayLevels = {MIN_ZOOM_ALL : 14, MIN_ZOOM_NONFREEWAY : 17},
        HeuristicsCandidate = {ERROR : -2, FAIL : -1, NONE : 0, PASS : 1};
  let MAX_LEN_HEUR, MAX_PERP_DIF, MAX_PERP_DIF_ALT, MAX_PERP_TO_CONSIDER, MAX_STRAIGHT_TO_CONSIDER, MAX_STRAIGHT_DIF,
  lt_scanArea_recursive = 0x0, LtSettings = {}, strings = {}, _turnInfo = [], _turnData = {}, laneCount,
  LTHighlightLayer, LTNamesLayer, LTLaneGraphics, _pickleColor, seaPickle, UpdateObj, MultiAction, SetTurn,
  shortcutsDisabled = false, draggingToolbar = false, isRBS = false, allowCpyPst = false, langLocality = "default",
  NEWZOOMLEVELS, currentMousePos = {x : -1, y : -1};
  console.log("LaneTools: initializing...");

  function laneToolsBootstrap(bootStrapAttempt = 0x0) {
    if (W && W.map && W.model && W.loginManager.user && $ && WazeWrap.Ready)
      initLaneTools();
    else
      bootStrapAttempt < 500 ? setTimeout(() => { laneToolsBootstrap(bootStrapAttempt++); }, 200)
                             : console.error("LaneTools: Failed to load");
  }

  function initLaneTools() {
    seaPickle = W.loginManager.user;
    UpdateObj = require("Waze/Action/UpdateObject");
    MultiAction = require("Waze/Action/MultiAction");
    SetTurn = require("Waze/Model/Graph/Actions/SetTurn");
    NEWZOOMLEVELS = W.map.getOLMap().getNumZoomLevels() === 23;
    const
    ltCSSClasses =
    [
      ".lt-wrapper {position:relative;width:100%;font-size:12px;font-family:\x22Rubik\x22, \x22Boing-light\x22, sans-serif;user-select:none;}",
      ".lt-section-wrapper {display:block;width:100%;padding:4px;",
      ".lt-section-wrapper.border {border-bottom:1px solid grey;margin-bottom:5px;}",
      ".lt-option-container {padding:3px;}",
      ".lt-option-container.color {text-decoration:none;}",
      "input[type=\x22checkbox\x22].lt-checkbox {position:relative;top:3px;vertical-align:top;margin:0;}",
      "input[type=\x22text\x22].lt-color-input {position:relative;width:70px;padding:3px;border:2px solid black;border-radius:6px;}",
      "input[type=\x22text\x22].lt-color-input:focus {outline-width:0;}",
      "label.lt-label {position:relative;max-width:90%;font-weight:normal;padding-left:5px}",
      // ".lt-Toolbar-Container {display:none;position:absolute;background-color:orange;border-radius:6px;border:1.5px
      // solid;box-size:border-box;z-index:1050;}",
      // ".lt-Toolbar-Wrapper {position:relative;padding:3px;",
      // ".lt-toolbar-button-container {display:inline-block;padding:5px;}",
      // ".lt-toolbar-button {position:relative;display:block;width:60px;height:25px;border-radius:6px;font-size:12px;}",
      "#lt-toolbar-container {position: relative;z-index:1010;text-align:center;}",
      ".lt-add-Width {display:inline-block;width:15px;height:15px;border:1px solid black;border-radius:8px;margin:0 3px 0 3px;line-height: 1.5;text-align:center;font-size:10px;}",
      ".lt-add-Width:hover {border:1px solid #26bae8;background-color:#26bae8;cursor:pointer;}",
      ".lt-add-lanes {display:inline-block;width:15px;height:15px;border:1px solid black;border-radius:8px;margin:0 3px 0 3px;line-height: 1.5;text-align:center;font-size:10px;}",
      ".lt-add-lanes:hover {border:1px solid #26bae8;background-color:#26bae8;cursor:pointer;}",
      ".lt-chkAll-lns {display:inline-block;width:20px;height:20px;text-decoration:underline;font-weight:bold;font-size:10px;padding-left:3px;cursor:pointer;}",
      ".lt-tio-select {max-width:80%;color:rgb(32, 33, 36);background-color:rgb(242, 243, 244);border:0px;border-radius:6px;padding:0 16px 0 10px;cursor:pointer;}",
      "#lt-color-title {display:block;width:100%;padding:5px 0 5px 0;font-weight:bold;text-decoration:underline;cursor:pointer;}",
    ]
    .join(" "),
    initMsg = $(constantStrings.divStr);
    initMsg.html = [
      "<div class='lt-wrapper' id='lt-tab-wrapper'>\n" +
      "            <div class='lt-section-wrapper' id='lt-tab-body'>\n" +
      "                <div class='lt-section-wrapper border' style='border-bottom:2px double grey;'>\n" +
      "                    <a href='https://www.waze.com/forum/viewtopic.php?f=819&t=301158' style='font-weight:bold;font-size:12px;text-decoration:underline;'  target='_blank'>" +
      "LaneTools - v" + LANETOOLS_VERSION + "</a>\n" +
      "                    <div>\n" +
      "                        <div style='display:inline-block;'><span class='lt-trans-tglshcut'></span>:<span id='lt-EnableShortcut' style='padding-left:10px;'></span></div>\n" +
      "                       <div class='lt-option-container' style='float:right;'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-ScriptEnabled' />\n" +
      "                           <label class='lt-label' for='lt-ScriptEnabled'><span class='lt-trans-enabled'></span></label>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "               </div>\n" +
      "               <div class='lt-section-wrapper' id='lt-LaneTabFeatures'>\n" +
      "                   <div class='lt-section-wrapper border'>\n" +
      "                       <span style='font-weight:bold;'><span id='lt-trans-uiEnhance'></span></span>\n" +
      "                       <div class='lt-option-container' style='float:right;'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-UIEnable' />\n" +
      "                           <label class='lt-label' for='lt-UIEnable'><span class='lt-trans-enabled'></span></label>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "                   <div id='lt-UI-wrapper'>\n" +
      "                       <div class='lt-option-container' style='margin-bottom:5px;'>\n" +
      "                           <div style='display:inline-block;'><span class='lt-trans-tglshcut'></span>:<span id='lt-UIEnhanceShortcut' style='padding-left:10px;'></span></div>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-AutoOpenWidth' />\n" +
      "                           <label class='lt-label' for='lt-AutoOpenWidth'><span id='lt-trans-autoWidth'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-AutoLanesTab' />\n" +
      "                           <label class='lt-label' for='lt-AutoLanesTab'><span id='lt-trans-autoTab'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-AutoExpandLanes' />\n" +
      "                           <label class='lt-label' for='lt-AutoExpandLanes'><span title=\x22Feature disabled as of Aug 27, 2022 to prevent flickering issue\x22 id='lt-trans-autoExpand'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-AutoFocusLanes' />\n" +
      "                           <label class='lt-label' for='lt-AutoFocusLanes'><span id='lt-trans-autoFocus'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-highlightCSIcons' />\n" +
      "                           <label class='lt-label' for='lt-highlightCSIcons'><span id='lt-trans-csIcons'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-ReverseLanesIcon' />\n" +
      "                           <label class='lt-label' for='lt-ReverseLanesIcon'><span id='lt-trans-orient'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container' style='display:none;'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-AddTIO' />\n" +
      "                           <label class='lt-label' for='lt-AddTIO'><span id='lt-trans-AddTIO'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-ClickSaveEnable' />\n" +
      "                           <label class='lt-label' for='lt-ClickSaveEnable'><span id='lt-trans-enClick'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container clk-svr' style='padding-left:10%;'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-ClickSaveStraight' />\n" +
      "                           <label class='lt-label' for='lt-ClickSaveStraight'><span id='lt-trans-straClick'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container clk-svr' style='padding-left:10%;'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-ClickSaveTurns' />\n" +
      "                           <label class='lt-label' for='lt-ClickSaveTurns'><span id='lt-trans-turnClick'></span></label>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "               </div>\n" +
      "               <div class='lt-section-wrapper'>\n" +
      "                   <div class='lt-section-wrapper border'>\n" +
      "                       <span style='font-weight:bold;'><span id='lt-trans-mapHigh'></span></span>\n" +
      "                       <div class='lt-option-container' style='float:right;'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-HighlightsEnable' />\n" +
      "                           <label class='lt-label' for='lt-HighlightsEnable'><span class='lt-trans-enabled'></span></label>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "                   <div id='lt-highlights-wrapper'>\n" +
      "                       <div class='lt-option-container' style='margin-bottom:5px;'>\n" +
      "                           <div style='display:inline-block;'><span class='lt-trans-tglshcut'></span>:<span id='lt-HighlightShortcut' style='padding-left:10px;'></span></div>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-IconsEnable' />\n" +
      "                           <label class='lt-label' for='lt-IconsEnable'><span id='lt-trans-enIcons'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-IconsRotate' />\n" +
      "                           <label class='lt-label' for='lt-IconsRotate'><span id='lt-trans-IconsRotate'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-LabelsEnable' />\n" +
      "                           <label class='lt-label' for='lt-LabelsEnable'><span id='lt-trans-lnLabel'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-NodesEnable' />\n" +
      "                           <label class='lt-label' for='lt-NodesEnable'><span id='lt-trans-nodeHigh'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-LIOEnable' />\n" +
      "                           <label class='lt-label' for='lt-LIOEnable'><span id='lt-trans-laOver'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-CSEnable' />\n" +
      "                           <label class='lt-label' for='lt-CSEnable'><span id='lt-trans-csOver'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-highlightOverride' />\n" +
      "                           <label class='lt-label' for='lt-highlightOverride'><span id='lt-trans-highOver'></span></label>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "               </div>\n" +
      "               <div class='lt-section-wrapper'>\n" +
      "                   <div class='lt-section-wrapper border'>\n" +
      "                       <span style='font-weight:bold;'><span id='lt-trans-heurCan'></span></span>\n" +
      "                       <div class='lt-option-container' style='float:right;'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-LaneHeuristicsChecks' />\n" +
      "                           <label class='lt-label' for='lt-LaneHeuristicsChecks'><span class='lt-trans-enabled'></span></label>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "                   <div id='lt-heur-wrapper'>\n" +
      "                       <div class='lt-option-container' style='margin-bottom:5px;'>\n" +
      "                           <div style='display:inline-block;'><span class='lt-trans-tglshcut'></span>:<span id='lt-LaneHeurChecksShortcut' style='padding-left:10px;'></span></div>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-LaneHeurPosHighlight' />\n" +
      "                           <label class='lt-label' for='lt-LaneHeurPosHighlight'><span id='lt-trans-heurPos'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-LaneHeurNegHighlight' />\n" +
      "                           <label class='lt-label' for='lt-LaneHeurNegHighlight'><span id='lt-trans-heurNeg'></span></label>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "               </div>\n" +
      "               <div class='lt-section-wrapper'>\n" +
      "                   <div class='lt-section-wrapper'>\n" +
      "                       <span id='lt-color-title' data-original-title='" + TRANSLATIONS[langLocality].colTooltip +
      "'><span id='lt-trans-highCol'></span>:</span>\n" +
      "                        <div id='lt-color-inputs' style='display:none;'>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-ABColor' />\n" +
      "                               <label class='lt-label' for='lt-ABColor' id='lt-ABColorLabel'><span id='lt-trans-fwdCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-BAColor' />\n" +
      "                               <label class='lt-label' for='lt-BAColor' id='lt-BAColorLabel'><span id='lt-trans-revCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-LabelColor' />\n" +
      "                               <label class='lt-label' for='lt-LabelColor' id='lt-LabelColorLabel'><span id='lt-trans-labelCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-ErrorColor' />\n" +
      "                               <label class='lt-label' for='lt-ErrorColor' id='lt-ErrorColorLabel'><span id='lt-trans-errorCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-NodeColor' />\n" +
      "                               <label class='lt-label' for='lt-NodeColor' id='lt-NodeColorLabel'><span id='lt-trans-nodeCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-TIOColor' />\n" +
      "                               <label class='lt-label' for='lt-TIOColor' id='lt-TIOColorLabel'><span id='lt-trans-tioCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-LIOColor' />\n" +
      "                               <label class='lt-label' for='lt-TIOColor' id='lt-LIOColorLabel'><span id='lt-trans-laoCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-CS1Color' />\n" +
      "                               <label class='lt-label' for='lt-CS1Color' id='lt-CS1ColorLabel'><span id='lt-trans-viewCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-CS2Color' />\n" +
      "                               <label class='lt-label' for='lt-CS2Color' id='lt-CS2ColorLabel'><span id='lt-trans-hearCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-HeurColor' />\n" +
      "                               <label class='lt-label' for='lt-HeurColor' id='lt-HeurColorLabel'><span id='lt-trans-posCol'></span></label>\n" +
      "                           </div>\n" +
      "                           <div class='lt-option-container color'>\n" +
      "                               <input type=color class='lt-color-input' id='lt-HeurFailColor' />\n" +
      "                               <label class='lt-label' for='lt-HeurFailColor' id='lt-HeurFailColorLabel'><span id='lt-trans-negCol'></span></label>\n" +
      "                           </div>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "               </div>\n" +
      "               <div class='lt-section-wrapper''>\n" +
      "                   <div class='lt-section-wrapper border'>\n" +
      "                       <span style='font-weight:bold;'><span id='lt-trans-devTools'></span> (WARNING: -  May Produce Undesirable Results)</span>\n" +
      "                       <div class='lt-option-container' style='float:right;'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-DevToolsEnable' />\n" +
      "                           <label class='lt-label' for='lt-DevToolsEnable'><span class='lt-trans-dev-tools-enable'></span></label>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "                   <div id='lt-dev-tools-wrapper'>" +
      "                       <div class='lt-option-container'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-SelAllEnable' />\n" +
      "                           <label class='lt-label' for='lt-SelAllEnable' ><span id='lt-trans-quickTog'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container' id='lt-serverSelectContainer'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-serverSelect' />\n" +
      "                           <label class='lt-label' for='lt-serverSelect'><span id='lt-trans-heurRBS'></span></label>\n" +
      "                       </div>\n" +
      "                       <div class='lt-option-container' id='lt-cpy-pst'>\n" +
      "                           <input type=checkbox class='lt-checkbox' id='lt-CopyEnable' />\n" +
      "                           <label class='lt-label' for='lt-CopyEnable'>Copy/Paste Lanes</label>\n" +
      "                       </div>\n" +
      "                       <div id='lt-sheet-link' style='display:none;'>\n" +
      "                           <a href='https://docs.google.com/spreadsheets/d/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/edit?usp=sharing' target='_blank'>LT Config Sheet</a>\n" +
      "                       </div>\n" +
      "                   </div>\n" +
      "               </div>\n" +
      "           </div>\n" +
      "       </div>",
    ].join(" ");
    const message = $(constantStrings.divStr);
    message.html([
      "       <div class='lt-Toolbar-Container' id='lt-toolbar-container'>\n" +
      "           <div id='lt-toolbar-drag-handle' class='lt-toolbar-drag-handle'>LT\n" +
      "               <div class='lt-toolbar-button-container'>\n" +
      "                   <button type='button' class='lt-toolbar-button' id='copyA-button'>Copy A</button>\n" +
      "               </div>\n" +
      "               <div class='lt-toolbar-button-container'>\n" +
      "                   <button type='button' class='lt-toolbar-button' id='copyB-button'>Copy B</button>\n" +
      "               </div>\n" +
      "               <div class='lt-toolbar-button-container'>\n" +
      "                   <button type='button' class='lt-toolbar-button' id='pasteA-button'>Paste A</button>\n" +
      "               </div>\n" +
      "               <div class='lt-toolbar-button-container'>\n" +
      "                   <button type='button' class='lt-toolbar-button' id='pasteB-button'>Paste B</button>\n" +
      "               </div>\n" +
      "           </div>\n" +
      "       </div>",
    ].join(" "));
    _pickleColor = seaPickle.attributes.rank;
    if (_pickleColor >= 0x0) {
      WazeWrap.Interface.Tab("LT", initMsg.html, setupOptions, "LT");
      $("<style>" + ltCSSClasses + "</style>").appendTo("head");
      $("#map").append(message.html());
      WazeWrap.Interface.ShowScriptUpdate(GM_info.script.name, GM_info.script.version, LI_UPDATE_NOTES, GF_LINK,
                                          FORUM_LINK);
      $("#lt-toolbar-container").css({
        position: "fixed",
        left: "500px",
        top: "500px",
        "z-index": 1004,
        height: "150px",
        width: "70px",
      });
      $(".lt-toolbar-drag-handle").css({
        position: "absolute",
        height: "150px",
        width: "70px",
        border: "2px solid rgb(0, 117, 227)",
        "background-color": "navy",
        color: "white",
        "text-align": "center",
        cursor: "move"});
      console.log("LaneTools: Loaded");
    } else
      console.error("LaneTools: loading error....");
  }
  function processOptionSettings() {
    setSetting("lt-ScriptEnabled", LtSettings.ScriptEnabled);
    setSetting("lt-UIEnable", LtSettings.UIEnable);
    setSetting("lt-AutoOpenWidth", LtSettings.AutoOpenWidth);
    setSetting("lt-AutoExpandLanes", LtSettings.AutoExpandLanes);
    setSetting("lt-AutoLanesTab", LtSettings.AutoLanesTab);
    setSetting("lt-HighlightsEnable", LtSettings.HighlightsEnable);
    setSetting("lt-LabelsEnable", LtSettings.LabelsEnable);
    setSetting("lt-NodesEnable", LtSettings.NodesEnable);
    setSetting("lt-LIOEnable", LtSettings.LIOEnable);
    setSetting("lt-CSEnable", LtSettings.CSEnable);
    setSetting("lt-highlightOverride", LtSettings.highlightOverride);
    setSetting("lt-CopyEnable", LtSettings.CopyEnable);
    setSetting("lt-SelAllEnable", LtSettings.SelAllEnable);
    setSetting("lt-serverSelect", LtSettings.serverSelect);
    setSetting("lt-AutoFocusLanes", LtSettings.AutoFocusLanes);
    setSetting("lt-ReverseLanesIcon", LtSettings.ReverseLanesIcon);
    setSetting("lt-ClickSaveEnable", LtSettings.ClickSaveEnable);
    setSetting("lt-ClickSaveStraight", LtSettings.ClickSaveStraight);
    setSetting("lt-ClickSaveTurns", LtSettings.ClickSaveTurns);
    setSetting("lt-LaneHeurPosHighlight", LtSettings.LaneHeurPosHighlight);
    setSetting("lt-LaneHeurNegHighlight", LtSettings.LaneHeurNegHighlight);
    setSetting("lt-LaneHeuristicsChecks", LtSettings.LaneHeuristicsChecks);
    setSetting("lt-highlightCSIcons", LtSettings.highlightCSIcons);
    setSetting("lt-AddTIO", LtSettings.addTIO);
    setSetting("lt-IconsEnable", LtSettings.IconsEnable);
    setSetting("lt-IconsRotate", LtSettings.IconsRotate);
    setSetting("lt-DevToolsEnable", LtSettings.DevToolsEnable);
    setCSSBorder("lt-ABColor", LtSettings.ABColor);
    setCSSBorder("lt-BAColor", LtSettings.BAColor);
    setCSSBorder("lt-LabelColor", LtSettings.LabelColor);
    setCSSBorder("lt-ErrorColor", LtSettings.ErrorColor);
    setCSSBorder("lt-NodeColor", LtSettings.NodeColor);
    setCSSBorder("lt-TIOColor", LtSettings.TIOColor);
    setCSSBorder("lt-LIOColor", LtSettings.LIOColor);
    setCSSBorder("lt-CS1Color", LtSettings.CS1Color);
    setCSSBorder("lt-CS2Color", LtSettings.CS2Color);
    setCSSBorder("lt-HeurColor", LtSettings.HeurColor);
    setCSSBorder("lt-HeurFailColor", LtSettings.HeurFailColor);
    // !getId("lt-ClickSaveEnable").checked && $("#lt-ClickSaveEnable").hide();
    !getId("lt-UIEnable").checked && $("#lt-UI-wrapper").hide();
    !getId("lt-HighlightsEnable").checked && $("#lt-highlights-wrapper").hide();
    !getId("lt-LaneHeuristicsChecks").checked && $("#lt-heur-wrapper").hide();
    if(!getId("lt-DevToolsEnable").checked) {
      $("#lt-dev-tools-wrapper").hide();
      allowCpyPst = false;
    }
    else {
      allowCpyPst = getId("lt-CopyEnable").checked;
    }
    displayToolbar();

    function setSetting(propertyID, propertyValue) { $("#" + propertyID).prop("checked", propertyValue); }

    function setCSSBorder(idName, value) {
      const idSelector = $("#" + idName);
      idSelector.attr("value", value);
      idSelector.css("border", "2px solid" + value);
    }
  }

  async function setupOptions() {
    await loadSettings();
    await loadSpreadsheet();
    initLaneGuidanceClickSaver();
    LTHighlightLayer = new OpenLayers.Layer.Vector("LTHighlightLayer", {uniqueName : "_LTHighlightLayer"});
    W.map.addLayer(LTHighlightLayer);
    LTHighlightLayer.setVisibility(true);
    LTLaneGraphics = new OpenLayers.Layer.Vector("LTLaneGraphics", {uniqueName : "LTLaneGraphics"});
    W.map.addLayer(LTLaneGraphics);
    LTLaneGraphics.setVisibility(true);
    const style_map = new OpenLayers.Style({
      fontFamily : "Open Sans, Alef, helvetica, sans-serif, monospace",
      labelOutlineColor : "black",
      fontColor : "${labelColor}",
      fontSize : "16",
      labelXOffset : 0xf,
      labelYOffset : -0xf,
      labelOutlineWidth : "3",
      label : "${labelText}",
      angle : "",
      labelAlign : "cm",
      "stroke-width" : "0",
    });
    LTNamesLayer = new OpenLayers.Layer.Vector("LTNamesLayer", {
      uniqueName : "LTNamesLayer",
      styleMap : new OpenLayers.StyleMap(style_map),
    });
    W.map.addLayer(LTNamesLayer);
    LTNamesLayer.setVisibility(true);
    WazeWrap.Events.register("moveend", null, scanArea)
    WazeWrap.Events.register("moveend", null, displayLaneGraphics);
    WazeWrap.Events.register("zoomend", null, scanArea);
    WazeWrap.Events.register("zoomend", null, displayLaneGraphics);
    WazeWrap.Events.register("afteraction", null, scanArea);
    WazeWrap.Events.register("afteraction", null, lanesTabSetup);
    WazeWrap.Events.register("afteraction", null, displayLaneGraphics);
    WazeWrap.Events.register("afterundoaction", null, scanArea);
    WazeWrap.Events.register("afterundoaction", null, lanesTabSetup);
    WazeWrap.Events.register("afterundoaction", null, displayLaneGraphics);
    WazeWrap.Events.register("afterclearactions", null, scanArea);
    WazeWrap.Events.register("selectionchanged", null, scanArea);
    WazeWrap.Events.register("selectionchanged", null, lanesTabSetup);
    WazeWrap.Events.register("selectionchanged", null, displayLaneGraphics);
    WazeWrap.Events.register("changelayer", null, scanArea);
    try {
      new WazeWrap.Interface
      .Shortcut("enableHighlights", "Toggle lane highlights", "wmelt", "Lane Tools", LtSettings.enableHighlights,
                toggleHighlights, null)
      .add();
      new WazeWrap.Interface
      .Shortcut("enableUIEnhancements", "Toggle UI enhancements", "wmelt", "Lane Tools",
                LtSettings.enableUIEnhancements, toggleUIEnhancements, null)
      .add();
      new WazeWrap.Interface
      .Shortcut("enableHeuristics", "Toggle heuristic highlights", "wmelt", "Lane Tools", LtSettings.enableHeuristics,
                toggleLaneHeuristicsChecks, null)
      .add();
      new WazeWrap.Interface
      .Shortcut("enableScript", "Toggle script", "wmelt", "Lane Tools", LtSettings.enableScript, toggleScript, null)
      .add();
    } catch (err) {
      console.log("LT Error creating shortcuts. This feature will be disabled.");
      $("#lt-EnableShortcut").text("" + TRANSLATIONS.default.disabled);
      $("#lt-HighlightShortcut").text("" + TRANSLATIONS.default.disabled);
      $("#lt-UIEnhanceShortcut").text("" + TRANSLATIONS.default.disabled);
      $("#lt-LaneHeurChecksShortcut").text("" + TRANSLATIONS.default.disabled);
      shortcutsDisabled = true
    }
    const highlightsEnabledID = $("#lt-HighlightsEnable"), colorTitleID = $("#lt-color-title"),
          laneHeuristicsChecksID = $("#lt-LaneHeuristicsChecks"), devToolsEnable = $("#lt-DevToolsEnable");
    processOptionSettings();
    setTimeout(() => { updateShortcutLabels(); }, 50);
    setHeuristics();
    setTranslations();
    let toolbarContainerSelector = $("#lt-toolbar-container");
    toolbarContainerSelector.draggable({handle : ".lt-toolbar-drag-handle", containment : "#map"});
    if (_pickleColor > 0x1) {
      let jqQuickTog = $("#lt-trans-quickTog");
      let ltEnabledFeatures = "LaneTools: The following special access features are enabled: ";
      jqQuickTog.attr("data-original-title", "" + strings["selAllTooltip"]);
      jqQuickTog.tooltip();
      _.each(RBSArray, (argument) => {
        if (argument[0x0] === seaPickle.userName) {
          argument[0x1] === "1" && (isRBS = true);
          argument[0x2] === "1" && (allowCpyPst = true);
        }
      });
      if (isRBS) {
        getId("lt-DevToolsEnable").checked && $("#lt-serverSelectContainer").css("display", "block");
        ltEnabledFeatures += "RBS Heuristics";
      }
      if (allowCpyPst) {
        $("#lt-sheet-link").css({display : "block", margin : "2px"});
        let sheetLinkSelector = $("#lt-sheet-link > a");
        sheetLinkSelector.css({
          padding : "2px",
          border : "2px solid black",
          "border-radius" : "6px",
          "text-decoration" : "none",
        });
        sheetLinkSelector.on("mouseenter", function() { $(this).css("background-color", "orange"); })
                         .on("mouseleave", function() { $(this).css("background-color", "#eeeeee"); });
        $(".lt-toolbar-button").on("click", function() {
          $(this)[0].id === "copyA-button" && copyLaneInfo("A");
          $(this)[0].id === "copyB-button" && copyLaneInfo("B");
          $(this)[0].id === "pasteA-button" && pasteLaneInfo("A");
          $(this)[0].id === "pasteB-button" && pasteLaneInfo("B");
        });
        ltEnabledFeatures = isRBS ? ltEnabledFeatures + ", Copy/Paste" : ltEnabledFeatures + "Copy/Paste";
      } else {
        toolbarContainerSelector.css({visibility: "hidden"});
      }
      if (isRBS || allowCpyPst) {
        console.log(ltEnabledFeatures);
      }
    } else {
      $("#lt-LaneTabFeatures").css("display", "none");
    }
    $(".lt-checkbox").on("click", function() {
      let settingName = $(this)[0x0].id.substring(3);
      LtSettings[settingName] = this.checked;
      saveSettings();
    })
    $(".lt-color-input").on("change", function() {
      let color_input = $(this)[0].id.substring(3);
      LtSettings[color_input] = this["value"];
      saveSettings();
      $("#lt-" + color_input).css("border", "2px solid" + this["value"]);
      removeHighlights();
      scanArea();
    });
    $("#lt-ScriptEnabled").on("click", () => {
      if (getId("lt-ScriptEnabled").checked)
        scanArea();
      else {
        removeHighlights();
        removeLaneGraphics();
      }
    });
    highlightsEnabledID.on("click", () => {
      if (!getId("lt-HighlightsEnable").checked)
        removeHighlights();
      scanArea();
    });
    devToolsEnable.on("click", () => {
      if(!getId("lt-DevToolsEnable").checked) removeHighlights();
      scanArea();
      displayToolbar();
      $("#lt-dev-tools-wrapper").toggle();
    })
    $("#lt-LabelsEnable").on("click", () => {
      if (!getId("lt-LabelsEnable").checked)
        removeHighlights();
      scanArea();
    });
    $("#lt-NodesEnable").on("click", () => {
      if (!getId("lt-NodesEnable").checked)
        removeHighlights();
      scanArea();
    });
    $("#lt-LIOEnable").on("click", () => {
      if (!getId("lt-LIOEnable").checked)
        removeHighlights();
      scanArea();
    });
    $("#lt-IconsEnable")
    .on("click", () => { getId("lt-IconsEnable").checked ? displayLaneGraphics() : removeLaneGraphics(); });
    $("#lt-highlightOverride").on("click", () => {
      if (!getId("lt-highlightOverride").checked)
        removeHighlights();
      scanArea();
    });
    colorTitleID.on("click", () => { $("#lt-color-inputs").toggle(); });
    $("#lt-ClickSaveEnable").on("click", () => { $(".lt-option-container.clk-svr").toggle(); });
    $("#lt-UIEnable").on("click", () => {
      $("#lt-UI-wrapper").toggle();
      removeLaneGraphics();
    });
    highlightsEnabledID.on("click", () => { $("#lt-highlights-wrapper").toggle(); });
    laneHeuristicsChecksID.on("click", () => { $("#lt-heur-wrapper").toggle(); });
    laneHeuristicsChecksID.on("click", () => {
      if (!getId("lt-LaneHeuristicsChecks").checked)
        removeHighlights();
      scanArea();
    });
    $("#lt-LaneHeurPosHighlight").on("click", () => {
      if (!getId("lt-LaneHeurPosHighlight").checked)
        removeHighlights();
      scanArea();
    });
    $("#lt-LaneHeurNegHighlight").on("click", () => {
      if (!getId("lt-LaneHeurNegHighlight").checked)
        removeHighlights();
      scanArea();
    });
    $("#lt-serverSelect").on("click", () => {
      setHeuristics();
      removeHighlights();
      scanArea();
    });
    // $.fn.hide = function() {
    //   this.trigger("hide");
    //   $.fn.hide.apply(this, arguments);
    // };
    $("#keyboard-dialog").on("hide", () => { checkShortcutsChanged(); });
    $("#lt-CopyEnable").on("click", displayToolbar);
    colorTitleID.tooltip();
    scanArea();
    displayLaneGraphics();
  }

  async function loadSettings() {
    const parsedSettings = JSON.parse(localStorage.getItem("LT_Settings")),
          laneToolsSettings = await WazeWrap.Remote.RetrieveSettings("LT_Settings");
    !laneToolsSettings && console.error("LaneTools: Error communicating with WW settings server");
    const settingsObject = {
      lastSaveAction : 0x0,
      ScriptEnabled : true,
      UIEnable : true,
      AutoOpenWidth : false,
      AutoExpandLanes : false,
      AutoLanesTab : false,
      HighlightsEnable : true,
      LabelsEnable : true,
      NodesEnable : true,
      ABColor : "#990033",
      BAColor : "#0033cc",
      LabelColor : "#FFAD08",
      ErrorColor : "#F50E0E",
      NodeColor : "#66ccff",
      TIOColor : "#ff9900",
      LIOColor : "#ff9900",
      CS1Color : "#04E6F6",
      CS2Color : "#8F47FA",
      HeurColor : "#00aa00",
      HeurFailColor : "#E804F6",
      CopyEnable : false,
      SelAllEnable : false,
      serverSelect : false,
      LIOEnable : true,
      CSEnable : true,
      AutoFocusLanes : true,
      ReverseLanesIcon : false,
      ClickSaveEnable : true,
      ClickSaveStraight : false,
      ClickSaveTurns : true,
      enableScript : "",
      enableHighlights : "",
      enableUIEnhancements : "",
      enableHeuristics : "",
      LaneHeurNegHighlight : false,
      LaneHeurPosHighlight : false,
      LaneHeuristicsChecks : false,
      highlightCSIcons : false,
      highlightOverride : true,
      AddTIO : false,
      IconsEnable : true,
      IconsRotate : true,
        DevToolsEnable: false
    };
    LtSettings = $.extend({}, settingsObject, parsedSettings);
    if (laneToolsSettings && laneToolsSettings["lastSaveAction"] > LtSettings.lastSaveAction) {
      $.extend(LtSettings, laneToolsSettings);
    }

    Object.keys(settingsObject).forEach((propertyName) => {
      !LtSettings.hasOwnProperty(propertyName) && (LtSettings[propertyName] = settingsObject[propertyName]);
    });
  }

  async function saveSettings() {
    const {
      ScriptEnabled : scriptEnabledValue,
      HighlightsEnable : highlightsEnabledValue,
      LabelsEnable : labelsEnabledValue,
      NodesEnable : nodesEnabledValue,
      UIEnable : uiEnabledValue,
      AutoLanesTab : autoLanesTab,
      AutoOpenWidth : autoOpenWidth,
      AutoExpandLanes : autoExpandLanes,
      ABColor : abColorValue,
      BAColor : baColor,
      LabelColor : labelColorValue,
      ErrorColor : errorColorValue,
      NodeColor : nodeColorValue,
      TIOColor : tioColorValue,
      LIOColor : lioColorValue,
      CS1Color : cs1ColorValue,
      CS2Color : cs2ColorValue,
      CopyEnable : copyEnable,
      SelAllEnable : setEallEnable,
      serverSelect : serverSelectValue,
      LIOEnable : lioEnableValue,
      CSEnable : csEnableValue,
      AutoFocusLanes : autoFocusLanesValue,
      ReverseLanesIcon : revLanesIcon,
      ClickSaveEnable : clickSaveEnable,
      ClickSaveStraight : clickSaveStraightValue,
      ClickSaveTurns : clickSaveTurns,
      enableScript : enableScriptValue,
      enableHighlights : enableHighlightsValue,
      enableUIEnhancements : enableUIEnhancementsValue,
      enableHeuristics : enableHeuristicsValue,
      HeurColor : heurColorValue,
      HeurFailColor : heurFailColorValue,
      LaneHeurPosHighlight : laneHeurPosHighlightValue,
      LaneHeurNegHighlight : laneHeurNegHighlightValue,
      LaneHeuristicsChecks : laneHeuristicsChecksValue,
      highlightCSIcons : highlightCSIconsValue,
      highlightOverride : highlightOverrideValue,
      AddTIO : addTIOValue,
      IconsEnable : iconsEnableValue,
      IconsRotate : iconsRotateValue,
        DevToolsEnable: devToolsEnable
    } = LtSettings,
    savedLTSettings = {
      lastSaveAction : Date.now(),
      ScriptEnabled : scriptEnabledValue,
      HighlightsEnable : highlightsEnabledValue,
      LabelsEnable : labelsEnabledValue,
      NodesEnable : nodesEnabledValue,
      UIEnable : uiEnabledValue,
      AutoOpenWidth : autoOpenWidth,
      AutoLanesTab : autoLanesTab,
      AutoExpandLanes : autoExpandLanes,
      ABColor : abColorValue,
      BAColor : baColor,
      LabelColor : labelColorValue,
      ErrorColor : errorColorValue,
      NodeColor : nodeColorValue,
      TIOColor : tioColorValue,
      LIOColor : lioColorValue,
      CS1Color : cs1ColorValue,
      CS2Color : cs2ColorValue,
      CopyEnable : copyEnable,
      SelAllEnable : setEallEnable,
      serverSelect : serverSelectValue,
      LIOEnable : lioEnableValue,
      CSEnable : csEnableValue,
      AutoFocusLanes : autoFocusLanesValue,
      ReverseLanesIcon : revLanesIcon,
      ClickSaveEnable : clickSaveEnable,
      ClickSaveStraight : clickSaveStraightValue,
      ClickSaveTurns : clickSaveTurns,
      enableScript : enableScriptValue,
      enableHighlights : enableHighlightsValue,
      enableUIEnhancements : enableUIEnhancementsValue,
      enableHeuristics : enableHeuristicsValue,
      HeurColor : heurColorValue,
      HeurFailColor : heurFailColorValue,
      LaneHeurPosHighlight : laneHeurPosHighlightValue,
      LaneHeurNegHighlight : laneHeurNegHighlightValue,
      LaneHeuristicsChecks : laneHeuristicsChecksValue,
      highlightCSIcons : highlightCSIconsValue,
      highlightOverride : highlightOverrideValue,
      AddTIO : addTIOValue,
      IconsEnable : iconsEnableValue,
      IconsRotate : iconsRotateValue,
      DevToolsEnable: devToolsEnable
    };
    for (const action in W.accelerators.Actions) {
      const {shortcut : keyboardShortcut, group : keyboardActionGroup} = W.accelerators.Actions[action];
      let keyPressed = "";
      if (keyboardActionGroup === "wmelt") {
        if (keyboardShortcut) {
          keyboardShortcut.altKey === true && (keyPressed += "A");
          keyboardShortcut.shiftKey === true && (keyPressed += "S");
          keyboardShortcut.ctrlKey === true && (keyPressed += "C");
          keyPressed !== "" && (keyPressed += "+");
          keyboardShortcut.keyCode && (keyPressed += keyboardShortcut.keyCode);
        } else {
          keyPressed = "-1";
        }
        savedLTSettings[action] = keyPressed
      }
    }
    LtSettings = savedLTSettings;
    localStorage && localStorage.setItem("LT_Settings", JSON.stringify(savedLTSettings));
    const ltSettingsSaveStatus = await WazeWrap.Remote.SaveSettings("LT_Settings", savedLTSettings);
    if (ltSettingsSaveStatus === null)
      console.warn("LaneTools: User PIN not set in WazeWrap tab");
    else {
      if (ltSettingsSaveStatus === false)
        console.error("LaneTools: Unable to save settings to server");
      else
        console.log("LaneTools: Saved Settings to the Server")
    }
  }

  async function loadSpreadsheet() {
    let spreadSheetLoadStatus = false;
    const spreadsheetID = "AIzaSyDZjmkSx5xWc-86hsAIzedgDgRgy8vB7BQ",
          angleFail =
          (_0x135a7d, _0x3e3ad5, errorMsg) => { console.error("LaneTools: Error loading settings:", errorMsg); },
          rbsFail =
          (_0x2d5151, _0x4e197b, reason) => {
            console.error("LaneTools: Error loading RBS: ", reason);
            if (!RBSArray.failed) {
              WazeWrap.Alerts.error(GM_info.script.name,
                                    "Unable to load heuristics data for LG. This feature will not be available");
              RBSArray.failed = true
            }
          },
          translationFailedToLoad =
          (_0x4e546b, _0x559463, err) => { console.error("LaneTools: Error loading trans: ", err); };
    try {
      await $.getJSON(constantStrings.translationSpreadSheetBaseURL + spreadsheetID)
      .done(async (spreadSheetData) => {
        spreadSheetData.values.length > 0x0 ? _.each(spreadSheetData.values, (translationValue) => {
          let localeName = translationValue[1];
          let translationsAvailable = Number.parseInt(translationValue[2], 10) === 1;
          !TRANSLATIONS[localeName] && translationsAvailable &&
          (TRANSLATIONS[localeName] = JSON.parse(translationValue[0]));
        }) : translationFailedToLoad();
      })
      .fail(translationFailedToLoad);
    } catch (ex) {
      translationFailedToLoad(null, null, ex);
    }
    try {
      await $.getJSON(constantStrings.angleSpreadSheetBaseURL + spreadsheetID)
      .done((angleValueJSON) => {
        if (angleValueJSON.values.length > 0x0) {
          _.each(
          angleValueJSON.values,
          (angleValue) => { !configArray[angleValue[1]] && (configArray[angleValue[1]] = JSON.parse(angleValue[0])); });
          spreadSheetLoadStatus = true
        } else
          angleFail();
      })
      .fail(angleFail);
    } catch (angleException) {
      angleFail(null, null, angleException);
    }
    try {
      await $.getJSON(constantStrings.RBSAccessSheetBaseURL + spreadsheetID)
      .done((rbsValueJSON) => {
        if (rbsValueJSON.values.length > 0x0) {
          for (let idx = 0x0; idx < rbsValueJSON.values.length; idx++) {
            RBSArray[idx] = rbsValueJSON.values[idx];
          }
          RBSArray.failed = false;
        } else
          rbsFail();
      })
      .fail(rbsFail);
    } catch (rbsException) {
      rbsFail(null, null, rbsException);
    }
    spreadSheetLoadStatus && _.each(configArray, (configValueJSON) => {
      for (const configValue in configValueJSON) {
        if (configValueJSON.hasOwnProperty(configValue)) {
          let value = configValueJSON[configValue];
          configValueJSON[configValue] = Number.parseFloat(value);
        }
      }
    });
  }

  function setTranslations() {
    langLocality = I18n.currentLocale().toLowerCase();
    if (TRANSLATIONS[langLocality])
      strings = TRANSLATIONS[langLocality];
    else
      langLocality.includes("-") && TRANSLATIONS[langLocality.split("-")[0x0]]
      ? (strings = TRANSLATIONS[langLocality.split("-")[0x0]])
      : (strings = TRANSLATIONS["default"]);
    Object.keys(TRANSLATIONS.default).forEach((propertyName) => {
      (!strings.hasOwnProperty(propertyName) || strings[propertyName] === "") &&
      (strings[propertyName] = TRANSLATIONS.default[ propertyName ]);
    });
    $(".lt-trans-enabled").text(strings.enabled);
    $(".lt-trans-tglshcut").text(strings["toggleShortcut"]);
    $("#lt-trans-uiEnhance").text(strings["UIEnhance"]);
    $("#lt-trans-autoTab").text(strings["autoOpen"]);
    $("#lt-trans-autoWidth").text(strings["autoWidth"]);
    $("#lt-trans-autoExpand").text(strings["autoExpand"]);
    $("#lt-trans-autoFocus").text(strings["autoFocus"]);
    $("#lt-trans-orient").text(strings["reOrient"]);
    $("#lt-trans-enClick").text(strings["enClick"]);
    $("#lt-trans-straClick").text(strings["clickStraight"]);
    $("#lt-trans-turnClick").text(strings["clickTurn"]);
    $("#lt-trans-mapHigh").text(strings["mapHighlight"]);
    $("#lt-trans-lnLabel").text(strings["laneLabel"]);
    $("#lt-trans-nodeHigh").text(strings["nodeHigh"]);
    $("#lt-trans-laOver").text(strings["LAOHigh"]);
    $("#lt-trans-csOver").text(strings["CSOHigh"]);
    $("#lt-trans-heurCan").text(strings["heuristics"]);
    $("#lt-trans-heurPos").text(strings["posHeur"]);
    $("#lt-trans-heurNeg").text(strings["negHeur"]);
    $("#lt-trans-highCol").text(strings["highColor"]);
    $("#lt-trans-fwdCol").text(strings["fwdCol"]);
    $("#lt-trans-revCol").text(strings["revCol"]);
    $("#lt-trans-labelCol").text(strings["labelCol"]);
    $("#lt-trans-errorCol").text(strings["errorCol"]);
    $("#lt-trans-nodeCol").text(strings["laneNodeCol"]);
    $("#lt-trans-tioCol").text(strings["nodeTIOCol"]);
    $("#lt-trans-laoCol").text(strings["LAOCol"]);
    $("#lt-trans-viewCol").text(strings["viewCSCol"]);
    $("#lt-trans-hearCol").text(strings["hearCSCol"]);
    $("#lt-trans-posCol").text(strings["heurPosCol"]);
    $("#lt-trans-negCol").text(strings["heurNegCol"]);
    $("#lt-trans-devTools").text(strings["devTools"]);
    $("#lt-trans-quickTog").text(strings["quickTog"]);
    $("#lt-trans-heurRBS").text(strings["showRBS"]);
    $("#lt-trans-csIcons").text(strings["csIcons"]);
    $("#lt-trans-highOver").text(strings["highlightOverride"]);
    $("#lt-trans-AddTIO").text(strings["addTIO"]);
    $("#lt-trans-enIcons").text(strings["enIcons"]);
    $("#lt-trans-IconsRotate").text(strings["IconsRotate"]);
    $("#lt-color-title").attr("data-original-title", strings["colTooltip"]);
    if (shortcutsDisabled) {
      $("#lt-EnableShortcut").text("" + strings["disabled"]);
      $("#lt-HighlightShortcut").text("" + strings["disabled"]);
      $("#lt-UIEnhanceShortcut").text("" + strings["disabled"]);
      $("#lt-LaneHeurChecksShortcut").text("" + strings["disabled"])
    }
  }

  function setHeuristics() {
    if (RBSArray.failed)
      return;
    let config = isRBS && getId("lt-serverSelect").checked ? configArray.RBS : configArray.RPS;
    MAX_LEN_HEUR = config.MAX_LEN_HEUR;
    (MAX_PERP_DIF = config.MAX_PERP_DIF);
    (MAX_PERP_DIF_ALT = config.MAX_PERP_DIF_ALT);
    (MAX_PERP_TO_CONSIDER = config.MAX_PERP_TO_CONSIDER);
    (MAX_STRAIGHT_TO_CONSIDER = config.MAX_STRAIGHT_TO_CONSIDER);
    (MAX_STRAIGHT_DIF = config.MAX_STRAIGHT_DIF);
  }

  function checkShortcutsChanged() {
    let shortCutInvoked = false;
    for (const actionValue in W.accelerators.Actions) {
      const {shortcut : shortCutValue, group : groupValue} = W.accelerators.Actions[actionValue];
      if (groupValue === "wmelt") {
        let shortCutString = "";
        if (shortCutValue) {
          shortCutValue["altKey"] === true && (shortCutString += "A");
          shortCutValue["shiftKey"] === true && (shortCutString += "S");
          shortCutValue["ctrlKey"] === true && (shortCutString += "C");
          shortCutString !== "" && (shortCutString += "+");
          shortCutValue["keyCode"] && (shortCutString += shortCutValue["keyCode"]);
        } else
          shortCutString = "-1";
        if (LtSettings[actionValue] !== shortCutString) {
          (shortCutInvoked = true);
          console.log("LaneTools: Stored shortcut " + actionValue + ": " + LtSettings[actionValue] + "changed to " +
                      shortCutString);
          break;
        }
      }
    }
    if (shortCutInvoked) {
      saveSettings().then(r => setTimeout(() => { updateShortcutLabels(); }, 200));
    }
  }

  function getKeyboardShortcut(settingValue) {
    const keyboardShortCut = LtSettings[settingValue];
    let shortCutValue = "";
    if (keyboardShortCut !== "-1") {
      if (keyboardShortCut.indexOf("+") > -1) {
        const keyboardKeyValue = keyboardShortCut.split("+")[0x0];
        for (let index = 0x0; index < keyboardKeyValue.length; index++) {
          shortCutValue.length > 0x0 && (shortCutValue += "+");
          keyboardKeyValue[index] === "C" && (shortCutValue += "Ctrl");
          keyboardKeyValue[index] === "S" && (shortCutValue += "Shift");
          keyboardKeyValue[index] === "A" && (shortCutValue += "Alt");
        }
        shortCutValue.length > 0x0 && (shortCutValue += "+");
        let keyboardKey = keyboardShortCut.split("+")[0x1];
        if (keyboardKey >= 96 && keyboardKey <= 105) {
          keyboardKey -= 48;
          shortCutValue += "[num pad]";
        }
        shortCutValue += String.fromCharCode(keyboardKey);
      } else {
        let keyboardKey = Number.parseInt(keyboardShortCut, 10);
        if (keyboardKey >= 96 && keyboardKey <= 105) {
          keyboardKey -= 48;
          shortCutValue += "[num pad]";
        }
        shortCutValue += String.fromCharCode(keyboardKey);
      }
    }
    return shortCutValue;
  }

  function updateShortcutLabels() {
    if (!shortcutsDisabled) {
      $("#lt-EnableShortcut").text(getKeyboardShortcut("enableScript"));
      $("#lt-HighlightShortcut").text(getKeyboardShortcut("enableHighlights"));
      $("#lt-UIEnhanceShortcut").text(getKeyboardShortcut("enableUIEnhancements"));
      $("#lt-LaneHeurChecksShortcut").text(getKeyboardShortcut("enableHeuristics"))
    }
  }

  function getSegObj(objectID) { return W.model.segments.getObjectById(objectID); }

  function getNodeObj(objectID) { return W.model.nodes.getObjectById(objectID); }
  function decorateSegments(flagsObject, selectedFeatures, eventInfo = null) {
    if (eventInfo !== null) {
      eventInfo.stopPropagation();
    }
    getId("lt-ReverseLanesIcon").checked && !flagsObject.rotateDisplayLanes && rotateDisplay(flagsObject);
    getId("lt-highlightCSIcons").checked && decorateCSIcons(selectedFeatures);
    if (_pickleColor >= 0x1 || editorInfo["editableCountryIDS"].length > 0x0) {
      if (getId("li-del-opp-btn"))
        $("#li-del-opp-btn").remove();
      let
      delForwardButton = $(
      "<button type=\"button\" id=\"li-del-fwd-btn\" style=\"height:20px;background-color:white;border:1px solid grey;border-radius:8px;\">" +
      strings.delFwd + "</button>"),
      deleteRefButton = $(
      "<button type=\"button\" id=\"li-del-rev-btn\" style=\"height:20px;background-color:white;border:1px solid grey;border-radius:8px;\">" +
      strings.delRev + "</button>"),
      deleteOppButton = $(
      "<button type=\"button\" id=\"li-del-opp-btn\" style=\"height:auto;background-color:orange;border:1px solid grey;border-radius:8px; margin-bottom:5px;\">" +
      strings.delOpp + "</button>"),
      fwdDisplayRelative = $("<div style=\"display:inline-block;position:relative;\" />"),
      revDisplayRelativeSelector = $("<div style=\"display:inline-block;position:relative;\" />"),
      oppDisplayRelativeSelector = $("<div style=\"display:inline-block;position:relative;\" />");
      delForwardButton.appendTo(fwdDisplayRelative);
      deleteRefButton.appendTo(revDisplayRelativeSelector);
      deleteOppButton.appendTo(oppDisplayRelativeSelector);
      const liDeleteFwdButtonSelector = $("#li-del-fwd-btn"), liDeleteReverseButtonSelector = $("#li-del-rev-btn"),
            liDeleteOppositeButtonSelector = $("#li-del-opp-btn");
      liDeleteFwdButtonSelector.off();
      liDeleteReverseButtonSelector.off();
      liDeleteOppositeButtonSelector.off();
      if (!getId("li-del-rev-btn") && !flagsObject.revLanesEnabled &&
          selectedFeatures[0x0].attributes.wazeFeature._wmeObject.getRevLanes().laneCount > 0x0) {
        if ($(constantStrings.revLanesInstructionsFromCSS).length > 0x0) {
          revDisplayRelativeSelector.prependTo(constantStrings.revLanesInstructionsFromCSS);
          $(constantStrings.revLanesInstructionsFromCSS).css("border-bottom", "4px dashed " + LtSettings.BAColor);
        } else if (selectedFeatures[0x0].attributes.wazeFeature._wmeObject.attributes.revDirection !== true) {
          deleteOppButton.prop("title", "rev");
          deleteOppButton.prependTo(constantStrings.editPanelCSS);
        }
      } else
        $(constantStrings.revLanesInstructionsFromCSS).css("border-bottom", "4px dashed " + LtSettings.BAColor);
      if (!getId("li-del-fwd-btn") && !flagsObject.fwdLanesEnabled &&
          selectedFeatures[0x0].attributes.wazeFeature._wmeObject.getFwdLanes().laneCount > 0x0) {
        if ($(constantStrings.fwdLanesDivInstructionCSS).length > 0x0) {
          fwdDisplayRelative.prependTo(constantStrings.fwdLanesDivInstructionCSS);
          $(constantStrings.fwdLanesDivInstructionCSS).css("border-bottom", "4px dashed " + LtSettings.ABColor);
        } else if (selectedFeatures[0x0].attributes.wazeFeature._wmeObject.attributes.fwdDirection !== true) {
          deleteOppButton.prop("title", "fwd");
          deleteOppButton.prependTo(constantStrings.editPanelCSS);
        }
      } else
        $(constantStrings.fwdLanesInstructionsFromCSS).css("border-bottom", "4px dashed " + LtSettings.ABColor);
      liDeleteFwdButtonSelector.on("click", function() {
        delLanes("fwd");
        flagsObject.fwdLanesEnabled = true;
        setTimeout(function() { decorateSegments(flagsObject, selectedFeatures); }, 200);
      });
      liDeleteReverseButtonSelector.on("click", function() {
        delLanes("rev");
        flagsObject.revLanesEnabled = true;
        setTimeout(function() { decorateSegments(flagsObject, selectedFeatures); }, 200);
      });
      liDeleteOppositeButtonSelector.on("click", function() {
        let laneDirection = $(this).prop("title");
        delLanes(laneDirection);
        laneDirection === "rev" ? (flagsObject.revLanesEnabled = true) : (flagsObject.fwdLanesEnabled = true);
        decorateSegments(flagsObject, selectedFeatures);
      });
    }
    const editLaneGuidanceSelector = $(".edit-lane-guidance");
    editLaneGuidanceSelector.off();
    editLaneGuidanceSelector.on("click", function() {
      $(this).parents(".fwd-lanes").length && setTimeout(function() {
        setupTurnLanesForDirection("fwd");
        populateNumberOfLanes();
        configureDirectionLanesHTML();
        setupAutoFocusLanes(flagsObject);
        setUpActionButtons(flagsObject, selectedFeatures);
        if (getId("lt-AddTIO").checked)
          addTIOUI("fwd");
      }, 100);
      $(this).parents(".rev-lanes").length && setTimeout(function() {
        setupTurnLanesForDirection("rev");
        populateNumberOfLanes();
        configureDirectionLanesHTML();
        setupAutoFocusLanes(flagsObject);
        setUpActionButtons(flagsObject, selectedFeatures);
        if (getId("lt-AddTIO").checked)
          addTIOUI("rev");
      }, 100);
    });
    if (!flagsObject.fwdLanesEnabled && !flagsObject.revLanesEnabled && !flagsObject.autoOpenTriggered)
      triggerAutoFunctions(flagsObject);
    configureDirectionLanesHTML();
  }
  function setUpActionButtons(flagsObject, selectedFeatures) {
    $(".apply-button.waze-btn.waze-btn-blue").off();
    $(".cancel-button").off();
    const fwdLanesSelector = $(".fwd-lanes"), revLanesSelector = $(".rev-lanes");
    fwdLanesSelector.find(".apply-button.waze-btn.waze-btn-blue").on("click", () => {
      flagsObject.fwdLanesEnabled = true;
      setTimeout(function() { decorateSegments(flagsObject, selectedFeatures); }, 200);
    });
    revLanesSelector.find(".apply-button.waze-btn.waze-btn-blue").on("click", () => {
      flagsObject.revLanesEnabled = true;
      setTimeout(function() { decorateSegments(flagsObject, selectedFeatures); }, 200);
    });
    fwdLanesSelector.find(".cancel-button").on("click", () => {
      flagsObject.fwdLanesEnabled = true;
      setTimeout(function() { decorateSegments(flagsObject, selectedFeatures); }, 200);
    });
    revLanesSelector.find(".cancel-button").on("click", () => {
      flagsObject.revLanesEnabled = true;
      setTimeout(function() { decorateSegments(flagsObject, selectedFeatures); }, 200);
    });
  }
  function triggerAutoFunctions(flagsObject) {
    flagsObject.autoOpenTriggered = true;
    if (getId("lt-AutoExpandLanes").checked) {
      if (!flagsObject.fwdLanesEnabled) {
      }
      if (!flagsObject.revLanesEnabled) {
      }
    }
    if (getId("lt-AutoOpenWidth").checked) {
      let wzButtonSelector = $(".set-road-width > wz-button");
      if (!flagsObject.fwdLanesEnabled) {
        $(".fwd-lanes").find(wzButtonSelector).trigger("click");
      }
      if (!flagsObject.revLanesEnabled) {
        $(".rev-lanes").find(wzButtonSelector).trigger("click");
      }
    }
  }

  function configureDirectionLanesHTML() {
    $(".fwd-lanes > div > .direction-lanes").css({
      padding : "5px 5px 10px",
      "margin-bottom" : "10px",
    });
    $("<div class=\x22lt-add-Width fwd\x22>2</div>").css({
      padding : "5px 5px 10px",
      margin : "0px",
    });
    $(constantStrings.fwdLanesDirectionControlEditCSS).css("padding-top", "10px");
    $(constantStrings.revLanesInstructionsToCSS).css("padding-top", "10px");
    $(constantStrings.fwdLanesLaneInstrunctionToCSS).css("margin-bottom", "4px");
    $(
    ".rev-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.edit-region > div > div > div:nth-child(1)")
    .css("margin-bottom", "4px");
  }

  function getLaneItems(count, class_names_list) {
    let itemsList = [], classString = class_names_list.join(" "), idStringBase = class_names_list.join("-");
    for (let i = 1; i <= count; ++i) {
      let idString = idStringBase + "-" + i.toString();
      let selectorString = "<div class=\"" + classString + "\" id=\"" + idString + "\">" + i.toString() + "</div>";
      let newItem = $(selectorString).css({
        padding : "2px",
        border : "2px",
        "border-radius" : "50%",
        height : "20px",
        width : "20px",
        "text-align" : "center"
      });
      itemsList.push(newItem)
    }
    return itemsList;
  }

  function setupLaneCountControls(parentSelector, classNamesList) {
    const jqueryClassSelector = "." + classNamesList.join(".");
    $(jqueryClassSelector).on("click", function() {
      $(jqueryClassSelector).css({"background-color" : "transparent", "color" : "black"});
      $(this).css({"background-color" : "navy", "color" : "white"});
    });
    let numLanesSelector = parentSelector.find(".form-control");
    let idString = "#" + classNamesList.join("-") + "-" + numLanesSelector.val();
    $(idString).css({"background-color" : "navy", "color" : "white"});
  }
  function populateNumberOfLanes() {
    let fwdLanesSelector = $(".fwd-lanes"), revLanesSelector = $(".rev-lanes");
    if (fwdLanesSelector.find(".direction-lanes").children().length > 0x0 && !getId("lt-fwd-add-lanes")) {
      let
      addLanesItem = $(
      "<div style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22 id=\x22lt-fwd-add-lanes\x22 />"),
      classNamesList = [ "lt-add-lanes", "fwd" ], laneCountsToAppend = getLaneItems(8, classNamesList);
      for (let idx = 0; idx < laneCountsToAppend.length; ++idx) {
        addLanesItem.append(laneCountsToAppend[idx]);
      }
      addLanesItem.appendTo(constantStrings.fwdLanesNthChild);
      setupLaneCountControls(fwdLanesSelector, classNamesList);
    }
    if (revLanesSelector.find(".direction-lanes").children().length > 0x0 && !getId("lt-rev-add-lanes")) {
      let
      reverseLaneDiv = $(
      "<div style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22 id=\x22lt-rev-add-lanes\x22 />"),
      classNamesList = [ "lt-add-lanes", "rev" ], laneCountsToAppend = getLaneItems(8, classNamesList);
      for (let idx = 0; idx < laneCountsToAppend.length; ++idx) {
        reverseLaneDiv.append(laneCountsToAppend[idx]);
      }
      reverseLaneDiv.appendTo(constantStrings.revLanesNthChild);
      setupLaneCountControls(revLanesSelector, classNamesList);
    }

    $(".lt-add-lanes").on("click", function() {
      let addLanesText = $(this).text(), formControlSelector = $(".form-control");
      addLanesText = Number.parseInt(addLanesText, 10);
      if ($(this).hasClass("lt-add-lanes fwd")) {
        // const fwdLanesSelector = $(".fwd-lanes");
        fwdLanesSelector.find(formControlSelector).val(addLanesText);
        fwdLanesSelector.find(formControlSelector).trigger("click");
        fwdLanesSelector.find(formControlSelector).trigger("change");
      }
      if ($(this).hasClass("lt-add-lanes rev")) {
        // const revLanesSelector = $(".rev-lanes");
        revLanesSelector.find(formControlSelector).val(addLanesText);
        revLanesSelector.find(formControlSelector).trigger("focus");
        revLanesSelector.find(formControlSelector).trigger("change");
      }
    });
    if (fwdLanesSelector.find(".direction-lanes").children().length > 0x0 && !getId("lt-fwd-add-Width")) {
      let addFwdLanes =
          $("<div style=\x22display:inline-flex;flex-direction:row;width:100%;\x22 id=\x22lt-fwd-add-Width\x22 />"),
          classNamesList = [ "lt-add-Width", "fwd" ], laneCountsToAppend = getLaneItems(8, classNamesList);
      for (let idx = 0; idx < laneCountsToAppend.length; ++idx) {
        addFwdLanes.append(laneCountsToAppend[idx]);
      }
      addFwdLanes.prependTo(
      ".fwd-lanes > div > div > .lane-instruction.lane-instruction-from > .instruction > .road-width-edit > div > div > div > .lane-width-card");
      const jqueryClassSelector = "." + classNamesList.join(".");
      $(jqueryClassSelector).on("click", function() {
        $(jqueryClassSelector).css({"background-color" : "transparent", "color" : "black"});
        $(this).css({"background-color" : "navy", "color" : "white"});
      });
    }
    if (revLanesSelector.find(".direction-lanes").children().length > 0x0 && !getId("lt-rev-add-Width")) {
      let appendRevLanes =
          $("<div style=\x22display:inline-flex;flex-direction:row;width:100%;\x22 id=\x22lt-rev-add-Width\x22 />"),
          classNamesList = [ "lt-add-Width", "rev" ], laneCountsToAppend = getLaneItems(8, classNamesList);
      for (let idx = 0; idx < laneCountsToAppend.length; ++idx) {
        appendRevLanes.append(laneCountsToAppend[idx]);
      }
      appendRevLanes.prependTo(
      ".rev-lanes > div > div > .lane-instruction.lane-instruction-from > .instruction > .road-width-edit > div > div > div > .lane-width-card");
      const jqueryClassSelector = "." + classNamesList.join(".");
      $(jqueryClassSelector).on("click", function() {
        $(jqueryClassSelector).css({"background-color" : "transparent", "color" : "black"});
        $(this).css({"background-color" : "navy", "color" : "white"});
      });
    }
    $(".lt-add-Width").on("click", function() {
      let numLanesToAdd = $(this).text();
      numLanesToAdd = Number.parseInt(numLanesToAdd, 10);
      if ($(this).hasClass("lt-add-Width fwd")) {
        // const fwdLanesSelector = $(".fwd-lanes");
        fwdLanesSelector.find("#number-of-lanes").val(numLanesToAdd);
        fwdLanesSelector.find("#number-of-lanes").trigger("change");
        fwdLanesSelector.find("#number-of-lanes").trigger("focus");
      }
      if ($(this).hasClass("lt-add-Width rev")) {
        // const revLanesSelector = $(".rev-lanes");
        revLanesSelector.find("#number-of-lanes").val(numLanesToAdd);
        revLanesSelector.find("#number-of-lanes").trigger("focus");
        revLanesSelector.find("#number-of-lanes").trigger("change");
      }
    });
  }

  function setupAutoFocusLanes(flagsObject) {
    if (getId("lt-AutoFocusLanes").checked) {
      const fwdLanesSelector = $(".fwd-lanes"), revLanesSelector = $(".rev-lanes"),
            editRegionSelectors = $(".edit-region"), formControlSelectors = $(".form-control");
      if (fwdLanesSelector.find(editRegionSelectors).children().length > 0x0 && !flagsObject.fwdLanesEnabled)
        fwdLanesSelector.find(formControlSelectors).trigger("focus");
      else if (revLanesSelector.find(editRegionSelectors).children().length > 0x0 && !flagsObject.revLanesEnabled) {
        revLanesSelector.find(formControlSelectors).trigger("focus");
      }
    }
  }

  function setupTurnLanesForDirection(laneDirection) {
    if (getId("lt-DevToolsEnable").checked && getId("lt-SelAllEnable").checked) {
      $(".street-name").css("user-select", "none");
      let formControlSelector = laneDirection === "fwd" ? $(".fwd-lanes").find(".form-control")[0x0]
                                                        : $(".rev-lanes").find(".form-control")[0x0],
          numOfLanesForGuidance = $(formControlSelector).val();
      $(formControlSelector).on("change", function() {
        let turnsRegion;
        if ($(this).parents(".fwd-lanes").length)
          turnsRegion = $(".fwd-lanes").find(".controls-container.turns-region");
        else if ($(this).parents(".rev-lanes").length)
          turnsRegion = $(".rev-lanes").find(".controls-container.turns-region");
        turnsRegion = $(".street-name", turnsRegion);
        for (let idx = 0x0; idx < turnsRegion.length; idx++) {
          $(turnsRegion[idx]).off();
          $(turnsRegion[idx]).on("click", function() {
            let turnDirection = $(this).get(0x0), parentElement = turnDirection["parentElement"],
                htmlElements = $(".checkbox-large.checkbox-white", parentElement);
            if (htmlElements.length > 0) {
              const elementDisabled = !getId(htmlElements[0x0].id).checked;
              for (let idx = 0x0; idx < htmlElements.length; idx++) {
                const idElement = $("#" + htmlElements[idx].id);
                idElement.prop("checked", elementDisabled);
                idElement.trigger("change");
              }
            }
          });
        }
      });
      numOfLanesForGuidance > 0x0 && $(formControlSelector).trigger("change");
    }
  }
  function decorateCSIcons(selectedFeatures) {
    const segmentRef = selectedFeatures[0x0].attributes.wazeFeature._wmeObject,
          bNodeRef = getNodeObj(segmentRef.attributes.toNodeID),
          aNodeRef = getNodeObj(segmentRef.attributes.fromNodeID);
    let fwdLanesConfig =
        getLanesConfig(segmentRef, bNodeRef, bNodeRef.attributes.segIDs, segmentRef.attributes.fwdLaneCount),
        numFwdGuidedLanes = fwdLanesConfig[4],
        revLanesConfig =
        getLanesConfig(segmentRef, aNodeRef, aNodeRef.attributes.segIDs, segmentRef.attributes.revLaneCount),
        numRevGuidedLanes = revLanesConfig[4];
    if (numFwdGuidedLanes > 0) {
      let fwdCSIconColor = (numFwdGuidedLanes === 0x1 ? LtSettings.CS1Color : LtSettings.CS2Color),
          _0x1d2fa0 = $(constantStrings.segmentEditLanes).children();
      for (let i = 0x0; i < _0x1d2fa0.length; i++) {
        _0x1d2fa0[i]["title"] === fwdLanesConfig[5] && $(_0x1d2fa0[i]).css("background-color", fwdCSIconColor);
      }
    }
    if (numRevGuidedLanes > 0x0) {
      let revCSIconColor = (numRevGuidedLanes === 0x1 ? LtSettings.CS1Color : LtSettings.CS2Color),
          _0x37b735 = $(constantStrings.segmentEditLanes).children();
      for (let i = 0x0; i < _0x37b735.length; i++) {
        _0x37b735[i]["title"] === revLanesConfig[0x5] && $(_0x37b735[i]).css("background-color", revCSIconColor);
      }
    }
  }

  function rotateDisplay(flagsObject) {
    let headingElement = document.getElementsByClassName("heading"), laneArrows = $(".lane-arrows > div").get();
    for (let idx = 0x0; idx < headingElement.length; idx++) {
      if (headingElement[idx].textContent.includes("south")) {
        let kids = $(laneArrows[idx]).children();
        $(kids).css("transform", "rotate(180deg)");
        $(laneArrows[idx]).append(kids.get().reverse());
      }
    }
    flagsObject.rotateDisplayLanes = true;
  }

  function lanesTabSetup() {
    if (getId("edit-panel").getElementsByTagName("wz-tabs").length === 0x0) {
      setTimeout(lanesTabSetup, 2000);
      console.log("Edit panel not yet loaded.");
      return;
    }
    const selectedFeatures = W.selectionManager.getSelectedFeatures();
    let flagsObject = {};
    flagsObject.fwdLanesEnabled = false;
    flagsObject.revLanesEnabled = false;
    flagsObject.rotateDisplayLanes = false;
    flagsObject.autoOpenTriggered = false;
    // function _0x47ffa9() {
    //   W.model.nodes.get(W.selectionManager.getSegmentSelection().segments[0].attributes.toNodeID).attributes.geometry;
    //   document.getElementById(
    //       W.model.nodes.get(W.selectionManager.getSegmentSelection().segments[0].attributes.toNodeID)
    //           .attributes.geometry.id);
    //   console.log("hovering to B");
    // }
    // function _0x758543() {
    //   W.model.nodes
    //       .get(W.selectionManager.getSegmentSelection()
    //                .segments[0]
    //                .attributes.fromNodeID)
    //       .attributes.geometry;
    //   document.getElementById(
    //       W.model.nodes
    //           .get(W.selectionManager.getSegmentSelection()
    //                    .segments[0]
    //                    .attributes.fromNodeID)
    //           .attributes.geometry.id),
    //       console.log("hovering to A");
    // }

    if (getId("lt-UIEnable").checked && getId("lt-ScriptEnabled").checked && selectedFeatures.length > 0x0) {
      if (selectedFeatures.length === 0x1 &&
          selectedFeatures[0x0].attributes.wazeFeature._wmeObject.type === "segment") {
        $(".lanes-tab").on("click", (event) => { decorateSegments(flagsObject, selectedFeatures, event); });
        getId("lt-AutoLanesTab").checked && setTimeout(() => { $(".lanes-tab").trigger("click"); }, 100);
      } else
        selectedFeatures.length === 0x2 && scanHeuristicsCandidates(selectedFeatures);
    }
  }

  function toggleScript() { $("#lt-ScriptEnabled").trigger("click"); }

  function toggleHighlights() { $("#lt-HighlightsEnable").trigger("click"); }

  function toggleUIEnhancements() { $("#lt-UIEnable").click(); }

  function toggleLaneHeuristicsChecks() { $("#lt-LaneHeuristicsChecks").click(); }

  function displayToolbar() {
    let toolbarContainer = $("#lt-toolbar-container");
    if (!getId("lt-ScriptEnabled").checked || !getId("lt-DevToolsEnable").checked || !getId("lt-CopyEnable").checked) {
      toolbarContainer.css({visibility : "hidden"});
      return;
    }
    const featureList = W.selectionManager.getSelectedFeatures();
    if (featureList.length === 0x1 && getId("lt-CopyEnable").checked && getId("lt-DevToolsEnable").checked &&
        getId("lt-ScriptEnabled").checked) {
      if (featureList[0x0].attributes.wazeFeature._wmeObject.type.toLowerCase() === "segment") {
        const mapSelector = $("#map");
        toolbarContainer.css({
          visibility : "visible",
          left : mapSelector.width() * 0.1,
          top : mapSelector.height() * 0.1,
        });
      }
    } else
      toolbarContainer.css({visibility : "visible"});
  }

  function getId(elementId) { return document.getElementById(elementId); }

  function onScreen(wmeObject, zoomLevel) {
    if (!wmeObject || !wmeObject.geometry || !wmeObject.attributes)
      return false;
    if (zoomLevel >= DisplayLevels["MIN_ZOOM_NONFREEWAY"] ||
        (wmeObject.type === "segments" && wmeObject.attributes["roadType"] === LT_ROAD_TYPE.FREEWAY))
      return W.map.getExtent().intersectsBounds(wmeObject.geometry.getBounds());
    return false;
  }

  function getSegmentAngle(nodeId, segment) {
    if (nodeId == null || segment == null)
      return null;
    let xDiff, yDiff;
    if (segment.attributes.fromNodeID === nodeId) {
      xDiff = lt_get_second_point(segment).x - lt_get_first_point(segment).x;
      yDiff = lt_get_second_point(segment).y - lt_get_first_point(segment).y;
    } else {
      xDiff = lt_get_next_to_last_point(segment).x - lt_get_last_point(segment).x;
      yDiff = lt_get_next_to_last_point(segment).y - lt_get_last_point(segment).y;
    }
    let angleRad = Math.atan2(yDiff, xDiff), angleDegrees = ((angleRad * 180) / Math.PI) % 360;
    if (angleDegrees < 0x0)
      angleDegrees = angleDegrees + 360;
    return Math.round(angleDegrees);
  }

  function lt_get_first_point(segment) { return segment.geometry.components[0x0]; }

  function lt_get_last_point(segment) { return segment.geometry.components[segment.geometry.components.length - 0x1]; }

  function lt_get_second_point(segment) { return segment.geometry.components[0x1]; }

  function lt_get_next_to_last_point(segment) {
    return segment.geometry.components[segment.geometry.components.length - 0x2];
  }

  function delLanes(laneDirection) {
    const selectedFeatures = W.selectionManager.getSelectedFeatures(),
          wmeObject = selectedFeatures[0x0].attributes.wazeFeature._wmeObject, turnGraph = W.model.getTurnGraph(),
          mAction = new MultiAction();
    let nodeObject, attachedSegmentIDs, lanesObject = {};
    mAction.setModel(W.model);
    if (laneDirection === "fwd") {
      lanesObject.fwdLaneCount = 0x0;
      nodeObject = getNodeObj(wmeObject.attributes.toNodeID);
      attachedSegmentIDs = nodeObject.getSegmentIds();
      const fwdLanesSelector = $(".fwd-lanes");
      fwdLanesSelector.find(".form-control").val(0x0);
      fwdLanesSelector.find(".form-control").trigger("change");
    }
    if (laneDirection === "rev") {
      lanesObject.revLaneCount = 0x0;
      nodeObject = getNodeObj(wmeObject.attributes.fromNodeID);
      attachedSegmentIDs = nodeObject.getSegmentIds();
      const revLanesSelector = $(".rev-lanes");
      revLanesSelector.find(".form-control").val(0x0);
      revLanesSelector.find(".form-control").trigger("change");
    }
    mAction.doSubAction(new UpdateObj(wmeObject, lanesObject));
    for (let idx = 0x0; idx < attachedSegmentIDs.length; idx++) {
      let turnNode = turnGraph.getTurnThroughNode(nodeObject, wmeObject, getSegObj(attachedSegmentIDs[idx])),
          turnData = turnNode.getTurnData();
      if (turnData.hasLanes()) {
        turnData = turnData.withLanes();
        turnNode = turnNode.withTurnData(turnData);
        mAction.doSubAction(new SetTurn(turnGraph, turnNode));
      }
    }
    mAction._description = "Deleted lanes and turn associations";
    W.model.actionManager.add(mAction);
  }

  function removeHighlights() {
    LTHighlightLayer.removeAllFeatures();
    LTNamesLayer.removeAllFeatures();
  }

  function removeLaneGraphics() { LTLaneGraphics.removeAllFeatures(); }

  function applySegmentCountDisplay(anchorPoint, fwdSegmentLaneCount, revSegmentLaneCount) {
    let replAnchorPoint = anchorPoint.clone(), _0x58bfcc = fwdSegmentLaneCount + " / " + revSegmentLaneCount,
        newLayer = new OpenLayers.Feature.Vector(replAnchorPoint, {
          labelText : _0x58bfcc,
          labelColor : LtSettings.LabelColor,
        });
    LTNamesLayer.addFeatures([ newLayer ]);
  }

  function highlightSegment(segGeom, segDirection, highlightEnabled, highlightLabelsEnabled, forwardLaneCount,
                            reverseLaneCount, tioAndLIO, turnGuidanceMode, lanesMissingConfiguration, heurCandidate,
                            applyHeuristics) {
    const segmentHighlightTypes = {
      DASH_THIN : 0x1,
      DASH_THICK : 0x2,
      HIGHLIGHT : 0xa,
      OVER_HIGHLIGHT : 0x14,
    },
          newSegmentGeometry = segGeom.clone(), csEnabled = getId("lt-CSEnable").checked;
    if (newSegmentGeometry.components.length > 0x2) {
      let numComponents = newSegmentGeometry.components.length, oneDirectionNumComponents = numComponents / 2,
          fwdNumComponents =
          numComponents % 0x2 ? Math.ceil(oneDirectionNumComponents) - 0x1 : Math.ceil(oneDirectionNumComponents),
          revNumComponents =
          numComponents % 0x2 ? Math.floor(oneDirectionNumComponents) + 0x1 : Math.floor(oneDirectionNumComponents);
      if (segDirection === Direction.FORWARD) {
        let _0x21e1e8 = getModifiableComponents(newSegmentGeometry, fwdNumComponents, numComponents);
        highlightEnabled && applyLineDecoration(_0x21e1e8, "" + LtSettings.ABColor, segmentHighlightTypes.DASH_THIN);
        _0x43deae(_0x21e1e8, tioAndLIO, lanesMissingConfiguration, heurCandidate, applyHeuristics);
      } else {
        if (segDirection === Direction.REVERSE) {
          let _0x3e6b6f = getModifiableComponents(newSegmentGeometry, 0x0, revNumComponents);
          highlightEnabled && applyLineDecoration(_0x3e6b6f, "" + LtSettings.BAColor, segmentHighlightTypes.DASH_THIN);
          _0x43deae(_0x3e6b6f, tioAndLIO, lanesMissingConfiguration, heurCandidate, applyHeuristics);
        }
      }
      if (highlightLabelsEnabled && (Direction.FORWARD || forwardLaneCount === 0x0)) {
        if (numComponents % 0x2)
          applySegmentCountDisplay(newSegmentGeometry.components[fwdNumComponents], forwardLaneCount, reverseLaneCount);
        else {
          let _0x3f4fb2 = newSegmentGeometry.components[revNumComponents - 0x1],
              _0x196425 = newSegmentGeometry.components[fwdNumComponents],
              _0x2daf64 =
              new OpenLayers.Geometry.Point((_0x3f4fb2.x + _0x196425.x) / 0x2, (_0x3f4fb2.y + _0x196425.y) / 0x2);
          applySegmentCountDisplay(_0x2daf64, forwardLaneCount, reverseLaneCount);
        }
      }
    } else {
      let _0x5b73aa = newSegmentGeometry.components[0x0], _0x3cd08d = newSegmentGeometry.components[0x1],
          startPoint =
          new OpenLayers.Geometry.Point((_0x5b73aa.x + _0x3cd08d.x) / 0x2, (_0x5b73aa.y + _0x3cd08d.y) / 0x2);
      if (segDirection === Direction.FORWARD) {
        let fwdEndPoint = new OpenLayers.Geometry.Point(newSegmentGeometry.components[0x1].clone().x,
                                                        newSegmentGeometry.components[0x1].clone().y),
            fwdLaneDecorationLine = new OpenLayers.Geometry.LineString([ startPoint, fwdEndPoint ], {});
        highlightEnabled &&
        applyLineDecoration(fwdLaneDecorationLine, "" + LtSettings.ABColor, segmentHighlightTypes.DASH_THIN);
        _0x43deae(fwdLaneDecorationLine, tioAndLIO, lanesMissingConfiguration, heurCandidate, applyHeuristics);
      } else {
        if (segDirection === Direction.REVERSE) {
          let revEndPoint = new OpenLayers.Geometry.Point(newSegmentGeometry.components[0x0].clone().x,
                                                          newSegmentGeometry.components[0x0].clone().y),
              revLaneDecorationLine = new OpenLayers.Geometry.LineString([ startPoint, revEndPoint ], {});
          highlightEnabled &&
          applyLineDecoration(revLaneDecorationLine, "" + LtSettings.BAColor, segmentHighlightTypes.DASH_THIN);
          _0x43deae(revLaneDecorationLine, tioAndLIO, lanesMissingConfiguration, heurCandidate, applyHeuristics);
        }
      }
      highlightLabelsEnabled && (Direction.FORWARD || forwardLaneCount === 0x0) &&
      applySegmentCountDisplay(startPoint, forwardLaneCount, reverseLaneCount);
    }

    function getModifiableComponents(_0x1226a0, _0x5d1ef6, _0x2d2248) {
      let _0x3411db = [];
      for (let idx = _0x5d1ef6; idx < _0x2d2248; idx++) {
        _0x3411db[idx] = _0x1226a0.components[idx].clone();
      }
      return new OpenLayers.Geometry.LineString(_0x3411db, {});
    }

    function _0x43deae(decorationLine, tioAndLIO, lanesMissingConfiguration, heuristicsCandidate,
                       applyHeuristics = false) {
      if (lanesMissingConfiguration) {
        applyLineDecoration(decorationLine.clone(), "" + LtSettings.ErrorColor, segmentHighlightTypes.OVER_HIGHLIGHT);
        return;
      }
      tioAndLIO &&
      applyLineDecoration(decorationLine.clone(), "" + LtSettings.LIOColor, segmentHighlightTypes.HIGHLIGHT);
      turnGuidanceMode === 0x1 && csEnabled &&
      applyLineDecoration(decorationLine.clone(), "" + LtSettings.CS1Color, segmentHighlightTypes.HIGHLIGHT);
      turnGuidanceMode === 0x2 && csEnabled &&
      applyLineDecoration(decorationLine.clone(), "" + LtSettings.CS2Color, segmentHighlightTypes.HIGHLIGHT);
      if (heuristicsCandidate === HeuristicsCandidate["PASS"])
        applyLineDecoration(decorationLine.clone(), "" + LtSettings.HeurColor,
                            applyHeuristics ? segmentHighlightTypes.OVER_HIGHLIGHT : segmentHighlightTypes.HIGHLIGHT);
      else
        heuristicsCandidate === HeuristicsCandidate.FAIL &&
        applyLineDecoration(decorationLine.clone(), "" + LtSettings.HeurFailColor,
                            applyHeuristics ? segmentHighlightTypes.OVER_HIGHLIGHT : segmentHighlightTypes.HIGHLIGHT);
    }

    function applyLineDecoration(lineLayerObject, lineColor, highLightType) {
      let lineLayerVector = new OpenLayers.Feature.Vector(lineLayerObject, {}, {});
      LTHighlightLayer.addFeatures([ lineLayerVector ]);
      const lineLayerObjectId = document.getElementById(lineLayerObject.id);
      if (lineLayerObjectId) {
        lineLayerObjectId.setAttribute("stroke", "" + lineColor);
        if (highLightType === segmentHighlightTypes.HIGHLIGHT) {
          lineLayerObjectId.setAttribute("stroke-width", "15");
          lineLayerObjectId.setAttribute("stroke-opacity", ".6");
        } else {
          if (highLightType === segmentHighlightTypes.OVER_HIGHLIGHT) {
            lineLayerObjectId.setAttribute("stroke-width", "18");
            lineLayerObjectId.setAttribute("stroke-opacity", ".85");
          } else {
            lineLayerObjectId.setAttribute("stroke-opacity", "1");
            if (highLightType === segmentHighlightTypes.DASH_THICK) {
              lineLayerObjectId.setAttribute("stroke-width", "8");
              lineLayerObjectId.setAttribute("stroke-dasharray", "8 10");
            } else if (highLightType === segmentHighlightTypes.DASH_THIN) {
              lineLayerObjectId.setAttribute("stroke-width", "4");
              lineLayerObjectId.setAttribute("stroke-dasharray", "10 10")
            }
          }
        }
      }
    }

    LTHighlightLayer.setZIndex(450);
  }

  function highlightNode(nodeGeometry, highLightColor, indicateHeuristics = false) {
    const clonedNodeGeometry = nodeGeometry.clone(), _0x1313c1 = new OpenLayers.Feature.Vector(clonedNodeGeometry, {});
    LTHighlightLayer.addFeatures([ _0x1313c1 ]);
    const nodeElement = document.getElementById(clonedNodeGeometry.id);
    if (nodeElement !== null) {
      nodeElement.setAttribute("fill", highLightColor);
      nodeElement.setAttribute("r", indicateHeuristics ? "18" : "10");
      nodeElement.setAttribute("fill-opacity", "0.9");
      nodeElement.setAttribute("stroke-width", "0");
    }
  }

  let lt_scanArea_timer = {
    start : function() {
      this.cancel();
      let timerObject = this;
      this["timeoutID"] = window.setTimeout(function() { timerObject.calculate(); }, 500);
    },
    calculate : function() {
      scanArea_real();
      delete this.timeoutID;
    },
    cancel : function() {
      if (typeof this.timeoutID === "number") {
        window.clearTimeout(this.timeoutID);
        delete this.timeoutID;
        lt_scanArea_recursive = 0x0;
      }
    },
  };

  function scanArea() {
    if (lt_scanArea_recursive === 0)
      lt_scanArea_recursive = 0x3;
    else
      lt_scanArea_recursive--;
    if (lt_scanArea_recursive === 0)
      return;
    scanArea_real();
  }

  function scanArea_real() {
    if (lt_scanArea_recursive === 0)
      return;
    const scriptEnabled = getId("lt-ScriptEnabled").checked, highlightsEnabled = getId("lt-HighlightsEnable").checked,
          heuristicsChecksEnabled = getId("lt-LaneHeuristicsChecks").checked,
          currentZoomLevel = W.map.getZoom() != null ? W.map.getZoom() : 16,
          highlightOverridden = getId("lt-highlightOverride").checked,
          roadLayerState = W.layerSwitcherController.getTogglerState("ITEM_ROAD") ||
                           W.layerSwitcherController.getTogglerState("ITEM_ROAD_V2");
    removeHighlights();
    if (currentZoomLevel < DisplayLevels.MIN_ZOOM_ALL)
      return;
    if (roadLayerState || (!roadLayerState && !highlightOverridden)) {
      scriptEnabled && (highlightsEnabled || heuristicsChecksEnabled) &&
      scanSegments(W.model.segments.getObjectArray(), false);
      if (scriptEnabled) {
        const selectedFeatures = W.selectionManager.getSelectedFeatures();
        selectedFeatures.length === 0x2 && scanHeuristicsCandidates(selectedFeatures);
      }
    }
  }

  function scanHeuristicsCandidates(features) {
    let segmentList = [], numSegments = 0x0;
    _.each(features, (feature) => {
      feature && feature.attributes.wazeFeature._wmeObject &&
      feature.attributes.wazeFeature._wmeObject.type === "segments" &&
      (numSegments = segmentList.push(feature.attributes.wazeFeature._wmeObject));
    });
    scanSegments(segmentList, true);
    return numSegments
  }

  function processOneSegment(segmentObj, segmentAttributes, segmentDirection, segmentLength, minZoomLevel,
                             performHeuristicsCheck, errorsFound) {
    const fwdLaneCount = segmentAttributes.fwdLaneCount, revLaneCount = segmentAttributes.revLaneCount,
          highlightEnabled = getId("lt-HighlightsEnable").checked,
          checkHeuristics = getId("lt-LaneHeuristicsChecks").checked,
          heurPosHighlightEnabled = checkHeuristics && getId("lt-LaneHeurPosHighlight").checked,
          heurNegHighlightEnabled = checkHeuristics && getId("lt-LaneHeurNegHighlight").checked,
          highlightLIOEnabled = highlightEnabled && getId("lt-LIOEnable").checked,
          highlightLabelsEnabled = highlightEnabled && getId("lt-LabelsEnable").checked,
          turnGraph = W.model.getTurnGraph();

    let toNode = getNodeObj(segmentAttributes.toNodeID), fromNode = getNodeObj(segmentAttributes.fromNodeID),
        fLaneCount = fwdLaneCount;
    if (segmentDirection !== Direction.FORWARD) {
      toNode = getNodeObj(segmentAttributes.fromNodeID);
      fromNode = getNodeObj(segmentAttributes.toNodeID);
      fLaneCount = revLaneCount;
    }
    let turnLanesExist = false, turnDataInstructionOpcodeExists = false, lanesMissingConfiguration = false,
        turnAngleOverridden = false, turnGuidanceMode = 0x0, heurCandidate = HeuristicsCandidate.NONE,
        mutableSegmentWithDirection = null, segmentWithDirection = {seg : 0x0, direction : Direction.NONE};
    if (onScreen(toNode, minZoomLevel)) {
      const toNodeAttachedSegmentIDs = toNode.getSegmentIds();
      if (fLaneCount > 0x0) {
        let segmentLanesConfig = getLanesConfig(segmentObj, toNode, toNodeAttachedSegmentIDs, fLaneCount);
        turnLanesExist = segmentLanesConfig[0x0];
        turnDataInstructionOpcodeExists = segmentLanesConfig[0x1];
        turnAngleOverridden = segmentLanesConfig[0x2];
        lanesMissingConfiguration = segmentLanesConfig[0x3];
        turnGuidanceMode = segmentLanesConfig[0x4];
        errorsFound = (lanesMissingConfiguration || errorsFound);
      }
      if (segmentLength <= MAX_LEN_HEUR) {
        heurCandidate = heuristicsCandidateIndication(segmentObj, toNode, toNodeAttachedSegmentIDs, fromNode,
                                                      fLaneCount, segmentLength, turnGraph, segmentWithDirection);
        (heurCandidate === HeuristicsCandidate.ERROR) && (lanesMissingConfiguration = true);
        if (!checkHeuristics)
          heurCandidate = HeuristicsCandidate.NONE;
        else
          heurCandidate !== HeuristicsCandidate.NONE && (mutableSegmentWithDirection = {...segmentWithDirection});
      }
    }
    if (!performHeuristicsCheck) {
      let mutableHeurCandidate = null;
      if ((heurPosHighlightEnabled && heurCandidate === HeuristicsCandidate.PASS) ||
          (heurNegHighlightEnabled && heurCandidate === HeuristicsCandidate.FAIL))
        mutableHeurCandidate = heurCandidate;
      if (fLaneCount > 0x0 || mutableHeurCandidate !== null || lanesMissingConfiguration) {
        highlightSegment(segmentObj.geometry, segmentDirection, highlightEnabled, highlightLabelsEnabled, fwdLaneCount,
                         revLaneCount, turnAngleOverridden && highlightLIOEnabled, turnGuidanceMode,
                         lanesMissingConfiguration, mutableHeurCandidate, false)
      }
      if (highlightEnabled && getId("lt-NodesEnable").checked) {
        turnLanesExist && highlightNode(toNode.geometry, "" + LtSettings.NodeColor);
        turnDataInstructionOpcodeExists && highlightNode(toNode.geometry, "" + LtSettings.TIOColor);
      }
    } else {
      lt_log("candidate(f):" + heurCandidate);
      if (heurCandidate !== HeuristicsCandidate.NONE) {
        if (mutableSegmentWithDirection != null &&
            segmentArray.findIndex((segId) => segId === mutableSegmentWithDirection.seg) > -0x1) {
          let heurColor =
          (heurCandidate === HeuristicsCandidate.PASS ? "" + LtSettings.NodeColor : "" + LtSettings.HeurFailColor);
          highlightSegment(segmentObj.geometry, segmentDirection, false, false, 0x0, 0x0, false, turnGuidanceMode,
                           lanesMissingConfiguration, heurCandidate, true);
          highlightSegment(mutableSegmentWithDirection["seg"].geometry, mutableSegmentWithDirection.direction, false,
                           false, 0x0, 0x0, false, 0x0, false, heurCandidate, true);
          highlightNode(toNode.geometry, heurColor, true);
          highlightNode(fromNode.geometry, heurColor, true);
        }
      }
    }
    return errorsFound;
  }

  function scanSegments(segmentList, performHeuristicsCheck) {
    const minZoomLevel = W.map.getZoom() != null ? W.map.getZoom() : 16; //
    _.each(segmentList, (segmentObj) => {
      if (onScreen(segmentObj, minZoomLevel)) {
        const featureAttributes = segmentObj.getFeatureAttributes();
        let errorsFound = false, segmentLength = lt_segment_length(segmentObj);
        errorsFound ||= processOneSegment(segmentObj, featureAttributes, Direction.FORWARD, segmentLength, minZoomLevel,
                                          performHeuristicsCheck, errorsFound);
        if (errorsFound && lt_scanArea_recursive > 0x0) {
          lt_log("LT errors found, scanning again", 0x2);
          removeHighlights();
          lt_scanArea_recursive--;
          lt_scanArea_timer.start();
          return;
        }
        errorsFound ||= processOneSegment(segmentObj, featureAttributes, Direction.REVERSE, segmentLength, minZoomLevel,
                                          performHeuristicsCheck, errorsFound);
        if (errorsFound && lt_scanArea_recursive > 0x0) {
          lt_log("LT errors found, scanning again", 2);
          removeHighlights();
          lt_scanArea_recursive--;
          lt_scanArea_timer.start();
        }
      }
    });
  }

  function getLanesConfig(segment, node, attachedSegments, laneCount) {
    let turnLanesExist = false, turnDataInstructionOpcodeExists = false, laneMissingConfiguration = false,
        turnAngleOverridden = false, turnGuidanceMode = 0x0, streetName = null, _0x44a7d8 = [];
    const turnGraph = W.model.getTurnGraph(), zoomLevel = W.map.getZoom() != null ? W.map.getZoom() : 16;
    for (let idx = 0x0; idx < attachedSegments.length; idx++) {
      const attachedSegment = getSegObj(attachedSegments[idx]),
            turnData = turnGraph.getTurnThroughNode(node, segment, attachedSegment).getTurnData();
      if (turnData.state === 0x1) {
        turnData.hasInstructionOpcode() && (turnDataInstructionOpcodeExists = true);
        if (turnData.hasLanes()) {
          turnLanesExist = true;
          turnData.getLaneData().hasOverrideAngle() && (turnAngleOverridden = true);
          if (turnData.getLaneData().getGuidanceMode() === 0x1) {
            turnGuidanceMode = 0x1;
            streetName = W.model.streets.getObjectById(attachedSegment.attributes.primaryStreetID).name;
          } else if (turnData.getLaneData().getGuidanceMode() === 0x2) {
            turnGuidanceMode = 0x2;
            streetName = W.model.streets.getObjectById(attachedSegment.attributes.primaryStreetID).name;
          }
          const frmLnIdx = turnData.lanes.fromLaneIndex, toLnIdx = turnData.lanes.toLaneIndex;
          for (let cnt = frmLnIdx; cnt <= toLnIdx; cnt++) {
            let _0x18e06a = true;
            for (let idx = 0x0; idx < _0x44a7d8.length; idx++) {
              _0x44a7d8[idx] === cnt && (_0x18e06a = false);
            }
            _0x18e06a && _0x44a7d8.push(cnt);
          }
        }
      }
    }
    _0x44a7d8.sort();
    for (let idx = 0x0; idx < _0x44a7d8.length; idx++) {
      _0x44a7d8[idx] !== idx && (laneMissingConfiguration = true);
    }
    if (_0x44a7d8.length < laneCount && onScreen(node, zoomLevel))
      laneMissingConfiguration = true;
    return [
      turnLanesExist, turnDataInstructionOpcodeExists, turnAngleOverridden, laneMissingConfiguration, turnGuidanceMode,
      streetName
    ]
  }

  function setTurns(directionClass, numLanes) {
    if (!getId("lt-ClickSaveEnable").checked)
      return;
    let directionElement = document.getElementsByClassName(directionClass)[0x0],
        leftTurnAngleClass = directionElement.getElementsByClassName("angle--135").length > 0x0  ? "angle--135"
                             : directionElement.getElementsByClassName("angle--90").length > 0x0 ? "angle--90"
                                                                                                 : "angle--45",
        rightTurnAngleClass = directionElement.getElementsByClassName("angle-135").length > 0x0  ? "angle-135"
                              : directionElement.getElementsByClassName("angle-90").length > 0x0 ? "angle-90"
                                                                                                 : "angle-45",
        turnLaneEditTop = directionElement.getElementsByClassName("turn-lane-edit-top");
    for (let idx = 0; idx < turnLaneEditTop.length; ++idx) {
      let checboxesElems = turnLaneEditTop[idx].getElementsByClassName("turn-lane-checkbox");
      if (checboxesElems.length !== numLanes)
        return;
    }
    let numGuidedLanes = []
                         .slice.call(turnLaneEditTop)
                         .reduce((turnGuidanceEnabledCounter, editElement) =>
                                 turnGuidanceEnabledCounter +
                                 []
                                 .slice.call(editElement.getElementsByTagName("wz-checkbox"))
                                 .reduce((turnAppliedCounter, turnCheckBox) =>
                                         (turnCheckBox.checked === true ? turnAppliedCounter + 1 : turnAppliedCounter),
                                         0),
                                 0);
    if (numGuidedLanes < numLanes) {
      let isLeftHand = W.model.isLeftHand, leftTurnEnabled = false, rightTurnEnabled = false;
      for (let idx = 0x0; idx < turnLaneEditTop.length; idx++) {
        const turnLaneEditTopContainer = turnLaneEditTop[idx];
        let turnCheckBoxes = turnLaneEditTopContainer.getElementsByTagName("wz-checkbox");
        if (turnCheckBoxes && turnCheckBoxes.length > 0x0) {
          if (turnLaneEditTopContainer.getElementsByClassName(leftTurnAngleClass).length > 0x0 &&
              turnCheckBoxes[0].checked !== undefined) {
            if (turnCheckBoxes[0].checked === true)
              leftTurnEnabled = true;
            if (getId("lt-ClickSaveTurns").checked && turnCheckBoxes[0].checked === false) {
              turnCheckBoxes[0].click();
              leftTurnEnabled = true;
            }
          } else if (turnLaneEditTopContainer.getElementsByClassName(rightTurnAngleClass).length > 0x0 &&
                     turnCheckBoxes[turnCheckBoxes.length - 1].checked !== undefined) {
            if (turnCheckBoxes[turnCheckBoxes.length - 1].checked === true)
              rightTurnEnabled = true;
            if (getId("lt-ClickSaveTurns").checked && turnCheckBoxes[turnCheckBoxes.length - 1].checked === false) {
              rightTurnEnabled = true;
              turnCheckBoxes[turnCheckBoxes.length - 0x1].click();
            }
          }
        }
      }
      for (let idx = 0x0; idx < turnLaneEditTop.length; idx++) {
        const turnLanesContainer = turnLaneEditTop[idx];
        let directionCheckBoxes = turnLanesContainer.getElementsByTagName("wz-checkbox");
        if (turnLanesContainer.getElementsByClassName("angle-0").length > 0x0)
          for (let idx = 0x0; idx < directionCheckBoxes.length; idx++) {
            if (directionCheckBoxes[idx].checked === false) {
              if (idx === 0x0 && (getId("lt-ClickSaveStraight").checked &&
                                  ((!isLeftHand && !leftTurnEnabled) || (isLeftHand && !rightTurnEnabled))))
                directionCheckBoxes[idx].click();
              else {
                if (idx === directionCheckBoxes.length - 0x1 &&
                    (getId("lt-ClickSaveStraight").checked &&
                     ((!rightTurnEnabled && !isLeftHand) || (isLeftHand && !leftTurnEnabled))))
                  directionCheckBoxes[idx].click();
                else if (idx !== 0x0 && idx !== directionCheckBoxes.length - 0x1)
                  directionCheckBoxes[idx].click();
              }
            }
          }
      }
    }
  }

  function initLaneGuidanceClickSaver() {
    let mutationObserver = new MutationObserver((mutationRecordList) => {
      let selectedFeatures = W.selectionManager.getSelectedFeatures();
      if (selectedFeatures[0x0] && selectedFeatures[0x0].attributes.wazeFeature._wmeObject.type === "segment" &&
          getId("lt-ScriptEnabled").checked) {
        let laneCountElement = document.getElementsByName("laneCount");
        for (let idx = 0; idx < laneCountElement.length; idx++) {
          laneCountElement[idx].addEventListener("change", function() {
            let parent9LevelsUp = $(this).parents().eq(9), elem = parent9LevelsUp[0], className = elem.className,
                numLanes = parseInt($(this).val(), 10);
            setTurns(className, numLanes);
            let laneCountNums = $(this).parents().find(".lt-add-lanes"), counterClassName = laneCountNums[0].className,
                selectorClassName = "." + counterClassName.replace(" ", ".");
            let counterClassToSelectName = "#" + counterClassName.replace(" ", "-") + "-" + numLanes.toString();
            $(selectorClassName).css({"background-color" : "transparent", "color" : "black"});
            $(counterClassToSelectName).css({"background-color" : "navy", "color" : "white"});
          }, false);
        }
        let addLanesElement = document.getElementsByClassName("lt-add-lanes");
        for (let idx = 0; idx < addLanesElement.length; idx++) {
          addLanesElement[idx].addEventListener("click", function() {
            let parents9LevelsUp = $(this).parents().eq(10), className = parents9LevelsUp[0x0].className,
                numLanes = parseInt($(this).text(), 10);
            setTurns(className, numLanes);
          }, false);
        }
      }
    });
    mutationObserver.observe(document.getElementById("edit-panel"), {
      childList : true,
      subtree : true,
    });
  }

  function getAzimuthAngle(objectId, segment) {
    if (objectId == null || segment == null)
      return null;
    let xCoord, yCoord;
    if (segment.attributes.fromNodeID === objectId) {
      xCoord = lt_get_second_point(segment).x - lt_get_first_point(segment).x;
      yCoord = lt_get_second_point(segment).y - lt_get_first_point(segment).y
    } else {
      (xCoord = lt_get_next_to_last_point(segment).x - lt_get_last_point(segment).x);
      (yCoord = lt_get_next_to_last_point(segment).y - lt_get_last_point(segment).y);
    }
    let angleInRadians = Math.atan2(yCoord, xCoord), angleInDegrees = ((angleInRadians * 180) / Math.PI) % 360;
    lt_log("Azm from node " + objectId + " / " + segment.attributes.id + ": " + angleInDegrees, 0x3);
    return angleInDegrees;
  }

  function heuristicsCandidateIndication(segmentObj, toNodeObj, attachedSegmentIDs, fromNodeObj, fwdLaneCount,
                                         segmentlength, turnGraph, segWDirectionObject) {
    if (segmentObj == null || toNodeObj == null || attachedSegmentIDs == null || fromNodeObj == null ||
        fwdLaneCount == null || turnGraph == null || segWDirectionObject == null) {
      lt_log("heuristicsCandidateIndication received bad argument (null)", 0x1);
      return HeuristicsCandidate.NONE;
    }
    let outSegment = null, outTurnAngleDifference = null, attachedSegmentHeuristicsCandidate = 0,
        inSegDestinationSegment = null, insegTurnAngle = null, insegAngleDiff = null, fromNodeHeurState = 0,
        outsegDestinationSegment = null, outsegDestinationAngle = null, outHeuristicsCandidate = 0, insegIdxDiff = 0;
    if (segmentlength > MAX_LEN_HEUR)
      return HeuristicsCandidate.NONE;
    const segmentId = segmentObj.attributes.id;
    let fwdAngle = getSegmentAngleFromZero(toNodeObj.attributes.id, segmentObj),
        revAngle = getAzimuthAngle(fromNodeObj.attributes.id, segmentObj), turnAngleDirectionClass = -90,
        reverseTurnAngleDirectionClass = 90;
    if (W.model.isLeftHand) {
      turnAngleDirectionClass = 90;
      reverseTurnAngleDirectionClass = -90;
    }
    lt_log("==================================================================================", 2);
    lt_log("Checking heuristics candidate: seg" + segmentId + "node" + toNodeObj.attributes.id + " azm " + fwdAngle +
           "nodeExitSegIds:" + attachedSegmentIDs.length,
           2);
    let segmentIDs = fromNodeObj.getSegmentIds();
    for (let idx = 0; idx < segmentIDs.length; idx++) {
      let heurState = 0;
      if (segmentIDs[idx] === segmentId)
        continue;
      const destinationSegment = getSegObj(segmentIDs[idx]);
      if (!isTurnAllowed(destinationSegment, fromNodeObj, segmentObj))
        continue;
      let turnAngleToDestination = getSegmentAngleFromZero(fromNodeObj.attributes.id, destinationSegment),
          angleDifference = getAngleBetweenFwdAndReverse(turnAngleToDestination, revAngle);
      lt_log("Turn angle from inseg " + segmentIDs[idx] + ": " + angleDifference + "(" + turnAngleToDestination + "," +
             revAngle + ")",
             3);
      if (Math.abs(angleDifference) > MAX_STRAIGHT_DIF) {
        if (Math.abs(angleDifference) > MAX_STRAIGHT_TO_CONSIDER)
          continue;
        lt_log("Not eligible as inseg: " + angleDifference, 2);
        heurState = HeuristicsCandidate.FAIL;
      }
      const fromNodeDestSegmentTurnGraph = turnGraph.getTurnThroughNode(fromNodeObj, destinationSegment, segmentObj),
            fromNodeDestSegmentTurnData = fromNodeDestSegmentTurnGraph.getTurnData();
      if (fromNodeDestSegmentTurnData.state !== 0x1 || !fromNodeDestSegmentTurnData.hasLanes()) {
        lt_log("Straight turn has no lanes:" + segmentIDs[idx] + " to " + segmentId, 3);
        continue;
      }
      let idxDiff =
      fromNodeDestSegmentTurnData.lanes.toLaneIndex - fromNodeDestSegmentTurnData.lanes.fromLaneIndex + 0x1;
      if (idxDiff !== fwdLaneCount && !(fwdLaneCount === 0x0 && idxDiff === 0x1)) {
        lt_log("Straight turn lane count does not match", 0x2);
        heurState = HeuristicsCandidate.ERROR
      }
      if (inSegDestinationSegment !== null && heurState >= fromNodeHeurState) {
        if (fromNodeHeurState === 0x0 && heurState === 0x0) {
          lt_log("Error: >1 qualifying entry segment for " + segmentObj.attributes.id + ": " +
                 inSegDestinationSegment.attributes.id + "," + destinationSegment.attributes.id,
                 0x2);
          lt_log("==================================================================================", 0x2);
          return HeuristicsCandidate.NONE
        }
      }
      inSegDestinationSegment = destinationSegment;
      insegTurnAngle = turnAngleToDestination;
      insegAngleDiff = angleDifference;
      insegIdxDiff = idxDiff;
      fromNodeHeurState = heurState;
      segWDirectionObject.inSeg = inSegDestinationSegment;
      segWDirectionObject.inSegDir =
      (fromNodeDestSegmentTurnGraph.fromVertex["direction"] === "fwd" ? Direction.FORWARD : Direction.REVERSE)
    }
    if (inSegDestinationSegment == null) {
      lt_log("== No inseg found ==================================================================", 0x2);
      return HeuristicsCandidate.NONE;
    } else
      lt_log("Found inseg candidate: " + inSegDestinationSegment.attributes.id + " " +
             (fromNodeHeurState === 0x0 ? "" : "(failed)"),
             0x2);
    for (let idx = 0x0; idx < attachedSegmentIDs.length; idx++) {
      let attachSegHeuristics = 0;
      if (attachedSegmentIDs[idx] === segmentId)
        continue;
      const destinationSegment = getSegObj(attachedSegmentIDs[idx]);
      if (!isTurnAllowed(segmentObj, toNodeObj, destinationSegment))
        continue;
      let turnAngle = getAzimuthAngle(toNodeObj.attributes.id, destinationSegment),
          turnAngleDifference = getAngleBetweenFwdAndReverse(fwdAngle, turnAngle);
      lt_log("Turn angle to outseg2 " + attachedSegmentIDs[idx] + ": " + turnAngleDifference + "(" + fwdAngle + "," +
             turnAngle + ")",
             2);
      if (Math.abs(turnAngleDirectionClass - turnAngleDifference) < MAX_PERP_TO_CONSIDER)
        return 0x0;
      if (Math.abs(reverseTurnAngleDirectionClass - turnAngleDifference) > MAX_PERP_DIF) {
        if (Math.abs(reverseTurnAngleDirectionClass - turnAngleDifference) > MAX_PERP_TO_CONSIDER)
          continue;
        lt_log("   Not eligible as outseg2: " + turnAngleDifference, 0x2);
        attachSegHeuristics = HeuristicsCandidate.FAIL;
      }
      if (outSegment !== null && attachSegHeuristics >= attachedSegmentHeuristicsCandidate) {
        if (attachedSegmentHeuristicsCandidate === 0x0 && attachSegHeuristics === 0x0) {
          lt_log("Error: >1 qualifying exit2 segment for " + segmentObj.attributes.id + ": " +
                 outSegment.attributes.id + "," + destinationSegment.attributes.id,
                 0x2);
          lt_log("==================================================================================", 0x2);
          return 0x0;
        }
      }
      outSegment = destinationSegment;
      outTurnAngleDifference = turnAngleDifference;
      attachedSegmentHeuristicsCandidate = attachSegHeuristics;
    }
    if (outSegment == null) {
      lt_log("== No Outseg2 found ==================================================================", 0x2);
      return HeuristicsCandidate.NONE;
    } else
      lt_log("Found outseg2 candidate: " + outSegment.attributes.id + " " +
             (attachedSegmentHeuristicsCandidate === 0x0 ? "" : "(failed)"),
             0x2);
    for (let idx = 0x0; idx < segmentIDs.length; idx++) {
      if (segmentIDs[idx] === segmentId || segmentIDs[idx] === inSegDestinationSegment.attributes.id)
        continue;
      const destinationSegment = getSegObj(segmentIDs[idx]);
      let outsegHeuristicsCandidate = 0;
      if ((destinationSegment.attributes.fwdDirection &&
           destinationSegment.attributes.toNodeID !== fromNodeObj.attributes.id) ||
          (destinationSegment.attributes.revDirection &&
           destinationSegment.attributes.fromNodeID !== fromNodeObj.attributes.id))
        continue;
      let destinationAngle = getSegmentAngleFromZero(fromNodeObj.attributes.id, destinationSegment),
          destinationReciprocalAngle = getAngleBetweenFwdAndReverse(insegTurnAngle, destinationAngle);
      lt_log("Turn angle from inseg (supplementary) " + segmentIDs[idx] + ": " + destinationReciprocalAngle + "(" +
             insegTurnAngle + "," + destinationAngle + ")",
             3);
      if (Math.abs(turnAngleDirectionClass - destinationReciprocalAngle) > MAX_PERP_DIF_ALT) {
        if (Math.abs(turnAngleDirectionClass - destinationReciprocalAngle) > MAX_PERP_TO_CONSIDER)
          continue;
        lt_log("Not eligible as altIn1: " + destinationReciprocalAngle, 0x3);
        (outsegHeuristicsCandidate = HeuristicsCandidate.FAIL);
      }
      if (outsegDestinationSegment !== null) {
        if (outsegHeuristicsCandidate < outHeuristicsCandidate)
          continue;
        if (outHeuristicsCandidate === 0x0 && outsegHeuristicsCandidate === 0x0)
          lt_log("Error: >1 qualifying segment for " + segmentObj.attributes.id + ": " +
                 outsegDestinationSegment.attributes.id + "," + destinationSegment.attributes.id,
                 2);
        lt_log("==================================================================================", 0x2);
        return HeuristicsCandidate.FAIL;
      }
      (outsegDestinationSegment = destinationSegment);
      (outsegDestinationAngle = destinationAngle);
      (outHeuristicsCandidate = outsegHeuristicsCandidate);
    }
    if (outsegDestinationSegment == null) {
      lt_log("== No alt incoming-1 segment found ==================================================================\n",
             2);
      return HeuristicsCandidate.NONE;
    } else
      lt_log("Alt incoming-1 segment found: " + outsegDestinationSegment.attributes.id + " " +
             (outHeuristicsCandidate === 0x0 ? "" : "(failed)"),
             2);
    if (fromNodeHeurState < 0x0 || outHeuristicsCandidate < 0x0 || attachedSegmentHeuristicsCandidate < 0x0) {
      lt_log("Found a failed candidate for " + segmentId + " ( " +
             Math.min(fromNodeHeurState, outHeuristicsCandidate, attachedSegmentHeuristicsCandidate) + ")",
             2);
      return (fromNodeHeurState === HeuristicsCandidate.FAIL || outHeuristicsCandidate === HeuristicsCandidate.FAIL ||
              attachedSegmentHeuristicsCandidate === HeuristicsCandidate.FAIL
              ? HeuristicsCandidate.FAIL
              : HeuristicsCandidate.ERROR);
    }
    lt_log("Found a heuristics candidate! " + segmentId + " to " + outSegment.attributes.id + "at" +
           outTurnAngleDifference,
           0x2);
    return HeuristicsCandidate.PASS;
  }

  function getSegmentAngleFromZero(objectId, segment) {
    let azimuthAngle = getAzimuthAngle(objectId, segment), reciprocalAngle = azimuthAngle + 180;
    reciprocalAngle >= 180 && (reciprocalAngle -= 360);
    lt_log("Azm to node " + objectId + "/ " + segment.attributes.id + ": " + reciprocalAngle, 0x3);
    return reciprocalAngle;
  }

  function getAngleBetweenFwdAndReverse(turnAngle, revAngle) {
    let turnAngleCopy = turnAngle, revAngleCopy = revAngle;
    while (revAngle > 180) {
      revAngleCopy -= 360;
    }
    while (revAngle < -180) {
      revAngleCopy += 360;
    }
    while (turnAngle > 180) {
      turnAngleCopy -= 360;
    }
    while (turnAngle < -180) {
      turnAngleCopy += 360;
    }
    let angleDiffBetweenTurnAngles = revAngleCopy - turnAngleCopy;
    (angleDiffBetweenTurnAngles += angleDiffBetweenTurnAngles > 180    ? -360
                                   : angleDiffBetweenTurnAngles < -180 ? 360
                                                                       : 0);
    lt_log("Turn " + turnAngleCopy + "," + revAngleCopy + ": " + angleDiffBetweenTurnAngles, 0x3);
    return angleDiffBetweenTurnAngles
  }

  function isTurnAllowed(destinationSegment, nodeObject, sourceSegment) {
    lt_log("Allow from " + destinationSegment.attributes.id + "to " + sourceSegment.attributes.id + " via " +
           nodeObject.attributes.id + "? \n" +
           "            " + nodeObject.isTurnAllowedBySegDirections(destinationSegment, sourceSegment) + "| " +
           destinationSegment.isTurnAllowed(sourceSegment, nodeObject),
           3);
    if (!nodeObject.isTurnAllowedBySegDirections(destinationSegment, sourceSegment)) {
      lt_log("Driving direction restriction applies", 3);
      return false;
    }
    if (!destinationSegment.isTurnAllowed(sourceSegment, nodeObject)) {
      lt_log("Other restriction applies", 0x3);
      return false;
    }
    return true;
  }

  function lt_segment_length(segment) {
    let segmentLength = segment.geometry.getGeodesicLength(W.map.olMap.projection);
    lt_log("segment:" + segment.attributes.id + "computed len: " + segmentLength +
           "attrs len: " + segment.attributes.length,
           3);
    return segmentLength;
  }

  function lt_log(devMsg, debugLevel = 1) {
    return debugLevel <= LANETOOLS_DEBUG_LEVEL && console.log("LaneTools Dev Msg: ", devMsg);
  }

  function copyLaneInfo(nodeName) {
    _turnInfo = [];
    const selectedFeatures = W.selectionManager.getSelectedFeatures(),
          featureObject = selectedFeatures[0].attributes.wazeFeature._wmeObject,
          featureAttributes = featureObject.getFeatureAttributes(),
          featureGeometryComponents = featureObject.geometry.components,
          nodeID = nodeName === "A" ? featureAttributes.fromNodeID : featureAttributes.toNodeID,
          laneCount = nodeName === "A" ? featureAttributes.revLaneCount : featureAttributes.fwdLaneCount;
    console.log("Copy Lane Info Lane Count: " + laneCount);
    const nodeObj = getNodeObj(nodeID), attachedSegmentIDs = nodeObj.getSegmentIds(),
          turnGraph = W.model.getTurnGraph();
    let _0x21c177;
    nodeName === "A" ? (_0x21c177 = featureGeometryComponents[1])
                     : (_0x21c177 = featureGeometryComponents[featureGeometryComponents.length - 2]);
    let _0x17c96f = _0x21c177.x - nodeObj.geometry.x, _0x3b764f = _0x21c177.y - nodeObj.geometry.y,
        _0x25f24a = Math.atan2(_0x3b764f, _0x17c96f), _0x1b508f = ((_0x25f24a * 180) / Math.PI) % 360;
    for (let segIdx = 0x0; segIdx < attachedSegmentIDs.length; segIdx++) {
      const segmentObject = getSegObj(attachedSegmentIDs[segIdx]);
      let _0x56f831 = segmentObject.getFeatureAttributes(), geometryComponents = segmentObject.geometry.components,
          _0x165d3c, selectedNodeName,
          turnData = turnGraph.getTurnThroughNode(nodeObj, featureObject, segmentObject).getTurnData();
      if (turnData.state === 0x1 && turnData.lanes) {
        _0x56f831.fromNodeID === nodeID ? (selectedNodeName = "A") : (selectedNodeName = "B");
        selectedNodeName === "A" ? (_0x165d3c = geometryComponents[0x1])
                                 : (_0x165d3c = geometryComponents[geometryComponents.length - 0x2]);
        _0x17c96f = _0x165d3c.x - nodeObj.geometry.x;
        _0x3b764f = _0x165d3c.y - nodeObj.geometry.y;
        _0x25f24a = Math.atan2(_0x3b764f, _0x17c96f);
        let _0x422251 = ((_0x25f24a * 0xb4) / Math.PI) % 360;
        if (_0x1b508f < 0x0)
          _0x422251 = _0x1b508f - _0x422251;
        _turnData = {};
        let _0x2ca8fc = turnData.getLaneData();
        _turnData.id = segmentObject.attributes.id;
        _turnData.order = _0x422251;
        _turnData.lanes = _0x2ca8fc;
        _turnInfo.push(_turnData);
      }
      _turnInfo.sort((lhs, rhs) => (lhs.order > rhs.order ? 0x1 : -0x1));
    }
    console.log(_turnInfo);
  }

  function pasteLaneInfo(nodeName) {
    const mAction = new MultiAction();
    mAction.setModel(W.model);
    const selectedFeatures = W.selectionManager.getSelectedFeatures(),
          featureObject = selectedFeatures[0x0].attributes.wazeFeature._wmeObject,
          components = featureObject.geometry.components, featureAttributes = featureObject.getFeatureAttributes(),
          _0xdafc0a = nodeName === "A" ? featureAttributes.fromNodeID : featureAttributes.toNodeID;
    let _0x1989c7;
    const _0x32336a = getNodeObj(_0xdafc0a), segmentIDs = _0x32336a["getSegmentIds"](),
          turnGraph = W.model.getTurnGraph();
    let _0x44e9fd = {}, _0x1b740b = [];
    nodeName === "A" ? (_0x1989c7 = components[0x1]) : (_0x1989c7 = components[components.length - 0x2]);
    let _0x2362eb = _0x1989c7.x - _0x32336a.geometry.x, _0x480d3d = _0x1989c7.y - _0x32336a.geometry.y,
        _0x33018e = Math.atan2(_0x480d3d, _0x2362eb), _0xf2c260 = ((_0x33018e * 0xb4) / Math.PI) % 360;
    for (let idx = 0x0; idx < segmentIDs.length; idx++) {
      let _0x3831b2 = getSegObj(segmentIDs[idx]), _0x5842af = _0x3831b2.attributes,
          _0x3619b7 = _0x3831b2.geometry.components, _0x3374c6 = {}, _0x52b37f,
          turnData = turnGraph.getTurnThroughNode(_0x32336a, featureObject, _0x3831b2).getTurnData();
      _0x5842af.fromNodeID === _0xdafc0a ? (_0x52b37f = "A") : (_0x52b37f = "B");
      _0x52b37f === "A" ? (_0x3374c6 = _0x3619b7[0x1]) : (_0x3374c6 = _0x3619b7[_0x3619b7.length - 0x2]);
      if (turnData.state === 0x1) {
        _0x44e9fd = {};
        _0x2362eb = _0x3374c6.x - _0x32336a.geometry.x;
        _0x480d3d = _0x3374c6.y - _0x32336a.geometry.y;
        _0x33018e = Math.atan2(_0x480d3d, _0x2362eb);
        let _0x528fbb = ((_0x33018e * 180) / Math.PI) % 360;
        if (_0xf2c260 < 0x0)
          _0x528fbb = _0xf2c260 - _0x528fbb;
        _0x44e9fd.id = _0x5842af.id;
        _0x44e9fd.order = _0x528fbb;
        _0x1b740b.push(_0x44e9fd);
      }
      _0x1b740b.sort((_0x42b904, _0xb23157) => (_0x42b904.order > _0xb23157.order ? 0x1 : -0x1));
    }
    console.log(_0x1b740b);
    if (_turnInfo.length === _0x1b740b.length) {
      nodeName === "A" ? mAction.doSubAction(new UpdateObj(featureObject, {revLaneCount : laneCount}))
                       : mAction.doSubAction(new UpdateObj(featureObject, {fwdLaneCount : laneCount}));
      for (let idx = 0x0; idx < _0x1b740b.length; idx++) {
        let _0x1662da = {};
        for (let j = 0x0; j < _turnInfo.length; j++) {
          _0x1662da[j] = _turnInfo[j];
        }
        let _0x1d44a8 = getSegObj(_0x1b740b[idx].id),
            _0x4e30d7 = turnGraph.getTurnThroughNode(_0x32336a, featureObject, _0x1d44a8),
            _0x469b71 = _0x4e30d7.getTurnData();
        _0x469b71 = _0x469b71.withLanes(_0x1662da[idx].lanes);
        _0x4e30d7 = _0x4e30d7.withTurnData(_0x469b71);
        mAction.doSubAction(new SetTurn(turnGraph, _0x4e30d7));
      }
      mAction._description = "Pasted some lane stuff";
      W.model.actionManager.add(mAction);
      $(".lanes-tab").trigger("click");
    } else
      WazeWrap.Alerts.warning(GM_info.script.name,
                              "There are a different number of enabled turns on this segment/node");
  }

  function addUturn(displayedTurns) {
    let displayedWithUturn = {};
    for (let idx = 0x0; idx < displayedTurns.length; idx++) {
      let uturnObject = {};
      let uturnDisplay = $(displayedTurns[idx]).find(".uturn").css("display"),
          miniUturnDisplay = $(displayedTurns[idx]).find(".small-uturn").css("display");
      uturnObject.uturn = (uturnDisplay && uturnDisplay !== "none");
      uturnObject.miniuturn = (miniUturnDisplay && miniUturnDisplay !== "none");
      uturnObject.svg = $(displayedTurns[idx]).find("svg").map(function() { return this; }).get();
      displayedWithUturn[idx] = uturnObject;
    }
    return displayedWithUturn;
  }
  function getLaneBoxAnchor(departureAngleID, nodeObj, laneDisplayBoxConfiguration, segmentLength) {
    let temp = {};
    if (NEWZOOMLEVELS) {
      if (departureAngleID === 0x0)
        temp = {
          x : nodeObj.geometry.x + laneDisplayBoxConfiguration.start * 2,
          y : nodeObj.geometry.y + laneDisplayBoxConfiguration.boxheight,
        };
      else {
        if (departureAngleID === 0x1)
          temp = {
            x : nodeObj.geometry.x + laneDisplayBoxConfiguration.boxheight,
            y : nodeObj.geometry.y + (laneDisplayBoxConfiguration.boxincwidth * segmentLength),
          };
        else {
          if (departureAngleID === 0x2)
            temp = {
              x : nodeObj.geometry.x -
                  (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxincwidth * segmentLength),
              y : nodeObj.geometry.y + (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxheight),
            };
          else {
            if (departureAngleID === 0x3)
              temp = {
                x : nodeObj.geometry.x + (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxincwidth),
                y : nodeObj.geometry.y - (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxheight),
              };
            else {
              if (departureAngleID === 0x4)
                temp = {
                  x : nodeObj.geometry.x -
                      (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxheight * 1.5),
                  y : nodeObj.geometry.y - (laneDisplayBoxConfiguration.start +
                                            laneDisplayBoxConfiguration.boxincwidth * segmentLength * 1.5),
                };
              else {
                if (departureAngleID === 0x5)
                  temp = {
                    x : nodeObj.geometry.x +
                        (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxincwidth / 0x2),
                    y : nodeObj.geometry.y + laneDisplayBoxConfiguration.start / 0x2,
                  };
                else {
                  if (departureAngleID === 0x6)
                    temp = {
                      x : nodeObj.geometry.x - laneDisplayBoxConfiguration.start,
                      y : nodeObj.geometry.y - laneDisplayBoxConfiguration.start *
                                               ((laneDisplayBoxConfiguration.boxincwidth * segmentLength) / 0x2),
                    };
                  else
                    departureAngleID === 0x7 && (temp = {
                      x : nodeObj.geometry.x - laneDisplayBoxConfiguration.start *
                                               ((laneDisplayBoxConfiguration.boxincwidth * segmentLength) / 0x2),
                      y : nodeObj.geometry.y - laneDisplayBoxConfiguration.start,
                    });
                }
              }
            }
          }
        }
      }
    } else {
      if (departureAngleID === 0x0)
        temp = {
          x : nodeObj.geometry.x + laneDisplayBoxConfiguration.start * 0x2,
          y : nodeObj.geometry.y + laneDisplayBoxConfiguration.boxheight,
        };
      else {
        if (departureAngleID === 0x1)
          temp = {
            x : nodeObj.geometry.x + laneDisplayBoxConfiguration.boxheight,
            y : nodeObj.geometry.y + (laneDisplayBoxConfiguration.boxincwidth * segmentLength) / 1.8,
          };
        else {
          if (departureAngleID === 0x2)
            temp = {
              x : nodeObj.geometry.x -
                  (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxincwidth * segmentLength),
              y : nodeObj.geometry.y + (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxheight),
            };
          else {
            if (departureAngleID === 0x3)
              temp = {
                x : nodeObj.geometry.x + (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxincwidth),
                y :
                nodeObj.geometry.y - (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxheight * 0x2),
              };
            else {
              if (departureAngleID === 0x4)
                temp = {
                  x : nodeObj.geometry.x -
                      (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxheight * 1.5),
                  y : nodeObj.geometry.y - (laneDisplayBoxConfiguration.start +
                                            laneDisplayBoxConfiguration.boxincwidth * segmentLength * 1.5),
                };
              else {
                if (departureAngleID === 0x5)
                  temp = {
                    x : nodeObj.geometry.x +
                        (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxincwidth / 0x2),
                    y : nodeObj.geometry.y + laneDisplayBoxConfiguration.start / 0x2,
                  };
                else {
                  if (departureAngleID === 0x6)
                    temp = {
                      x : nodeObj.geometry.x - laneDisplayBoxConfiguration.start,
                      y : nodeObj.geometry.y - laneDisplayBoxConfiguration.start *
                                               ((laneDisplayBoxConfiguration.boxincwidth * segmentLength) / 0x2),
                    };
                  else
                    departureAngleID === 0x7 && (temp = {
                      x : nodeObj.geometry.x - laneDisplayBoxConfiguration.start *
                                               ((laneDisplayBoxConfiguration.boxincwidth * segmentLength) / 0x2),
                      y : nodeObj.geometry.y - laneDisplayBoxConfiguration.start,
                    });
                }
              }
            }
          }
        }
      }
    }
    return temp;
  }

  function displayGuidanceBox(nodeObj, segmentObject, guidanceObject) {
    const numberOfTurnLanes = Object.getOwnPropertyNames(guidanceObject).length;
    if (numberOfTurnLanes === 0)
      return;
    let laneDisplayBoxConfiguration = getLaneDisplayBoxObjectConfig(),
        segmentDisplayCardinalAngle = getSegmentAngle(nodeObj.attributes.id, segmentObject), centroid,
        guidanceBoxCoordinates = [], departureAngleID = 0;
    if (!getId("lt-IconsRotate").checked)
      segmentDisplayCardinalAngle = -90;
    if (segmentDisplayCardinalAngle === 0) {
      segmentDisplayCardinalAngle += 180;
      departureAngleID = 0x1;
    } else {
      if (segmentDisplayCardinalAngle > 0 && segmentDisplayCardinalAngle <= 30) {
        segmentDisplayCardinalAngle += (2 * (90 - segmentDisplayCardinalAngle));
        departureAngleID = 0x1;
      } else {
        if (segmentDisplayCardinalAngle >= 330 && segmentDisplayCardinalAngle <= 360) {
          segmentDisplayCardinalAngle -= (180 - 0x2 * (360 - segmentDisplayCardinalAngle));
          departureAngleID = 0x1;
        } else {
          if (segmentDisplayCardinalAngle > 30 && segmentDisplayCardinalAngle < 60) {
            segmentDisplayCardinalAngle -= (90 - 2 * (360 - segmentDisplayCardinalAngle));
            departureAngleID = 0x2;
          } else {
            if (segmentDisplayCardinalAngle >= 60 && segmentDisplayCardinalAngle <= 120) {
              segmentDisplayCardinalAngle -= (90 - 2 * (360 - segmentDisplayCardinalAngle));
              departureAngleID = 0x2;
            } else {
              if (segmentDisplayCardinalAngle > 120 && segmentDisplayCardinalAngle < 150) {
                segmentDisplayCardinalAngle -= (90 - 2 * (360 - segmentDisplayCardinalAngle));
                departureAngleID = 7;
              } else {
                if (segmentDisplayCardinalAngle >= 150 && segmentDisplayCardinalAngle <= 210) {
                  segmentDisplayCardinalAngle = 180 - segmentDisplayCardinalAngle;
                  departureAngleID = 4;
                } else {
                  if (segmentDisplayCardinalAngle > 210 && segmentDisplayCardinalAngle < 240) {
                    segmentDisplayCardinalAngle -= (90 - 0x2 * (360 - segmentDisplayCardinalAngle));
                    departureAngleID = 6;
                  } else {
                    if (segmentDisplayCardinalAngle >= 240 && segmentDisplayCardinalAngle <= 300) {
                      segmentDisplayCardinalAngle -= (180 - 0x2 * (360 - segmentDisplayCardinalAngle));
                      departureAngleID = 0x3;
                    } else if (segmentDisplayCardinalAngle > 300 && segmentDisplayCardinalAngle < 330) {
                      segmentDisplayCardinalAngle -= (180 - 2 * (360 - segmentDisplayCardinalAngle));
                      departureAngleID = 0x5
                    } else
                      console.log("LT: icon angle is out of bounds");
                  }
                }
              }
            }
          }
        }
      }
    }
    let displayAngle =
        segmentDisplayCardinalAngle > 315 ? segmentDisplayCardinalAngle : segmentDisplayCardinalAngle + 90,
        reciprocalDisplayAngle = 360 - displayAngle;

    let guidanceBoxTopLeftCoord =
    getLaneBoxAnchor(departureAngleID, nodeObj, laneDisplayBoxConfiguration, numberOfTurnLanes);
    const guidanceBoxBottomLeftVtx = new OpenLayers.Geometry.Point(
          guidanceBoxTopLeftCoord.x, guidanceBoxTopLeftCoord.y + laneDisplayBoxConfiguration.boxheight),
          guidanceBoxTopRightPointVtx = new OpenLayers.Geometry.Point(
          guidanceBoxTopLeftCoord.x + laneDisplayBoxConfiguration.boxincwidth * numberOfTurnLanes,
          guidanceBoxTopLeftCoord.y + laneDisplayBoxConfiguration.boxheight),
          guidanceBoxBottomRightVtx = new OpenLayers.Geometry.Point(
          guidanceBoxTopLeftCoord.x + laneDisplayBoxConfiguration.boxincwidth * numberOfTurnLanes,
          guidanceBoxTopLeftCoord.y),
          guidanceBoxTopLeftVtx = new OpenLayers.Geometry.Point(guidanceBoxTopLeftCoord.x, guidanceBoxTopLeftCoord.y);
    guidanceBoxCoordinates.push(guidanceBoxBottomLeftVtx, guidanceBoxTopRightPointVtx, guidanceBoxBottomRightVtx,
                                guidanceBoxTopLeftVtx);
    let guidanceBoxColors = {
      strokeColor : "#ffffff",
      strokeOpacity : 0x1,
      strokeWidth : 0x8,
      fillColor : "#ffffff",
    };
    let linearRing = new OpenLayers.Geometry.LinearRing(guidanceBoxCoordinates);
    centroid = linearRing.getCentroid();
    linearRing.rotate(reciprocalDisplayAngle, centroid);
    let boxRingFeatues = new OpenLayers.Feature.Vector(linearRing, null, guidanceBoxColors);
    LTLaneGraphics.addFeatures([ boxRingFeatues ]);
    let boxWidthThickness = 0;
    _.each(guidanceObject, (lg) => {
      let displayBoxVertices = [];
      var displayBoxLeftTopPoint = new OpenLayers.Geometry.Point(
          guidanceBoxTopLeftCoord.x + laneDisplayBoxConfiguration.boxincwidth * boxWidthThickness +
          laneDisplayBoxConfiguration.iconbordermargin,
          guidanceBoxTopLeftCoord.y + laneDisplayBoxConfiguration.iconborderheight),
          displayBoxLeftBottomPoint = new OpenLayers.Geometry.Point(
          guidanceBoxTopLeftCoord.x + laneDisplayBoxConfiguration.boxincwidth * boxWidthThickness +
          laneDisplayBoxConfiguration.iconborderwidth,
          guidanceBoxTopLeftCoord.y + laneDisplayBoxConfiguration.iconborderheight),
          displayBoxRightTopPoint = new OpenLayers.Geometry.Point(
          guidanceBoxTopLeftCoord.x + laneDisplayBoxConfiguration.boxincwidth * boxWidthThickness +
          laneDisplayBoxConfiguration.iconborderwidth,
          guidanceBoxTopLeftCoord.y + laneDisplayBoxConfiguration.iconbordermargin),
          displayBoxRightBottomPoint = new OpenLayers.Geometry.Point(
          guidanceBoxTopLeftCoord.x + laneDisplayBoxConfiguration.boxincwidth * boxWidthThickness +
          laneDisplayBoxConfiguration.iconbordermargin,
          guidanceBoxTopLeftCoord.y + laneDisplayBoxConfiguration.iconbordermargin);
      displayBoxVertices.push(displayBoxLeftTopPoint, displayBoxLeftBottomPoint, displayBoxRightTopPoint,
                              displayBoxRightBottomPoint);
      const displayBoxColors = {
        strokeColor : "#000000",
        strokeOpacity : 0x1,
        strokeWidth : 0x1,
        fillColor : "#26bae8",
      };
      let displayBoxLinearRing = new OpenLayers.Geometry.LinearRing(displayBoxVertices);
      displayBoxLinearRing.rotate(reciprocalDisplayAngle, centroid);
      let displayBoxVector = new OpenLayers.Feature.Vector(displayBoxLinearRing, null, displayBoxColors);
      LTLaneGraphics.addFeatures([ displayBoxVector ]);
      let displayBoxLinearRingCentroid = displayBoxLinearRing.getCentroid(),
          displayBoxLinearRigntCentroidCoords =
          new OpenLayers.Geometry.Point(displayBoxLinearRingCentroid.x, displayBoxLinearRingCentroid.y),
          wazeFont = "", uTurnTopLeftCoordinates = {x : 0x0, y : 0x0}, uTurnBottomRightCoordinates = {x : 0x0, y : 0x0};
      if (lg["uturn"] === true) {
        wazeFont = constantStrings.wazeFontLink;
        uTurnTopLeftCoordinates.x = 0.6;
        uTurnTopLeftCoordinates.y = 0.6;
        uTurnBottomRightCoordinates.x = -7;
        uTurnBottomRightCoordinates.y = -12
      }
      if (lg["miniuturn"] === true) {
        wazeFont = constantStrings.wazeFontLink;
        uTurnTopLeftCoordinates.x = 0.3;
        uTurnTopLeftCoordinates.y = 0.25;
        uTurnBottomRightCoordinates.x = -8;
        uTurnBottomRightCoordinates.y = 4
      }
      let displayBoxConfiguration = {
        externalGraphic : lg.svg,
        graphicHeight : laneDisplayBoxConfiguration.graphicHeight,
        graphicWidth : laneDisplayBoxConfiguration.graphicWidth,
        fillColor : "#26bae8",
        bgcolor : "#26bae8",
        color : "#26bae8",
        rotation : displayAngle,
        backgroundGraphic : wazeFont,
        backgroundHeight : laneDisplayBoxConfiguration.graphicHeight * uTurnTopLeftCoordinates.y,
        backgroundWidth : laneDisplayBoxConfiguration.graphicWidth * uTurnTopLeftCoordinates.x,
        backgroundXOffset : uTurnBottomRightCoordinates.x,
        backgroundYOffset : uTurnBottomRightCoordinates.y,
      },
          displayBoxVectorLayer =
          new OpenLayers.Feature.Vector(displayBoxLinearRigntCentroidCoords, null, displayBoxConfiguration);
      LTLaneGraphics.addFeatures([ displayBoxVectorLayer ]);
      boxWidthThickness++;
    });
    LTLaneGraphics.setZIndex(600);
  }

  function getLaneDisplayBoxObjectConfig() {
    var boxDisplayObject = {};
    let zoomLevel = W.map.getOLMap().getZoom();
    if (NEWZOOMLEVELS)
      switch (zoomLevel) {
      case 22:
        boxDisplayObject.start = 0.5;
        boxDisplayObject.boxheight = 1.7;
        boxDisplayObject.boxincwidth = 1.1;
        boxDisplayObject.iconbordermargin = 0.1;
        boxDisplayObject.iconborderheight = 1.6;
        boxDisplayObject.iconborderwidth = 1;
        boxDisplayObject.graphicHeight = 42;
        boxDisplayObject.graphicWidth = 25;
        break;
      case 21:
        (boxDisplayObject.start = 0x1);
        (boxDisplayObject.boxheight = 3.2);
        (boxDisplayObject.boxincwidth = 2.2);
        (boxDisplayObject.iconbordermargin = 0.2);
        (boxDisplayObject.iconborderheight = 3);
        (boxDisplayObject.iconborderwidth = 2);
        (boxDisplayObject.graphicHeight = 42);
        (boxDisplayObject.graphicWidth = 25);
        break;
      case 20:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 5.2);
        (boxDisplayObject.boxincwidth = 3.8);
        (boxDisplayObject.iconbordermargin = 0.3);
        (boxDisplayObject.iconborderheight = 4.9);
        (boxDisplayObject.iconborderwidth = 3.5);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 19:
        (boxDisplayObject.start = 0x3);
        (boxDisplayObject.boxheight = 0xa);
        (boxDisplayObject.boxincwidth = 7.2);
        (boxDisplayObject.iconbordermargin = 0.4);
        (boxDisplayObject.iconborderheight = 9.6);
        (boxDisplayObject.iconborderwidth = 6.8);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 18:
        (boxDisplayObject.start = 6);
        (boxDisplayObject.boxheight = 20);
        (boxDisplayObject.boxincwidth = 14);
        boxDisplayObject.iconbordermargin = 0.5;
        boxDisplayObject.iconborderheight = 19.5;
        boxDisplayObject.iconborderwidth = 13.5;
        boxDisplayObject.graphicHeight = 42;
        boxDisplayObject.graphicWidth = 25;
        break;
      case 17:
        (boxDisplayObject.start = 0xa);
        (boxDisplayObject.boxheight = 0x27);
        (boxDisplayObject.boxincwidth = 0x1c);
        (boxDisplayObject.iconbordermargin = 0x1);
        (boxDisplayObject.iconborderheight = 0x26);
        (boxDisplayObject.iconborderwidth = 0x1b);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 16:
        (boxDisplayObject.start = 0xf);
        (boxDisplayObject.boxheight = 80);
        (boxDisplayObject.boxincwidth = 55);
        (boxDisplayObject.iconbordermargin = 2);
        (boxDisplayObject.iconborderheight = 78);
        (boxDisplayObject.iconborderwidth = 53);
        (boxDisplayObject.graphicHeight = 42);
        (boxDisplayObject.graphicWidth = 25);
        break;
      case 15:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 120);
        (boxDisplayObject.boxincwidth = 90);
        (boxDisplayObject.iconbordermargin = 3);
        (boxDisplayObject.iconborderheight = 117);
        (boxDisplayObject.iconborderwidth = 0x57);
        (boxDisplayObject.graphicHeight = 42);
        boxDisplayObject.graphicWidth = 25;
        break;
      case 14:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 5.2);
        (boxDisplayObject.boxincwidth = 3.8);
        (boxDisplayObject.iconbordermargin = 0.3);
        (boxDisplayObject.iconborderheight = 4.9);
        (boxDisplayObject.iconborderwidth = 3.5);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      }
    else
      switch (zoomLevel) {
      case 10:
        (boxDisplayObject.start = 0.5);
        (boxDisplayObject.boxheight = 1.7);
        (boxDisplayObject.boxincwidth = 1.1);
        (boxDisplayObject.iconbordermargin = 0.1);
        (boxDisplayObject.iconborderheight = 1.6);
        (boxDisplayObject.iconborderwidth = 0x1);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 9:
        (boxDisplayObject.start = 1);
        (boxDisplayObject.boxheight = 3.2);
        (boxDisplayObject.boxincwidth = 2.2);
        (boxDisplayObject.iconbordermargin = 0.2);
        (boxDisplayObject.iconborderheight = 0x3);
        (boxDisplayObject.iconborderwidth = 0x2);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 8:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 5.2);
        (boxDisplayObject.boxincwidth = 3.8);
        (boxDisplayObject.iconbordermargin = 0.3);
        (boxDisplayObject.iconborderheight = 4.9);
        (boxDisplayObject.iconborderwidth = 3.5);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 7:
        (boxDisplayObject.start = 0x3);
        (boxDisplayObject.boxheight = 0xa);
        (boxDisplayObject.boxincwidth = 7.2);
        (boxDisplayObject.iconbordermargin = 0.4);
        (boxDisplayObject.iconborderheight = 9.6);
        (boxDisplayObject.iconborderwidth = 6.8);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 6:
        (boxDisplayObject.start = 0x6);
        (boxDisplayObject.boxheight = 0x14);
        (boxDisplayObject.boxincwidth = 0xe);
        (boxDisplayObject.iconbordermargin = 0.5);
        (boxDisplayObject.iconborderheight = 19.5);
        (boxDisplayObject.iconborderwidth = 13.5);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 5:
        (boxDisplayObject.start = 0xa);
        (boxDisplayObject.boxheight = 0x28);
        (boxDisplayObject.boxincwidth = 0x1d);
        (boxDisplayObject.iconbordermargin = 0x1);
        (boxDisplayObject.iconborderheight = 0x26);
        (boxDisplayObject.iconborderwidth = 0x1b);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 4:
        (boxDisplayObject.start = 0xf);
        (boxDisplayObject.boxheight = 0x50);
        (boxDisplayObject.boxincwidth = 0x37);
        (boxDisplayObject.iconbordermargin = 0x2);
        (boxDisplayObject.iconborderheight = 0x4e);
        (boxDisplayObject.iconborderwidth = 0x35);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 3:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 0x78);
        (boxDisplayObject.boxincwidth = 90);
        (boxDisplayObject.iconbordermargin = 0x3);
        (boxDisplayObject.iconborderheight = 0x75);
        (boxDisplayObject.iconborderwidth = 0x57);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 2:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 5.2);
        (boxDisplayObject.boxincwidth = 3.8);
        (boxDisplayObject.iconbordermargin = 0.3);
        (boxDisplayObject.iconborderheight = 4.9);
        (boxDisplayObject.iconborderwidth = 3.5);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 1:
        boxDisplayObject.start = 0x2;
        boxDisplayObject.boxheight = 5.2;
        boxDisplayObject.boxincwidth = 3.8;
        boxDisplayObject.iconbordermargin = 0.3;
        boxDisplayObject.iconborderheight = 4.9;
        boxDisplayObject.iconborderwidth = 3.5;
        boxDisplayObject.graphicHeight = 0x2a;
        boxDisplayObject.graphicWidth = 0x19;
        break;
      }
    return boxDisplayObject;
  }

  function serializeTurns(guidanceLaneInfoArray) {
    const serializer = new XMLSerializer();
    return (_.each(guidanceLaneInfoArray, (guidanceLaneInfo) => {
      try {
        let guidanceSVG = guidanceLaneInfo.svg[0], svgXML = serializer.serializeToString(guidanceSVG);
        guidanceLaneInfo["svg"] = "data:image/svg+xml;base64," + window.btoa(svgXML);
      } catch (ex) {
      }
    }, guidanceLaneInfoArray));
  }

  function displayLaneGraphics() {
    removeLaneGraphics();
    const features = W.selectionManager.getSelectedFeatures();
    if (!getId("lt-ScriptEnabled").checked || !getId("lt-IconsEnable").checked || features.length !== 0x1 ||
        features[0].attributes.wazeFeature._wmeObject.type !== "segment")
      return;
    const wmeObject = features[0].attributes.wazeFeature._wmeObject, currentZoomLevel = W.map.getOLMap().getZoom();
    if ((currentZoomLevel < 15) ||
        (wmeObject.attributes.roadType !== LT_ROAD_TYPE.FREEWAY &&
         wmeObject.attributes.roadType !== LT_ROAD_TYPE.MAJOR_HIGHWAY &&
         wmeObject.attributes.roadType !== LT_ROAD_TYPE.MAJOR_HIGHWAY && currentZoomLevel < 16))
      return;
    let fwdTurnsObject = wmeObject.attributes.fwdLaneCount > 0x0
                         ? addUturn($(".fwd-lanes").find(".lane-arrow").map(function() { return this; }).get())
                         : false,
        revTurnsObject = wmeObject.attributes.revLaneCount > 0x0
                         ? addUturn($(".rev-lanes").find(".lane-arrow").map(function() { return this; }).get())
                         : false;

    let fwdGuidance = fwdTurnsObject !== false ? serializeTurns(fwdTurnsObject) : false,
        revGuidance = revTurnsObject !== false ? serializeTurns(revTurnsObject) : false;
    fwdTurnsObject &&
    displayGuidanceBox(W.model.nodes.getObjectById(wmeObject.attributes.toNodeID), wmeObject, fwdGuidance);
    revTurnsObject &&
    displayGuidanceBox(W.model.nodes.getObjectById(wmeObject.attributes.fromNodeID), wmeObject, revGuidance);
  }

  laneToolsBootstrap();
  // while (true) {
  //   try {
  //     const exitCode =
  //         -parseInt("116729CFFamr") + -parseInt("1006486hQNMjC") / 0x2 +
  //         (-parseInt("21lOwPjv") / 0x3) * (parseInt("246188fslQvy") / 0x4) + -parseInt("2546485hRBZxR") / 0x5 +
  //         (parseInt("695094iWfXcp") / 0x6) * (-parseInt("7CccpnK") / 0x7) +
  //         (parseInt("155432OeGIQS") / 0x8) * (-parseInt("396CKTurr") / 0x9) + parseInt("30770070DOGVeo") / 0xa;
  //     if (exitCode === 546184)
  //       break;
  //   } catch (ex) {
  //   }
  // }
})();
