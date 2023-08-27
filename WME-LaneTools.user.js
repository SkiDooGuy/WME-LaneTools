// ==UserScript==
// @name         WME LaneTools
// @namespace    https://github.com/SkiDooGuy/WME-LaneTools
// @version      2023.07.20.00
// @description  Adds highlights and tools to WME to supplement the lanes
// feature
// @author       SkiDooGuy, Click Saver by HBiede, Heuristics by kndcajun
// @updateURL
// https://github.com/SkiDooGuy/WME-LaneTools/raw/master/WME-LaneTools.user.js
// @downloadURL
// https://github.com/SkiDooGuy/WME-LaneTools/raw/master/WME-LaneTools.user.js
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @grant        none
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// ==/UserScript==

/* global W */
/* global OpenLayers */
/* jshint esversion:6 */
/* eslint-disable */

(function main() {
  "use strict";
  // const stringArrayRef = getStringArray();

  const constantStrings = {
    divStr : "<div>",
    checkedStr : "checked",
    mapTag : "#map",
    htmlStr : "html",
    translationSpreadSheetBaseURL :
        "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Translations!A2:C?key=",
    angleSpreadSheetBaseURL :
        "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Angles!A2:B?key=",
    RBSAccessSheetBaseURL :
        "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/RBS_Access!A2:C?key=",
    revLanesInstructionsFromCSS :
        ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction",
    fwdLanesInstructionsFromCSS :
        ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction",
    editPanelCSS :
        "#edit-panel\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20div.segment-edit-section\x20>\x20wz-tabs\x20>\x20wz-tab.lanes-tab",
    fwdLanesDivInstructionCSS :
        ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction",
    fwdLanesNthChild :
        ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)\x20>\x20div",
    fwdLanesDirectionControlEditCSS :
        ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit",
    fwdLanesLaneInstrunctionToCSS :
        ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)",
    revLanesInstructionsToCSS :
        ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit",
    wazeFontLink : "https://editor-assets.waze.com/production/font/aae5ed152758cb6a9191b91e6cedf322.svg",
  };
  const
      LANETOOLS_VERSION = "" + GM_info.script.version,
      GF_LINK = "https://github.com/SkiDooGuy/WME-LaneTools/blob/master/WME-LaneTools.user.js",
      FORUM_LINK = "https://www.waze.com/forum/viewtopic.php?f=819&t=30115",
      LI_UPDATE_NOTES = "<b>NEW:</b><br>\x0a<b>FIXES:</b><br><br>\x0a", LANETOOLS_DEBUG_LEVEL = 0x1, configArray = {},
      RBSArray = {failed : false}, IsBeta = location.href.indexOf("beta.waze.com") !== -0x1, TRANSLATIONS = {
        default : {
          enabled : "Enabled",
          disabled : "Disabled",
          toggleShortcut : "Toggle\x20Shortcut",
          UIEnhance : "Tab\x20UI\x20Enhancements",
          autoWidth : "Auto-open\x20road\x20width",
          autoOpen : "Auto-open\x20lanes\x20tab",
          autoExpand : "Auto-expand\x20lane\x20editor",
          autoFocus : "Auto-focus\x20lane\x20input",
          reOrient : "Re-orient\x20lane\x20icons",
          enClick : "Enable\x20ClickSaver",
          clickStraight : "All\x20straight\x20lanes",
          clickTurn : "default",
          mapHighlight : "Map\x20Highlights",
          laneLabel : "Lane\x20labels",
          nodeHigh : "Node\x20Highlights",
          LAOHigh : "Lane\x20angle\x20overrides",
          CSOHigh : "Continue\x20straight\x20overrides",
          heuristics : "Lane\x20heuristics\x20candidates",
          posHeur : "Positive\x20heuristics\x20candidate",
          negHeur : "Negative\x20heuristics\x20candidate",
          highColor : "Highlight\x20Colors",
          colTooltip : "Click\x20to\x20toggle\x20color\x20inputs",
          selAllTooltip : "Click\x20on\x20turn\x20name\x20to\x20toggle\x20all\x20lane\x20associations",
          fwdCol : "Fwd\x20(A>B)",
          revCol : "Rev\x20(B>A)",
          labelCol : "Labels",
          errorCol : "Lane\x20errors",
          laneNodeCol : "Nodes\x20with\x20lanes",
          nodeTIOCol : "Nodes\x20with\x20TIOs",
          LAOCol : "Segs\x20with\x20TIOs",
          viewCSCol : "View\x20only\x20CS",
          hearCSCol : "View\x20and\x20hear\x20CS",
          heurPosCol : "Lane\x20heuristics\x20likely",
          heurNegCol : "Lane\x20heuristics\x20-\x20not\x20qualified",
          advTools : "Advance\x20Tools",
          quickTog : "Quick\x20toggle\x20all\x20lanes",
          showRBS : "Use\x20RBS\x20heuristics",
          delFwd : "Delete\x20FWD\x20Lanes",
          delRev : "Delete\x20Rev\x20Lanes",
          delOpp :
              "This\x20segment\x20is\x20one-way\x20but\x20has\x20lanes\x20set\x20in\x20the\x20opposite\x20direction.\x20Click\x20here\x20to\x20delete\x20them",
          csIcons : "Highlight\x20CS\x20Icons",
          highlightOverride : "Only\x20highlight\x20if\x20segment\x20layer\x20active",
          addTIO : "Include\x20TIO\x20in\x20lanes\x20tab",
          labelTIO : "TIO",
          defaultTIO : "Waze\x20Selected",
          noneTIO : "None",
          tlTIO : "Turn\x20Left",
          trTIO : "Turn\x20Right",
          klTIO : "Keep\x20Left",
          krTIO : "Keep\x20Right",
          conTIO : "Continue",
          elTIO : "Exit\x20Left",
          erTIO : "Exit\x20Right",
          uturnTIO : "U-Turn",
          enIcons : "Display\x20lane\x20icons\x20on\x20map",
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
      shortcutsDisabled = false, isRBS = false, allowCpyPst = false, langLocality = "default", UPDATEDZOOM;
  console.log("LaneTools:\x20initializing...");

  function laneToolsBootstrap(bootStrapAttempt = 0x0) {
    if (W && W.map && W.model && W.loginManager.user && $ && WazeWrap.Ready)
      initLaneTools();
    else
      bootStrapAttempt < 500 ? setTimeout(() => { laneToolsBootstrap(bootStrapAttempt++); }, 200)
                             : console.error("LaneTools:\x20Failed\x20to\x20load");
  }

  function initLaneTools() {
    seaPickle = W.loginManager.user;
    UpdateObj = require("Waze/Action/UpdateObject");
    MultiAction = require("Waze/Action/MultiAction");
    SetTurn = require("Waze/Model/Graph/Actions/SetTurn");
    UPDATEDZOOM = W.map.getOLMap().getZoom() === 23;
    const
        ltCSSClasses =
            [
              ".lt-wrapper\x20{position:relative;width:100%;font-size:12px;font-family:\x22Rubik\x22,\x20\x22Boing-light\x22, sans-serif;user-select:none;}",
              ".lt-section-wrapper\x20{display:block;width:100%;padding:4px;",
              ".lt-section-wrapper.border\x20{border-bottom:1px\x20solid\x20grey;margin-bottom:5px;}",
              ".lt-option-container\x20{padding:3px;}",
              ".lt-option-container.color\x20{text-decoration:none;}",
              "input[type=\x22checkbox\x22].lt-checkbox\x20{position:relative;top:3px;vertical-align:top;margin:0;}",
              "input[type=\x22text\x22].lt-color-input\x20{position:relative;width:70px;padding:3px;border:2px\x20solid black;border-radius:6px;}",
              "input[type=\x22text\x22].lt-color-input:focus\x20{outline-width:0;}",
              "label.lt-label\x20{position:relative;max-width:90%;font-weight:normal;padding-left:5px}",
              ".lt-Toolbar-Container\x20{display:none;position:absolute;background-color:orange;border-radius:6px;border:1.5px solid;box-size:border-box;z-index:1050;}",
              ".lt-Toolbar-Wrapper\x20{position:relative;padding:3px;",
              ".lt-toolbar-button-container\x20{display:inline-block;padding:5px;}",
              ".lt-toolbar-button\x20{position:relative;display:block;width:60px;height:25px;border-radius:6px;font-size:12px;}",
              ".lt-add-Width\x20{display:inline-block;width:15px;height:15px;border:1px\x20solid\x20black;border-radius:8px;margin:0\x203px\x200\x203px;line-height:\x201.5;text-align:center;font-size:10px;}",
              ".lt-add-Width:hover\x20{border:1px solid #26bae8;background-color:#26bae8;cursor:pointer;}",
              ".lt-add-lanes {display:inline-block;width:15px;height:15px;border:1px\x20solid black;border-radius:8px;margin:0\x203px 0 3px;line-height: 1.5;text-align:center;font-size:10px;}",
              ".lt-add-lanes:hover\x20{border:1px\x20solid\x20#26bae8;background-color:#26bae8;cursor:pointer;}",
              ".lt-chkAll-lns\x20{display:inline-block;width:20px;height:20px;text-decoration:underline;font-weight:bold;font-size:10px;padding-left:3px;cursor:pointer;}",
              ".lt-tio-select {max-width:80%;color:rgb(32, 33, 36);background-color:rgb(242, 243, 244);border:0px;border-radius:6px;padding:0 16px 0 10px;cursor:pointer;}",
              "#lt-color-title {display:block;width:100%;padding:5px 0 5px 0;font-weight:bold;text-decoration:underline;cursor:pointer;}",
            ].join("\x20"),
        initMsg = $(constantStrings.divStr);
    initMsg.html = [
      "<div\x20class=\x27lt-wrapper\x27\x20id=\x27lt-tab-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-tab-body\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27\x20style=\x27border-bottom:2px\x20double\x20grey;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<a\x20href=\x27https://www.waze.com/forum/viewtopic.php?f=819&t=301158\x27\x20style=\x27font-weight:bold;font-size:12px;text-decoration:underline;\x27\x20\x20target=\x27_blank\x27>LaneTools\x20-\x20v" +
          LANETOOLS_VERSION +
          "</a>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-EnableShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ScriptEnabled\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ScriptEnabled\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-LaneTabFeatures\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-uiEnhance\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-UIEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-UIEnable\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-UI-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-UIEnhanceShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoOpenWidth\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoOpenWidth\x27><span\x20id=\x27lt-trans-autoWidth\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoLanesTab\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoLanesTab\x27><span\x20id=\x27lt-trans-autoTab\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoExpandLanes\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoExpandLanes\x27><span\x20title=\x22Feature\x20disabled\x20as\x20of\x20Aug\x2027,\x202022\x20to\x20prevent\x20flickering\x20issue\x22\x20id=\x27lt-trans-autoExpand\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoFocusLanes\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoFocusLanes\x27><span\x20id=\x27lt-trans-autoFocus\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-highlightCSIcons\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-highlightCSIcons\x27><span\x20id=\x27lt-trans-csIcons\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ReverseLanesIcon\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ReverseLanesIcon\x27><span\x20id=\x27lt-trans-orient\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AddTIO\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AddTIO\x27><span\x20id=\x27lt-trans-AddTIO\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveEnable\x27><span\x20id=\x27lt-trans-enClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20clk-svr\x27\x20style=\x27padding-left:10%;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveStraight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveStraight\x27><span\x20id=\x27lt-trans-straClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20clk-svr\x27\x20style=\x27padding-left:10%;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveTurns\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveTurns\x27><span\x20id=\x27lt-trans-turnClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-mapHigh\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-HighlightsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-HighlightsEnable\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-highlights-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-HighlightShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-IconsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-IconsEnable\x27><span\x20id=\x27lt-trans-enIcons\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-IconsRotate\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-IconsRotate\x27><span\x20id=\x27lt-trans-IconsRotate\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LabelsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LabelsEnable\x27><span\x20id=\x27lt-trans-lnLabel\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-NodesEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-NodesEnable\x27><span\x20id=\x27lt-trans-nodeHigh\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LIOEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LIOEnable\x27><span\x20id=\x27lt-trans-laOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-CSEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CSEnable\x27><span\x20id=\x27lt-trans-csOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-highlightOverride\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-highlightOverride\x27><span\x20id=\x27lt-trans-highOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-heurCan\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeuristicsChecks\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeuristicsChecks\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-heur-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-LaneHeurChecksShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeurPosHighlight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeurPosHighlight\x27><span\x20id=\x27lt-trans-heurPos\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeurNegHighlight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeurNegHighlight\x27><span\x20id=\x27lt-trans-heurNeg\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20id=\x27lt-color-title\x27\x20data-original-title=\x27" +
          TRANSLATIONS.langLocality.colTooltip +
          "\x27><span\x20id=\x27lt-trans-highCol\x27></span>:</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-color-inputs\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-ABColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ABColor\x27\x20id=\x27lt-ABColorLabel\x27><span\x20id=\x27lt-trans-fwdCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-BAColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-BAColor\x27\x20id=\x27lt-BAColorLabel\x27><span\x20id=\x27lt-trans-revCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-LabelColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LabelColor\x27\x20id=\x27lt-LabelColorLabel\x27><span\x20id=\x27lt-trans-labelCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-ErrorColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ErrorColor\x27\x20id=\x27lt-ErrorColorLabel\x27><span\x20id=\x27lt-trans-errorCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-NodeColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-NodeColor\x27\x20id=\x27lt-NodeColorLabel\x27><span\x20id=\x27lt-trans-nodeCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-TIOColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-TIOColor\x27\x20id=\x27lt-TIOColorLabel\x27><span\x20id=\x27lt-trans-tioCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-LIOColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-TIOColor\x27\x20id=\x27lt-LIOColorLabel\x27><span\x20id=\x27lt-trans-laoCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-CS1Color\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CS1Color\x27\x20id=\x27lt-CS1ColorLabel\x27><span\x20id=\x27lt-trans-viewCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-CS2Color\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CS2Color\x27\x20id=\x27lt-CS2ColorLabel\x27><span\x20id=\x27lt-trans-hearCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-HeurColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-HeurColor\x27\x20id=\x27lt-HeurColorLabel\x27><span\x20id=\x27lt-trans-posCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20color\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-HeurFailColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-HeurFailColor\x27\x20id=\x27lt-HeurFailColorLabel\x27><span\x20id=\x27lt-trans-negCol\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-adv-tools\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-advTools\x27>></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-SelAllEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-SelAllEnable\x27\x20><span\x20id=\x27lt-trans-quickTog\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20id=\x27lt-serverSelectContainer\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-serverSelect\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-serverSelect\x27><span\x20id=\x27lt-trans-heurRBS\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20id=\x27lt-cpy-pst\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-CopyEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CopyEnable\x27>Copy/Paste\x20Lanes</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:\x20bold;\x27>(**Caution**\x20-\x20double\x20check\x20results,\x20feature\x20still\x20in\x20Dev)</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-sheet-link\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<a\x20href=\x27https://docs.google.com/spreadsheets/d/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/edit?usp=sharing\x27\x20target=\x27_blank\x27>LT\x20Config\x20Sheet</a>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>",
    ].join("\x20");
    const message = $(constantStrings.divStr);
    message.html([
      "<div\x20class=\x27lt-Toolbar-Container\x27\x20id=\x22lt-toolbar-container\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-Toolbar-Wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-toolbar-button-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20type=\x27button\x27\x20class=\x27lt-toolbar-button\x27\x20id=\x27copyA-button\x27>Copy\x20A</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-toolbar-button-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20type=\x27button\x27\x20class=\x27lt-toolbar-button\x27\x20id=\x27copyB-button\x27>Copy\x20B</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-toolbar-button-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20type=\x27button\x27\x20class=\x27lt-toolbar-button\x27\x20id=\x27pasteA-button\x27>Paste\x20A</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-toolbar-button-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20type=\x27button\x27\x20class=\x27lt-toolbar-button\x27\x20id=\x27pasteB-button\x27>Paste\x20B</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>",
    ].join("\x20"));
    seaPickle = W.loginManager.user;
    _pickleColor = seaPickle["rank"];
    if (_pickleColor >= 0x0) {
      WazeWrap.Interface.LtSettings("LT", initMsg.html, setupOptions, "LT");
      $("<style>" + ltCSSClasses + "</style>").appendTo("head");
      $(constantStrings.mapTag).append(message.html());
      WazeWrap.Interface.ShowScriptUpdate(GM_info.script.name, GM_info.script.version, LI_UPDATE_NOTES, GF_LINK,
                                          FORUM_LINK);
      console.log("LaneTools:\x20Loaded");
    } else
      console.error("LaneTools:\x20loading\x20error....");
  }

  async function setupOptions() {
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
      !getId("lt-ClickSaveEnable").checked && $("#lt-ClickSaveEnable").hide();
      !getId("lt-UIEnable").checked && $("#lt-UI-wrapper").hide();
      !getId("lt-HighlightsEnable").checked && $("#lt-highlights-wrapper").hide();
      !getId("lt-LaneHeuristicsChecks").checked && $("#lt-heur-wrapper").hide();
      function setSetting(propertyID, propertyValue) { $("#" + propertyID).prop("checked", propertyValue); }
      function setCSSBorder(idName, value) {
        const idSelector = $("#" + idName);
        idSelector.attr("value", value);
        idSelector.css("border", "2px\x20solid" + value);
      }
    }

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
          .Shortcut("enableHighlights", "Toggle\x20lane\x20highlights", "wmelt", "Lane\x20Tools",
                    LtSettings.enableHighlights, toggleHighlights, null)
          .add();
      new WazeWrap.Interface
          .Shortcut("enableUIEnhancements", "Toggle\x20UI\x20enhancements", "wmelt", "Lane\x20Tools",
                    LtSettings.enableUIEnhancements, toggleUIEnhancements, null)
          .add();
      new WazeWrap.Interface
          .Shortcut("enableHeuristics", "Toggle\x20heuristic\x20highlights", "wmelt", "Lane\x20Tools",
                    LtSettings.enableHeuristics, toggleLaneHeuristicsChecks, null)
          .add();
      new WazeWrap.Interface
          .Shortcut("enableScript", "Toggle\x20script", "wmelt", "Lane\x20Tools", LtSettings.enableScript, toggleScript,
                    null)
          .add();
    } catch (err) {
      console.log("LT\x20Error\x20creating\x20shortcuts.\x20This\x20feature\x20will\x20be\x20disabled.");
          $("#lt-EnableShortcut").text("" + TRANSLATIONS.default.disabled);
          $("#lt-HighlightShortcut").text("" + TRANSLATIONS.default.disabled);
          $("#lt-UIEnhanceShortcut").text("" + TRANSLATIONS.default.disabled);
          $("#lt-LaneHeurChecksShortcut").text("" + TRANSLATIONS.default.disabled);
          shortcutsDisabled = true
    }
    const highlightsEnabledID = $("#lt-HighlightsEnable"), colorTitleID = $("#lt-color-title"),
          laneHeuristicsChecksID = $("#lt-LaneHeuristicsChecks");
    processOptionSettings();
    setTimeout(() => { updateShortcutLabels(); }, 50);
    setHeuristics();
    setTranslations();
    if (_pickleColor > 0x1) {
      let jqQuickTog = $("#lt-trans-quickTog");
      let ltEnabledFeatures = "LaneTools:\x20The\x20following\x20special\x20access\x20features\x20are\x20enabled:\x20";
      $("#lt-adv-tools").css("display", "block");
      jqQuickTog.attr("data-original-title", "" + strings["selAllTooltip"]);
      jqQuickTog.tooltip();
      _.each(RBSArray, (argument) => {
        argument[0x0] === seaPickle.userName &&
            (argument[0x1] === "1" && (isRBS = true), argument[0x2] === "1" && (allowCpyPst = true));
      });
      if (isRBS) {
        $("#lt-serverSelectContainer").css("display", "block");
        ltEnabledFeatures += "RBS\x20Heuristics";
      }
      if (allowCpyPst) {
        $("#lt-sheet-link").css({display : "block", margin : "2px"});
        $("#lt-sheet-link > a").css({
          padding : "2px",
          border : "2px\x20solid\x20black",
          "border-radius" : "6px",
          "text-decoration" : "none",
        });
        $("#lt-sheet-link\x20>\x20a")
            .on("mouseenter", function() { $(this).css("background-color", "orange"); })
            .on("mouseleave", function() { $(this).css("background-color", "#eeeeee"); });
        $(".lt-toolbar-button").on("click", function() {
          $(this)[0x0].id === "copyA-button" && copyLaneInfo("A"),
              $(this)[0x0].id === "copyB-button" && copyLaneInfo("B"),
              $(this)[0x0].id === "pasteA-button" && pasteLaneInfo("A"),
              $(this)[0x0].id === "pasteB-button" && pasteLaneInfo("B");
        });
        ltEnabledFeatures = isRBS ? ltEnabledFeatures + ",\x20Copy/Paste" : ltEnabledFeatures + "Copy/Paste";
      }
      if (isRBS || allowCpyPst) {
        console.log(ltEnabledFeatures);
      }
    } else {
      $("#lt-LaneTabFeatures").css("display", "none");
    }
    $(".lt-checkbox").on("click", function() {
      let settingName = $(this)[0x0].id.substr(0x3);
      (LtSettings[settingName] = this.checked), saveSettings();
    })
    $(".lt-color-input").change(function() {
      let color_input = $(this)[0].id.substr(3);
      LtSettings[color_input] = this["value"];
      saveSettings();
      $("#lt-" + color_input).css("border", "2px\x20solid" + this["value"]);
      removeHighlights();
      scanArea();
    });
    $("#lt-ScriptEnabled")
        .on("click",
            () => { getId("lt-ScriptEnabled").checked ? scanArea() : (removeHighlights(), removeLaneGraphics()); });
    highlightsEnabledID.on(
        "click", () => { getId("lt-HighlightsEnable").checked ? scanArea() : removeHighlights(), scanArea(); });
    $("#lt-LabelsEnable")
        .on("click", () => { getId("lt-LabelsEnable").checked ? scanArea() : (removeHighlights(), scanArea()); });
    $("#lt-NodesEnable")
        .on("click", () => { getId("lt-NodesEnable").checked ? scanArea() : (removeHighlights(), scanArea()); });
    $("#lt-LIOEnable")
        .on("click", () => { getId("lt-LIOEnable").checked ? scanArea() : (removeHighlights(), scanArea()); });
    $("#lt-IconsEnable")
        .on("click", () => { getId("lt-IconsEnable").checked ? displayLaneGraphics() : removeLaneGraphics(); });
    $("#lt-highlightOverride")
        .on("click", () => { getId("lt-highlightOverride").checked ? scanArea() : (removeHighlights(), scanArea()); });
    colorTitleID.on("click", () => { $("#lt-color-inputs").toggle(); });
    $("#lt-ClickSaveEnable").on("click", () => { $(".lt-option-container.clk-svr").toggle(); });
    $("#lt-UIEnable").on("click", () => { $("#lt-UI-wrapper").toggle(), removeLaneGraphics(); });
    highlightsEnabledID.on("click", () => { $("#lt-highlights-wrapper").toggle(); });
    laneHeuristicsChecksID.on("click", () => { $("#lt-heur-wrapper").toggle(); });
    laneHeuristicsChecksID.on("click", () => {
      if (!getId("lt-LaneHeuristicsChecks").checked)
        removeHighlights();
      scanArea();
    });
    $("#lt-LaneHeurPosHighlight")
        .on("click",
            () => { getId("lt-LaneHeurPosHighlight").checked ? scanArea() : (removeHighlights(), scanArea()); });
    $("#lt-LaneHeurNegHighlight")
        .on("click",
            () => { getId("lt-LaneHeurNegHighlight").checked ? scanArea() : (removeHighlights(), scanArea()); });
    $("#lt-serverSelect").on("click", () => {
      setHeuristics();
      removeHighlights();
      scanArea();
    });
    $.fn.hide = function() {
      this["trigger"]("hide");
      return $.fn.hide.apply(this, arguments);
    };
    $("#keyboard-dialog")["on"]("hide", () => { checkShortcutsChanged(); });
    colorTitleID.tooltip();
  }
  async function loadSettings() {
    const parsedSettings = JSON.parse(localStorage.getItem("LT_Settings")),
          laneToolsSettings = await WazeWrap.Remote.RetrieveSettings("LT_Settings");
    !laneToolsSettings && console.error("LaneTools:\x20Error\x20communicating\x20with\x20WW\x20settings\x20server");
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
      ScriptEnabled : _0x2da5e1,
      HighlightsEnable : _0x745c7a,
      LabelsEnable : _0x36baff,
      NodesEnable : _0x3e8deb,
      UIEnable : _0x5e8779,
      AutoLanesTab : _0x223b60,
      AutoOpenWidth : _0x43ad59,
      AutoExpandLanes : _0x5951ee,
      ABColor : _0x20a7e4,
      BAColor : _0x37127d,
      LabelColor : _0x178529,
      ErrorColor : _0x4b7321,
      NodeColor : _0x36f178,
      TIOColor : _0x211d6c,
      LIOColor : _0xa024a4,
      CS1Color : _0x270556,
      CS2Color : _0x526320,
      CopyEnable : _0x34b214,
      SelAllEnable : _0xb763db,
      serverSelect : _0x1af807,
      LIOEnable : _0x22a8dc,
      CSEnable : _0x127a42,
      AutoFocusLanes : _0x12cefc,
      ReverseLanesIcon : _0x55ecb0,
      ClickSaveEnable : _0x282cb6,
      ClickSaveStraight : _0x258aa9,
      ClickSaveTurns : _0xd8d0f0,
      enableScript : _0x1becb4,
      enableHighlights : _0x814add,
      enableUIEnhancements : _0x198071,
      enableHeuristics : _0x210674,
      HeurColor : _0x325a53,
      HeurFailColor : _0x2d11e5,
      LaneHeurPosHighlight : _0x3b18b7,
      LaneHeurNegHighlight : _0x5560e4,
      LaneHeuristicsChecks : _0x5f21ec,
      highlightCSIcons : _0x430a83,
      highlightOverride : _0x175645,
      AddTIO : _0x3cc839,
      IconsEnable : _0x2b4c31,
      IconsRotate : _0x3b2352,
    } = LtSettings,
    savedLTSettings = {
      lastSaveAction : Date.now(),
      ScriptEnabled : _0x2da5e1,
      HighlightsEnable : _0x745c7a,
      LabelsEnable : _0x36baff,
      NodesEnable : _0x3e8deb,
      UIEnable : _0x5e8779,
      AutoOpenWidth : _0x43ad59,
      AutoLanesTab : _0x223b60,
      AutoExpandLanes : _0x5951ee,
      ABColor : _0x20a7e4,
      BAColor : _0x37127d,
      LabelColor : _0x178529,
      ErrorColor : _0x4b7321,
      NodeColor : _0x36f178,
      TIOColor : _0x211d6c,
      LIOColor : _0xa024a4,
      CS1Color : _0x270556,
      CS2Color : _0x526320,
      CopyEnable : _0x34b214,
      SelAllEnable : _0xb763db,
      serverSelect : _0x1af807,
      LIOEnable : _0x22a8dc,
      CSEnable : _0x127a42,
      AutoFocusLanes : _0x12cefc,
      ReverseLanesIcon : _0x55ecb0,
      ClickSaveEnable : _0x282cb6,
      ClickSaveStraight : _0x258aa9,
      ClickSaveTurns : _0xd8d0f0,
      enableScript : _0x1becb4,
      enableHighlights : _0x814add,
      enableUIEnhancements : _0x198071,
      enableHeuristics : _0x210674,
      HeurColor : _0x325a53,
      HeurFailColor : _0x2d11e5,
      LaneHeurPosHighlight : _0x3b18b7,
      LaneHeurNegHighlight : _0x5560e4,
      LaneHeuristicsChecks : _0x5f21ec,
      highlightCSIcons : _0x430a83,
      highlightOverride : _0x175645,
      AddTIO : _0x3cc839,
      IconsEnable : _0x2b4c31,
      IconsRotate : _0x3b2352,
    };
    for (const action in W.accelerators.Actions) {
      const {shortcut : keyboardShortcut, group : keyboardActionGroup} = W.accelerators.Actions[action];
      if (keyboardActionGroup === "wmelt") {
        let keyPressed = "-1";
        if (keyboardShortcut) {
          keyboardShortcut.altKey === true && (keyPressed += "A");
          keyboardShortcut.shiftKey === true && (keyPressed += "S");
          keyboardShortcut.ctrlKey === true && (keyPressed += "C");
          keyPressed !== "" && (keyPressed += "+");
          keyboardShortcut.keyCode && (keyPressed += keyboardShortcut.keyCode);
        }
        savedLTSettings[action] = keyPressed
      }
    }
    LtSettings = savedLTSettings;
    localStorage && localStorage.setItem("LT_Settings", JSON.stringify(savedLTSettings));
    const ltSettingsSaveStatus = await WazeWrap.Remote.SaveSettings("LT_Settings", savedLTSettings);
    ltSettingsSaveStatus === null ? console.warn("LaneTools:\x20User\x20PIN\x20not\x20set\x20in\x20WazeWrap\x20tab")
                                  : ltSettingsSaveStatus === false &&
                                        console.error("LaneTools:\x20Unable\x20to\x20save\x20settings\x20to\x20server");
  }
  async function loadSpreadsheet() {
    let spreadSheetLoadStatus = false;
    const spreadsheetID = "AIzaSyDZjmkSx5xWc-86hsAIzedgDgRgy8vB7BQ", angleFail = (_0x135a7d, _0x3e3ad5, errorMsg) => {
      console.error("LaneTools:\x20Error\x20loading\x20settings:", errorMsg);
    }, rbsFail = (_0x2d5151, _0x4e197b, reason) => {
      console.error("LaneTools:\x20Error\x20loading\x20RBS:\x20", reason);
      if (!RBSArray.failed) {
        WazeWrap.Alerts.error(
            GM_info.script.name,
            "Unable\x20to\x20load\x20heuristics\x20data\x20for\x20LG.\x20This\x20feature\x20will\x20not\x20be\x20available");
        RBSArray.failed = true
      }
    }, translationFailedToLoad = (_0x4e546b, _0x559463, err) => {
      console.error("LaneTools:\x20Error\x20loading\x20trans:\x20", err);
    };
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
            angleValueJSON.values.length > 0x0 ? (_.each(angleValueJSON.values, (angleValue) => {
              !configArray[angleValue[1]] && (configArray[angleValue[1]] = JSON.parse(angleValue[0]));
            }), (spreadSheetLoadStatus = true)) : angleFail();
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
    $("#lt-trans-advTools").text(strings["advTools"]);
    $("#lt-trans-quickTog").text(strings["quickTog"]);
    $("#lt-trans-heurRBS").text(strings["showRBS"]);
    $("#lt-trans-csIcons").text(strings["csIcons"]);
    $("#lt-trans-highOver").text(strings["highlightOverride"]);
    $("#lt-trans-AddTIO").text(strings["addTIO"]);
    $("#lt-trans-enIcons").text(strings["enIcons"]);
    $("#lt-trans-IconsRotate").text(strings["IconsRotate"]);
    $("#lt-color-title").attr("data-original-title", strings["colTooltip"]);
    shortcutsDisabled && ($("#lt-EnableShortcut").text("" + strings["disabled"]),
                          $("#lt-HighlightShortcut").text("" + strings["disabled"]),
                          $("#lt-UIEnhanceShortcut").text("" + strings["disabled"]),
                          $("#lt-LaneHeurChecksShortcut").text("" + strings["disabled"]));
  }

  function setHeuristics() {
    if (RBSArray.failed)
      return;
    let config = isRBS && getId("lt-serverSelect").checked ? configArray.RBS : configArray.RPS;
    (MAX_LEN_HEUR = config.MAX_LEN_HEUR), (MAX_PERP_DIF = config.MAX_PERP_DIF),
        (MAX_PERP_DIF_ALT = config.MAX_PERP_DIF_ALT), (MAX_PERP_TO_CONSIDER = config.MAX_PERP_TO_CONSIDER),
        (MAX_STRAIGHT_TO_CONSIDER = config.MAX_STRAIGHT_TO_CONSIDER), (MAX_STRAIGHT_DIF = config.MAX_STRAIGHT_DIF);
  }

  function checkShortcutsChanged() {
    let shortCutInvoked = false;
    for (const actionValue in W.accelerators.Actions) {
      const {shortcut : shortCutValue, group : groupValue} = W.accelerators.Actions[actionValue];
      if (groupValue === "wmelt") {
        let shortCutString = "";
        shortCutValue ? (shortCutValue["altKey"] === true && (shortCutString += "A"),
                         shortCutValue["shiftKey"] === true && (shortCutString += "S"),
                         shortCutValue["ctrlKey"] === true && (shortCutString += "C"),
                         shortCutString !== "" && (shortCutString += "+"),
                         shortCutValue["keyCode"] && (shortCutString += shortCutValue["keyCode"]))
                      : (shortCutString = "-1");
        if (LtSettings[actionValue] !== shortCutString) {
          (shortCutInvoked = true), console.log("LaneTools:\x20Stored\x20shortcut\x20" + actionValue + ":\x20" +
                                                LtSettings[actionValue] + "changed\x20to\x20" + shortCutString);
          break;
        }
      }
    }
    shortCutInvoked && (saveSettings(), setTimeout(() => { updateShortcutLabels(); }, 200));
  }

  function getKeyboardShortcut(settingValue) {
    const keyboardShortCut = LtSettings[settingValue];
    let shortCutValue = "";
    if (keyboardShortCut.indexOf("+") > -0x1) {
      const keyboardKeyValue = keyboardShortCut["split"]("+")[0x0];
      for (let index = 0x0; index < keyboardKeyValue.length; index++) {
        shortCutValue.length > 0x0 && (shortCutValue += "+"),
            keyboardKeyValue[index] === "C" && (shortCutValue += "Ctrl"),
            keyboardKeyValue[index] === "S" && (shortCutValue += "Shift"),
            keyboardKeyValue[index] === "A" && (shortCutValue += "Alt");
      }
      shortCutValue.length > 0x0 && (shortCutValue += "+");
      let keyboardKey = keyboardShortCut.split("+")[0x1];
      if(keyboardKey >= 96 && keyboardKey <= 105) {
          keyboardKey -= 48; shortCutValue += "[num\x20pad]";
      }
      shortCutValue += String.fromCharCode(keyboardKey);
    } else {
      let keyboardKey = Number.parseInt(keyboardShortCut, 10);
      if(keyboardKey >= 0x60 && keyboardKey <= 0x69) {
          keyboardKey -= 48; shortCutValue += "[num\x20pad]";
      }
      shortCutValue += String.fromCharCode(keyboardKey);
    }
    return shortCutValue;
  }

  function updateShortcutLabels() {
    !shortcutsDisabled && ($("#lt-EnableShortcut").text(getKeyboardShortcut("enableScript")),
                           $("#lt-HighlightShortcut").text(getKeyboardShortcut("enableHighlights")),
                           $("#lt-UIEnhanceShortcut").text(getKeyboardShortcut("enableUIEnhancements")),
                           $("#lt-LaneHeurChecksShortcut").text(getKeyboardShortcut("enableHeuristics")));
  }

  function getSegObj(objectID) { return W.model.segments.getObjectById(objectID); }
  function getNodeObj(objectID) { return W.model.nodes.getObjectById(objectID); }

  function lanesTabSetup() {
    if (getId("edit-panel").getElementsByTagName("wz-tabs").length === 0x0) {
      setTimeout(lanesTabSetup, 8000);
      console.log("Edit\x20panel\x20not\x20yet\x20loaded.");
      return;
    }
    const selectedFeatures = W.selectionManager.getSelectedFeatures();
    let fwdLanesEnabled = false, revLanesEnabled = false, rotateDisplayLanes = false;
    function _0x47ffa9() {
      W.model.nodes.get(W.selectionManager.getSegmentSelection().segments[0].attributes.toNodeID).attributes.geometry;
      document.getElementById(
          W.model.nodes.get(W.selectionManager.getSegmentSelection().segments[0].attributes.toNodeID)
              .attributes.geometry.id);
      console.log("hovering\x20to\x20B");
    }
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
    //       console.log("hovering\x20to\x20A");
    // }

    function _0x5a28b7() {
      getId("lt-ReverseLanesIcon").checked && !rotateDisplayLanes && _0x8ccdf2();
      getId("lt-highlightCSIcons").checked && _0x50c216();
      if (_pickleColor >= 0x1 || editorInfo["editableCountryIDS"].length > 0x0) {
        if (getId("li-del-opp-btn"))
          $("#li-del-opp-btn").remove();
        let _0x8b5acb = $(
                "<button\x20type=\x22button\x22\x20id=\x22li-del-fwd-btn\x22\x20style=\x22height:20px;background-color:white;border:1px\x20solid\x20grey;border-radius:8px;\x22>" +
                strings.delFwd + "</button>"),
            _0x2f9ee4 = $(
                "<button\x20type=\x22button\x22\x20id=\x22li-del-rev-btn\x22\x20style=\x22height:20px;background-color:white;border:1px\x20solid\x20grey;border-radius:8px;\x22>" +
                strings.delRev + "</button>"),
            _0x336aa4 = $(
                "<button\x20type=\x22button\x22\x20id=\x22li-del-opp-btn\x22\x20style=\x22height:auto;background-color:orange;border:1px\x20solid\x20grey;border-radius:8px;\x20margin-bottom:5px;\x22>" +
                strings.delOpp + "</button>"),
            _0x52f96d = $("<div\x20style=\x22display:inline-block;position:relative;\x22\x20/>"),
            _0x52daad = $("<div\x20style=\x22display:inline-block;position:relative;\x22\x20/>"),
            _0x55302b = $("<div\x20style=\x22display:inline-block;position:relative;\x22\x20/>");
        _0x8b5acb.appendTo(_0x52f96d), _0x2f9ee4.appendTo(_0x52daad), _0x336aa4.appendTo(_0x55302b);
        const _0x26df67 = $("#li-del-fwd-btn"), _0x24898c = $("#li-del-rev-btn"), _0xf4d645 = $("#li-del-opp-btn");
        _0x26df67.off(), _0x24898c.off(), _0xf4d645.off();
        if (!getId("li-del-rev-btn") && !revLanesEnabled &&
            selectedFeatures[0x0].attributes.wazeFeature._wmeObject.getRevLanes().laneCount > 0x0) {
          if ($(constantStrings.revLanesInstructionsFromCSS).length > 0x0)
            _0x52daad.prependTo(constantStrings.revLanesInstructionsFromCSS),
                $(constantStrings.revLanesInstructionsFromCSS).css("border-bottom", "4px dashed " + LtSettings.BAColor);
          else
            selectedFeatures[0x0].attributes.wazeFeature._wmeObject.attributes.revDirection != true &&
                (_0x336aa4.prop("title", "rev"), _0x336aa4.prependTo(constantStrings.editPanelCSS));
        } else
          $(constantStrings.revLanesInstructionsFromCSS).css("border-bottom", "4px\x20dashed\x20" + LtSettings.BAColor);
        if (!getId("li-del-fwd-btn") && !fwdLanesEnabled &&
            selectedFeatures[0x0].attributes.wazeFeature._wmeObject.getFwdLanes().laneCount > 0x0) {
          if ($(constantStrings.fwdLanesDivInstructionCSS).length > 0x0)
            _0x52f96d.prependTo(constantStrings.fwdLanesDivInstructionCSS),
                $(constantStrings.fwdLanesDivInstructionCSS).css("border-bottom", "4px dashed " + LtSettings.ABColor);
          else
            selectedFeatures[0x0].attributes.wazeFeature._wmeObject.attributes.fwdDirection != true &&
                (_0x336aa4.prop("title", "fwd"), _0x336aa4.prependTo(constantStrings.editPanelCSS));
        } else
          $(constantStrings.fwdLanesInstructionsFromCSS).css("border-bottom", "4px\x20dashed\x20" + LtSettings.ABColor);
        $("#li-del-fwd-btn").on("click", function() {
          delLanes("fwd");
          fwdLanesEnabled = true;
          setTimeout(function() { _0x5a28b7(); }, 200);
        });
        $("#li-del-rev-btn").on("click", function() {
          delLanes("rev"), (revLanesEnabled = true), setTimeout(function() { _0x5a28b7(); }, 200);
        }), $("#li-del-opp-btn").on("click", function() {
          let _0x535f00 = $(this).prop("title");
          delLanes(_0x535f00), _0x535f00 === "rev" ? (revLanesEnabled = true) : (fwdLanesEnabled = true), _0x5a28b7();
        });
      }
      const editLaneGuidance = $(".edit-lane-guidance");
      editLaneGuidance.off(), editLaneGuidance.click(function() {
        $(this).parents(".fwd-lanes").length && setTimeout(function() {
          _0x16065d("fwd"), _0x414f9a(), _0x816cf7(), _0x3e0f42(), _0x1a7fee();
          if (getId("lt-AddTIO").checked)
            addTIOUI("fwd");
        }, 0x64), $(this).parents(".rev-lanes").length && setTimeout(function() {
                    _0x16065d("rev"), _0x414f9a(), _0x816cf7(), _0x3e0f42(), _0x1a7fee();
                    if (getId("lt-AddTIO").checked)
                      addTIOUI("rev");
                  }, 0x64);
      }),
          !fwdLanesEnabled && !revLanesEnabled && _0x2308e1(), _0x816cf7();
    }
    function _0x1a7fee() {
      $(".apply-button.waze-btn.waze-btn-blue").off();
      $(".cancel-button").off();
      const fwdLanesSelector = $(".fwd-lanes"), revLanesSelector = $(".rev-lanes");
      fwdLanesSelector.find(".apply-button.waze-btn.waze-btn-blue")
          .on("click", () => { (fwdLanesEnabled = true), setTimeout(function() { _0x5a28b7(); }, 200); }),
          revLanesSelector.find(".apply-button.waze-btn.waze-btn-blue")
              .click(() => { (revLanesEnabled = true), setTimeout(function() { _0x5a28b7(); }, 200); }),
          fwdLanesSelector.find(".cancel-button")
              .click(() => { (fwdLanesEnabled = true), setTimeout(function() { _0x5a28b7(); }, 200); }),
          revLanesSelector.find(".cancel-button")
              .click(() => { (revLanesEnabled = true), setTimeout(function() { _0x5a28b7(); }, 200); });
    }
    function _0x2308e1() {
      if (getId("lt-AutoExpandLanes").checked) {
        if (!fwdLanesEnabled) {
        }
        if (!revLanesEnabled) {
        }
      }
      getId("lt-AutoOpenWidth").checked &&
          (!fwdLanesEnabled && $(".fwd-lanes").find(".set-road-width\x20>\x20wz-button").click(),
           !revLanesEnabled && $(".rev-lanes").find(".set-road-width\x20>\x20wz-button").click());
    }

    function _0x816cf7() {
      $(".fwd-lanes\x20>\x20div\x20>\x20.direction-lanes").css({
        padding : "5px\x205px\x2010px",
        "margin-bottom" : "10px",
      }),
          $("<div\x20class=\x22lt-add-Width\x20fwd\x22>2</div>").css({
            padding : "5px\x205px\x2010px",
            margin : "0px",
          }),
          $(constantStrings.fwdLanesDirectionControlEditCSS).css("padding-top", "10px"),
          $(constantStrings.revLanesInstructionsToCSS).css("padding-top", "10px"),
          $(constantStrings.fwdLanesLaneInstrunctionToCSS).css("margin-bottom", "4px"),
          $(".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)")
              .css("margin-bottom", "4px");
    }
    function _0x414f9a() {
      if ($(".fwd-lanes").find(".direction-lanes").children().length > 0x0 && !getId("lt-fwd-add-lanes")) {
        let add1Lane = $("<div\x20class=\x22lt-add-lanes\x20fwd\x22>1</div>"),
            add2Lanes = $("<div\x20class=\x20lt-add-lanes\x20fwd\x22>2</div>"),
            add3Lanes = $("<div\x20class=\x22t-add-lanes\x20fwd\x22>3</div>"),
            add4Lanes = $("<div\x20class=\x22lt-add-lanes\x20fwd\x22>4</div>"),
            add5Lanes = $("<div\x20class=\x22lt-add-lanes\x20fwd\x22>5</div>"),
            add6Lanes = $("<div\x20class=\x22lt-add-lanes\x20fwd\x22>6</div>"),
            add7Lanes = $("<div\x20class=\x22lt-add-lanes\x20fwd\x22>7</div>"),
            add8Lanes = $("<div\x20class=\x22lt-add-lanes\x20fwd\x22>8</div>"),
            addLanesItem = $(
                "<div\x20style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22\x20id=\x22lt-fwd-add-lanes\x22\x20/>");
        add1Lane.appendTo(addLanesItem), add2Lanes.appendTo(addLanesItem), add3Lanes.appendTo(addLanesItem),
            add4Lanes.appendTo(addLanesItem), add5Lanes.appendTo(addLanesItem), add6Lanes.appendTo(addLanesItem),
            add7Lanes.appendTo(addLanesItem), add8Lanes.appendTo(addLanesItem),
            addLanesItem.appendTo(constantStrings.fwdLanesNthChild);
      }
      if ($(".rev-lanes").find(".direction-lanes").children().length > 0x0 && !getId("lt-rev-add-lanes")) {
        let add1ReverseLane = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>1</div>"),
            add2ReverseLanes = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>2</div>"),
            add3ReverseLanes = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>3</div>"),
            add4ReverseLanes = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>4</div>"),
            add5ReverseLanes = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>5</div>"),
            add6ReverseLanes = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>6</div>"),
            add7ReverseLanes = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>7</div>"),
            add8ReverseLanes = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>8</div>"),
            reversLanesDiv = $(
                "<div style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22\x20id=\x22lt-rev-add-lanes\x22\x20/>");
        add1ReverseLane.appendTo(reversLanesDiv), add2ReverseLanes.appendTo(reversLanesDiv),
            add3ReverseLanes.appendTo(reversLanesDiv), add4ReverseLanes.appendTo(reversLanesDiv),
            add5ReverseLanes.appendTo(reversLanesDiv), add6ReverseLanes.appendTo(reversLanesDiv),
            add7ReverseLanes.appendTo(reversLanesDiv), add8ReverseLanes.appendTo(reversLanesDiv),
            reversLanesDiv.appendTo(
                ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)\x20>\x20div");
      }
      $(".lt-add-lanes").click(function() {
        let _0xa2f2b3 = $(this).text();
        _0xa2f2b3 = Number.parseInt(_0xa2f2b3, 0xa);
        if ($(this).hasClass("lt-add-lanes\x20fwd")) {
          const _0x11380e = $(".fwd-lanes");
          _0x11380e.find(".form-control").val(_0xa2f2b3), _0x11380e.find(".form-control").change(),
              _0x11380e.find(".form-control").focus();
        }
        if ($(this).hasClass("lt-add-lanes\x20rev")) {
          const _0x4d157 = $(".rev-lanes");
          _0x4d157.find(".form-control").val(_0xa2f2b3), _0x4d157.find(".form-control").change(),
              _0x4d157.find(".form-control").focus();
        }
      });
      if ($(".fwd-lanes").find(".lane-width-card").children().length > 0x0 && !getId("lt-fwd-add-Width")) {
        let add1MoreLane = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>1</div>"),
            add2MoreLanes = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>2</div>"),
            add3MoreLanes = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>3</div>"),
            add4MoreLanes = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>4</div>"),
            add5MoreLanes = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>5</div>"),
            add6MoreLanes = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>6</div>"),
            add7MoreLanes = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>7</div>"),
            add8MoreLanes = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>8</div>"),
            addMoreLanes = $(
                "<div\x20style=\x22position:relative;display:block;width:100%;\x22\x20id=\x22lt-fwd-add-Width\x22\x20/>");
        add1MoreLane.appendTo(addMoreLanes), add2MoreLanes.appendTo(addMoreLanes), add3MoreLanes.appendTo(addMoreLanes),
            add4MoreLanes.appendTo(addMoreLanes), add5MoreLanes.appendTo(addMoreLanes),
            add6MoreLanes.appendTo(addMoreLanes), add7MoreLanes.appendTo(addMoreLanes),
            add8MoreLanes.appendTo(addMoreLanes),
            addMoreLanes.prependTo(
                ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-from\x20>\x20.instruction\x20>\x20.road-width-edit\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20.lane-width-card");
      }
      if ($(".rev-lanes").find(".lane-width-card").children().length > 0x0 && !getId("lt-rev-add-Width")) {
        let append1Lane = $("<div\x20class=\x22lt-add-Width\x20rev\x22>1</div>"),
            append2Lanes = $("<div\x20class=\x22lt-add-Width\x20rev\x22>2</div>"),
            append3Lanes = $("<div\x20class=\x22lt-add-Width\x20rev\x22>3</div>"),
            append4Lanes = $("<div\x20class=\x22lt-add-Width\x20rev\x22>4</div>"),
            append5Lanes = $("<div\x20class=\x22lt-add-Width\x20rev\x22>5</div>"),
            append6Lanes = $("<div\x20class=\x22lt-add-Width\x20rev\x22>6</div>"),
            append7Lanes = $("<div\x20class=\x22lt-add-Width\x20rev\x22>8</div>"),
            append8Lanes = $("<div\x20class=\x22lt-add-Width\x20rev\x22>8</div>"),
            appendRevLanes = $(
                "<div\x20style=\x22position:relative;display:block;width:100%;\x22\x20id=\x22lt-rev-add-Width\x22\x20/>");
        append1Lane.appendTo(appendRevLanes), append2Lanes.appendTo(appendRevLanes),
            append3Lanes.appendTo(appendRevLanes), append4Lanes.appendTo(appendRevLanes),
            append5Lanes.appendTo(appendRevLanes), append6Lanes.appendTo(appendRevLanes),
            append7Lanes.appendTo(appendRevLanes), append8Lanes.appendTo(appendRevLanes),
            appendRevLanes.prependTo(
                ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-from\x20>\x20.instruction\x20>\x20.road-width-edit\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20.lane-width-card");
      }
      $(".lt-add-Width").click(function() {
        let numLanesToAdd = $(this).text();
        numLanesToAdd = Number.parseInt(numLanesToAdd, 0xa);
        if ($(this).hasClass("lt-add-Width\x20fwd")) {
          const fwdLanes = $(".fwd-lanes");
          fwdLanes.find("#number-of-lanes").val(numLanesToAdd), fwdLanes.find("#number-of-lanes").change(),
              fwdLanes.find("#number-of-lanes").focus();
        }
        if ($(this).hasClass("lt-add-Width\x20rev")) {
          const revLanes = $(".rev-lanes");
          revLanes.find("#number-of-lanes").val(numLanesToAdd), revLanes.find("#number-of-lanes").change(),
              revLanes.find("#number-of-lanes").focus();
        }
      });
    }
    function _0x3e0f42() {
      if (getId("lt-AutoFocusLanes").checked) {
        const _0x3797e1 = $(".fwd-lanes"), _0x36859d = $(".rev-lanes");
        if (_0x3797e1.find(".edit-region").children().length > 0x0 && !fwdLanesEnabled)
          _0x3797e1.find(".form-control").focus();
        else
          _0x36859d.find(".edit-region").children().length > 0x0 && !revLanesEnabled &&
              _0x36859d.find(".form-control").focus();
      }
    }
    function _0x16065d(laneDirection) {
      if (getId("lt-SelAllEnable").checked) {
        $(".street-name").css("user-select", "none");
        let _0x430051 = laneDirection === "fwd" ? $(".fwd-lanes").find(".form-control")[0x0]
                                                : $(".rev-lanes").find(".form-control")[0x0],
            _0x36b726 = $(_0x430051).val();
        $(_0x430051).change(function() {
          let _0x2588e2;
          if ($(this).parents(".fwd-lanes").length)
            _0x2588e2 = $(".fwd-lanes").find(".controls-container.turns-region");
          else
            $(this).parents(".rev-lanes").length &&
                (_0x2588e2 = $(".rev-lanes").find(".controls-container.turns-region"));
          _0x2588e2 = $(".street-name", _0x2588e2);
          for (let idx = 0x0; idx < _0x2588e2.length; idx++) {
            $(_0x2588e2[idx]).off(), $(_0x2588e2[idx]).click(function() {
              let _0x3d91bf = $(this).get(0x0), _0x569f4 = _0x3d91bf["parentElement"],
                  _0xe979f1 = $(".checkbox-large.checkbox-white", _0x569f4);
              const _0x3412ed = !getId(_0xe979f1[0x0].id).checked;
              for (let idx = 0x0; idx < _0xe979f1.length; idx++) {
                const _0x179ec = $("#" + _0xe979f1[idx].id);
                _0x179ec.prop("checked", _0x3412ed), _0x179ec.change();
              }
            });
          }
        }),
            _0x36b726 > 0x0 && $(_0x430051).change();
      }
    }
    function _0x50c216() {
      const segmentRef = selectedFeatures[0x0].attributes.wazeFeature._wmeObject,
            bNodeRef = getNodeObj(segmentRef.attributes.toNodeID),
            aNodeRef = getNodeObj(segmentRef.attributes.fromNodeID);
      let _0x54880b = checkLanesConfiguration(segmentRef, bNodeRef, bNodeRef.attributes.segIDs,
                                              segmentRef.attributes.fwdLaneCount),
          _0x21c6d0 = checkLanesConfiguration(segmentRef, aNodeRef, aNodeRef.attributes.segIDs,
                                              segmentRef.attributes.revLaneCount);
      if (_0x54880b[0x4] > 0x0) {
        let _0x59815e = _0x54880b[0x4] === 0x1 ? LtSettings.CS1Color : LtSettings.CS2Color,
            _0x1d2fa0 =
                $("#segment-edit-lanes\x20>\x20div\x20>\x20div\x20>\x20div.fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.lane-arrows\x20>\x20div")
                    .children();
        for (let i = 0x0; i < _0x1d2fa0.length; i++) {
          _0x1d2fa0[i]["title"] == _0x54880b[0x5] && $(_0x1d2fa0[i]).css("background-color", _0x59815e);
        }
      }
      if (_0x21c6d0[0x4] > 0x0) {
        let _0xc39df0 = _0x21c6d0[0x4] === 0x1 ? LtSettings.CS1Color : LtSettings.CS2Color,
            _0x37b735 = $(constantStrings.segmentEditLanes).children();
        for (let i = 0x0; i < _0x37b735.length; i++) {
          _0x37b735[i]["title"] === _0x21c6d0[0x5] && $(_0x37b735[i]).css("background-color", _0xc39df0);
        }
      }
    }

    function _0x8ccdf2() {
      let headingElement = document.getElementsByClassName("heading"), _0x2b66d6 = $(".lane-arrows\x20>\x20div").get();
      for (let idx = 0x0; idx < headingElement.length; idx++) {
        if (headingElement[idx].textContent.includes("south")) {
          let kids = $(_0x2b66d6[idx]).children();
          $(kids).css("transform", "rotate(180deg)"), $(_0x2b66d6[idx]).append(kids.get().reverse());
        }
      }
      rotateDisplayLanes = true;
    }

    if (getId("lt-UIEnable").checked && getId("lt-ScriptEnabled").checked && selectedFeatures.length > 0x0) {
      if (selectedFeatures.length === 0x1 &&
          selectedFeatures[0x0].attributes.wazeFeature._wmeObject.type === "segments")
        $(".lanes-tab").click(() => {
          (fwdLanesEnabled = false), (revLanesEnabled = false), setTimeout(() => { _0x5a28b7(); }, 100);
        }),
            getId("lt-AutoLanesTab").checked && setTimeout(() => { $(".lanes-tab").click(); }, 100);
      else
        selectedFeatures.length === 0x2 && scanHeuristicsCandidates(selectedFeatures);
    }
  }
  function toggleScript() { $("#lt-ScriptEnabled").click(); }

  function toggleHighlights() { $("#lt-HighlightsEnable").click(); }

  // function getStringArray() {
  //   const predefinedStrings =
  //       [
  //         "\x20at\x20",
  //         "getZoom",
  //         "data-original-title",
  //         "rev",
  //         "REVERSE",
  //         "title",
  //         "Tab",
  //         "lanes",
  //         "lt-NodeColor",
  //         "input[type=\x22checkbox\x22].lt-checkbox\x20{position:relative;top:3px;vertical-align:top;margin:0;}",
  //         "#edit-panel\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20div.segment-edit-section\x20>\x20wz-tabs\x20>\x20wz-tab.lanes-tab",
  //         "altKey",
  //         "getSegmentSelection",
  //         "RPS",
  //         "</button>",
  //         "ShowScriptUpdate",
  //         "lt-AutoExpandLanes",
  //         "hasOwnProperty",
  //         "serializeToString",
  //         "HIGHLIGHT",
  //         "inSeg",
  //         "Azm\x20to\x20node\x20",
  //         "length",
  //         "ClickSaveTurns",
  //         "failed",
  //         "inSegDir",
  //         "Turn\x20lanes",
  //         "Straight\x20turn\x20lane\x20count\x20does\x20not\x20match",
  //         ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)",
  //         "posHeur",
  //         "includes",
  //         "LTLaneGraphics",
  //         "name",
  //         "#lt-LabelsEnable",
  //         "changelayer",
  //         "join",
  //         "<div\x20style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22\x20id=\x22lt-fwd-add-lanes\x22\x20/>",
  //         "data:image/svg+xml;base64,",
  //         "0px",
  //         "lastSaveAction",
  //         "Keep\x20Right",
  //         "components",
  //         "Rev\x20(B>A)",
  //         "lt-add-Width\x20fwd",
  //         "https://github.com/SkiDooGuy/WME-LaneTools/blob/master/WME-LaneTools.user.js",
  //         "removeAllFeatures",
  //         "lt-rev-add-Width",
  //         "margin-bottom",
  //         "graphicHeight",
  //         "map",
  //         "#26bae8",
  //         "#66ccff",
  //         "Shortcut",
  //         "lt-IconsRotate",
  //         "\x20changed\x20to\x20",
  //         "Turn\x20Right",
  //         "IconsRotate",
  //         "nodeTIOCol",
  //         "label.lt-label\x20{position:relative;max-width:90%;font-weight:normal;padding-left:5px}",
  //         "LaneTools:\x20initializing...",
  //         "4px\x20dashed\x20",
  //         "roadType",
  //         "NodeColor",
  //         "lt-add-lanes\x20rev",
  //         "val",
  //         "#lt-trans-negCol",
  //         "#lt-highlightOverride",
  //         "laneLabel",
  //         ".form-control",
  //         "MAX_PERP_TO_CONSIDER",
  //         "layerSwitcherController",
  //         "autoExpand",
  //         "addLayer",
  //         "lt-highlightCSIcons",
  //         "_LTHighlightLayer",
  //         "lt-LabelsEnable",
  //         "Highlight\x20CS\x20Icons",
  //         "li-del-opp-btn",
  //         "#lt-LaneHeurChecksShortcut",
  //         "input",
  //         "rotate(180deg)",
  //         "1006486hQNMjC",
  //         "shiftKey",
  //         "#li-del-rev-btn",
  //         "RBS",
  //         "nodes",
  //         "FAIL",
  //         "LaneHeurNegHighlight",
  //         "${labelColor}",
  //         "Rotate\x20map\x20icons\x20with\x20segment\x20direction",
  //         "LaneTools:\x20Error\x20loading\x20RBS:",
  //         "lt-ErrorColor",
  //         "10px",
  //         "#lt-trans-hearCol",
  //         "enClick",
  //         ".85",
  //         "DASH_THIN",
  //         "lt-fwd-add-Width",
  //         ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction",
  //         "add",
  //         "Point",
  //         "4px",
  //         "#00aa00",
  //         "LaneHeurPosHighlight",
  //         ".lt-color-input",
  //         "Ready",
  //         "<div\x20class=\x22lt-add-lanes\x20rev\x22>7</div>",
  //         "LaneTools\x20Dev\x20Msg:\x20",
  //         "ReverseLanesIcon",
  //         "clickStraight",
  //         "none",
  //         "toggle",
  //         ".lt-option-container.color\x20{text-decoration:none;}",
  //         "number",
  //         "border-bottom",
  //         "setAttribute",
  //         "selAllTooltip",
  //         "toLowerCase",
  //         "#lt-EnableShortcut",
  //         "NodesEnable",
  //         "Alerts",
  //         "Toggle\x20UI\x20enhancements",
  //         "find",
  //         "seg",
  //         "beta.waze.com",
  //         "396CKTurr",
  //         "Enable\x20ClickSaver",
  //         "start",
  //         "ErrorColor",
  //         "#lt-trans-autoTab",
  //         "#lt-trans-csIcons",
  //         "ClickSaveEnable",
  //         "getSelectedFeatures",
  //         "2546485hRBZxR",
  //         "type",
  //         "highlightCSIcons",
  //         "done",
  //         "fill",
  //         "<div\x20class=\x22lt-add-Width\x20fwd\x22>4</div>",
  //         "keys",
  //         "negHeur",
  //         "call",
  //         "#lt-trans-nodeHigh",
  //         ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)\x20>\x20div",
  //         "Edit\x20panel\x20not\x20yet\x20loaded.",
  //         ".apply-button.waze-btn.waze-btn-blue",
  //         "zoomend",
  //         "#lt-UIEnable",
  //         "hide",
  //         "#lt-highlights-wrapper",
  //         "Open\x20Sans,\x20Alef,\x20helvetica,\x20sans-serif,\x20monospace",
  //         "trigger",
  //         "Waze\x20Selected",
  //         "<div\x20class=\x22lt-add-Width\x20rev\x22>7</div>",
  //         "?\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20",
  //         "css",
  //         "keyCode",
  //         "delFwd",
  //         "lt-CSEnable",
  //         "2px\x20solid\x20black",
  //         "CS1Color",
  //         "246188fslQvy",
  //         "Turn\x20Left",
  //         "LaneHeuristicsChecks",
  //         "<div\x20class=\x22lt-add-lanes\x20fwd\x22>3</div>",
  //         "Unable\x20to\x20load\x20heuristics\x20data\x20for\x20LG.\x20This\x20feature\x20will\x20not\x20be\x20available",
  //         "Continue",
  //         "getFeatureAttributes",
  //         "highColor",
  //         "segment",
  //         "pasteB-button",
  //         "#lt-LaneTabFeatures",
  //         "lt-LIOEnable",
  //         "\x20\x20\x20Not\x20eligible\x20as\x20altIn1:\x20",
  //         "reduce",
  //         "CopyEnable",
  //         ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-from\x20>\x20.instruction\x20>\x20.road-width-edit\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20.lane-width-card",
  //         "lt-add-lanes",
  //         "fail",
  //         "getGuidanceMode",
  //         "split",
  //         ".lt-section-wrapper\x20{display:block;width:100%;padding:4px;}",
  //         "Click\x20on\x20turn\x20name\x20to\x20toggle\x20all\x20lane\x20associations",
  //         "Use\x20RBS\x20heuristics",
  //         "toLaneIndex",
  //         "Enabled",
  //         "projection",
  //         "Vector",
  //         "lt-CS1Color",
  //         "#lt-trans-heurCan",
  //         "ABColor",
  //         "Exit\x20Left",
  //         "\x20node\x20",
  //         "https://www.waze.com/forum/viewtopic.php?f=819&t=301158",
  //         "li-del-fwd-btn",
  //         "lt-ClickSaveEnable",
  //         "lt-BAColor",
  //         "Copy/Paste",
  //         "getCentroid",
  //         "lt-AutoOpenWidth",
  //         "#li-del-fwd-btn",
  //         "${labelText}",
  //         "className",
  //         "parents",
  //         "7CccpnK",
  //         "<div\x20class=\x22lt-add-Width\x20fwd\x22>2</div>",
  //         "ctrlKey",
  //         "register",
  //         "Layer",
  //         "OVER_HIGHLIGHT",
  //         "version",
  //         "<div\x20class=\x22lt-add-lanes\x20fwd\x22>1</div>",
  //         "doSubAction",
  //         "revDirection",
  //         "AutoExpandLanes",
  //         "angle-0",
  //         "#lt-UI-wrapper",
  //         "width",
  //         "#lt-trans-fwdCol",
  //         "HighlightsEnable",
  //         "parentElement",
  //         "#lt-color-title\x20{display:block;width:100%;padding:5px\x200\x205px\x200;font-weight:bold;text-decoration:underline;cursor:pointer;}",
  //         "border",
  //         "fill-opacity",
  //         "autoOpen",
  //         "<div\x20class=\x22lt-add-lanes\x20fwd\x22>5</div>",
  //         "primaryStreetID",
  //         "errorCol",
  //         "#E804F6",
  //         "LabelColor",
  //         "background-color",
  //         "miniuturn",
  //         "LaneTools:\x20Unable\x20to\x20save\x20settings\x20to\x20server",
  //         "rank",
  //         "Auto-focus\x20lane\x20input",
  //         "<div\x20class=\x22lt-add-Width\x20fwd\x22>5</div>",
  //         "wazeFeature",
  //         "lt-CS2Color",
  //         "<div\x20class=\x22lt-add-Width\x20rev\x22>6</div>",
  //         "<div\x20class=\x22lt-add-Width\x20fwd\x22>6</div>",
  //         "clickTurn",
  //         "AutoFocusLanes",
  //         "model",
  //         "<div\x20class=\x22lt-add-lanes\x20fwd\x22>7</div>",
  //         "lt-rev-add-lanes",
  //         "lt-SelAllEnable",
  //         "PASS",
  //         "lt-AddTIO",
  //         ".cancel-button",
  //         "change",
  //         "<button\x20type=\x22button\x22\x20id=\x22li-del-opp-btn\x22\x20style=\x22height:auto;background-color:orange;border:1px\x20solid\x20grey;border-radius:8px;\x20margin-bottom:5px;\x22>",
  //         "Advanced\x20Tools",
  //         "CSOHigh",
  //         ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)\x20>\x20div",
  //         "floor",
  //         "values",
  //         "0.9",
  //         "hearCSCol",
  //         "get",
  //         "orange",
  //         "<style\x20type=\x22text/css\x22>",
  //         "laneNodeCol",
  //         "getTurnData",
  //         "MAX_PERP_DIF_ALT",
  //         "getTogglerState",
  //         "href",
  //         "segment:\x20",
  //         "timeoutID",
  //         "stringify",
  //         "order",
  //         "\x20attrs\x20len:\x20",
  //         "viewCSCol",
  //         "Only\x20highlight\x20if\x20segment\x20layer\x20active",
  //         "Lane\x20heuristics\x20-\x20not\x20qualified",
  //         "Display\x20lane\x20icons\x20on\x20map",
  //         "MAX_STRAIGHT_TO_CONSIDER",
  //         "lt-CopyEnable",
  //         "<b>NEW:</b><br>\x0a<b>FIXES:</b><br><br>\x0a",
  //         "remove",
  //         "Actions",
  //         "warning",
  //         "parseJSON",
  //         "children",
  //         "116729CFFamr",
  //         "getSegmentIds",
  //         "All\x20straight\x20lanes",
  //         "#lt-ClickSaveEnable",
  //         "#lt-LaneHeurPosHighlight",
  //         ".lt-add-lanes",
  //         "Labels",
  //         "heuristics",
  //         "clearTimeout",
  //         "#lt-trans-autoExpand",
  //         "selectionchanged",
  //         "https://editor-assets.waze.com/production/font/aae5ed152758cb6a9191b91e6cedf322.svg",
  //         "fromCharCode",
  //         "#990033",
  //         "LinearRing",
  //         "text",
  //         ".lt-wrapper\x20{position:relative;width:100%;font-size:12px;font-family:\x22Rubik\x22,\x20\x22Boing-light\x22,\x20sans-serif;user-select:none;}",
  //         "isHeuristicsCandidate\x20received\x20bad\x20argument\x20(null)",
  //         "head",
  //         "ITEM_ROAD",
  //         "findIndex",
  //         "autoFocus",
  //         "Lane\x20heuristics\x20likely",
  //         "lt-ScriptEnabled",
  //         "selectionManager",
  //         "Turn\x20angle\x20from\x20inseg\x20",
  //         "enableUIEnhancements",
  //         "uturn",
  //         "#lt-ScriptEnabled",
  //         "<div\x20class=\x22lt-add-lanes\x20rev\x22>3</div>",
  //         "<div\x20class=\x22lt-add-Width\x20fwd\x22>8</div>",
  //         "Pasted\x20some\x20lane\x20stuff",
  //         "#8F47FA",
  //         "toNodeID",
  //         "30770070DOGVeo",
  //         "#lt-UIEnhanceShortcut",
  //         "getJSON",
  //         ".lt-tio-select\x20{max-width:80%;color:rgb(32,\x2033,\x2036);background-color:rgb(242,\x20243,\x20244);border:0px;border-radius:6px;padding:0\x2016px\x200\x2010px;cursor:pointer;}",
  //         "geometry",
  //         "angle-135",
  //         "edit-panel",
  //         "Nodes\x20with\x20lanes",
  //         "21lOwPjv",
  //         "enableHeuristics",
  //         "lt-AutoLanesTab",
  //         "#lt-trans-orient",
  //         "getNumZoomLevels",
  //         "#lt-color-inputs",
  //         "6px",
  //         "HeurColor",
  //         "#F50E0E",
  //         "enableScript",
  //         "delOpp",
  //         "Lane\x20Tools",
  //         "#lt-trans-laOver",
  //         "direction",
  //         "#lt-adv-tools",
  //         "LT_Settings",
  //         "heurNegCol",
  //         "#lt-trans-lnLabel",
  //         "<div\x20class=\x27lt-wrapper\x27\x20id=\x27lt-tab-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-tab-body\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27\x20style=\x27border-bottom:2px\x20double\x20grey;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<a\x20href=\x27https://www.waze.com/forum/viewtopic.php?f=819&t=301158\x27\x20style=\x27font-weight:bold;font-size:12px;text-decoration:underline;\x27\x20\x20target=\x27_blank\x27>LaneTools\x20-\x20v",
  //         "setVisibility",
  //         "lt-LIOColor",
  //         "observe",
  //         "angle--90",
  //         "lt-add-Width\x20rev",
  //         "accelerators",
  //         "#lt-sheet-link\x20>\x20a",
  //         "afterundoaction",
  //         "warn",
  //         "Driving\x20direction\x20restriction\x20applies",
  //         "#eeeeee",
  //         "Shift",
  //         "<div\x20style=\x22position:relative;display:block;width:100%;\x22\x20id=\x22lt-fwd-add-Width\x22\x20/>",
  //         "LaneTools:\x20Error\x20communicating\x20with\x20WW\x20settings\x20server",
  //         "Lane\x20angle\x20overrides",
  //         "getLaneData",
  //         "#lt-trans-IconsRotate",
  //         "LT\x20errors\x20found,\x20scanning\x20again",
  //         "svg",
  //         "graphicWidth",
  //         "Error:\x20>1\x20qualifying\x20entry\x20segment\x20for\x20",
  //         ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit",
  //         "Node\x20highlights",
  //         "Error:\x20>1\x20qualifying\x20segment\x20for\x20",
  //         "stroke-opacity",
  //         "hasClass",
  //         "SelAllEnable",
  //         "cancel",
  //         "li-del-rev-btn",
  //         "abs",
  //         "#keyboard-dialog",
  //         "off",
  //         "#ffffff",
  //         "<div\x20class=\x22lt-add-lanes\x20rev\x22>1</div>",
  //         "5px\x205px\x2010px",
  //         "Alt\x20incoming-1\x20segment\x20found:\x20",
  //         ".lane-arrows\x20>\x20div",
  //         "#lt-",
  //         "rotate",
  //         "Auto-open\x20road\x20width",
  //         "UIEnable",
  //         "NONE",
  //         "[num\x20pad]",
  //         "2px",
  //         "LIOColor",
  //         "lt-TIOColor",
  //         "user",
  //         ".lane-arrow",
  //         "substr",
  //         "Ctrl",
  //         "copyA-button",
  //         ".controls-container.turns-region",
  //         "fromLaneIndex",
  //         "Toggle\x20lane\x20highlights",
  //         "MIN_ZOOM_ALL",
  //         ".lt-Toolbar-Container\x20{display:none;position:absolute;background-color:orange;border-radius:6px;border:1.5px\x20solid;box-size:border-box;z-index:1050;}",
  //         "Disabled",
  //         "FORWARD",
  //         "#lt-trans-tioCol",
  //         "wz-checkbox",
  //         "Negative\x20heuristics\x20candidate",
  //         "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Translations!A2:C?key=",
  //         "<div\x20style=\x22display:inline-block;position:relative;\x22\x20/>",
  //         "getElementsByClassName",
  //         "stroke-dasharray",
  //         "#lt-color-title",
  //         "lt-fwd-add-lanes",
  //         "10\x2010",
  //         ".lane-width-card",
  //         "Waze/Action/UpdateObject",
  //         "getExtent",
  //         "<button\x20type=\x22button\x22\x20id=\x22li-del-fwd-btn\x22\x20style=\x22height:20px;background-color:white;border:1px\x20solid\x20grey;border-radius:8px;\x22>",
  //         "AutoOpenWidth",
  //         ".rev-lanes",
  //         "parse",
  //         "LaneTools:\x20Error\x20loading\x20trans:",
  //         "getOLMap",
  //         "lt-HeurColor",
  //         "lt-ClickSaveTurns",
  //         "MAX_STRAIGHT_DIF",
  //         "<div\x20class=\x22lt-add-Width\x20rev\x22>5</div>",
  //         "fromVertex",
  //         "Turn\x20angle\x20from\x20inseg\x20(supplementary)\x20",
  //         "fwdDirection",
  //         "withLanes",
  //         "#lt-trans-nodeCol",
  //         "Feature",
  //         "getElementsByName",
  //         "155432OeGIQS",
  //         ".lt-add-lanes\x20{display:inline-block;width:15px;height:15px;border:1px\x20solid\x20black;border-radius:8px;margin:0\x203px\x200\x203px;line-height:\x201.5;text-align:center;font-size:10px;}",
  //         ".lt-option-container\x20{padding:3px;}",
  //         ".edit-lane-guidance",
  //         "LaneTools:\x20User\x20PIN\x20not\x20set\x20in\x20WazeWrap\x20tab",
  //         "getGeodesicLength",
  //         "click",
  //         "Auto-expand\x20lane\x20editor",
  //         ".rev-lanes\x20>\x20div\x20>\x20.direction-lanes",
  //         "hasOverrideAngle",
  //         "Waze/Model/Graph/Actions/SetTurn",
  //         "script",
  //         "copyB-button",
  //         "parseFloat",
  //         "default",
  //         "angle-90",
  //         "segments",
  //         "enableHighlights",
  //         ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-from\x20>\x20.instruction\x20>\x20.road-width-edit\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20.lane-width-card",
  //         "MAX_PERP_DIF",
  //         "LT:\x20Error\x20creating\x20shortcuts.\x20This\x20feature\x20will\x20be\x20disabled.",
  //         "LaneTools:\x20The\x20following\x20special\x20access\x20features\x20are\x20enabled:\x20",
  //         "block",
  //         "#lt-sheet-link",
  //         "laneCount",
  //         "btoa",
  //         ".lt-add-Width:hover\x20{border:1px\x20solid\x20#26bae8;background-color:#26bae8;cursor:pointer;}",
  //         "streets",
  //         "#number-of-lanes",
  //         "Interface",
  //         "DASH_THICK",
  //         "8\x2010",
  //         "695094iWfXcp",
  //         "addTIO",
  //         "parseInt",
  //         "delRev",
  //         "Nodes\x20with\x20TIOs",
  //         ".lt-Toolbar-Wrapper\x20{position:relative;padding:3px;}",
  //         "\x20|\x20",
  //         "fwdCol",
  //         ".lt-option-container.clk-svr",
  //         "lt-AutoFocusLanes",
  //         "LT:\x20icon\x20angle\x20is\x20out\x20of\x20bounds",
  //         ".set-road-width\x20>\x20wz-button",
  //         "checked",
  //         "error",
  //         "quickTog",
  //         "Events",
  //         "==\x20No\x20inseg\x20found\x20==================================================================",
  //         "#lt-heur-wrapper",
  //         "Geometry",
  //         "UIEnhance",
  //         "Checking\x20heuristics\x20candidate:\x20seg\x20",
  //         "<div\x20class=\x22lt-add-Width\x20rev\x22>8</div>",
  //         "fwdLaneCount",
  //         "toggleShortcut",
  //         "heading",
  //         "Delete\x20FWD\x20Lanes",
  //         "Allow\x20from\x20",
  //         "wmelt",
  //         "lt-HighlightsEnable",
  //         "\x20nodeExitSegIds:",
  //         "SaveSettings",
  //         "RetrieveSettings",
  //         ".checkbox-large.checkbox-white",
  //         "TIOColor",
  //         ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit",
  //         "lt-LaneHeurPosHighlight",
  //         "pasteA-button",
  //         "#li-del-opp-btn",
  //         "BAColor",
  //         "iconborderheight",
  //         "boxincwidth",
  //         "lt-add-lanes\x20fwd",
  //         "enIcons",
  //         "getElementsByTagName",
  //         "LaneTools:\x20Failed\x20to\x20load",
  //         "lt-NodesEnable",
  //         "clone",
  //         "labelCol",
  //         "Toggle\x20Shortcut",
  //         "View\x20and\x20hear\x20CS",
  //         "#ff9900",
  //         ".fwd-lanes",
  //         "LaneTools:\x20loaded",
  //         "Positive\x20heuristics\x20candidate",
  //         "#lt-trans-enClick",
  //         ".street-name",
  //         ".lt-trans-enabled",
  //         "forEach",
  //         "angle--135",
  //         "#lt-trans-heurPos",
  //         "LAOHigh",
  //         "advTools",
  //         "<div\x20class=\x22lt-add-lanes\x20rev\x22>6</div>",
  //         "addEventListener",
  //         "<div\x20style=\x22position:relative;display:block;width:100%;\x22\x20id=\x22lt-rev-add-Width\x22\x20/>",
  //         "Found\x20inseg\x20candidate:\x20",
  //         "HeurFailColor",
  //         "#04E6F6",
  //         "Turn\x20",
  //         "withTurnData",
  //         "LaneTools:\x20Error\x20loading\x20settings:",
  //         "\x20to\x20",
  //         "getItem",
  //         "Lane\x20heuristics\x20candidates",
  //         "#lt-serverSelect",
  //         "isTurnAllowed",
  //         "display",
  //         "lt-ClickSaveStraight",
  //         ".lt-toolbar-button-container\x20{display:inline-block;padding:5px;}",
  //         "Exit\x20Right",
  //         "<div\x20class=\x22lt-add-Width\x20rev\x22>3</div>",
  //         "prop",
  //         "#lt-HighlightShortcut",
  //         "afterclearactions",
  //         "round",
  //         "hasLanes",
  //         "fwd",
  //         "isLeftHand",
  //         "LTNamesLayer",
  //         "ceil",
  //         "lt-serverSelect",
  //         "hovering\x20to\x20A",
  //         ".direction-lanes",
  //         "#lt-trans-autoWidth",
  //         "value",
  //         "<div\x20class=\x22lt-add-lanes\x20fwd\x22>6</div>",
  //         "getTurnThroughNode",
  //         "setTimeout",
  //         "lt-highlightOverride",
  //         "boxheight",
  //         "stroke-width",
  //         "Keep\x20Left",
  //         "#lt-LaneHeuristicsChecks",
  //         "Error:\x20>1\x20qualifying\x20exit2\x20segment\x20for\x20",
  //         "setZIndex",
  //         "log",
  //         "sort",
  //         "View\x20only\x20CS",
  //         "#segment-edit-lanes\x20>\x20div\x20>\x20div\x20>\x20div.rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.lane-arrows\x20>\x20div",
  //         "addFeatures",
  //         "input[type=\x22text\x22].lt-color-input\x20{position:relative;width:70px;padding:3px;border:2px\x20solid\x20black;border-radius:6px;}",
  //         "CS2Color",
  //         "<div\x20class=\x22lt-add-lanes\x20fwd\x22>2</div>",
  //         "IconsEnable",
  //         "lt-ReverseLanesIcon",
  //         ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction",
  //         "StyleMap",
  //         "getObjectById",
  //         "append",
  //         "attributes",
  //         "LIOEnable",
  //         "user-select",
  //         "attr",
  //         "autoWidth",
  //         "Found\x20a\x20heuristics\x20candidate!\x20",
  //         "turn-lane-edit-top",
  //         "isTurnAllowedBySegDirections",
  //         "angle--45",
  //         ".fwd-lanes\x20>\x20div\x20>\x20.direction-lanes",
  //         ".edit-region",
  //         "lt-HeurFailColor",
  //         "html",
  //         "#lt-trans-revCol",
  //         "(failed)",
  //         "2px\x20solid\x20",
  //         "state",
  //         "segIDs",
  //         "slice",
  //         ".lt-checkbox",
  //         "#lt-trans-viewCol",
  //         "U-Turn",
  //         "prependTo",
  //         "<div\x20style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22\x20id=\x22lt-rev-add-lanes\x22\x20/>",
  //         "atan2",
  //         "\x20\x20\x20Not\x20eligible\x20as\x20inseg:\x20",
  //         "getTurnGraph",
  //         "#0033cc",
  //         "\x20/\x20",
  //         "nodeHigh",
  //         "lt-IconsEnable",
  //         "</a>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-EnableShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ScriptEnabled\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ScriptEnabled\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-LaneTabFeatures\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-uiEnhance\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-UIEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-UIEnable\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-UI-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-UIEnhanceShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoOpenWidth\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoOpenWidth\x27><span\x20id=\x27lt-trans-autoWidth\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoLanesTab\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoLanesTab\x27><span\x20id=\x27lt-trans-autoTab\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoExpandLanes\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoExpandLanes\x27><span\x20title=\x22Feature\x20disabled\x20as\x20of\x20Aug\x2027,\x202022\x20to\x20prevent\x20flickering\x20issue\x22\x20id=\x27lt-trans-autoExpand\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoFocusLanes\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoFocusLanes\x27><span\x20id=\x27lt-trans-autoFocus\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-highlightCSIcons\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-highlightCSIcons\x27><span\x20id=\x27lt-trans-csIcons\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ReverseLanesIcon\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ReverseLanesIcon\x27><span\x20id=\x27lt-trans-orient\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AddTIO\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AddTIO\x27><span\x20id=\x27lt-trans-AddTIO\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveEnable\x27><span\x20id=\x27lt-trans-enClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20clk-svr\x27\x20style=\x27padding-left:10%;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveStraight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveStraight\x27><span\x20id=\x27lt-trans-straClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20clk-svr\x27\x20style=\x27padding-left:10%;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveTurns\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveTurns\x27><span\x20id=\x27lt-trans-turnClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-mapHigh\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-HighlightsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-HighlightsEnable\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-highlights-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-HighlightShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-IconsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-IconsEnable\x27><span\x20id=\x27lt-trans-enIcons\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-IconsRotate\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-IconsRotate\x27><span\x20id=\x27lt-trans-IconsRotate\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LabelsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LabelsEnable\x27><span\x20id=\x27lt-trans-lnLabel\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-NodesEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-NodesEnable\x27><span\x20id=\x27lt-trans-nodeHigh\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LIOEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LIOEnable\x27><span\x20id=\x27lt-trans-laOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-CSEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CSEnable\x27><span\x20id=\x27lt-trans-csOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-highlightOverride\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-highlightOverride\x27><span\x20id=\x27lt-trans-highOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-heurCan\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeuristicsChecks\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeuristicsChecks\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-heur-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-LaneHeurChecksShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeurPosHighlight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeurPosHighlight\x27><span\x20id=\x27lt-trans-heurPos\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeurNegHighlight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeurNegHighlight\x27><span\x20id=\x27lt-trans-heurNeg\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20id=\x27lt-color-title\x27\x20data-original-title=\x27",
  //         "getElementById",
  //         "afteraction",
  //         "revLaneCount",
  //         "reOrient",
  //         "#lt-trans-enIcons",
  //         "setModel",
  //         "getOwnPropertyNames",
  //         "indexOf",
  //         "fromNodeID",
  //         "getObjectArray",
  //         "Remote",
  //         "push",
  //         "#lt-trans-posCol",
  //         "colTooltip",
  //         "<div\x20class=\x22lt-add-lanes\x20rev\x22>4</div>",
  //         "lt-LaneHeuristicsChecks",
  //         ".lanes-tab",
  //         "#map",
  //         "==================================================================================",
  //         "lt-UIEnable",
  //         "\x20computed\x20len:\x20",
  //         "stroke",
  //         "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Angles!A2:B?key=",
  //         ".lt-trans-tglshcut",
  //         "#lt-trans-quickTog",
  //         "==\x20No\x20alt\x20incoming-1\x20segment\x20found\x20==================================================================",
  //         "#lt-NodesEnable",
  //         "focus",
  //         "#lt-trans-highOver",
  //         "angle-45",
  //         "Continue\x20straight\x20overrides",
  //         "iconbordermargin",
  //         "<div\x20class=\x22lt-add-Width\x20rev\x22>2</div>",
  //         "Highlight\x20Colors",
  //         "LineString",
  //         "Alt",
  //         "wz-tabs",
  //         "#lt-trans-advTools",
  //         "_wmeObject",
  //         "appendTo",
  //         "extend",
  //         "hovering\x20to\x20B",
  //         "Delete\x20Rev\x20Lanes",
  //         "AddTIO",
  //         "<div>",
  //         "each",
  //         "loginManager",
  //         "Straight\x20turn\x20has\x20no\x20lanes:",
  //         "Found\x20a\x20failed\x20candidate\x20for\x20",
  //         "calculate",
  //         "south",
  //         "Toggle\x20script",
  //         "_description",
  //         "iconborderwidth",
  //         "disabled",
  //         "==\x20No\x20Outseg2\x20found\x20==================================================================",
  //         "There\x20are\x20a\x20different\x20number\x20of\x20enabled\x20turns\x20on\x20this\x20segment/node",
  //         "#lt-HighlightsEnable",
  //         "intersectsBounds",
  //         "ERROR",
  //         "<div\x20class=\x22lt-add-lanes\x20fwd\x22>8</div>",
  //       ];
  //   getStringArray = function() { return predefinedStrings; };
  //   return getStringArray();
  // Original Code had lookup in the array to be with the offset of 1010 or 334
  // }

  function toggleUIEnhancements() { $("#lt-UIEnable").click(); }
  function toggleLaneHeuristicsChecks() { $("#lt-LaneHeuristicsChecks").click(); }
  function displayToolbar() {
    const _0x4afd09 = W.selectionManager["getSelectedFeatures"]();
    if (_0x4afd09.length === 0x1 && getId("lt-CopyEnable").checked && getId("lt-ScriptEnabled").checked) {
      if (_0x4afd09[0x0].attributes.wazeFeature._wmeObject.type.toLowerCase() === "segments") {
        const _0x5df401 = $("#map");
        $("#lt-toolbar-container").css({
          display : "block",
          left : _0x5df401.width() * 0.1,
          top : _0x5df401.height() * 0.1,
        });
      }
    } else
      $("#lt-toolbar-container").css("display", "none");
  }

  function getId(elementId) { return document.getElementById(elementId); }

  function onScreen(_0x1d94fe, _0x4edaf4) {
    if (!_0x1d94fe.geometry || !_0x1d94fe.attributes)
      return false;
    if (_0x4edaf4 >= DisplayLevels["MIN_ZOOM_NONFREEWAY"] ||
        (_0x1d94fe.type === "segments" && _0x1d94fe.attributes["roadType"] === LT_ROAD_TYPE.FREEWAY))
      return W.map.getExtent().intersectsBounds(_0x1d94fe.geometry.getBounds());
    return false;
  }
  function getCardinalAngle(_0x5f13ca, _0x261fce) {
    if (_0x5f13ca == null || _0x261fce == null)
      return null;
    let _0x529918, _0x573f8b;
    _0x261fce.attributes.fromNodeID === _0x5f13ca
        ? ((_0x529918 = lt_get_second_point(_0x261fce).x - lt_get_first_point(_0x261fce).x),
           (_0x573f8b = lt_get_second_point(_0x261fce).y - lt_get_first_point(_0x261fce).y))
        : ((_0x529918 = lt_get_next_to_last_point(_0x261fce).x - lt_get_last_point(_0x261fce).x),
           (_0x573f8b = lt_get_next_to_last_point(_0x261fce).y - lt_get_last_point(_0x261fce).y));
    let _0x45f593 = Math.atan2(_0x573f8b, _0x529918), _0x1d47ac = ((_0x45f593 * 0xb4) / Math.PI) % 360;
    if (_0x1d47ac < 0x0)
      _0x1d47ac = _0x1d47ac + 360;
    return Math.round(_0x1d47ac);
  }
  function lt_get_first_point(_0x1ee745) { return _0x1ee745.geometry.components[0x0]; }
  function lt_get_last_point(_0x5c9b90) {
    return _0x5c9b90.geometry.components[_0x5c9b90.geometry.components.length - 0x1];
  }
  function lt_get_second_point(_0x24de9d) { return _0x24de9d.geometry.components[0x1]; }
  function lt_get_next_to_last_point(_0x2ea5d3) {
    return _0x2ea5d3.geometry.components[_0x2ea5d3.geometry.components.length - 0x2];
  }

  function delLanes(laneDirection) {
    const selectedFeatures = W.selectionManager.getSelectedFeatures(),
          wmeObject = selectedFeatures[0x0].attributes.wazeFeature._wmeObject, turnGraph = W.model.getTurnGraph(),
          mAction = new MultiAction();
    let nodeObject, attachedSegmentIDs, lanesObject = {};
    mAction.setModel(W.model);
    if (laneDirection === "fwd") {
      (lanesObject.fwdLaneCount = 0x0), (nodeObject = getNodeObj(wmeObject.attributes.toNodeID)),
          (attachedSegmentIDs = nodeObject.getSegmentIds());
      const _0xfa6629 = $(".fwd-lanes");
      _0xfa6629.find(".form-control").val(0x0), _0xfa6629.find(".form-control").change();
    }
    if (laneDirection === "rev") {
      (lanesObject.revLaneCount = 0x0), (nodeObject = getNodeObj(wmeObject.attributes.fromNodeID)),
          (attachedSegmentIDs = nodeObject.getSegmentIds());
      const _0x5c7972 = $(".rev-lanes");
      _0x5c7972.find(".form-control").val(0x0), _0x5c7972.find(".form-control").change();
    }
    mAction.doSubAction(new UpdateObj(wmeObject, lanesObject));
    for (let idx = 0x0; idx < attachedSegmentIDs.length; idx++) {
      let _0x58ea8c = turnGraph.getTurnThroughNode(nodeObject, wmeObject, getSegObj(attachedSegmentIDs[idx])),
          _0x5c9c0e = _0x58ea8c.getTurnData();
      _0x5c9c0e.hasLanes() && ((_0x5c9c0e = _0x5c9c0e.withLanes()), (_0x58ea8c = _0x58ea8c.withTurnData(_0x5c9c0e)),
                               mAction["doSubAction"](new SetTurn(turnGraph, _0x58ea8c)));
    }
    (mAction._description = "Deleted\x20lanes\x20and\x20turn\x20associations"), W.model.actionManager.add(mAction);
  }
  function removeHighlights() {
    LTHighlightLayer.removeAllFeatures();
    LTNamesLayer.removeAllFeatures();
  }
  function removeLaneGraphics() { LTLaneGraphics.removeAllFeatures(); }
  function applyName(_0x27e648, _0x2d5f66, _0x3e4f08) {
    let _0x2e0a0c = _0x27e648.clone(), _0x58bfcc = _0x2d5f66 + "\x20/\x20" + _0x3e4f08,
        _0x118707 = new OpenLayers.Feature.Vector(_0x2e0a0c, {
          labelText : _0x58bfcc,
          labelColor : LtSettings.LabelColor,
        });
    LTNamesLayer.addFeatures([ _0x118707 ]);
  }
  function highlightSegment(segGeom, segDirection, highlightEnabled, highlightLabelsEnabled, forwardLaneCount,
                            reverseLaneCount, _0x147e33, _0x40fe5d, _0x42e2ed, _0x701156, _0x2a289c) {
    const segmentHighlightTypes = {
      DASH_THIN : 0x1,
      DASH_THICK : 0x2,
      HIGHLIGHT : 0xa,
      OVER_HIGHLIGHT : 0x14,
    },
          newSegmentGeometry = segGeom.clone(), csEnabled = getId("lt-CSEnable").checked;
    if (newSegmentGeometry.components.length > 0x2) {
      let _0x114781 = newSegmentGeometry.components.length, _0x17a8e9 = _0x114781 / 0x2,
          _0x5479ec = _0x114781 % 0x2 ? Math.ceil(_0x17a8e9) - 0x1 : Math.ceil(_0x17a8e9),
          _0x3a7f64 = _0x114781 % 0x2 ? Math.floor(_0x17a8e9) + 0x1 : Math.floor(_0x17a8e9);
      if (segDirection === Direction.FORWARD) {
        let _0x21e1e8 = _0x1c40ca(newSegmentGeometry, _0x5479ec, _0x114781);
        highlightEnabled && _0x58a03b(_0x21e1e8, "" + LtSettings.ABColor, segmentHighlightTypes.DASH_THIN),
            _0x43deae(_0x21e1e8, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
      } else {
        if (segDirection === Direction.REVERSE) {
          let _0x3e6b6f = _0x1c40ca(newSegmentGeometry, 0x0, _0x3a7f64);
          highlightEnabled && _0x58a03b(_0x3e6b6f, "" + LtSettings.BAColor, segmentHighlightTypes.DASH_THIN),
              _0x43deae(_0x3e6b6f, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
        }
      }
      if (highlightLabelsEnabled && (Direction.FORWARD || forwardLaneCount === 0x0)) {
        if (_0x114781 % 0x2)
          applyName(newSegmentGeometry.components[_0x5479ec], forwardLaneCount, _0x2c9162);
        else {
          let _0x3f4fb2 = newSegmentGeometry.components[_0x3a7f64 - 0x1],
              _0x196425 = newSegmentGeometry.components[_0x5479ec],
              _0x2daf64 =
                  new OpenLayers.Geometry.Point((_0x3f4fb2.x + _0x196425.x) / 0x2, (_0x3f4fb2.y + _0x196425.y) / 0x2);
          applyName(_0x2daf64, forwardLaneCount, _0x2c9162);
        }
      }
    } else {
      let _0x5b73aa = newSegmentGeometry.components[0x0], _0x3cd08d = newSegmentGeometry.components[0x1],
          _0xa8356b =
              new OpenLayers.Geometry.Point((_0x5b73aa.x + _0x3cd08d.x) / 0x2, (_0x5b73aa.y + _0x3cd08d.y) / 0x2);
      if (segDirection === Direction.FORWARD) {
        let _0x196538 = new OpenLayers.Geometry.Point(newSegmentGeometry.components[0x1].clone().x,
                                                      newSegmentGeometry.components[0x1].clone().y),
            _0x13e81d = new OpenLayers.Geometry["LineString"]([ _0xa8356b, _0x196538 ], {});
        highlightEnabled && _0x58a03b(_0x13e81d, "" + LtSettings.ABColor, segmentHighlightTypes.DASH_THIN),
            _0x43deae(_0x13e81d, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
      } else {
        if (segDirection === Direction.REVERSE) {
          let _0x4c870d = new OpenLayers.Geometry.Point(newSegmentGeometry.components[0x0].clone().x,
                                                        newSegmentGeometry.components[0x0].clone().y),
              _0x598bfa = new OpenLayers.geometry.LineString([ _0xa8356b, _0x4c870d ], {});
          highlightEnabled && _0x58a03b(_0x598bfa, "" + LtSettings["BAColor"], segmentHighlightTypes["DASH_THIN"]),
              _0x43deae(_0x598bfa, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
        }
      }
      highlightLabelsEnabled && (Direction.FORWARD || forwardLaneCount === 0x0) &&
          applyName(_0xa8356b, forwardLaneCount, _0x2c9162);
    }
    function _0x1c40ca(_0x1226a0, _0x5d1ef6, _0x2d2248) {
      let _0x3411db = [];
      for (let _0x191254 = _0x5d1ef6; _0x191254 < _0x2d2248; _0x191254++) {
        _0x3411db[_0x191254] = _0x1226a0.components[_0x191254].clone();
      }
      return new OpenLayers.Geometry.LineString(_0x3411db, {});
    }
    function _0x43deae(_0x3291c0, _0xe37e1, _0x2d6773, _0x5e102e, _0x59dda1 = false) {
      if (_0x2d6773) {
        _0x58a03b(_0x3291c0.clone(), "" + LtSettings["ErrorColor"], segmentHighlightTypes.OVER_HIGHLIGHT);
        return;
      }
      _0xe37e1 && _0x58a03b(_0x3291c0.clone(), "" + LtSettings.LIOColor, segmentHighlightTypes.HIGHLIGHT);
      _0x40fe5d === 0x1 && csEnabled &&
          _0x58a03b(_0x3291c0.clone(), "" + LtSettings.CS1Color, segmentHighlightTypes.HIGHLIGHT);
      _0x40fe5d === 0x2 && csEnabled &&
          _0x58a03b(_0x3291c0.clone(), "" + LtSettings.CS2Color, segmentHighlightTypes["HIGHLIGHT"]);
      if (_0x5e102e === HeuristicsCandidate["PASS"])
        _0x58a03b(_0x3291c0.clone(), "" + LtSettings.HeurColor,
                  _0x59dda1 ? segmentHighlightTypes.OVER_HIGHLIGHT : segmentHighlightTypes["HIGHLIGHT"]);
      else
        _0x5e102e === HeuristicsCandidate.FAIL &&
            _0x58a03b(_0x3291c0.clone(), "" + LtSettings.HeurFailColor,
                      _0x59dda1 ? segmentHighlightTypes.OVER_HIGHLIGHT : segmentHighlightTypes.HIGHLIGHT);
    }
    function _0x58a03b(_0x4e223c, _0x4b1ac8, _0x1d2584) {
      let _0x3bdb58 = new OpenLayers.Feature.Vector(_0x4e223c, {}, {});
      LTHighlightLayer.addFeatures([ _0x3bdb58 ]);
      const _0x5501de = document.getElementById(_0x4e223c.id);
      if (_0x5501de) {
        _0x5501de.setAttribute("stroke", "" + _0x4b1ac8);
        if (_0x1d2584 === segmentHighlightTypes.HIGHLIGHT)
          _0x5501de.setAttribute("stroke-width", "15"), _0x5501de.setAttribute("stroke-opacity", ".6");
        else {
          if (_0x1d2584 === segmentHighlightTypes.OVER_HIGHLIGHT)
            _0x5501de.setAttribute("stroke-width", "18"), _0x5501de.setAttribute("stroke-opacity", ".85");
          else {
            _0x5501de.setAttribute("stroke-opacity", "1");
            if (_0x1d2584 === segmentHighlightTypes.DASH_THICK)
              _0x5501de.setAttribute("stroke-width", "8"), _0x5501de.setAttribute("stroke-dasharray", "8\x2010");
            else
              _0x1d2584 === segmentHighlightTypes.DASH_THIN &&
                  (_0x5501de.setAttribute("stroke-width", "4"), _0x5501de.setAttribute("stroke-dasharray", "10\x2010"));
          }
        }
      }
    }
    LTHighlightLayer.setZIndex(450);
  }
  function highlightNode(_0x468e12, _0xcc8670, _0x5c426d = false) {
    const _0x5ee4da = _0x468e12.clone(), _0x1313c1 = new OpenLayers.Feature.Vector(_0x5ee4da, {});
    LTHighlightLayer.addFeatures([ _0x1313c1 ]);
    const _0x2bd47a = document.getElementById(_0x5ee4da.id);
    _0x2bd47a && (_0x2bd47a.setAttribute("fill", _0xcc8670), _0x2bd47a.setAttribute("r", _0x5c426d ? "18" : "10"),
                  _0x2bd47a.setAttribute("fill-opacity", "0.9"), _0x2bd47a.setAttribute("stroke-width", "0"));
  }
  let lt_scanArea_timer = {
    start : function() {
      this.cancel();
      let _0x150ba4 = this;
      this["timeoutID"] = window.setTimeout(function() { _0x150ba4.calculate(); }, 500);
    },
    calculate : function() { scanArea_real(), delete this.timeoutID; },
    cancel : function() {
      typeof this.timeoutID === "number" &&
          (window.clearTimeout(this.timeoutID), delete this.timeoutID, (lt_scanArea_recursive = 0x0));
    },
  };
  function scanArea() { (lt_scanArea_recursive = 0x3), scanArea_real(); }
  function scanArea_real() {
    const scriptEnabled = getId("lt-ScriptEnabled").checked, highlightsEnabled = getId("lt-HighlightsEnable").checked,
          heuristicsChecksEnabled = getId("lt-LaneHeuristicsChecks").checked,
          currentZoomLevel = W.map.getZoom() != null ? W.map["getZoom"]() : 16,
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
  function scanHeuristicsCandidates(_0x482def) {
    let _0x4174e4 = [], _0x232b3f = 0x0;
    return (_.each(_0x482def, (_0x249a9b) => {
      _0x249a9b && _0x249a9b.attributes.wazeFeature._wmeObject &&
          _0x249a9b.attributes.wazeFeature._wmeObject.type === "segments" &&
          (_0x232b3f = _0x4174e4.push(_0x249a9b.attributes.wazeFeature._wmeObject));
    }), scanSegments(_0x4174e4, true), _0x232b3f);
  }
  function scanSegments(_0x48b407, _0x553a1b) {
    const checkHeuristics = getId("lt-LaneHeuristicsChecks").checked,
          heurPosHighlightEnabled = checkHeuristics && getId("lt-LaneHeurPosHighlight").checked,
          heurNegHighlightEnabled = checkHeuristics && getId("lt-LaneHeurNegHighlight").checked,
          highlightEnabled = getId("lt-HighlightsEnable").checked,
          highlightLIOEnabled = highlightEnabled && getId("lt-LIOEnable").checked,
          highlightLabelsEnabled = highlightEnabled && getId("lt-LabelsEnable").checked,
          minZoomLevel = W.map.getZoom() != null ? W.map.getZoom() : 16, turnGraph = W.model.getTurnGraph();
    _.each(_0x48b407, (_0x4e91a0) => {
      if (onScreen(_0x4e91a0, minZoomLevel)) {
        const featureAttributes = _0x4e91a0.getFeatureAttributes();
        let _0x1b6f52 = false, _0x1ca2eb = lt_segment_length(_0x4e91a0);
        _0x1b6f52 = _0x1b6f52 || _0x2ad725(_0x4e91a0, featureAttributes, Direction.FORWARD, _0x1ca2eb, _0x1b6f52);
        if (_0x1b6f52 && lt_scanArea_recursive > 0x0) {
          lt_log("LT\x20errors\x20found,\x20scanning\x20again", 0x2), removeHighlights(), lt_scanArea_recursive--,
              lt_scanArea_timer.start();
          return;
        }
        _0x1b6f52 = _0x1b6f52 || _0x2ad725(_0x4e91a0, featureAttributes, Direction.REVERSE, _0x1ca2eb, _0x1b6f52);
        if (_0x1b6f52 && lt_scanArea_recursive > 0x0) {
          lt_log("LT\x20errors\x20found,\x20scanning\x20again", 0x2), removeHighlights(), lt_scanArea_recursive--,
              lt_scanArea_timer.start();
        }
      }
    });
    function _0x2ad725(_0x6f84fd, segmentObj, segmentDirection, _0x37b92d, _0x402e4b) {
      const fwdLaneCount = segmentObj.fwdLaneCount, revLaneCount = segmentObj.revLaneCount;
      let toNode = getNodeObj(segmentObj.toNodeID), fromNode = getNodeObj(segmentObj.fromNodeID),
          fLaneCount = fwdLaneCount, rLaneCount = revLaneCount;
      segmentDirection !== Direction.FORWARD &&
          ((toNode = getNodeObj(segmentObj.fromNodeID)), (fromNode = getNodeObj(segmentObj.toNodeID)),
           (fLaneCount = revLaneCount), (rLaneCount = fwdLaneCount));
      let _0x5855dd = false, _0x4d3a78 = false, _0x12606 = false, _0x58ba1e = false, _0x3a8c59 = 0x0,
          heurCandidate = HeuristicsCandidate.NONE, _0x53f387 = null,
          _0x211d6a = {seg : 0x0, direction : Direction.NONE};
      if (onScreen(toNode, minZoomLevel)) {
        const toNodeAttachedSegmentIDs = toNode.getSegmentIds();
        if (fLaneCount > 0x0) {
          let _0x30b899 = checkLanesConfiguration(_0x6f84fd, toNode, toNodeAttachedSegmentIDs, fLaneCount);
          (_0x5855dd = _0x30b899[0x0]), (_0x4d3a78 = _0x30b899[0x1]), (_0x58ba1e = _0x30b899[0x2]),
              (_0x12606 = _0x30b899[0x3]), (_0x3a8c59 = _0x30b899[0x4]), (_0x402e4b = _0x12606 || _0x402e4b);
        }
        if (_0x37b92d <= MAX_LEN_HEUR) {
          heurCandidate = isHeuristicsCandidate(_0x6f84fd, toNode, toNodeAttachedSegmentIDs, fromNode, fLaneCount,
                                                _0x37b92d, turnGraph, _0x211d6a);
          heurCandidate === HeuristicsCandidate["ERROR"] && (_0x12606 = true);
          if (!checkHeuristics)
            heurCandidate = HeuristicsCandidate.NONE;
          else
            heurCandidate !== HeuristicsCandidate.NONE && (_0x53f387 = {..._0x211d6a});
        }
      }
      if (!_0x553a1b) {
        let _0x5c9960 = null;
        ((heurPosHighlightEnabled && heurCandidate === HeuristicsCandidate.PASS) ||
         (heurNegHighlightEnabled && heurCandidate === HeuristicsCandidate.FAIL)) &&
            (_0x5c9960 = heurCandidate),
            (fLaneCount > 0x0 || _0x5c9960 !== null || _0x12606) &&
                highlightSegment(_0x6f84fd.geometry, segmentDirection, highlightEnabled, highlightLabelsEnabled,
                                 fwdLaneCount, revLaneCount, _0x58ba1e && highlightLIOEnabled, _0x3a8c59, _0x12606,
                                 _0x5c9960, false),
            highlightEnabled && getId("lt-NodesEnable").checked &&
                (_0x5855dd && highlightNode(toNode.geometry, "" + LtSettings.NodeColor),
                 _0x4d3a78 && highlightNode(toNode.geometry, "" + LtSettings.TIOColor));
      } else {
        lt_log("candidate(f):" + heurCandidate);
        if (heurCandidate !== HeuristicsCandidate.NONE) {
          if (_0x53f387 != null && _0x48b407["findIndex"]((_0x12b968) => _0x12b968 === _0x53f387.seg) > -0x1) {
            let _0x4063ba =
                heurCandidate === HeuristicsCandidate.PASS ? "" + LtSettings.NodeColor : "" + LtSettings.HeurFailColor;
            highlightSegment(_0x6f84fd.geometry, segmentDirection, false, false, 0x0, 0x0, false, _0x3a8c59, _0x12606,
                             heurCandidate, true),
                highlightSegment(_0x53f387["seg"].geometry, _0x53f387.direction, false, false, 0x0, 0x0, false, 0x0,
                                 false, heurCandidate, true),
                highlightNode(toNode.geometry, _0x4063ba, true), highlightNode(fromNode.geometry, _0x4063ba, true);
          }
        }
      }
      return _0x402e4b;
    }
  }
  function checkLanesConfiguration(segment, node, attachedSegments, laneCount) {
    let _0x739f97 = false, _0x55ea18 = false, _0x16f110 = false, _0x161259 = false, _0x5c5507 = 0x0, _0x4211dc = null,
        _0x44a7d8 = [];
    const turnGraph = W.model.getTurnGraph(), zoomLevel = W.map.getZoom() != null ? W.map["getZoom"]() : 0x10;
    for (let idx = 0x0; idx < attachedSegments.length; idx++) {
      const attachedSegment = getSegObj(attachedSegments[idx]),
            turnData = turnGraph.getTurnThroughNode(node, segment, attachedSegment).getTurnData();
      if (turnData.state === 0x1) {
        turnData["hasInstructionOpcode"]() && (_0x55ea18 = true);
        if (turnData["hasLanes"]()) {
          _0x739f97 = true;
          turnData.getLaneData().hasOverrideAngle() && (_0x161259 = true);
          if (turnData.getLaneData().getGuidanceMode() === 0x1)
            (_0x5c5507 = 0x1),
                (_0x4211dc = W.model.streets.getObjectById(attachedSegment.attributes.primaryStreetID).name);
          else
            turnData.getLaneData().getGuidanceMode() === 0x2 &&
                ((_0x5c5507 = 0x2),
                 (_0x4211dc = W.model.streets.getObjectById(attachedSegment.attributes.primaryStreetID).name));
          const frmLnIdx = turnData.lanes.fromLaneIndex, toLnIdx = turnData.lanes.toLaneIndex;
          for (let cnt = frmLnIdx; cnt < toLnIdx + 0x1; cnt++) {
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
      _0x44a7d8[idx] !== idx && (_0x16f110 = true);
    }
    return (_0x44a7d8.length < laneCount && onScreen(node, zoomLevel) && (_0x16f110 = true),
            [ _0x739f97, _0x55ea18, _0x161259, _0x16f110, _0x5c5507, _0x4211dc ]);
  }
  function setTurns(_0x32e1b9) {
    if (!getId("lt-ClickSaveEnable").checked)
      return;
    let _0x1357ab = document.getElementsByClassName(_0x32e1b9)[0x0],
        _0x3ce173 = _0x1357ab["getElementsByClassName"]("angle--135").length > 0x0  ? "angle--135"
                    : _0x1357ab["getElementsByClassName"]("angle--90").length > 0x0 ? "angle--90"
                                                                                    : "angle--45",
        _0x217ae4 = _0x1357ab.getElementsByClassName("angle-135").length > 0x0  ? "angle-135"
                    : _0x1357ab.getElementsByClassName("angle-90").length > 0x0 ? "angle-90"
                                                                                : "angle-45",
        _0x3541df = _0x1357ab.getElementsByClassName("turn-lane-edit-top"), _0x16a6be = false, _0x43ae0b = false,
        _0x257aea = [].slice.call(_0x3541df).reduce(
            (_0x4861b3, _0x2010bf) =>
                _0x4861b3 +
                [].slice.call(_0x2010bf.getElementsByTagName("input"))
                    .reduce((_0x58c1c4, _0x4afea1) => (_0x4afea1.checked === true ? _0x58c1c4 + 0x1 : _0x58c1c4), 0x0),
            0x0);
    if (_0x257aea === 0x0) {
      for (let idx = 0x0; idx < _0x3541df.length; idx++) {
        const _0x496f7c = _0x3541df[idx];
        let _0x5c6270 = _0x496f7c.getElementsByTagName("wz-checkbox");
        if (_0x5c6270 && _0x5c6270.length > 0x0) {
          if (_0x496f7c.getElementsByClassName(_0x3ce173).length > 0x0 && _0x5c6270[0x0].checked !== undefined &&
              _0x5c6270[0x0].checked === false && getId("lt-ClickSaveTurns").checked)
            (_0x16a6be = true), _0x5c6270[0x0].click();
          else
            _0x496f7c.getElementsByClassName(_0x217ae4).length > 0x0 &&
                _0x5c6270[_0x5c6270.length - 0x1].checked !== undefined &&
                _0x5c6270[_0x5c6270.length - 0x1].checked === false && getId("lt-ClickSaveTurns").checked &&
                ((_0x43ae0b = true), _0x5c6270[_0x5c6270.length - 0x1].click());
        }
      }
      for (let idx = 0x0; idx < _0x3541df.length; idx++) {
        const _0x376ec2 = _0x3541df[idx];
        let _0x58c806 = _0x376ec2.getElementsByTagName("wz-checkbox");
        if (_0x376ec2.getElementsByClassName("angle-0").length > 0x0)
          for (let idx = 0x0; idx < _0x58c806.length; idx++) {
            if (_0x58c806[idx].checked === false) {
              if (idx === 0x0 && (getId("lt-ClickSaveStraight").checked || _0x16a6be === false))
                _0x58c806[idx].click();
              else {
                if (idx === _0x58c806.length - 0x1 && (getId("lt-ClickSaveStraight").checked || _0x43ae0b === false))
                  _0x58c806[idx].click();
                else
                  idx !== 0x0 && idx !== _0x58c806.length - 0x1 && _0x58c806[idx].click();
              }
            }
          }
      }
    }
  }
  function initLaneGuidanceClickSaver() {
    let _0x324acf = new MutationObserver((_0x23b79c) => {
      if (W.selectionManager.getSelectedFeatures()[0x0] &&
          W.selectionManager.getSelectedFeatures()[0x0].attributes.wazeFeature._wmeObject.type === "segments" &&
          getId("lt-ScriptEnabled").checked) {
        let _0x21e4b9 = document.getElementsByName("laneCount");
        for (let idx = 0x0; idx < _0x21e4b9.length; idx++) {
          _0x21e4b9[idx].addEventListener("change", function() {
            let _0x2cc679 = $(this).parents().eq(0x9), _0x80b8a5 = _0x2cc679[0x0].parentElement.className;
            setTimeout(setTurns(_0x80b8a5), 0x32);
          }, false);
        }
        let _0xb4fbc1 = document.getElementsByClassName("lt-add-lanes");
        for (let idx = 0x0; idx < _0xb4fbc1.length; idx++) {
          _0xb4fbc1[idx]["addEventListener"]("click", function() {
            let _0x45dfc7 = $(this).parents().eq(0x9), _0x24c520 = _0x45dfc7[0x0].parentElement.className;
            setTimeout(setTurns(_0x24c520), 0x32);
          }, false);
        }
      }
    });
    _0x324acf.observe(document.getElementById("edit-panel"), {
      childList : true,
      subtree : true,
    });
  }
  function isHeuristicsCandidate(_0x2bb3f1, toNodeObj, attachedSegmentIDs, fromNodeObj, fwdLaneCount, _0x25826c,
                                 _0x5aa7bb, _0x1a610d) {
    if (_0x2bb3f1 == null || toNodeObj == null || attachedSegmentIDs == null || fromNodeObj == null ||
        fwdLaneCount == null || _0x5aa7bb == null || _0x1a610d == null) {
      lt_log("isHeuristicsCandidate\x20received\x20bad\x20argument\x20(null)", 0x1);
      return 0x0;
    }
    let _0x1859f0 = null, _0x4f9be7 = null, _0x96949d = 0x0, _0x4777ff = null, _0x28857a = null, _0x96fad4 = null,
        _0x4e91d5 = 0x0, _0x4fd61c = null, _0x1c6b60 = null, _0x5063e3 = 0x0, _0x296190 = 0x0;
    if (_0x25826c > MAX_LEN_HEUR)
      return 0x0;
    const _0x453456 = _0x2bb3f1.attributes.id;
    let _0x11d184 = _0x43a6d2(toNodeObj.attributes.id, _0x2bb3f1),
        _0x5349e1 = _0xca5734(fromNodeObj.attributes.id, _0x2bb3f1), _0x18525c = -90, _0x26651c = 90;
    W.model.isLeftHand && ((_0x18525c = 90), (_0x26651c = -90));
    lt_log("==================================================================================", 0x2);
    lt_log("Checking\x20heuristics\x20candidate:\x20seg" + _0x453456 + "node" + toNodeObj.attributes.id +
               "\x20azm\x20" + _0x11d184 + "nodeExitSegIds:" + attachedSegmentIDs.length,
           0x2);
    let segmentIDs = fromNodeObj.getSegmentIds();
    for (let idx = 0x0; idx < segmentIDs.length; idx++) {
      let heurState = 0x0;
      if (segmentIDs[idx] === _0x453456)
        continue;
      const _0x71a39c = getSegObj(segmentIDs[idx]);
      if (!_0x493643(_0x71a39c, fromNodeObj, _0x2bb3f1))
        continue;
      let _0x3c6b23 = _0x43a6d2(fromNodeObj.attributes.id, _0x71a39c), _0x4ef283 = _0xcd5d5b(_0x3c6b23, _0x5349e1);
      lt_log("Turn\x20angle\x20from\x20inseg\x20" + segmentIDs[idx] + ":\x20" + _0x4ef283 + "(" + _0x3c6b23 + "," +
                 _0x5349e1 + ")",
             0x3);
      if (Math.abs(_0x4ef283) > MAX_STRAIGHT_DIF) {
        if (Math.abs(_0x4ef283) > MAX_STRAIGHT_TO_CONSIDER)
          continue;
        lt_log("Not\x20eligible\x20as\x20inseg:\x20" + _0x4ef283, 0x2), (heurState = HeuristicsCandidate.FAIL);
      }
      const _0x4c0fc6 = _0x5aa7bb.getTurnThroughNode(fromNodeObj, _0x71a39c, _0x2bb3f1),
            _0x264c0a = _0x4c0fc6.getTurnData();
      if (_0x264c0a.state !== 0x1 || !_0x264c0a.hasLanes()) {
        lt_log("Straight\x20turn\x20has\x20no\x20lanes:" + segmentIDs[idx] + "\x20to\x20" + _0x453456, 0x3);
        continue;
      }
      let idxDiff = _0x264c0a.lanes.toLaneIndex - _0x264c0a.lanes.fromLaneIndex + 0x1;
      idxDiff !== fwdLaneCount && !(fwdLaneCount === 0x0 && idxDiff === 0x1) &&
          (lt_log("Straight\x20turn\x20lane\x20count\x20does\x20not\x20match", 0x2),
           (heurState = HeuristicsCandidate.ERROR));
      if (_0x4777ff !== null && heurState >= _0x4e91d5) {
        if (_0x4e91d5 === 0x0 && heurState === 0x0)
          return (lt_log("Error:\x20>1\x20qualifying\x20entry\x20segment\x20for\x20" + _0x2bb3f1.attributes.id +
                             ":\x20" + _0x4777ff.attributes.id + "," + _0x71a39c.attributes.id,
                         0x2),
                  lt_log("==================================================================================", 0x2),
                  0x0);
      }
      (_0x4777ff = _0x71a39c), (_0x28857a = _0x3c6b23), (_0x96fad4 = _0x4ef283), (_0x296190 = idxDiff),
          (_0x4e91d5 = heurState), (_0x1a610d.inSeg = _0x4777ff),
          (_0x1a610d.inSegDir = _0x4c0fc6.fromVertex["direction"] === "fwd" ? Direction.FORWARD : Direction["REVERSE"]);
    }
    if (_0x4777ff == null)
      return lt_log("==\x20No\x20inseg\x20found\x20==================================================================",
                    0x2),
             0x0;
    else
      lt_log("Found\x20inseg\x20candidate:\x20" + _0x4777ff.attributes.id + "\x20" +
                 (_0x4e91d5 === 0x0 ? "" : "(failed)"),
             0x2);
    for (let idx = 0x0; idx < attachedSegmentIDs.length; idx++) {
      let _0x10d7bb = 0x0;
      if (attachedSegmentIDs[idx] === _0x453456)
        continue;
      const _0x3e085f = getSegObj(attachedSegmentIDs[idx]);
      if (!_0x493643(_0x2bb3f1, toNodeObj, _0x3e085f))
        continue;
      let _0xff74b4 = _0xca5734(toNodeObj.attributes.id, _0x3e085f), _0x1bf6a7 = _0xcd5d5b(_0x11d184, _0xff74b4);
      lt_log("Turn\x20angle\x20to\x20outseg2\x20" + attachedSegmentIDs[idx] + ":\x20" + _0x1bf6a7 + "(" + _0x11d184 +
                 "," + _0xff74b4 + ")",
             0x2);
      if (Math.abs(_0x18525c - _0x1bf6a7) < MAX_PERP_TO_CONSIDER)
        return 0x0;
      if (Math.abs(_0x26651c - _0x1bf6a7) > MAX_PERP_DIF) {
        if (Math.abs(_0x26651c - _0x1bf6a7) > MAX_PERP_TO_CONSIDER)
          continue;
        lt_log("\x20\x20\x20Not\x20eligible\x20as\x20outseg2:\x20" + _0x1bf6a7, 0x2),
            (_0x10d7bb = HeuristicsCandidate.FAIL);
      }
      if (_0x1859f0 !== null && _0x10d7bb >= _0x96949d) {
        if (_0x96949d === 0x0 && _0x10d7bb === 0x0) {
          lt_log("Error:\x20>1\x20qualifying\x20exit2\x20segment\x20for\x20" + _0x2bb3f1.attributes.id + ":\x20" +
                     _0x1859f0.attributes.id + "," + _0x3e085f.attributes.id,
                 0x2);
          lt_log("==================================================================================", 0x2);
          return 0x0;
        }
      }
      (_0x1859f0 = _0x3e085f), (_0x4f9be7 = _0x1bf6a7), (_0x96949d = _0x10d7bb);
    }
    if (_0x1859f0 == null) {
      lt_log("==\x20No\x20Outseg2\x20found\x20==================================================================", 0x2);
      return 0x0;
    } else
      lt_log("Found\x20outseg2\x20candidate:\x20" + _0x1859f0.attributes.id + "\x20" +
                 (_0x96949d === 0x0 ? "" : "(failed)"),
             0x2);
    for (let idx = 0x0; idx < segmentIDs.length; idx++) {
      if (segmentIDs[idx] === _0x453456 || segmentIDs[idx] === _0x4777ff.attributes.id)
        continue;
      const _0x1b9808 = getSegObj(segmentIDs[idx]);
      let _0x3edc74 = 0x0;
      if ((_0x1b9808.attributes.fwdDirection && _0x1b9808.attributes.toNodeID !== fromNodeObj.attributes.id) ||
          (_0x1b9808.attributes.revDirection && _0x1b9808.attributes.fromNodeID !== fromNodeObj.attributes.id))
        continue;
      let _0x46ff80 = _0x43a6d2(fromNodeObj.attributes.id, _0x1b9808), _0x58b38d = _0xcd5d5b(_0x28857a, _0x46ff80);
      lt_log("Turn\x20angle\x20from\x20inseg\x20(supplementary)\x20" + segmentIDs[idx] + ":\x20" + _0x58b38d + "(" +
                 _0x28857a + "," + _0x46ff80 + ")",
             0x3);
      if (Math.abs(_0x18525c - _0x58b38d) > MAX_PERP_DIF_ALT) {
        if (Math.abs(_0x18525c - _0x58b38d) > MAX_PERP_TO_CONSIDER)
          continue;
        lt_log("Not\x20eligible\x20as\x20altIn1:\x20" + _0x58b38d, 0x3);
        (_0x3edc74 = HeuristicsCandidate.FAIL);
      }
      if (_0x4fd61c !== null) {
        if (_0x3edc74 < _0x5063e3)
          continue;
        if (_0x5063e3 === 0x0 && _0x3edc74 === 0x0)
          lt_log("Error:\x20>1\x20qualifying\x20segment\x20for\x20" + _0x2bb3f1.attributes.id + ":\x20" +
                     _0x4fd61c.attributes.id + "," + _0x1b9808.attributes.id,
                 0x2);
        lt_log("==================================================================================", 0x2);
        return HeuristicsCandidate.FAIL;
      }
      (_0x4fd61c = _0x1b9808);
      (_0x1c6b60 = _0x46ff80);
      (_0x5063e3 = _0x3edc74);
    }
    if (_0x4fd61c == null) {
      lt_log("== No alt incoming-1 segment found ==================================================================\n",
             0x2);
      return 0;
    } else
      lt_log("Alt\x20incoming-1\x20segment\x20found:\x20" + _0x4fd61c.attributes.id + "\x20" +
                 (_0x5063e3 === 0x0 ? "" : "(failed)"),
             0x2);
    if (_0x4e91d5 < 0x0 || _0x5063e3 < 0x0 || _0x96949d < 0x0) {
      lt_log("Found\x20a\x20failed\x20candidate\x20for\x20" + _0x453456 + "\x20(\x20" +
                 Math.min(_0x4e91d5, _0x5063e3, _0x96949d) + ")",
             0x2);
      return (_0x4e91d5 === HeuristicsCandidate.FAIL || _0x5063e3 === HeuristicsCandidate.FAIL ||
                      _0x96949d === HeuristicsCandidate.FAIL
                  ? HeuristicsCandidate.FAIL
                  : HeuristicsCandidate.ERROR);
    }
    lt_log("Found\x20a\x20heuristics\x20candidate!\x20" + _0x453456 + "\x20to\x20" + _0x1859f0.attributes.id + "at" +
               _0x4f9be7,
           0x2);
    return 0x1;
    function _0xca5734(_0x15149a, _0x25a1f9) {
      if (_0x15149a == null || _0x25a1f9 == null)
        return null;
      let _0x1fef83, _0x3934e8;
      _0x25a1f9.attributes.fromNodeID === _0x15149a
          ? ((_0x1fef83 = lt_get_second_point(_0x25a1f9).x - lt_get_first_point(_0x25a1f9).x),
             (_0x3934e8 = lt_get_second_point(_0x25a1f9).y - lt_get_first_point(_0x25a1f9).y))
          : ((_0x1fef83 = lt_get_next_to_last_point(_0x25a1f9).x - lt_get_last_point(_0x25a1f9).x),
             (_0x3934e8 = lt_get_next_to_last_point(_0x25a1f9).y - lt_get_last_point(_0x25a1f9).y));
      let _0x21c597 = Math.atan2(_0x3934e8, _0x1fef83), _0x232509 = ((_0x21c597 * 0xb4) / Math.PI) % 360;
      return (
          lt_log("Azm\x20from\x20node\x20" + _0x15149a + "\x20/\x20" + _0x25a1f9.attributes.id + ":\x20" + _0x232509,
                 0x3),
          _0x232509);
    }
    function _0x43a6d2(_0x293709, _0x3901cd) {
      let _0x39f1a3 = _0xca5734(_0x293709, _0x3901cd), _0x228ce5 = _0x39f1a3 + 0xb4;
      return (
          _0x228ce5 >= 0xb4 && (_0x228ce5 -= 360),
          lt_log("Azm\x20to\x20node\x20" + _0x293709 + "/\x20" + _0x3901cd.attributes.id + ":\x20" + _0x228ce5, 0x3),
          _0x228ce5);
    }
    function _0xcd5d5b(_0x362a09, _0xd93a20) {
      let _0x240602 = _0x362a09, _0x56fa6c = _0xd93a20;
      while (_0xd93a20 > 0xb4) {
        _0x56fa6c -= 360;
      }
      while (_0xd93a20 < -0xb4) {
        _0x56fa6c += 360;
      }
      while (_0x362a09 > 0xb4) {
        _0x240602 -= 360;
      }
      while (_0x362a09 < -0xb4) {
        _0x240602 += 360;
      }
      let _0x1eb39a = _0x56fa6c - _0x240602;
      return ((_0x1eb39a += _0x1eb39a > 0xb4    ? -360
                            : _0x1eb39a < -0xb4 ? 360
                                                : 0x0),
              lt_log("Turn\x20" + _0x240602 + "," + _0x56fa6c + ":\x20" + _0x1eb39a, 0x3), _0x1eb39a);
    }
    function _0x493643(_0x17bc7b, _0x31445a, _0x85690c) {
      lt_log(getString(0x338) + _0x17bc7b.attributes.id + getString(0x365) + _0x85690c.attributes.id + "\x20via\x20" +
                 _0x31445a.attributes.id + getString(0x1e8) + _0x31445a[getString(0x39c)](_0x17bc7b, _0x85690c) +
                 getString(0x324) + _0x17bc7b[getString(0x369)](_0x85690c, _0x31445a),
             0x3);
      if (!_0x31445a.isTurnAllowedBySegDirections(_0x17bc7b, _0x85690c)) {
        lt_log("Driving\x20direction\x20restriction\x20applies", 3);
        return false;
      }
      if (!_0x17bc7b[getString(0x369)](_0x85690c, _0x31445a)) {
        lt_log("Other\x20restriction\x20applies", 0x3);
        return false;
      }
      return true;
    }
  }

  function lt_segment_length(segment) {
    let segmentLength = segment.geometry.getGeodesicLength(W.map.olMap.projection);
    lt_log("segment:" + segment.attributes.id + "computed\x20len:\x20" + segmentLength + "attrs\x20len:\x20" +
               segment.attributes.length,
           0x3);
    return segmentLength;
  }
  function lt_log(devMsg, debugLevel = 0x1) {
    return debugLevel <= LANETOOLS_DEBUG_LEVEL && console.log("LaneTools Dev Msg: ", devMsg);
  }

  function copyLaneInfo(nodeName) {
    _turnInfo = [];
    const selectedFeatures = W.selectionManager.getSelectedFeatures(),
          featureObject = selectedFeatures[0x0].attributes.wazeFeature._wmeObject,
          featureAttributes = featureObject.getFeatureAttributes(),
          featureGeometryComponents = featureObject.geometry.components,
          nodeID = nodeName === "A" ? featureAttributes.fromNodeID : featureAttributes.toNodeID,
          laneCount = nodeName === "A" ? featureAttributes.revLaneCount : featureAttributes.fwdLaneCount;
    console.log(laneCount);
    const nodeObj = getNodeObj(nodeID), attachedSegmentIDs = nodeObj.getSegmentIds(),
          turnGraph = W.model.getTurnGraph();
    let _0x21c177;
    nodeName === "A" ? (_0x21c177 = featureGeometryComponents[0x1])
                     : (_0x21c177 = featureGeometryComponents[featureGeometryComponents.length - 0x2]);
    let _0x17c96f = _0x21c177.x - nodeObj.geometry.x, _0x3b764f = _0x21c177.y - nodeObj.geometry.y,
        _0x25f24a = Math.atan2(_0x3b764f, _0x17c96f), _0x1b508f = ((_0x25f24a * 0xb4) / Math.PI) % 360;
    for (let segIdx = 0x0; segIdx < attachedSegmentIDs.length; segIdx++) {
      const segmentObject = getSegObj(attachedSegmentIDs[segIdx]);
      let _0x56f831 = segmentObject.getFeatureAttributes(), geometryComponents = segmentObject.geometry.components,
          _0x165d3c, selectedNodeName,
          turnData = turnGraph.getTurnThroughNode(nodeObj, featureObject, segmentObject).getTurnData();
      if (turnData.state === 0x1 && turnData.lanes) {
        _0x56f831.fromNodeID === nodeID ? (selectedNodeName = "A") : (selectedNodeName = "B");
        selectedNodeName === "A" ? (_0x165d3c = geometryComponents[0x1])
                                 : (_0x165d3c = geometryComponents[geometryComponents.length - 0x2]);
        (_0x17c96f = _0x165d3c.x - nodeObj.geometry.x), (_0x3b764f = _0x165d3c.y - nodeObj.geometry.y),
            (_0x25f24a = Math.atan2(_0x3b764f, _0x17c96f));
        let _0x422251 = ((_0x25f24a * 0xb4) / Math.PI) % 360;
        if (_0x1b508f < 0x0)
          _0x422251 = _0x1b508f - _0x422251;
        _turnData = {};
        let _0x2ca8fc = turnData.getLaneData();
        (_turnData.id = segmentObject.attributes.id), (_turnData.order = _0x422251), (_turnData.lanes = _0x2ca8fc),
            _turnInfo.push(_turnData);
      }
      _turnInfo["sort"]((_0x1252aa, _0x286486) => (_0x1252aa.order > _0x286486.order ? 0x1 : -0x1));
    }
    console.log(_turnInfo);
  }

  function pasteLaneInfo(_0x448ddd) {
    const mAction = new MultiAction();
    mAction.setModel(W.model);
    const selectedFeatures = W.selectionManager.getSelectedFeatures(),
          featureObject = selectedFeatures[0x0].attributes.wazeFeature._wmeObject,
          components = featureObject.geometry.components, featureAttributes = featureObject.getFeatureAttributes(),
          _0xdafc0a = _0x448ddd === "A" ? featureAttributes.fromNodeID : featureAttributes.toNodeID;
    let _0x1989c7;
    const _0x32336a = getNodeObj(_0xdafc0a), segmentIDs = _0x32336a["getSegmentIds"](),
          turnGraph = W.model["getTurnGraph"]();
    let _0x44e9fd = {}, _0x1b740b = [];
    _0x448ddd === "A" ? (_0x1989c7 = components[0x1]) : (_0x1989c7 = components[components.length - 0x2]);
    let _0x2362eb = _0x1989c7.x - _0x32336a.geometry.x, _0x480d3d = _0x1989c7.y - _0x32336a.geometry.y,
        _0x33018e = Math.atan2(_0x480d3d, _0x2362eb), _0xf2c260 = ((_0x33018e * 0xb4) / Math.PI) % 360;
    for (let idx = 0x0; idx < segmentIDs.length; idx++) {
      let _0x3831b2 = getSegObj(segmentIDs[idx]), _0x5842af = _0x3831b2.attributes,
          _0x3619b7 = _0x3831b2.geometry.components, _0x3374c6 = {}, _0x52b37f,
          turnData = turnGraph.getTurnThroughNode(_0x32336a, featureObject, _0x3831b2).getTurnData();
      _0x5842af.fromNodeID === _0xdafc0a ? (_0x52b37f = "A") : (_0x52b37f = "B");
      _0x52b37f === "A" ? (_0x3374c6 = _0x3619b7[0x1]) : (_0x3374c6 = _0x3619b7[_0x3619b7.length - 0x2]);
      if (turnData.state === 0x1) {
        (_0x44e9fd = {}), (_0x2362eb = _0x3374c6.x - _0x32336a.geometry.x),
            (_0x480d3d = _0x3374c6.y - _0x32336a.geometry.y), (_0x33018e = Math.atan2(_0x480d3d, _0x2362eb));
        let _0x528fbb = ((_0x33018e * 180) / Math.PI) % 360;
        if (_0xf2c260 < 0x0)
          _0x528fbb = _0xf2c260 - _0x528fbb;
        (_0x44e9fd.id = _0x5842af.id), (_0x44e9fd.order = _0x528fbb), _0x1b740b.push(_0x44e9fd);
      }
      _0x1b740b.sort((_0x42b904, _0xb23157) => (_0x42b904.order > _0xb23157.order ? 0x1 : -0x1));
    }
    console.log(_0x1b740b);
    if (_turnInfo.length === _0x1b740b.length) {
      _0x448ddd === "A" ? mAction.doSubAction(new UpdateObj(featureObject, {revLaneCount : laneCount}))
                        : mAction.doSubAction(new UpdateObj(featureObject, {fwdLaneCount : laneCount}));
      for (let _0x392af3 = 0x0; _0x392af3 < _0x1b740b.length; _0x392af3++) {
        let _0x1662da = {};
        for (let _0x1f1e9b = 0x0; _0x1f1e9b < _turnInfo.length; _0x1f1e9b++) {
          _0x1662da[_0x1f1e9b] = _turnInfo[_0x1f1e9b];
        }
        let _0x1d44a8 = getSegObj(_0x1b740b[_0x392af3].id),
            _0x4e30d7 = turnGraph.getTurnThroughNode(_0x32336a, featureObject, _0x1d44a8),
            _0x469b71 = _0x4e30d7.getTurnData();
        (_0x469b71 = _0x469b71.withLanes(_0x1662da[_0x392af3].lanes)), (_0x4e30d7 = _0x4e30d7.withTurnData(_0x469b71)),
            mAction.doSubAction(new SetTurn(turnGraph, _0x4e30d7));
      }
      (mAction._description = "Pasted\x20some\x20lane\x20stuff"), W.model.actionManager.add(mAction),
          $(".lanes-tab").click();
    } else
      WazeWrap.Alerts.warning(
          GM_info.script.name,
          "There\x20are\x20a\x20different\x20number\x20of\x20enabled\x20turns\x20on\x20this\x20segment/node");
  }
  function displayLaneGraphics() {
    removeLaneGraphics();
    const features = W.selectionManager.getSelectedFeatures();
    if (!getId("lt-ScriptEnabled").checked || !getId("lt-IconsEnable").checked || features.length !== 0x1 ||
        features[0x0].attributes.wazeFeature._wmeObject.type !== "segment")
      return;
    const wmeObject = features[0x0].attributes.wazeFeature._wmeObject, currentZoomLevel = W.map.getOLMap().getZoom();
    if ((wmeObject.attributes[getString(0x42f)] !== (0x3 || 0x6 || 0x7) && currentZoomLevel < 0x10) ||
        currentZoomLevel < 0xf)
      return;
    let _0x2d2a03 = wmeObject.attributes.fwdLaneCount > 0x0
                        ? _0x5694f9($(".fwd-lanes").find(".lane-arrow").map(function() { return this; }).get())
                        : false,
        _0x154122 = wmeObject.attributes.revLaneCount > 0x0
                        ? _0x5694f9($(".rev-lanes").find(".lane-arrow").map(function() { return this; }).get())
                        : false;

    function _0x5694f9(_0x3399d1) {
      let _0x2c1862 = {};
      for (let idx = 0x0; idx < _0x3399d1.length; idx++) {
        let _0x3ce23 = {};
        (_0x3ce23.uturn = $(_0x3399d1[idx]).find(".uturn").css("display") !== "none"),
            (_0x3ce23.miniuturn = $(_0x3399d1[idx]).find(".small-uturn").css("display") !== "none"),
            (_0x3ce23.svg = $(_0x3399d1[idx]).find("svg").map(function() { return this; }).get()),
            (_0x2c1862[idx] = _0x3ce23);
      }
      return _0x2c1862;
    }
    let _0x5dea5f = _0x2d2a03 !== false ? _0x4db382(_0x2d2a03) : false,
        _0x326722 = _0x154122 !== false ? _0x4db382(_0x154122) : false;
    function _0x4db382(_0x22e6e2) {
      const serializer = new XMLSerializer();
      return (_.each(_0x22e6e2, (_0xa929da) => {
        try {
          let _0x1b9e83 = _0xa929da["svg"][0x0], _0x2e4457 = serializer.serializeToString(_0x1b9e83);
          _0xa929da["svg"] = "data:image/svg+xml;base64," + window.btoa(_0x2e4457);
        } catch (ex) {
        }
      }, _0x22e6e2));
    }
    _0x2d2a03 && _0x19644c(W.model.nodes.getObjectById(wmeObject.attributes.toNodeID), _0x5dea5f);
    _0x154122 && _0x19644c(W.model.nodes.getObjectById(wmeObject.attributes.fromNodeID), _0x326722);
    function _0x19644c(nodeObj, _0x533989) {
      let _0x55da4e = _0x24ac62(), cardinalAngle = getCardinalAngle(nodeObj.attributes.id, wmeObject), _0x1d852d,
          _0x55c2d7 = [], _0x1c3e29 = 0x0, _0x5095aa = Object[getString(0x3bb)](_0x533989).length;
      if (!getId("lt-IconsRotate").checked)
        cardinalAngle = -90;
      if (cardinalAngle === 0x0) {
        cardinalAngle += 0xb4;
        _0x1c3e29 = 0x1;
      } else {
        if (cardinalAngle > 0x0 && cardinalAngle <= 0x1e) {
          cardinalAngle += 0x2 * (90 - cardinalAngle);
          _0x1c3e29 = 0x1;
        } else {
          if (cardinalAngle >= 0x14a && cardinalAngle <= 360)
            (cardinalAngle -= 0xb4 - 0x2 * (360 - cardinalAngle)), (_0x1c3e29 = 0x1);
          else {
            if (cardinalAngle > 0x1e && cardinalAngle < 0x3c)
              (cardinalAngle -= 90 - 0x2 * (360 - cardinalAngle)), (_0x1c3e29 = 0x2);
            else {
              if (cardinalAngle >= 0x3c && cardinalAngle <= 0x78)
                (cardinalAngle -= 90 - 0x2 * (360 - cardinalAngle)), (_0x1c3e29 = 0x2);
              else {
                if (cardinalAngle > 0x78 && cardinalAngle < 0x96)
                  (cardinalAngle -= 90 - 0x2 * (360 - cardinalAngle)), (_0x1c3e29 = 0x7);
                else {
                  if (cardinalAngle >= 0x96 && cardinalAngle <= 0xd2)
                    (cardinalAngle = 0xb4 - cardinalAngle), (_0x1c3e29 = 0x4);
                  else {
                    if (cardinalAngle > 0xd2 && cardinalAngle < 0xf0)
                      (cardinalAngle -= 90 - 0x2 * (360 - cardinalAngle)), (_0x1c3e29 = 0x6);
                    else {
                      if (cardinalAngle >= 0xf0 && cardinalAngle <= 0x12c)
                        (cardinalAngle -= 0xb4 - 0x2 * (360 - cardinalAngle)), (_0x1c3e29 = 0x3);
                      else
                        cardinalAngle > 0x12c && cardinalAngle < 0x14a
                            ? ((cardinalAngle -= 0xb4 - 0x2 * (360 - cardinalAngle)), (_0x1c3e29 = 0x5))
                            : console.log("LT:\x20icon\x20angle\x20is\x20out\x20of\x20bounds");
                    }
                  }
                }
              }
            }
          }
        }
      }
      let _0x3b5791 = cardinalAngle > 315 ? cardinalAngle : cardinalAngle + 90, _0x2fcc96 = 360 - _0x3b5791;
      function _0x4b99ab(_0x23f39e) {
        let temp = {};
        if (UPDATEDZOOM) {
          if (_0x23f39e === 0x0)
            temp = {
              x : nodeObj.geometry.x + _0x55da4e.start * 0x2,
              y : nodeObj.geometry.y + _0x55da4e.boxheight,
            };
          else {
            if (_0x23f39e === 0x1)
              temp = {
                x : nodeObj.geometry.x + _0x55da4e.boxheight,
                y : nodeObj.geometry.y + (_0x55da4e.boxincwidth * _0x5095aa) / 1.8,
              };
            else {
              if (_0x23f39e === 0x2)
                temp = {
                  x : nodeObj.geometry.x - (_0x55da4e.start + _0x55da4e.boxincwidth * _0x5095aa),
                  y : nodeObj.geometry.y + (_0x55da4e.start + _0x55da4e.boxheight),
                };
              else {
                if (_0x23f39e === 0x3)
                  temp = {
                    x : nodeObj.geometry.x + (_0x55da4e.start + _0x55da4e.boxincwidth),
                    y : nodeObj.geometry.y - (_0x55da4e.start + _0x55da4e.boxheight),
                  };
                else {
                  if (_0x23f39e === 0x4)
                    temp = {
                      x : nodeObj.geometry.x - (_0x55da4e.start + _0x55da4e.boxheight * 1.5),
                      y : nodeObj.geometry.y - (_0x55da4e.start + _0x55da4e.boxincwidth * _0x5095aa * 1.5),
                    };
                  else {
                    if (_0x23f39e === 0x5)
                      temp = {
                        x : nodeObj.geometry.x + (_0x55da4e.start + _0x55da4e.boxincwidth / 0x2),
                        y : nodeObj.geometry.y + _0x55da4e.start / 0x2,
                      };
                    else {
                      if (_0x23f39e === 0x6)
                        temp = {
                          x : nodeObj.geometry.x - _0x55da4e.start,
                          y : nodeObj.geometry.y - _0x55da4e.start * ((_0x55da4e.boxincwidth * _0x5095aa) / 0x2),
                        };
                      else
                        _0x23f39e === 0x7 && (temp = {
                          x : nodeObj.geometry.x - _0x55da4e.start * ((_0x55da4e.boxincwidth * _0x5095aa) / 0x2),
                          y : nodeObj.geometry.y - _0x55da4e.start,
                        });
                    }
                  }
                }
              }
            }
          }
        } else {
          if (_0x23f39e === 0x0)
            temp = {
              x : nodeObj.geometry.x + _0x55da4e.start * 0x2,
              y : nodeObj.geometry.y + _0x55da4e.boxheight,
            };
          else {
            if (_0x23f39e === 0x1)
              temp = {
                x : nodeObj.geometry.x + _0x55da4e.boxheight,
                y : nodeObj.geometry.y + (_0x55da4e.boxincwidth * _0x5095aa) / 1.8,
              };
            else {
              if (_0x23f39e === 0x2)
                temp = {
                  x : nodeObj.geometry.x - (_0x55da4e.start + _0x55da4e.boxincwidth * _0x5095aa),
                  y : nodeObj.geometry.y + (_0x55da4e.start + _0x55da4e.boxheight),
                };
              else {
                if (_0x23f39e === 0x3)
                  temp = {
                    x : nodeObj.geometry.x + (_0x55da4e.start + _0x55da4e.boxincwidth),
                    y : nodeObj.geometry.y - (_0x55da4e.start + _0x55da4e.boxheight * 0x2),
                  };
                else {
                  if (_0x23f39e === 0x4)
                    temp = {
                      x : nodeObj.geometry.x - (_0x55da4e.start + _0x55da4e.boxheight * 1.5),
                      y : nodeObj.geometry.y - (_0x55da4e.start + _0x55da4e.boxincwidth * _0x5095aa * 1.5),
                    };
                  else {
                    if (_0x23f39e === 0x5)
                      temp = {
                        x : nodeObj.geometry.x + (_0x55da4e.start + _0x55da4e.boxincwidth / 0x2),
                        y : nodeObj.geometry.y + _0x55da4e.start / 0x2,
                      };
                    else {
                      if (_0x23f39e === 0x6)
                        temp = {
                          x : nodeObj.geometry.x - _0x55da4e.start,
                          y : nodeObj.geometry.y - _0x55da4e.start * ((_0x55da4e.boxincwidth * _0x5095aa) / 0x2),
                        };
                      else
                        _0x23f39e === 0x7 && (temp = {
                          x : nodeObj.geometry.x - _0x55da4e.start * ((_0x55da4e.boxincwidth * _0x5095aa) / 0x2),
                          y : nodeObj.geometry.y - _0x55da4e.start,
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
      let _0x2a17ea = _0x4b99ab(_0x1c3e29);
      var topLeftVtx = new OpenLayers.Geometry.Point(_0x2a17ea.x, _0x2a17ea.y + _0x55da4e.boxheight),
          topRightVtx = new OpenLayers.Geometry.Point(_0x2a17ea.x + _0x55da4e.boxincwidth * _0x5095aa,
                                                      _0x2a17ea.y + _0x55da4e.boxheight),
          bottomRightVtx = new OpenLayers.Geometry.Point(_0x2a17ea.x + _0x55da4e.boxincwidth * _0x5095aa, _0x2a17ea.y),
          topRightVTX = new OpenLayers.Geometry.Point(_0x2a17ea.x, _0x2a17ea.y);
      _0x55c2d7.push(topLeftVtx, topRightVtx, bottomRightVtx, topRightVTX);
      var _0x5b7230 = {
        strokeColor : "#ffffff",
        strokeOpacity : 0x1,
        strokeWidth : 0x8,
        fillColor : "#ffffff",
      };
      let _0x548ba5 = new OpenLayers.geometry.LinearRing(_0x55c2d7);
      (_0x1d852d = _0x548ba5[getString(0x214)]()), _0x548ba5[getString(0x2cc)](_0x2fcc96, _0x1d852d);
      let _0x79291a = new OpenLayers.Feature.Vector(_0x548ba5, null, _0x5b7230);
      LTLaneGraphics.addFeatures([ _0x79291a ]);
      let _0xe41aaa = 0x0;
      _.each(_0x533989, (_0x25119b) => {
        let _0x4731ea = [];
        var _0x1bd240 = new OpenLayers.Geometry.Point(_0x2a17ea.x + _0x55da4e.boxincwidth * _0xe41aaa +
                                                          _0x55da4e.iconbordermargin,
                                                      _0x2a17ea.y + _0x55da4e.iconborderheight),
            _0x47bfb1 = new OpenLayers.Geometry.Point(_0x2a17ea.x + _0x55da4e.boxincwidth * _0xe41aaa +
                                                          _0x55da4e.iconborderwidth,
                                                      _0x2a17ea.y + _0x55da4e.iconborderheight),
            _0x2d1e17 = new OpenLayers.Geometry.Point(_0x2a17ea.x + _0x55da4e.boxincwidth * _0xe41aaa +
                                                          _0x55da4e.iconborderwidth,
                                                      _0x2a17ea.y + _0x55da4e.iconbordermargin),
            _0x42e795 = new OpenLayers.Geometry.Point(_0x2a17ea.x + _0x55da4e.boxincwidth * _0xe41aaa +
                                                          _0x55da4e.iconbordermargin,
                                                      _0x2a17ea.y + _0x55da4e.iconbordermargin);
        _0x4731ea.push(_0x1bd240, _0x47bfb1, _0x2d1e17, _0x42e795);
        var _0x2c762f = {
          strokeColor : "#000000",
          strokeOpacity : 0x1,
          strokeWidth : 0x1,
          fillColor : "#26bae8",
        };
        let _0x30718d = new OpenLayers.Geometry.LinearRing(_0x4731ea);
        _0x30718d["rotate"](_0x2fcc96, _0x1d852d);
        let _0x5f23a1 = new OpenLayers.Feature.Vector(_0x30718d, null, _0x2c762f);
        LTLaneGraphics.addFeatures([ _0x5f23a1 ]);
        let _0x305721 = _0x30718d.getCentroid(), _0x5001ff = new OpenLayers.Geometry.Point(_0x305721.x, _0x305721.y),
            wazeFont = "", _0x4e547b = {x : 0x0, y : 0x0}, _0x43b459 = {x : 0x0, y : 0x0};
        _0x25119b["uturn"] === true && ((wazeFont = constantStrings.wazeFontLink), (_0x4e547b.x = 0.6),
                                        (_0x4e547b.y = 0.6), (_0x43b459.x = -0x7), (_0x43b459.y = -0xc));
        _0x25119b["miniuturn"] === true && ((wazeFont = constantStrings.wazeFontLink), (_0x4e547b.x = 0.3),
                                            (_0x4e547b.y = 0.25), (_0x43b459.x = -0x8), (_0x43b459.y = 0x4));
        let _0x140285 = {
          externalGraphic : _0x25119b.svg,
          graphicHeight : _0x55da4e.graphicHeight,
          graphicWidth : _0x55da4e.graphicWidth,
          fillColor : "#26bae8",
          bgcolor : "#26bae8",
          color : "#26bae8",
          rotation : _0x3b5791,
          backgroundGraphic : wazeFont,
          backgroundHeight : _0x55da4e.graphicHeight * _0x4e547b.y,
          backgroundWidth : _0x55da4e.graphicWidth * _0x4e547b.x,
          backgroundXOffset : _0x43b459.x,
          backgroundYOffset : _0x43b459.y,
        },
            _0x3f212b = new OpenLayers.Feature.Vector(_0x5001ff, null, _0x140285);
        LTLaneGraphics.addFeatures([ _0x3f212b ]), _0xe41aaa++;
      }), LTLaneGraphics.setZIndex(600);
    }

    function _0x24ac62() {
      var boxDisplayObject = {};
      if (UPDATEDZOOM)
        switch (W.map.getOLMap().getZoom()) {
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
          (boxDisplayObject.start = 0xf), (boxDisplayObject.boxheight = 0x50), (boxDisplayObject.boxincwidth = 0x37),
              (boxDisplayObject.iconbordermargin = 0x2), (boxDisplayObject["iconborderheight"] = 0x4e),
              (boxDisplayObject.iconborderwidth = 0x35), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 15:
          (boxDisplayObject.start = 0x2), (boxDisplayObject.boxheight = 0x78), (boxDisplayObject.boxincwidth = 90),
              (boxDisplayObject.iconbordermargin = 0x3), (boxDisplayObject.iconborderheight = 117),
              (boxDisplayObject.iconborderwidth = 0x57), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 14:
          (boxDisplayObject.start = 0x2), (boxDisplayObject.boxheight = 5.2), (boxDisplayObject.boxincwidth = 3.8),
              (boxDisplayObject.iconbordermargin = 0.3), (boxDisplayObject.iconborderheight = 4.9),
              (boxDisplayObject.iconborderwidth = 3.5), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        }
      else
        switch (W.map.getOLMap().getZoom()) {
        case 0xa:
          (boxDisplayObject.start = 0.5), (boxDisplayObject.boxheight = 1.7), (boxDisplayObject.boxincwidth = 1.1),
              (boxDisplayObject.iconbordermargin = 0.1), (boxDisplayObject.iconborderheight = 1.6),
              (boxDisplayObject.iconborderwidth = 0x1), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x9:
          (boxDisplayObject.start = 0x1), (boxDisplayObject.boxheight = 3.2), (boxDisplayObject.boxincwidth = 2.2),
              (boxDisplayObject.iconbordermargin = 0.2), (boxDisplayObject.iconborderheight = 0x3),
              (boxDisplayObject.iconborderwidth = 0x2), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x8:
          (boxDisplayObject.start = 0x2), (boxDisplayObject.boxheight = 5.2), (boxDisplayObject.boxincwidth = 3.8),
              (boxDisplayObject.iconbordermargin = 0.3), (boxDisplayObject.iconborderheight = 4.9),
              (boxDisplayObject.iconborderwidth = 3.5), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x7:
          (boxDisplayObject.start = 0x3), (boxDisplayObject.boxheight = 0xa), (boxDisplayObject.boxincwidth = 7.2),
              (boxDisplayObject.iconbordermargin = 0.4), (boxDisplayObject.iconborderheight = 9.6),
              (boxDisplayObject.iconborderwidth = 6.8), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x6:
          (boxDisplayObject.start = 0x6), (boxDisplayObject.boxheight = 0x14), (boxDisplayObject.boxincwidth = 0xe),
              (boxDisplayObject.iconbordermargin = 0.5), (boxDisplayObject.iconborderheight = 19.5),
              (boxDisplayObject.iconborderwidth = 13.5), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x5:
          (boxDisplayObject.start = 0xa), (boxDisplayObject.boxheight = 0x28), (boxDisplayObject.boxincwidth = 0x1d),
              (boxDisplayObject.iconbordermargin = 0x1), (boxDisplayObject.iconborderheight = 0x26),
              (boxDisplayObject.iconborderwidth = 0x1b), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x4:
          (boxDisplayObject.start = 0xf), (boxDisplayObject.boxheight = 0x50), (boxDisplayObject.boxincwidth = 0x37),
              (boxDisplayObject.iconbordermargin = 0x2), (boxDisplayObject.iconborderheight = 0x4e),
              (boxDisplayObject.iconborderwidth = 0x35), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x3:
          (boxDisplayObject.start = 0x2), (boxDisplayObject.boxheight = 0x78), (boxDisplayObject.boxincwidth = 90),
              (boxDisplayObject.iconbordermargin = 0x3), (boxDisplayObject.iconborderheight = 0x75),
              (boxDisplayObject.iconborderwidth = 0x57), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x2:
          (boxDisplayObject.start = 0x2), (boxDisplayObject.boxheight = 5.2), (boxDisplayObject.boxincwidth = 3.8),
              (boxDisplayObject.iconbordermargin = 0.3), (boxDisplayObject.iconborderheight = 4.9),
              (boxDisplayObject.iconborderwidth = 3.5), (boxDisplayObject.graphicHeight = 0x2a),
              (boxDisplayObject.graphicWidth = 0x19);
          break;
        case 0x1: {
          boxDisplayObject.start = 0x2;
          boxDisplayObject.boxheight = 5.2;
          boxDisplayObject.boxincwidth = 3.8;
          boxDisplayObject.iconbordermargin = 0.3;
          boxDisplayObject.iconborderheight = 4.9;
          boxDisplayObject.iconborderwidth = 3.5;
          boxDisplayObject.graphicHeight = 0x2a;
          boxDisplayObject.graphicWidth = 0x19;
        } break;
        }
      return boxDisplayObject;
    }
  }
  laneToolsBootstrap();
  while (true) {
    try {
      const exitCode =
          -parseInt("116729CFFamr") + -parseInt("1006486hQNMjC") / 0x2 +
          (-parseInt("21lOwPjv") / 0x3) * (parseInt("246188fslQvy") / 0x4) + -parseInt("2546485hRBZxR") / 0x5 +
          (parseInt("695094iWfXcp") / 0x6) * (-parseInt("7CccpnK") / 0x7) +
          (parseInt("155432OeGIQS") / 0x8) * (-parseInt("396CKTurr") / 0x9) + parseInt("30770070DOGVeo") / 0xa;
      if (exitCode === _0x1fd245)
        break;
      else
        push(shift());
    } catch (ex) {
      push(shift());
    }
  }
})();
