// ==UserScript==
// @name         WME LaneTools
// @namespace    https://github.com/SkiDooGuy/WME-LaneTools
// @version      2023.07.20.00
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
        ".rev-lanes > div > div > div.lane-instruction.lane-instruction-from > div.instruction",
    fwdLanesInstructionsFromCSS :
        ".fwd-lanes > div > div > div.lane-instruction.lane-instruction-from > div.instruction",
    editPanelCSS : "#edit-panel > div > div > div > div.segment-edit-section > wz-tabs > wz-tab.lanes-tab",
    fwdLanesDivInstructionCSS : ".fwd-lanes > div > div > div.lane-instruction.lane-instruction-from > div.instruction",
    fwdLanesNthChild :
        ".fwd-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.edit-region > div > div > div:nth-child(1) > div",
    fwdLanesDirectionControlEditCSS :
        ".fwd-lanes > div > div > .lane-instruction.lane-instruction-to > .instruction > .lane-edit > .edit-region > div > .controls.direction-lanes-edit",
    fwdLanesLaneInstrunctionToCSS :
        ".fwd-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.edit-region > div > div > div:nth-child(1)",
    revLanesInstructionsToCSS :
        ".rev-lanes > div > div > .lane-instruction.lane-instruction-to > .instruction > .lane-edit > .edit-region > div > .controls.direction-lanes-edit",
    wazeFontLink : "https://editor-assets.waze.com/production/font/aae5ed152758cb6a9191b91e6cedf322.svg",
  };
  const LANETOOLS_VERSION = "" + GM_info.script.version,
        GF_LINK = "https://github.com/SkiDooGuy/WME-LaneTools/blob/master/WME-LaneTools.user.js",
        FORUM_LINK = "https://www.waze.com/forum/viewtopic.php?f=819&t=30115",
        LI_UPDATE_NOTES = "<b>NEW:</b><br>\x0a<b>FIXES:</b><br><br>\x0a", LANETOOLS_DEBUG_LEVEL = 0x1, configArray = {},
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
            advTools : "Advance Tools",
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
      shortcutsDisabled = false, isRBS = false, allowCpyPst = false, langLocality = "default", UPDATEDZOOM;
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
    UPDATEDZOOM = W.map.getOLMap().getZoom() === 23;
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
              ".lt-Toolbar-Container {display:none;position:absolute;background-color:orange;border-radius:6px;border:1.5px solid;box-size:border-box;z-index:1050;}",
              ".lt-Toolbar-Wrapper {position:relative;padding:3px;",
              ".lt-toolbar-button-container {display:inline-block;padding:5px;}",
              ".lt-toolbar-button {position:relative;display:block;width:60px;height:25px;border-radius:6px;font-size:12px;}",
              ".lt-add-Width {display:inline-block;width:15px;height:15px;border:1px solid black;border-radius:8px;margin:0 3px 0 3px;line-height: 1.5;text-align:center;font-size:10px;}",
              ".lt-add-Width:hover {border:1px solid #26bae8;background-color:#26bae8;cursor:pointer;}",
              ".lt-add-lanes {display:inline-block;width:15px;height:15px;border:1px solid black;border-radius:8px;margin:0 3px 0 3px;line-height: 1.5;text-align:center;font-size:10px;}",
              ".lt-add-lanes:hover {border:1px solid #26bae8;background-color:#26bae8;cursor:pointer;}",
              ".lt-chkAll-lns {display:inline-block;width:20px;height:20px;text-decoration:underline;font-weight:bold;font-size:10px;padding-left:3px;cursor:pointer;}",
              ".lt-tio-select {max-width:80%;color:rgb(32, 33, 36);background-color:rgb(242, 243, 244);border:0px;border-radius:6px;padding:0 16px 0 10px;cursor:pointer;}",
              "#lt-color-title {display:block;width:100%;padding:5px 0 5px 0;font-weight:bold;text-decoration:underline;cursor:pointer;}",
            ].join(" "),
        initMsg = $(constantStrings.divStr);
    initMsg.html = [
      "<div class=\x27lt-wrapper\x27 id=\x27lt-tab-wrapper\x27>\x0a            <div class=\x27lt-section-wrapper\x27 id=\x27lt-tab-body\x27>\x0a                <div class=\x27lt-section-wrapper border\x27 style=\x27border-bottom:2px double grey;\x27>\x0a                    <a href=\x27https://www.waze.com/forum/viewtopic.php?f=819&t=301158\x27 style=\x27font-weight:bold;font-size:12px;text-decoration:underline;\x27  target=\x27_blank\x27>LaneTools - v" +
          LANETOOLS_VERSION +
          "</a>\x0a                    <div>\x0a                        <div style=\x27display:inline-block;\x27><span class=\x27lt-trans-tglshcut\x27></span>:<span id=\x27lt-EnableShortcut\x27 style=\x27padding-left:10px;\x27></span></div>\x0a                        <div class=\x27lt-option-container\x27 style=\x27float:right;\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-ScriptEnabled\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-ScriptEnabled\x27><span class=\x27lt-trans-enabled\x27></span></label>\x0a                        </div>\x0a                    </div>\x0a                </div>\x0a                <div class=\x27lt-section-wrapper\x27 id=\x27lt-LaneTabFeatures\x27>\x0a                    <div class=\x27lt-section-wrapper border\x27>\x0a                        <span style=\x27font-weight:bold;\x27><span id=\x27lt-trans-uiEnhance\x27></span></span>\x0a                        <div class=\x27lt-option-container\x27 style=\x27float:right;\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-UIEnable\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-UIEnable\x27><span class=\x27lt-trans-enabled\x27></span></label>\x0a                        </div>\x0a                    </div>\x0a                    <div id=\x27lt-UI-wrapper\x27>\x0a                        <div class=\x27lt-option-container\x27 style=\x27margin-bottom:5px;\x27>\x0a                            <div style=\x27display:inline-block;\x27><span class=\x27lt-trans-tglshcut\x27></span>:<span id=\x27lt-UIEnhanceShortcut\x27 style=\x27padding-left:10px;\x27></span></div>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-AutoOpenWidth\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-AutoOpenWidth\x27><span id=\x27lt-trans-autoWidth\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-AutoLanesTab\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-AutoLanesTab\x27><span id=\x27lt-trans-autoTab\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-AutoExpandLanes\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-AutoExpandLanes\x27><span title=\x22Feature disabled as of Aug 27, 2022 to prevent flickering issue\x22 id=\x27lt-trans-autoExpand\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-AutoFocusLanes\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-AutoFocusLanes\x27><span id=\x27lt-trans-autoFocus\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-highlightCSIcons\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-highlightCSIcons\x27><span id=\x27lt-trans-csIcons\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-ReverseLanesIcon\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-ReverseLanesIcon\x27><span id=\x27lt-trans-orient\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27 style=\x27display:none;\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-AddTIO\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-AddTIO\x27><span id=\x27lt-trans-AddTIO\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-ClickSaveEnable\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-ClickSaveEnable\x27><span id=\x27lt-trans-enClick\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container clk-svr\x27 style=\x27padding-left:10%;\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-ClickSaveStraight\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-ClickSaveStraight\x27><span id=\x27lt-trans-straClick\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container clk-svr\x27 style=\x27padding-left:10%;\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-ClickSaveTurns\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-ClickSaveTurns\x27><span id=\x27lt-trans-turnClick\x27></span></label>\x0a                        </div>\x0a                    </div>\x0a                </div>\x0a                <div class=\x27lt-section-wrapper\x27>\x0a                    <div class=\x27lt-section-wrapper border\x27>\x0a                        <span style=\x27font-weight:bold;\x27><span id=\x27lt-trans-mapHigh\x27></span></span>\x0a                        <div class=\x27lt-option-container\x27 style=\x27float:right;\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-HighlightsEnable\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-HighlightsEnable\x27><span class=\x27lt-trans-enabled\x27></span></label>\x0a                        </div>\x0a                    </div>\x0a                    <div id=\x27lt-highlights-wrapper\x27>\x0a                        <div class=\x27lt-option-container\x27 style=\x27margin-bottom:5px;\x27>\x0a                            <div style=\x27display:inline-block;\x27><span class=\x27lt-trans-tglshcut\x27></span>:<span id=\x27lt-HighlightShortcut\x27 style=\x27padding-left:10px;\x27></span></div>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-IconsEnable\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-IconsEnable\x27><span id=\x27lt-trans-enIcons\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-IconsRotate\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-IconsRotate\x27><span id=\x27lt-trans-IconsRotate\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-LabelsEnable\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-LabelsEnable\x27><span id=\x27lt-trans-lnLabel\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-NodesEnable\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-NodesEnable\x27><span id=\x27lt-trans-nodeHigh\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-LIOEnable\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-LIOEnable\x27><span id=\x27lt-trans-laOver\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-CSEnable\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-CSEnable\x27><span id=\x27lt-trans-csOver\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-highlightOverride\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-highlightOverride\x27><span id=\x27lt-trans-highOver\x27></span></label>\x0a                        </div>\x0a                    </div>\x0a                </div>\x0a                <div class=\x27lt-section-wrapper\x27>\x0a                    <div class=\x27lt-section-wrapper border\x27>\x0a                        <span style=\x27font-weight:bold;\x27><span id=\x27lt-trans-heurCan\x27></span></span>\x0a                        <div class=\x27lt-option-container\x27 style=\x27float:right;\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-LaneHeuristicsChecks\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-LaneHeuristicsChecks\x27><span class=\x27lt-trans-enabled\x27></span></label>\x0a                        </div>\x0a                    </div>\x0a                    <div id=\x27lt-heur-wrapper\x27>\x0a                        <div class=\x27lt-option-container\x27 style=\x27margin-bottom:5px;\x27>\x0a                            <div style=\x27display:inline-block;\x27><span class=\x27lt-trans-tglshcut\x27></span>:<span id=\x27lt-LaneHeurChecksShortcut\x27 style=\x27padding-left:10px;\x27></span></div>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-LaneHeurPosHighlight\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-LaneHeurPosHighlight\x27><span id=\x27lt-trans-heurPos\x27></span></label>\x0a                        </div>\x0a                        <div class=\x27lt-option-container\x27>\x0a                            <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-LaneHeurNegHighlight\x27 />\x0a                            <label class=\x27lt-label\x27 for=\x27lt-LaneHeurNegHighlight\x27><span id=\x27lt-trans-heurNeg\x27></span></label>\x0a                        </div>\x0a                    </div>\x0a                </div>\x0a                <div class=\x27lt-section-wrapper\x27>\x0a                    <div class=\x27lt-section-wrapper\x27>\x0a                        <span id=\x27lt-color-title\x27 data-original-title=\x27" +
          TRANSLATIONS[langLocality].colTooltip +
          "\x27><span id=\x27lt-trans-highCol\x27></span>:</span>\x0a                        <div id=\x27lt-color-inputs\x27 style=\x27display:none;\x27>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-ABColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-ABColor\x27 id=\x27lt-ABColorLabel\x27><span id=\x27lt-trans-fwdCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-BAColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-BAColor\x27 id=\x27lt-BAColorLabel\x27><span id=\x27lt-trans-revCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-LabelColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-LabelColor\x27 id=\x27lt-LabelColorLabel\x27><span id=\x27lt-trans-labelCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-ErrorColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-ErrorColor\x27 id=\x27lt-ErrorColorLabel\x27><span id=\x27lt-trans-errorCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-NodeColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-NodeColor\x27 id=\x27lt-NodeColorLabel\x27><span id=\x27lt-trans-nodeCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-TIOColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-TIOColor\x27 id=\x27lt-TIOColorLabel\x27><span id=\x27lt-trans-tioCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-LIOColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-TIOColor\x27 id=\x27lt-LIOColorLabel\x27><span id=\x27lt-trans-laoCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-CS1Color\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-CS1Color\x27 id=\x27lt-CS1ColorLabel\x27><span id=\x27lt-trans-viewCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-CS2Color\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-CS2Color\x27 id=\x27lt-CS2ColorLabel\x27><span id=\x27lt-trans-hearCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-HeurColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-HeurColor\x27 id=\x27lt-HeurColorLabel\x27><span id=\x27lt-trans-posCol\x27></span></label>\x0a                            </div>\x0a                            <div class=\x27lt-option-container color\x27>\x0a                                <input type=color class=\x27lt-color-input\x27 id=\x27lt-HeurFailColor\x27 />\x0a                                <label class=\x27lt-label\x27 for=\x27lt-HeurFailColor\x27 id=\x27lt-HeurFailColorLabel\x27><span id=\x27lt-trans-negCol\x27></span></label>\x0a                            </div>\x0a                        </div>\x0a                    </div>\x0a                </div>\x0a                <div class=\x27lt-section-wrapper\x27 id=\x27lt-adv-tools\x27 style=\x27display:none;\x27>\x0a                    <div class=\x27lt-section-wrapper border\x27>\x0a                        <span style=\x27font-weight:bold;\x27><span id=\x27lt-trans-advTools\x27>></span></span>\x0a                    </div>\x0a                    <div class=\x27lt-option-container\x27>\x0a                        <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-SelAllEnable\x27 />\x0a                        <label class=\x27lt-label\x27 for=\x27lt-SelAllEnable\x27 ><span id=\x27lt-trans-quickTog\x27></span></label>\x0a                    </div>\x0a                    <div class=\x27lt-option-container\x27 id=\x27lt-serverSelectContainer\x27 style=\x27display:none;\x27>\x0a                        <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-serverSelect\x27 />\x0a                        <label class=\x27lt-label\x27 for=\x27lt-serverSelect\x27><span id=\x27lt-trans-heurRBS\x27></span></label>\x0a                    </div>\x0a                    <div class=\x27lt-option-container\x27 id=\x27lt-cpy-pst\x27 style=\x27display:none;\x27>\x0a                        <input type=checkbox class=\x27lt-checkbox\x27 id=\x27lt-CopyEnable\x27 />\x0a                        <label class=\x27lt-label\x27 for=\x27lt-CopyEnable\x27>Copy/Paste Lanes</label>\x0a                        <span style=\x27font-weight: bold;\x27>(**Caution** - double check results, feature still in Dev)</span>\x0a                    </div>\x0a                    <div id=\x27lt-sheet-link\x27 style=\x27display:none;\x27>\x0a                        <a href=\x27https://docs.google.com/spreadsheets/d/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/edit?usp=sharing\x27 target=\x27_blank\x27>LT Config Sheet</a>\x0a                    </div>\x0a                </div>\x0a            </div>\x0a        </div>",
    ].join(" ");
    const message = $(constantStrings.divStr);
    message.html([
      "<div class=\x27lt-Toolbar-Container\x27 id=\x22lt-toolbar-container\x22>\x0a            <div class=\x27lt-Toolbar-Wrapper\x27>\x0a                <div class=\x27lt-toolbar-button-container\x27>\x0a                    <button type=\x27button\x27 class=\x27lt-toolbar-button\x27 id=\x27copyA-button\x27>Copy A</button>\x0a                </div>\x0a                <div class=\x27lt-toolbar-button-container\x27>\x0a                    <button type=\x27button\x27 class=\x27lt-toolbar-button\x27 id=\x27copyB-button\x27>Copy B</button>\x0a                </div>\x0a                <div class=\x27lt-toolbar-button-container\x27>\x0a                    <button type=\x27button\x27 class=\x27lt-toolbar-button\x27 id=\x27pasteA-button\x27>Paste A</button>\x0a                </div>\x0a                <div class=\x27lt-toolbar-button-container\x27>\x0a                    <button type=\x27button\x27 class=\x27lt-toolbar-button\x27 id=\x27pasteB-button\x27>Paste B</button>\x0a                </div>\x0a            </div>\x0a        </div>",
    ].join(" "));
    _pickleColor = seaPickle.attributes.rank;
    if (_pickleColor >= 0x0) {
      WazeWrap.Interface.Tab("LT", initMsg.html, setupOptions, "LT");
      $("<style>" + ltCSSClasses + "</style>").appendTo("head");
      $(constantStrings.mapTag).append(message.html());
      WazeWrap.Interface.ShowScriptUpdate(GM_info.script.name, GM_info.script.version, LI_UPDATE_NOTES, GF_LINK,
                                          FORUM_LINK);
      console.log("LaneTools: Loaded");
    } else
      console.error("LaneTools: loading error....");
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
        idSelector.css("border", "2px solid" + value);
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
          .Shortcut("enableHighlights", "Toggle lane highlights", "wmelt", "Lane Tools", LtSettings.enableHighlights,
                    toggleHighlights, null)
          .add();
      new WazeWrap.Interface
          .Shortcut("enableUIEnhancements", "Toggle UI enhancements", "wmelt", "Lane Tools",
                    LtSettings.enableUIEnhancements, toggleUIEnhancements, null)
          .add();
      new WazeWrap.Interface
          .Shortcut("enableHeuristics", "Toggle heuristic highlights", "wmelt", "Lane Tools",
                    LtSettings.enableHeuristics, toggleLaneHeuristicsChecks, null)
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
          laneHeuristicsChecksID = $("#lt-LaneHeuristicsChecks");
    processOptionSettings();
    setTimeout(() => { updateShortcutLabels(); }, 50);
    setHeuristics();
    setTranslations();
    if (_pickleColor > 0x1) {
      let jqQuickTog = $("#lt-trans-quickTog");
      let ltEnabledFeatures = "LaneTools: The following special access features are enabled: ";
      $("#lt-adv-tools").css("display", "block");
      jqQuickTog.attr("data-original-title", "" + strings["selAllTooltip"]);
      jqQuickTog.tooltip();
      _.each(RBSArray, (argument) => {
        if (argument[0x0] === seaPickle.userName) {
          argument[0x1] === "1" && (isRBS = true);
          argument[0x2] === "1" && (allowCpyPst = true);
        }
      });
      if (isRBS) {
        $("#lt-serverSelectContainer").css("display", "block");
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
          $(this)[0x0].id === "copyA-button" && copyLaneInfo("A");
          $(this)[0x0].id === "copyB-button" && copyLaneInfo("B");
          $(this)[0x0].id === "pasteA-button" && pasteLaneInfo("A");
          $(this)[0x0].id === "pasteB-button" && pasteLaneInfo("B");
        });
        ltEnabledFeatures = isRBS ? ltEnabledFeatures + ", Copy/Paste" : ltEnabledFeatures + "Copy/Paste";
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
    colorTitleID.tooltip();
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
    ltSettingsSaveStatus === null
        ? console.warn("LaneTools: User PIN not set in WazeWrap tab")
        : ltSettingsSaveStatus === false && console.error("LaneTools: Unable to save settings to server");
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
              _.each(angleValueJSON.values, (angleValue) => {
                !configArray[angleValue[1]] && (configArray[angleValue[1]] = JSON.parse(angleValue[0]));
              });
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
    $("#lt-trans-advTools").text(strings["advTools"]);
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
      saveSettings();
      setTimeout(() => { updateShortcutLabels(); }, 200);
    }
  }

  function getKeyboardShortcut(settingValue) {
    const keyboardShortCut = LtSettings[settingValue];
    let shortCutValue = "";
    if (keyboardShortCut.indexOf("+") > -0x1) {
      const keyboardKeyValue = keyboardShortCut["split"]("+")[0x0];
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
      if (keyboardKey >= 0x60 && keyboardKey <= 0x69) {
        keyboardKey -= 48;
        shortCutValue += "[num pad]";
      }
      shortCutValue += String.fromCharCode(keyboardKey);
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
  function _0x5a28b7(flagsObject) {
    getId("lt-ReverseLanesIcon").checked && !rotateDisplayLanes && rotateDisplay(flagsObject);
    getId("lt-highlightCSIcons").checked && _0x50c216();
    if (_pickleColor >= 0x1 || editorInfo["editableCountryIDS"].length > 0x0) {
      if (getId("li-del-opp-btn"))
        $("#li-del-opp-btn").remove();
      let delForwardButton = $(
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
      if (!getId("li-del-rev-btn") && !revLanesEnabled &&
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
      if (!getId("li-del-fwd-btn") && !fwdLanesEnabled &&
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
        setTimeout(function() { _0x5a28b7(); }, 200);
      });
      liDeleteReverseButtonSelector.on("click", function() {
        delLanes("rev");
        flagsObject.revLanesEnabled = true;
        setTimeout(function() { _0x5a28b7(); }, 200);
      });
      liDeleteOppositeButtonSelector.on("click", function() {
        let laneDirection = $(this).prop("title");
        delLanes(laneDirection);
        laneDirection === "rev" ? (flagsObject.revLanesEnabled = true) : (flagsObject.fwdLanesEnabled = true);
        _0x5a28b7();
      });
    }
    const editLaneGuidanceSelector = $(".edit-lane-guidance");
    editLaneGuidanceSelector.off();
    editLaneGuidanceSelector.on("click", function() {
      $(this).parents(".fwd-lanes").length && setTimeout(function() {
        _0x16065d("fwd");
        populateNumberOfLanes();
        configureDirectionLanesHTML();
        setupAutoFocusLanes();
        setUpActionButtons();
        if (getId("lt-AddTIO").checked)
          addTIOUI("fwd");
      }, 100);
      $(this).parents(".rev-lanes").length && setTimeout(function() {
        _0x16065d("rev");
        populateNumberOfLanes();
        configureDirectionLanesHTML();
        setupAutoFocusLanes();
        setUpActionButtons();
        if (getId("lt-AddTIO").checked)
          addTIOUI("rev");
      }, 0x64);
    });
    !flagsObject.fwdLanesEnabled && !flagsObject.revLanesEnabled && _0x2308e1();
    configureDirectionLanesHTML();
  }
  function setUpActionButtons(flagsObject) {
    $(".apply-button.waze-btn.waze-btn-blue").off();
    $(".cancel-button").off();
    const fwdLanesSelector = $(".fwd-lanes"), revLanesSelector = $(".rev-lanes");
    fwdLanesSelector.find(".apply-button.waze-btn.waze-btn-blue").on("click", () => {
      flagsObject.fwdLanesEnabled = true;
      setTimeout(function() { _0x5a28b7(); }, 200);
    });
    revLanesSelector.find(".apply-button.waze-btn.waze-btn-blue").on("click", () => {
      flagsObject.revLanesEnabled = true;
      setTimeout(function() { _0x5a28b7(); }, 200);
    });
    fwdLanesSelector.find(".cancel-button").on("click", () => {
      flagsObject.fwdLanesEnabled = true;
      setTimeout(function() { _0x5a28b7(); }, 200);
    });
    revLanesSelector.find(".cancel-button").on("click", () => {
      flagsObject.revLanesEnabled = true;
      setTimeout(function() { _0x5a28b7(); }, 200);
    });
  }
  function _0x2308e1(flagsObject) {
    if (getId("lt-AutoExpandLanes").checked) {
      if (!flagsObject.fwdLanesEnabled) {
      }
      if (!flagsObject.revLanesEnabled) {
      }
    }
    if (getId("lt-AutoOpenWidth").checked) {
      if (!flagsObject.fwdLanesEnabled)
        $(".fwd-lanes").find(".set-road-width > wz-button").trigger("click");
      if (!flagsObject.revLanesEnabled)
        $(".rev-lanes").find(".set-road-width > wz-button").trigger("click");
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
    $(".rev-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.edit-region > div > div > div:nth-child(1)")
        .css("margin-bottom", "4px");
  }

  function populateNumberOfLanes() {
    let fwdLanesSelector = $(".fwd-lanes"), revLanesSelector = $(".rev-lanes");
    if (fwdLanesSelector.find(".direction-lanes").children().length > 0x0 && !getId("lt-fwd-add-lanes")) {
      let add1Lane = $("<div class=\x22lt-add-lanes fwd\x22>1</div>"),
          add2Lanes = $("<div class= lt-add-lanes fwd\x22>2</div>"),
          add3Lanes = $("<div class=\x22t-add-lanes fwd\x22>3</div>"),
          add4Lanes = $("<div class=\x22lt-add-lanes fwd\x22>4</div>"),
          add5Lanes = $("<div class=\x22lt-add-lanes fwd\x22>5</div>"),
          add6Lanes = $("<div class=\x22lt-add-lanes fwd\x22>6</div>"),
          add7Lanes = $("<div class=\x22lt-add-lanes fwd\x22>7</div>"),
          add8Lanes = $("<div class=\x22lt-add-lanes fwd\x22>8</div>"),
          addLanesItem = $(
              "<div style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22 id=\x22lt-fwd-add-lanes\x22 />");
      add1Lane.appendTo(addLanesItem);
      add2Lanes.appendTo(addLanesItem);
      add3Lanes.appendTo(addLanesItem);
      add4Lanes.appendTo(addLanesItem);
      add5Lanes.appendTo(addLanesItem);
      add6Lanes.appendTo(addLanesItem);
      add7Lanes.appendTo(addLanesItem);
      add8Lanes.appendTo(addLanesItem);
      addLanesItem.appendTo(constantStrings.fwdLanesNthChild);
    }
    if (revLanesSelector.find(".direction-lanes").children().length > 0x0 && !getId("lt-rev-add-lanes")) {
      let add1ReverseLane = $("<div class=\x22lt-add-lanes rev\x22>1</div>"),
          add2ReverseLanes = $("<div class=\x22lt-add-lanes rev\x22>2</div>"),
          add3ReverseLanes = $("<div class=\x22lt-add-lanes rev\x22>3</div>"),
          add4ReverseLanes = $("<div class=\x22lt-add-lanes rev\x22>4</div>"),
          add5ReverseLanes = $("<div class=\x22lt-add-lanes rev\x22>5</div>"),
          add6ReverseLanes = $("<div class=\x22lt-add-lanes rev\x22>6</div>"),
          add7ReverseLanes = $("<div class=\x22lt-add-lanes rev\x22>7</div>"),
          add8ReverseLanes = $("<div class=\x22lt-add-lanes rev\x22>8</div>"),
          reversLanesDiv = $(
              "<div style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22 id=\x22lt-rev-add-lanes\x22 />");
      add1ReverseLane.appendTo(reversLanesDiv);
      add2ReverseLanes.appendTo(reversLanesDiv);
      add3ReverseLanes.appendTo(reversLanesDiv);
      add4ReverseLanes.appendTo(reversLanesDiv);
      add5ReverseLanes.appendTo(reversLanesDiv);
      add6ReverseLanes.appendTo(reversLanesDiv);
      add7ReverseLanes.appendTo(reversLanesDiv);
      add8ReverseLanes.appendTo(reversLanesDiv);
      reversLanesDiv.appendTo(
          ".rev-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.edit-region > div > div > div:nth-child(1) > div");
    }
    $(".lt-add-lanes").on("click", function() {
      let addLanesText = $(this).text();
      addLanesText = Number.parseInt(addLanesText, 10);
      if ($(this).hasClass("lt-add-lanes fwd")) {
        // const fwdLanesSelector = $(".fwd-lanes");
        fwdLanesSelector.find(".form-control").val(addLanesText);
        fwdLanesSelector.find(".form-control").trigger("change");
        fwdLanesSelector.find(".form-control").trigger("click");
      }
      if ($(this).hasClass("lt-add-lanes rev")) {
        // const revLanesSelector = $(".rev-lanes");
        revLanesSelector.find(".form-control").val(addLanesText);
        revLanesSelector.find(".form-control").trigger("change");
        revLanesSelector.find(".form-control").trigger("focus");
      }
    });
    if (fwdLanesSelector.find(".lane-width-card").children().length > 0x0 && !getId("lt-fwd-add-Width")) {
      let add1MoreLane = $("<div class=\x22lt-add-Width fwd\x22>1</div>"),
          add2MoreLanes = $("<div class=\x22lt-add-Width fwd\x22>2</div>"),
          add3MoreLanes = $("<div class=\x22lt-add-Width fwd\x22>3</div>"),
          add4MoreLanes = $("<div class=\x22lt-add-Width fwd\x22>4</div>"),
          add5MoreLanes = $("<div class=\x22lt-add-Width fwd\x22>5</div>"),
          add6MoreLanes = $("<div class=\x22lt-add-Width fwd\x22>6</div>"),
          add7MoreLanes = $("<div class=\x22lt-add-Width fwd\x22>7</div>"),
          add8MoreLanes = $("<div class=\x22lt-add-Width fwd\x22>8</div>"),
          addMoreLanes =
              $("<div style=\x22position:relative;display:block;width:100%;\x22 id=\x22lt-fwd-add-Width\x22 />");
      add1MoreLane.appendTo(addMoreLanes);
      add2MoreLanes.appendTo(addMoreLanes);
      add3MoreLanes.appendTo(addMoreLanes);
      add4MoreLanes.appendTo(addMoreLanes);
      add5MoreLanes.appendTo(addMoreLanes);
      add6MoreLanes.appendTo(addMoreLanes);
      add7MoreLanes.appendTo(addMoreLanes);
      add8MoreLanes.appendTo(addMoreLanes);
      addMoreLanes.prependTo(
          ".fwd-lanes > div > div > .lane-instruction.lane-instruction-from > .instruction > .road-width-edit > div > div > div > .lane-width-card");
    }
    if (revLanesSelector.find(".lane-width-card").children().length > 0x0 && !getId("lt-rev-add-Width")) {
      let append1Lane = $("<div class=\x22lt-add-Width rev\x22>1</div>"),
          append2Lanes = $("<div class=\x22lt-add-Width rev\x22>2</div>"),
          append3Lanes = $("<div class=\x22lt-add-Width rev\x22>3</div>"),
          append4Lanes = $("<div class=\x22lt-add-Width rev\x22>4</div>"),
          append5Lanes = $("<div class=\x22lt-add-Width rev\x22>5</div>"),
          append6Lanes = $("<div class=\x22lt-add-Width rev\x22>6</div>"),
          append7Lanes = $("<div class=\x22lt-add-Width rev\x22>8</div>"),
          append8Lanes = $("<div class=\x22lt-add-Width rev\x22>8</div>"),
          appendRevLanes =
              $("<div style=\x22position:relative;display:block;width:100%;\x22 id=\x22lt-rev-add-Width\x22 />");
      append1Lane.appendTo(appendRevLanes);
      append2Lanes.appendTo(appendRevLanes);
      append3Lanes.appendTo(appendRevLanes);
      append4Lanes.appendTo(appendRevLanes);
      append5Lanes.appendTo(appendRevLanes);
      append6Lanes.appendTo(appendRevLanes);
      append7Lanes.appendTo(appendRevLanes);
      append8Lanes.appendTo(appendRevLanes);
      appendRevLanes.prependTo(
          ".rev-lanes > div > div > .lane-instruction.lane-instruction-from > .instruction > .road-width-edit > div > div > div > .lane-width-card");
    }
    $(".lt-add-Width").on("click", function() {
      let numLanesToAdd = $(this).text();
      numLanesToAdd = Number.parseInt(numLanesToAdd, 0xa);
      if ($(this).hasClass("lt-add-Width fwd")) {
        // const fwdLanesSelector = $(".fwd-lanes");
        fwdLanesSelector.find("#number-of-lanes").val(numLanesToAdd);
        fwdLanesSelector.find("#number-of-lanes").trigger("change");
        fwdLanesSelector.find("#number-of-lanes").trigger("focus");
      }
      if ($(this).hasClass("lt-add-Width rev")) {
        // const revLanesSelector = $(".rev-lanes");
        revLanesSelector.find("#number-of-lanes").val(numLanesToAdd);
        revLanesSelector.find("#number-of-lanes").change();
        revLanesSelector.find("#number-of-lanes").focus();
      }
    });
  }

  function setupAutoFocusLanes() {
    if (getId("lt-AutoFocusLanes").checked) {
      const fwdLanesSelector = $(".fwd-lanes"), revLanesSelector = $(".rev-lanes");
      if (fwdLanesSelector.find(".edit-region").children().length > 0x0 && !fwdLanesEnabled)
        fwdLanesSelector.find(".form-control").trigger("focus");
      else if (revLanesSelector.find(".edit-region").children().length > 0x0 && !revLanesEnabled) {
        revLanesSelector.find(".form-control").trigger("focus");
      }
    }
  }

  function _0x16065d(laneDirection) {
    if (getId("lt-SelAllEnable").checked) {
      $(".street-name").css("user-select", "none");
      let _0x430051 = laneDirection === "fwd" ? $(".fwd-lanes").find(".form-control")[0x0]
                                              : $(".rev-lanes").find(".form-control")[0x0],
          _0x36b726 = $(_0x430051).val();
      $(_0x430051).on("change", function() {
        let turnsRegion;
        if ($(this).parents(".fwd-lanes").length)
          turnsRegion = $(".fwd-lanes").find(".controls-container.turns-region");
        else
          $(this).parents(".rev-lanes").length &&
              (turnsRegion = $(".rev-lanes").find(".controls-container.turns-region"));
        turnsRegion = $(".street-name", turnsRegion);
        for (let idx = 0x0; idx < turnsRegion.length; idx++) {
          $(turnsRegion[idx]).off();
          $(turnsRegion[idx]).on("click", function() {
            let _0x3d91bf = $(this).get(0x0), _0x569f4 = _0x3d91bf["parentElement"],
                htmlElements = $(".checkbox-large.checkbox-white", _0x569f4);
            const elementDisabled = !getId(htmlElements[0x0].id).checked;
            for (let idx = 0x0; idx < htmlElements.length; idx++) {
              const idElement = $("#" + htmlElements[idx].id);
              idElement.prop("checked", elementDisabled);
              idElement.trigger("change");
            }
          });
        }
      });
      _0x36b726 > 0x0 && $(_0x430051).trigger("change");
    }
  }
  function _0x50c216() {
    const segmentRef = selectedFeatures[0x0].attributes.wazeFeature._wmeObject,
          bNodeRef = getNodeObj(segmentRef.attributes.toNodeID),
          aNodeRef = getNodeObj(segmentRef.attributes.fromNodeID);
    let toLanesConfig =
            getLanesConfig(segmentRef, bNodeRef, bNodeRef.attributes.segIDs, segmentRef.attributes.fwdLaneCount),
        fromLanesConfig =
            getLanesConfig(segmentRef, aNodeRef, aNodeRef.attributes.segIDs, segmentRef.attributes.revLaneCount);
    if (toLanesConfig[0x4] > 0x0) {
      let _0x59815e = toLanesConfig[4] === 0x1 ? LtSettings.CS1Color : LtSettings.CS2Color,
          _0x1d2fa0 =
              $("#segment-edit-lanes > div > div > div.fwd-lanes > div > div > div.lane-instruction.lane-instruction-to > div.instruction > div.lane-arrows > div")
                  .children();
      for (let i = 0x0; i < _0x1d2fa0.length; i++) {
        _0x1d2fa0[i]["title"] === toLanesConfig[5] && $(_0x1d2fa0[i]).css("background-color", _0x59815e);
      }
    }
    if (fromLanesConfig[4] > 0x0) {
      let csColor = (fromLanesConfig[4] === 0x1 ? LtSettings.CS1Color : LtSettings.CS2Color),
          _0x37b735 = $(constantStrings.segmentEditLanes).children();
      for (let i = 0x0; i < _0x37b735.length; i++) {
        _0x37b735[i]["title"] === fromLanesConfig[0x5] && $(_0x37b735[i]).css("background-color", csColor);
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
      setTimeout(lanesTabSetup, 8000);
      console.log("Edit panel not yet loaded.");
      return;
    }
    const selectedFeatures = W.selectionManager.getSelectedFeatures();
    let flagsObject = {};
    flagsObject.fwdLanesEnabled = false;
    flagsObject.revLanesEnabled = false;
    flagsObject.rotateDisplayLanes = false;
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
          selectedFeatures[0x0].attributes.wazeFeature._wmeObject.type === "segments") {
        $(".lanes-tab").on("click", () => {
          (flagsObject.fwdLanesEnabled = false);
          (flagsObject.revLanesEnabled = false);
          setTimeout(() => { _0x5a28b7(flagsObject); }, 100);
        });
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

  function onScreen(wmeObject, zoomLevel) {
    if (!wmeObject || !wmeObject.geometry || !wmeObject.attributes)
      return false;
    if (zoomLevel >= DisplayLevels["MIN_ZOOM_NONFREEWAY"] ||
        (wmeObject.type === "segments" && wmeObject.attributes["roadType"] === LT_ROAD_TYPE.FREEWAY))
      return W.map.getExtent().intersectsBounds(wmeObject.geometry.getBounds());
    return false;
  }

  function getCardinalAngle(_0x5f13ca, _0x261fce) {
    if (_0x5f13ca == null || _0x261fce == null)
      return null;
    let _0x529918, _0x573f8b;
    if (_0x261fce.attributes.fromNodeID === _0x5f13ca) {
      _0x529918 = lt_get_second_point(_0x261fce).x - lt_get_first_point(_0x261fce).x;
      _0x573f8b = lt_get_second_point(_0x261fce).y - lt_get_first_point(_0x261fce).y;
    } else {
      _0x529918 = lt_get_next_to_last_point(_0x261fce).x - lt_get_last_point(_0x261fce).x;
      _0x573f8b = lt_get_next_to_last_point(_0x261fce).y - lt_get_last_point(_0x261fce).y;
    }
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
      lanesObject.fwdLaneCount = 0x0;
      nodeObject = getNodeObj(wmeObject.attributes.toNodeID);
      attachedSegmentIDs = nodeObject.getSegmentIds();
      const _0xfa6629 = $(".fwd-lanes");
      _0xfa6629.find(".form-control").val(0x0);
      _0xfa6629.find(".form-control").trigger("change");
    }
    lanesObject.revLaneCount = 0x0;
    nodeObject = getNodeObj(wmeObject.attributes.fromNodeID);
    if (laneDirection === "rev") {
      attachedSegmentIDs = nodeObject.getSegmentIds();
      const _0x5c7972 = $(".rev-lanes");
      _0x5c7972.find(".form-control").val(0x0);
      _0x5c7972.find(".form-control").trigger("change");
    }
    mAction.doSubAction(new UpdateObj(wmeObject, lanesObject));
    for (let idx = 0x0; idx < attachedSegmentIDs.length; idx++) {
      let _0x58ea8c = turnGraph.getTurnThroughNode(nodeObject, wmeObject, getSegObj(attachedSegmentIDs[idx])),
          _0x5c9c0e = _0x58ea8c.getTurnData();
      if (_0x5c9c0e.hasLanes()) {
        _0x5c9c0e = _0x5c9c0e.withLanes();
        _0x58ea8c = _0x58ea8c.withTurnData(_0x5c9c0e);
        mAction["doSubAction"](new SetTurn(turnGraph, _0x58ea8c));
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

  function applyName(_0x27e648, _0x2d5f66, _0x3e4f08) {
    let _0x2e0a0c = _0x27e648.clone(), _0x58bfcc = _0x2d5f66 + " / " + _0x3e4f08,
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
        highlightEnabled && _0x58a03b(_0x21e1e8, "" + LtSettings.ABColor, segmentHighlightTypes.DASH_THIN);
        _0x43deae(_0x21e1e8, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
      } else {
        if (segDirection === Direction.REVERSE) {
          let _0x3e6b6f = _0x1c40ca(newSegmentGeometry, 0x0, _0x3a7f64);
          highlightEnabled && _0x58a03b(_0x3e6b6f, "" + LtSettings.BAColor, segmentHighlightTypes.DASH_THIN);
          _0x43deae(_0x3e6b6f, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
        }
      }
      if (highlightLabelsEnabled && (Direction.FORWARD || forwardLaneCount === 0x0)) {
        if (_0x114781 % 0x2)
          applyName(newSegmentGeometry.components[_0x5479ec], forwardLaneCount, reverseLaneCount);
        else {
          let _0x3f4fb2 = newSegmentGeometry.components[_0x3a7f64 - 0x1],
              _0x196425 = newSegmentGeometry.components[_0x5479ec],
              _0x2daf64 =
                  new OpenLayers.Geometry.Point((_0x3f4fb2.x + _0x196425.x) / 0x2, (_0x3f4fb2.y + _0x196425.y) / 0x2);
          applyName(_0x2daf64, forwardLaneCount, reverseLaneCount);
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
          applyName(_0xa8356b, forwardLaneCount, reverseLaneCount);
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
        if (_0x1d2584 === segmentHighlightTypes.HIGHLIGHT) {
            _0x5501de.setAttribute("stroke-width", "15");
            _0x5501de.setAttribute("stroke-opacity", ".6");
        }
        else {
          if (_0x1d2584 === segmentHighlightTypes.OVER_HIGHLIGHT) {
            _0x5501de.setAttribute("stroke-width", "18");
            _0x5501de.setAttribute("stroke-opacity", ".85");
          } else {
            _0x5501de.setAttribute("stroke-opacity", "1");
            if (_0x1d2584 === segmentHighlightTypes.DASH_THICK) {
                _0x5501de.setAttribute("stroke-width", "8");
                _0x5501de.setAttribute("stroke-dasharray", "8 10");
            }
            else
                if(_0x1d2584 === segmentHighlightTypes.DASH_THIN) {
              _0x5501de.setAttribute("stroke-width", "4");
              _0x5501de.setAttribute("stroke-dasharray", "10 10")
            }
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
    let _0x4174e4 = [], _0x232b3f = 0x0;
    return (_.each(features, (feature) => {
      feature && feature.attributes.wazeFeature._wmeObject &&
          feature.attributes.wazeFeature._wmeObject.type === "segments" &&
          (_0x232b3f = _0x4174e4.push(feature.attributes.wazeFeature._wmeObject));
    }), scanSegments(_0x4174e4, true), _0x232b3f);
  }

    function _0x2ad725(segmentObj, segmentAttributes, segmentDirection, segmentLength, minZoomLevel, performHeuristicsCheck, errorsFound) {
        const fwdLaneCount = segmentAttributes.fwdLaneCount, revLaneCount = segmentAttributes.revLaneCount,
            highlightEnabled = getId("lt-HighlightsEnable").checked,
            checkHeuristics = getId("lt-LaneHeuristicsChecks").checked,
            heurPosHighlightEnabled = checkHeuristics && getId("lt-LaneHeurPosHighlight").checked,
            heurNegHighlightEnabled = checkHeuristics && getId("lt-LaneHeurNegHighlight").checked,
            highlightLIOEnabled = highlightEnabled && getId("lt-LIOEnable").checked,
            highlightLabelsEnabled = highlightEnabled && getId("lt-LabelsEnable").checked,
            turnGraph = W.model.getTurnGraph();

        let toNode = getNodeObj(segmentAttributes.toNodeID), fromNode = getNodeObj(segmentAttributes.fromNodeID),
            fLaneCount = fwdLaneCount, rLaneCount = revLaneCount;
        if(segmentDirection !== Direction.FORWARD) {
            toNode = getNodeObj(segmentAttributes.fromNodeID);
            fromNode = getNodeObj(segmentAttributes.toNodeID);
            fLaneCount = revLaneCount;
            rLaneCount = fwdLaneCount;
        }
        let _0x5855dd = false, _0x4d3a78 = false, _0x12606 = false, _0x58ba1e = false, _0x3a8c59 = 0x0,
            heurCandidate = HeuristicsCandidate.NONE, _0x53f387 = null,
            _0x211d6a = {seg : 0x0, direction : Direction.NONE};
        if (onScreen(toNode, minZoomLevel)) {
            const toNodeAttachedSegmentIDs = toNode.getSegmentIds();
            if (fLaneCount > 0x0) {
                let segmentLanesConfig = getLanesConfig(segmentObj, toNode, toNodeAttachedSegmentIDs, fLaneCount);
                _0x5855dd = segmentLanesConfig[0x0];
                _0x4d3a78 = segmentLanesConfig[0x1];
                _0x58ba1e = segmentLanesConfig[0x2];
                _0x12606 = segmentLanesConfig[0x3];
                _0x3a8c59 = segmentLanesConfig[0x4];
                errorsFound = (_0x12606 || errorsFound);
            }
            if (segmentLength <= MAX_LEN_HEUR) {
                heurCandidate = isHeuristicsCandidate(segmentObj, toNode, toNodeAttachedSegmentIDs, fromNode, fLaneCount,
                    segmentLength, turnGraph, _0x211d6a);
                heurCandidate === HeuristicsCandidate["ERROR"] && (_0x12606 = true);
                if (!checkHeuristics)
                    heurCandidate = HeuristicsCandidate.NONE;
                else
                    heurCandidate !== HeuristicsCandidate.NONE && (_0x53f387 = {..._0x211d6a});
            }
        }
        if (!performHeuristicsCheck) {
            let _0x5c9960 = null;
            ((heurPosHighlightEnabled && heurCandidate === HeuristicsCandidate.PASS) ||
                (heurNegHighlightEnabled && heurCandidate === HeuristicsCandidate.FAIL)) &&
            (_0x5c9960 = heurCandidate),
            (fLaneCount > 0x0 || _0x5c9960 !== null || _0x12606) &&
            highlightSegment(segmentObj.geometry, segmentDirection, highlightEnabled, highlightLabelsEnabled,
                fwdLaneCount, revLaneCount, _0x58ba1e && highlightLIOEnabled, _0x3a8c59, _0x12606,
                _0x5c9960, false),
            highlightEnabled && getId("lt-NodesEnable").checked &&
            (_0x5855dd && highlightNode(toNode.geometry, "" + LtSettings.NodeColor),
            _0x4d3a78 && highlightNode(toNode.geometry, "" + LtSettings.TIOColor));
        } else {
            lt_log("candidate(f):" + heurCandidate);
            if (heurCandidate !== HeuristicsCandidate.NONE) {
                if (_0x53f387 != null && segmentArray["findIndex"]((_0x12b968) => _0x12b968 === _0x53f387.seg) > -0x1) {
                    let _0x4063ba =
                        heurCandidate === HeuristicsCandidate.PASS ? "" + LtSettings.NodeColor : "" + LtSettings.HeurFailColor;
                    highlightSegment(segmentObj.geometry, segmentDirection, false, false, 0x0, 0x0, false, _0x3a8c59, _0x12606,
                        heurCandidate, true),
                        highlightSegment(_0x53f387["seg"].geometry, _0x53f387.direction, false, false, 0x0, 0x0, false, 0x0,
                            false, heurCandidate, true),
                        highlightNode(toNode.geometry, _0x4063ba, true), highlightNode(fromNode.geometry, _0x4063ba, true);
                }
            }
        }
        return errorsFound;
    }

    function scanSegments(segmentArray, performHeuristicsCheck) {
      const minZoomLevel = W.map.getZoom() != null ? W.map.getZoom() : 16; //
      _.each(segmentArray, (segmentObj) => {
        if (onScreen(segmentObj, minZoomLevel)) {
          const featureAttributes = segmentObj.getFeatureAttributes();
          let errorsFound = false, segmentLength = lt_segment_length(segmentObj);
          errorsFound ||=  _0x2ad725(segmentObj, featureAttributes, Direction.FORWARD, segmentLength, minZoomLevel, performHeuristicsCheck, errorsFound);
          if (errorsFound && lt_scanArea_recursive > 0x0) {
            lt_log("LT errors found, scanning again", 0x2);
            removeHighlights();
            lt_scanArea_recursive--;
            lt_scanArea_timer.start();
            return;
          }
          errorsFound ||= _0x2ad725(segmentObj, featureAttributes, Direction.REVERSE, segmentLength, minZoomLevel, performHeuristicsCheck, errorsFound);
          if (errorsFound && lt_scanArea_recursive > 0x0) {
            lt_log("LT errors found, scanning again", 0x2);
            removeHighlights();
            lt_scanArea_recursive--;
            lt_scanArea_timer.start();
          }
        }
      });
    }

  function getLanesConfig(segment, node, attachedSegments, laneCount) {
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
            setTimeout(setTurns(_0x24c520), 50);
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
      lt_log("isHeuristicsCandidate received bad argument (null)", 0x1);
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
    lt_log("Checking heuristics candidate: seg" + _0x453456 + "node" + toNodeObj.attributes.id + " azm " + _0x11d184 +
               "nodeExitSegIds:" + attachedSegmentIDs.length,
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
      lt_log("Turn angle from inseg " + segmentIDs[idx] + ": " + _0x4ef283 + "(" + _0x3c6b23 + "," + _0x5349e1 + ")",
             0x3);
      if (Math.abs(_0x4ef283) > MAX_STRAIGHT_DIF) {
        if (Math.abs(_0x4ef283) > MAX_STRAIGHT_TO_CONSIDER)
          continue;
        lt_log("Not eligible as inseg: " + _0x4ef283, 0x2), (heurState = HeuristicsCandidate.FAIL);
      }
      const _0x4c0fc6 = _0x5aa7bb.getTurnThroughNode(fromNodeObj, _0x71a39c, _0x2bb3f1),
            _0x264c0a = _0x4c0fc6.getTurnData();
      if (_0x264c0a.state !== 0x1 || !_0x264c0a.hasLanes()) {
        lt_log("Straight turn has no lanes:" + segmentIDs[idx] + " to " + _0x453456, 0x3);
        continue;
      }
      let idxDiff = _0x264c0a.lanes.toLaneIndex - _0x264c0a.lanes.fromLaneIndex + 0x1;
      idxDiff !== fwdLaneCount && !(fwdLaneCount === 0x0 && idxDiff === 0x1) &&
          (lt_log("Straight turn lane count does not match", 0x2), (heurState = HeuristicsCandidate.ERROR));
      if (_0x4777ff !== null && heurState >= _0x4e91d5) {
        if (_0x4e91d5 === 0x0 && heurState === 0x0)
          return (lt_log("Error: >1 qualifying entry segment for " + _0x2bb3f1.attributes.id + ": " +
                             _0x4777ff.attributes.id + "," + _0x71a39c.attributes.id,
                         0x2),
                  lt_log("==================================================================================", 0x2),
                  0x0);
      }
      (_0x4777ff = _0x71a39c), (_0x28857a = _0x3c6b23), (_0x96fad4 = _0x4ef283), (_0x296190 = idxDiff),
          (_0x4e91d5 = heurState), (_0x1a610d.inSeg = _0x4777ff),
          (_0x1a610d.inSegDir = _0x4c0fc6.fromVertex["direction"] === "fwd" ? Direction.FORWARD : Direction["REVERSE"]);
    }
    if (_0x4777ff == null)
      return lt_log("== No inseg found ==================================================================", 0x2), 0x0;
    else
      lt_log("Found inseg candidate: " + _0x4777ff.attributes.id + " " + (_0x4e91d5 === 0x0 ? "" : "(failed)"), 0x2);
    for (let idx = 0x0; idx < attachedSegmentIDs.length; idx++) {
      let _0x10d7bb = 0x0;
      if (attachedSegmentIDs[idx] === _0x453456)
        continue;
      const _0x3e085f = getSegObj(attachedSegmentIDs[idx]);
      if (!_0x493643(_0x2bb3f1, toNodeObj, _0x3e085f))
        continue;
      let _0xff74b4 = _0xca5734(toNodeObj.attributes.id, _0x3e085f), _0x1bf6a7 = _0xcd5d5b(_0x11d184, _0xff74b4);
      lt_log("Turn angle to outseg2 " + attachedSegmentIDs[idx] + ": " + _0x1bf6a7 + "(" + _0x11d184 + "," + _0xff74b4 +
                 ")",
             0x2);
      if (Math.abs(_0x18525c - _0x1bf6a7) < MAX_PERP_TO_CONSIDER)
        return 0x0;
      if (Math.abs(_0x26651c - _0x1bf6a7) > MAX_PERP_DIF) {
        if (Math.abs(_0x26651c - _0x1bf6a7) > MAX_PERP_TO_CONSIDER)
          continue;
        lt_log("   Not eligible as outseg2: " + _0x1bf6a7, 0x2), (_0x10d7bb = HeuristicsCandidate.FAIL);
      }
      if (_0x1859f0 !== null && _0x10d7bb >= _0x96949d) {
        if (_0x96949d === 0x0 && _0x10d7bb === 0x0) {
          lt_log("Error: >1 qualifying exit2 segment for " + _0x2bb3f1.attributes.id + ": " + _0x1859f0.attributes.id +
                     "," + _0x3e085f.attributes.id,
                 0x2);
          lt_log("==================================================================================", 0x2);
          return 0x0;
        }
      }
      (_0x1859f0 = _0x3e085f), (_0x4f9be7 = _0x1bf6a7), (_0x96949d = _0x10d7bb);
    }
    if (_0x1859f0 == null) {
      lt_log("== No Outseg2 found ==================================================================", 0x2);
      return 0x0;
    } else
      lt_log("Found outseg2 candidate: " + _0x1859f0.attributes.id + " " + (_0x96949d === 0x0 ? "" : "(failed)"), 0x2);
    for (let idx = 0x0; idx < segmentIDs.length; idx++) {
      if (segmentIDs[idx] === _0x453456 || segmentIDs[idx] === _0x4777ff.attributes.id)
        continue;
      const _0x1b9808 = getSegObj(segmentIDs[idx]);
      let _0x3edc74 = 0x0;
      if ((_0x1b9808.attributes.fwdDirection && _0x1b9808.attributes.toNodeID !== fromNodeObj.attributes.id) ||
          (_0x1b9808.attributes.revDirection && _0x1b9808.attributes.fromNodeID !== fromNodeObj.attributes.id))
        continue;
      let _0x46ff80 = _0x43a6d2(fromNodeObj.attributes.id, _0x1b9808), _0x58b38d = _0xcd5d5b(_0x28857a, _0x46ff80);
      lt_log("Turn angle from inseg (supplementary) " + segmentIDs[idx] + ": " + _0x58b38d + "(" + _0x28857a + "," +
                 _0x46ff80 + ")",
             0x3);
      if (Math.abs(_0x18525c - _0x58b38d) > MAX_PERP_DIF_ALT) {
        if (Math.abs(_0x18525c - _0x58b38d) > MAX_PERP_TO_CONSIDER)
          continue;
        lt_log("Not eligible as altIn1: " + _0x58b38d, 0x3);
        (_0x3edc74 = HeuristicsCandidate.FAIL);
      }
      if (_0x4fd61c !== null) {
        if (_0x3edc74 < _0x5063e3)
          continue;
        if (_0x5063e3 === 0x0 && _0x3edc74 === 0x0)
          lt_log("Error: >1 qualifying segment for " + _0x2bb3f1.attributes.id + ": " + _0x4fd61c.attributes.id + "," +
                     _0x1b9808.attributes.id,
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
      lt_log("Alt incoming-1 segment found: " + _0x4fd61c.attributes.id + " " + (_0x5063e3 === 0x0 ? "" : "(failed)"),
             0x2);
    if (_0x4e91d5 < 0x0 || _0x5063e3 < 0x0 || _0x96949d < 0x0) {
      lt_log("Found a failed candidate for " + _0x453456 + " ( " + Math.min(_0x4e91d5, _0x5063e3, _0x96949d) + ")",
             0x2);
      return (_0x4e91d5 === HeuristicsCandidate.FAIL || _0x5063e3 === HeuristicsCandidate.FAIL ||
                      _0x96949d === HeuristicsCandidate.FAIL
                  ? HeuristicsCandidate.FAIL
                  : HeuristicsCandidate.ERROR);
    }
    lt_log("Found a heuristics candidate! " + _0x453456 + " to " + _0x1859f0.attributes.id + "at" + _0x4f9be7, 0x2);
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
      return (lt_log("Azm from node " + _0x15149a + " / " + _0x25a1f9.attributes.id + ": " + _0x232509, 0x3),
              _0x232509);
    }

    function _0x43a6d2(_0x293709, _0x3901cd) {
      let _0x39f1a3 = _0xca5734(_0x293709, _0x3901cd), _0x228ce5 = _0x39f1a3 + 0xb4;
      return (_0x228ce5 >= 0xb4 && (_0x228ce5 -= 360),
              lt_log("Azm to node " + _0x293709 + "/ " + _0x3901cd.attributes.id + ": " + _0x228ce5, 0x3), _0x228ce5);
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
              lt_log("Turn " + _0x240602 + "," + _0x56fa6c + ": " + _0x1eb39a, 0x3), _0x1eb39a);
    }

    function _0x493643(_0x17bc7b, _0x31445a, _0x85690c) {
      lt_log("Allow from " + _0x17bc7b.attributes.id + "to " + _0x85690c.attributes.id + " via " +
                 _0x31445a.attributes.id + "? \n" +
                 "            " + _0x31445a["isTurnAllowedBySegDirections"](_0x17bc7b, _0x85690c) + "| " +
                 _0x17bc7b["isTurnAllowed"](_0x85690c, _0x31445a),
             3);
      if (!_0x31445a.isTurnAllowedBySegDirections(_0x17bc7b, _0x85690c)) {
        lt_log("Driving direction restriction applies", 3);
        return false;
      }
      if (!_0x17bc7b["isTurnAllowed"](_0x85690c, _0x31445a)) {
        lt_log("Other restriction applies", 0x3);
        return false;
      }
      return true;
    }
  }

  function lt_segment_length(segment) {
    let segmentLength = segment.geometry.getGeodesicLength(W.map.olMap.projection);
    lt_log("segment:" + segment.attributes.id + "computed len: " + segmentLength +
               "attrs len: " + segment.attributes.length,
           3);
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
          turnGraph = W.model.getTurnGraph();
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
      (mAction._description = "Pasted some lane stuff"), W.model.actionManager.add(mAction), $(".lanes-tab").click();
    } else
      WazeWrap.Alerts.warning(GM_info.script.name,
                              "There are a different number of enabled turns on this segment/node");
  }

  function _0x5694f9(_0x3399d1) {
    let _0x2c1862 = {};
    for (let idx = 0x0; idx < _0x3399d1.length; idx++) {
      let uturnObject = {};
      (uturnObject.uturn = $(_0x3399d1[idx]).find(".uturn").css("display") !== "none");
      (uturnObject.miniuturn = $(_0x3399d1[idx]).find(".small-uturn").css("display") !== "none");
      (uturnObject.svg = $(_0x3399d1[idx]).find("svg").map(function() { return this; }).get());
      (_0x2c1862[idx] = uturnObject);
    }
    return _0x2c1862;
  }
  function getOpposingVertexCoordinates(departureAngleID, nodeObj, laneDisplayBoxConfiguration, segmentLength) {
    let temp = {};
    if (UPDATEDZOOM) {
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
                y : nodeObj.geometry.y -
                        (laneDisplayBoxConfiguration.start + laneDisplayBoxConfiguration.boxheight * 0x2),
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

  function _0x19644c(nodeObj, segmentObject, _0x533989) {
    let laneDisplayBoxConfiguration = getLaneDisplayBoxObjectConfig(),
        departureAngle = getCardinalAngle(nodeObj.attributes.id, segmentObject), centroid, boxCoordinates = [],
        departureAngleID = 0x0, segmentLength = Object.getOwnPropertyNames(_0x533989).length;
    if (!getId("lt-IconsRotate").checked)
      departureAngle = -90;
    if (departureAngle === 0x0) {
      departureAngle += 180;
      departureAngleID = 0x1;
    } else {
      if (departureAngle > 0 && departureAngle <= 30) {
        departureAngle += (2 * (90 - departureAngle));
        departureAngleID = 0x1;
      } else {
        if (departureAngle >= 330 && departureAngle <= 360) {
          departureAngle -= (180 - 0x2 * (360 - departureAngle));
          departureAngleID = 0x1;
        } else {
          if (departureAngle > 30 && departureAngle < 60) {
            departureAngle -= (90 - 2 * (360 - departureAngle));
            departureAngleID = 0x2;
          } else {
            if (departureAngle >= 60 && departureAngle <= 120) {
              departureAngle -= (90 - 0x2 * (360 - departureAngle));
              departureAngleID = 0x2;
            } else {
              if (departureAngle > 120 && departureAngle < 150) {
                departureAngle -= (90 - 2 * (360 - departureAngle));
                departureAngleID = 0x7;
              } else {
                if (departureAngle >= 150 && departureAngle <= 210) {
                  departureAngle = 180 - departureAngle;
                  departureAngleID = 0x4;
                } else {
                  if (departureAngle > 210 && departureAngle < 240) {
                    departureAngle -= (90 - 0x2 * (360 - departureAngle));
                    departureAngleID = 0x6;
                  } else {
                    if (departureAngle >= 240 && departureAngle <= 300) {
                      departureAngle -= (180 - 0x2 * (360 - departureAngle));
                      departureAngleID = 0x3;
                    } else if (departureAngle > 300 && departureAngle < 330) {
                      departureAngle -= (180 - 2 * (360 - departureAngle));
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
    let turnAngle = departureAngle > 315 ? departureAngle : departureAngle + 90, reciprocalTurnAngle = 360 - turnAngle;

    let _0x2a17ea = getOpposingVertexCoordinates(departureAngleID, nodeObj, laneDisplayBoxConfiguration, segmentLength);
    var topLeftVtx = new OpenLayers.Geometry.Point(_0x2a17ea.x, _0x2a17ea.y + laneDisplayBoxConfiguration.boxheight),
        topRightVtx = new OpenLayers.Geometry.Point(_0x2a17ea.x + laneDisplayBoxConfiguration.boxincwidth * segmentLength,
                                                    _0x2a17ea.y + laneDisplayBoxConfiguration.boxheight),
        bottomRightVtx = new OpenLayers.Geometry.Point(
            _0x2a17ea.x + laneDisplayBoxConfiguration.boxincwidth * segmentLength, _0x2a17ea.y),
        topRightVTX = new OpenLayers.Geometry.Point(_0x2a17ea.x, _0x2a17ea.y);
    boxCoordinates.push(topLeftVtx, topRightVtx, bottomRightVtx, topRightVTX);
    let _0x5b7230 = {
      strokeColor : "#ffffff",
      strokeOpacity : 0x1,
      strokeWidth : 0x8,
      fillColor : "#ffffff",
    };
    let linearRing = new OpenLayers.geometry.LinearRing(boxCoordinates);
    centroid = linearRing.getCentroid();
    linearRing.rotate(reciprocalTurnAngle, centroid);
    let featureVector = new OpenLayers.Feature.Vector(linearRing, null, _0x5b7230);
    LTLaneGraphics.addFeatures([ featureVector ]);
    let _0xe41aaa = 0x0;
    _.each(_0x533989, (_0x25119b) => {
      let _0x4731ea = [];
      var _0x1bd240 = new OpenLayers.Geometry.Point(_0x2a17ea.x + laneDisplayBoxConfiguration.boxincwidth * _0xe41aaa +
                                                        laneDisplayBoxConfiguration.iconbordermargin,
                                                    _0x2a17ea.y + laneDisplayBoxConfiguration.iconborderheight),
          _0x47bfb1 = new OpenLayers.Geometry.Point(_0x2a17ea.x + laneDisplayBoxConfiguration.boxincwidth * _0xe41aaa +
                                                        laneDisplayBoxConfiguration.iconborderwidth,
                                                    _0x2a17ea.y + laneDisplayBoxConfiguration.iconborderheight),
          _0x2d1e17 = new OpenLayers.Geometry.Point(_0x2a17ea.x + laneDisplayBoxConfiguration.boxincwidth * _0xe41aaa +
                                                        laneDisplayBoxConfiguration.iconborderwidth,
                                                    _0x2a17ea.y + laneDisplayBoxConfiguration.iconbordermargin),
          _0x42e795 = new OpenLayers.Geometry.Point(_0x2a17ea.x + laneDisplayBoxConfiguration.boxincwidth * _0xe41aaa +
                                                        laneDisplayBoxConfiguration.iconbordermargin,
                                                    _0x2a17ea.y + laneDisplayBoxConfiguration.iconbordermargin);
      _0x4731ea.push(_0x1bd240, _0x47bfb1, _0x2d1e17, _0x42e795);
      var _0x2c762f = {
        strokeColor : "#000000",
        strokeOpacity : 0x1,
        strokeWidth : 0x1,
        fillColor : "#26bae8",
      };
      let _0x30718d = new OpenLayers.Geometry.LinearRing(_0x4731ea);
      _0x30718d["rotate"](reciprocalTurnAngle, centroid);
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
        graphicHeight : laneDisplayBoxConfiguration.graphicHeight,
        graphicWidth : laneDisplayBoxConfiguration.graphicWidth,
        fillColor : "#26bae8",
        bgcolor : "#26bae8",
        color : "#26bae8",
        rotation : turnAngle,
        backgroundGraphic : wazeFont,
        backgroundHeight : laneDisplayBoxConfiguration.graphicHeight * _0x4e547b.y,
        backgroundWidth : laneDisplayBoxConfiguration.graphicWidth * _0x4e547b.x,
        backgroundXOffset : _0x43b459.x,
        backgroundYOffset : _0x43b459.y,
      },
          _0x3f212b = new OpenLayers.Feature.Vector(_0x5001ff, null, _0x140285);
      LTLaneGraphics.addFeatures([ _0x3f212b ]);
      _0xe41aaa++;
    });
    LTLaneGraphics.setZIndex(600);
  }

  function getLaneDisplayBoxObjectConfig() {
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
        (boxDisplayObject.start = 0xf);
        (boxDisplayObject.boxheight = 0x50);
        (boxDisplayObject.boxincwidth = 0x37);
        (boxDisplayObject.iconbordermargin = 0x2);
        (boxDisplayObject.iconborderheight = 0x4e);
        (boxDisplayObject.iconborderwidth = 0x35);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 15:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 0x78);
        (boxDisplayObject.boxincwidth = 90);
        (boxDisplayObject.iconbordermargin = 0x3);
        (boxDisplayObject.iconborderheight = 117);
        (boxDisplayObject.iconborderwidth = 0x57);
        (boxDisplayObject.graphicHeight = 0x2a);
        boxDisplayObject.graphicWidth = 0x19;
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
      switch (W.map.getOLMap().getZoom()) {
      case 0xa:
        (boxDisplayObject.start = 0.5);
        (boxDisplayObject.boxheight = 1.7);
        (boxDisplayObject.boxincwidth = 1.1);
        (boxDisplayObject.iconbordermargin = 0.1);
        (boxDisplayObject.iconborderheight = 1.6);
        (boxDisplayObject.iconborderwidth = 0x1);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 0x9:
        (boxDisplayObject.start = 0x1);
        (boxDisplayObject.boxheight = 3.2);
        (boxDisplayObject.boxincwidth = 2.2);
        (boxDisplayObject.iconbordermargin = 0.2);
        (boxDisplayObject.iconborderheight = 0x3);
        (boxDisplayObject.iconborderwidth = 0x2);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 0x8:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 5.2);
        (boxDisplayObject.boxincwidth = 3.8);
        (boxDisplayObject.iconbordermargin = 0.3);
        (boxDisplayObject.iconborderheight = 4.9);
        (boxDisplayObject.iconborderwidth = 3.5);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 0x7:
        (boxDisplayObject.start = 0x3);
        (boxDisplayObject.boxheight = 0xa);
        (boxDisplayObject.boxincwidth = 7.2);
        (boxDisplayObject.iconbordermargin = 0.4);
        (boxDisplayObject.iconborderheight = 9.6);
        (boxDisplayObject.iconborderwidth = 6.8);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 0x6:
        (boxDisplayObject.start = 0x6);
        (boxDisplayObject.boxheight = 0x14);
        (boxDisplayObject.boxincwidth = 0xe);
        (boxDisplayObject.iconbordermargin = 0.5);
        (boxDisplayObject.iconborderheight = 19.5);
        (boxDisplayObject.iconborderwidth = 13.5);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 0x5:
        (boxDisplayObject.start = 0xa);
        (boxDisplayObject.boxheight = 0x28);
        (boxDisplayObject.boxincwidth = 0x1d);
        (boxDisplayObject.iconbordermargin = 0x1);
        (boxDisplayObject.iconborderheight = 0x26);
        (boxDisplayObject.iconborderwidth = 0x1b);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 0x4:
        (boxDisplayObject.start = 0xf);
        (boxDisplayObject.boxheight = 0x50);
        (boxDisplayObject.boxincwidth = 0x37);
        (boxDisplayObject.iconbordermargin = 0x2);
        (boxDisplayObject.iconborderheight = 0x4e);
        (boxDisplayObject.iconborderwidth = 0x35);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 0x3:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 0x78);
        (boxDisplayObject.boxincwidth = 90);
        (boxDisplayObject.iconbordermargin = 0x3);
        (boxDisplayObject.iconborderheight = 0x75);
        (boxDisplayObject.iconborderwidth = 0x57);
        (boxDisplayObject.graphicHeight = 0x2a);
        (boxDisplayObject.graphicWidth = 0x19);
        break;
      case 0x2:
        (boxDisplayObject.start = 0x2);
        (boxDisplayObject.boxheight = 5.2);
        (boxDisplayObject.boxincwidth = 3.8);
        (boxDisplayObject.iconbordermargin = 0.3);
        (boxDisplayObject.iconborderheight = 4.9);
        (boxDisplayObject.iconborderwidth = 3.5);
        (boxDisplayObject.graphicHeight = 0x2a);
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

  function displayLaneGraphics() {
    removeLaneGraphics();
    const features = W.selectionManager.getSelectedFeatures();
    if (!getId("lt-ScriptEnabled").checked || !getId("lt-IconsEnable").checked || features.length !== 0x1 ||
        features[0x0].attributes.wazeFeature._wmeObject.type !== "segment")
      return;
    const wmeObject = features[0x0].attributes.wazeFeature._wmeObject, currentZoomLevel = W.map.getOLMap().getZoom();
    if ((wmeObject.attributes.roadType !== 0x3 && wmeObject.attributes.roadType !== 0x6 &&
         wmeObject.attributes.roadType !== 0x7 && currentZoomLevel < 0x10) ||
        currentZoomLevel < 0xf)
      return;
    let _0x2d2a03 = wmeObject.attributes.fwdLaneCount > 0x0
                        ? _0x5694f9($(".fwd-lanes").find(".lane-arrow").map(function() { return this; }).get())
                        : false,
        _0x154122 = wmeObject.attributes.revLaneCount > 0x0
                        ? _0x5694f9($(".rev-lanes").find(".lane-arrow").map(function() { return this; }).get())
                        : false;

    let _0x5dea5f = _0x2d2a03 !== false ? _0x4db382(_0x2d2a03) : false,
        _0x326722 = _0x154122 !== false ? _0x4db382(_0x154122) : false;
    _0x2d2a03 && _0x19644c(W.model.nodes.getObjectById(wmeObject.attributes.toNodeID), wmeObject, _0x5dea5f);
    _0x154122 && _0x19644c(W.model.nodes.getObjectById(wmeObject.attributes.fromNodeID), wmeObject, _0x326722);
  }

  laneToolsBootstrap();
  while (true) {
    try {
      const exitCode =
          -parseInt("116729CFFamr") + -parseInt("1006486hQNMjC") / 0x2 +
          (-parseInt("21lOwPjv") / 0x3) * (parseInt("246188fslQvy") / 0x4) + -parseInt("2546485hRBZxR") / 0x5 +
          (parseInt("695094iWfXcp") / 0x6) * (-parseInt("7CccpnK") / 0x7) +
          (parseInt("155432OeGIQS") / 0x8) * (-parseInt("396CKTurr") / 0x9) + parseInt("30770070DOGVeo") / 0xa;
      if (exitCode === 546184)
        break;
    } catch (ex) {
    }
  }
})();
