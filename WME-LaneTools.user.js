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
// @grant        none
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// ==/UserScript==

(function main() {
  "use strict";
  const stringArrayRef = getStringArray();

  const constantStrings = {
    divStr: "<div>",
    checkedStr: "checked",
    mapTag: "#map",
    htmlStr: "html",
  };
  const LANETOOLS_VERSION = "" + GM_info.script.version,
    GF_LINK = getString(0x41e),
    FORUM_LINK = "https://www.waze.com/forum/viewtopic.php?f=819&t=30115",
    LI_UPDATE_NOTES = getString(611),
    LANETOOLS_DEBUG_LEVEL = 0x1,
    configArray = {},
    RBSArray = { failed: false },
    // IsBeta = location[getString(0x257)][getString(0x3bc)](getString(0x46e)) !== -0x1,
    TRANSLATIONS = {
      default: {
        enabled: "Enabled",
        disabled: "Disabled",
        toggleShortcut: "Toggle\x20Shortcut",
        UIEnhance: "Tab\x20UI\x20Enhancements",
        autoWidth: "Auto-open\x20road\x20width",
        autoOpen: "Auto-open\x20lanes\x20tab",
        autoExpand: "Auto-expand\x20lane\x20editor",
        autoFocus: "Auto-focus\x20lane\x20input",
        reOrient: "Re-orient\x20lane\x20icons",
        enClick: "Enable\x20ClickSaver",
        clickStraight: "All\x20straight\x20lanes",
        clickTurn: "default",
        mapHighlight: "Map\x20Highlights",
        laneLabel: "Lane\x20labels",
        nodeHigh: "Node\x20Highlights",
        LAOHigh: "Lane\x20angle\x20overrides",
        CSOHigh: "Continue\x20straight\x20overrides",
        heuristics: "Lane\x20heuristics\x20candidates",
        posHeur: "Positive\x20heuristics\x20candidate",
        negHeur: "Negative\x20heuristics\x20candidate",
        highColor: "Highlight\x20Colors",
        colTooltip: "Click\x20to\x20toggle\x20color\x20inputs",
        selAllTooltip: "Click\x20on\x20turn\x20name\x20to\x20toggle\x20all\x20lane\x20associations",
        fwdCol: "Fwd\x20(A>B)",
        revCol: "Rev\x20(B>A)",
        labelCol: "Labels",
        errorCol: "Lane\x20errors",
        laneNodeCol: "Nodes\x20with\x20lanes",
        nodeTIOCol: "Nodes\x20with\x20TIOs",
        LAOCol: "Segs\x20with\x20TIOs",
        viewCSCol: "View\x20only\x20CS",
        hearCSCol: "View\x20and\x20hear\x20CS",
        heurPosCol: "Lane\x20heuristics\x20likely",
        heurNegCol: "Lane\x20heuristics\x20-\x20not\x20qualified",
        advTools: "Advance\x20Tools",
        quickTog: "Quick\x20toggle\x20all\x20lanes",
        showRBS: "Use\x20RBS\x20heuristics",
        delFwd: "Delete\x20FWD\x20Lanes",
        delRev: "Delete\x20Rev\x20Lanes",
        delOpp:
          "This\x20segment\x20is\x20one-way\x20but\x20has\x20lanes\x20set\x20in\x20the\x20opposite\x20direction.\x20Click\x20here\x20to\x20delete\x20them",
        csIcons: getString(0x43e),
        highlightOverride: "Only\x20highlight\x20if\x20segment\x20layer\x20active",
        addTIO: "Include\x20TIO\x20in\x20lanes\x20tab",
        labelTIO: "TIO",
        defaultTIO: "Waze\x20Selected",
        noneTIO: "None",
        tlTIO: "Turn\x20Left",
        trTIO: "Turn\x20Right",
        klTIO: "Keep\x20Left",
        krTIO: "Keep\x20Right",
        conTIO: "Continue",
        elTIO: "Exit\x20Left",
        erTIO: "Exit\x20Right",
        uturnTIO: "U-Turn",
        enIcons: "Display\x20lane\x20icons\x20on\x20map",
        IconsRotate: "IconsRotate",
      },
    },
    Direction = { REVERSE: -1, ANY: 0, FORWARD: 1 },
    LT_ROAD_TYPE = {
      NARROW_STREET: 22,
      STREET: 1,
      PRIMARY_STREET: 2,
      RAMP: 4,
      FREEWAY: 3,
      MAJOR_HIGHWAY: 6,
      MINOR_HIGHWAY: 7,
      DIRT_ROAD: 8,
      FERRY: 14,
      PRIVATE_ROAD: 17,
      PARKING_LOT_ROAD: 20,
      WALKING_TRAIL: 5,
      PEDESTRIAN_BOARDWALK: 10,
      STAIRWAY: 16,
      RAILROAD: 18,
      RUNWAY: 19,
    },
    DisplayLevels = { MIN_ZOOM_ALL: 14, MIN_ZOOM_NONFREEWAY: 17 },
    HeuristicsCandidate = { ERROR: -2, FAIL: -1, NONE: 0, PASS: 1 };
  let MAX_LEN_HEUR,
    MAX_PERP_DIF,
    MAX_PERP_DIF_ALT,
    MAX_PERP_TO_CONSIDER,
    MAX_STRAIGHT_TO_CONSIDER,
    MAX_STRAIGHT_DIF,
    lt_scanArea_recursive = 0x0,
    LtSettings = {},
    strings = {},
    _turnInfo = [],
    _turnData = {},
    laneCount,
    LTHighlightLayer,
    LTNamesLayer,
    LTLaneGraphics,
    _pickleColor,
    seaPickle,
    UpdateObj,
    MultiAction,
    SetTurn,
    shortcutsDisabled = false,
    isRBS = false,
    allowCpyPst = false,
    langLocality = "default",
    UPDATEDZOOM;
  console.log("LaneTools:\x20initializing...");

  function laneToolsBootstrap(bootStrapAttempt = 0x0) {
    if (W && W.map && W.model && W.loginManager.user && $ && WazeWrap.Ready) initLaneTools();
    else
      bootStrapAttempt < 500
        ? setTimeout(() => {
            laneToolsBootstrap(bootStrapAttempt++);
          }, 200)
        : console.error("LaneTools:\x20Failed\x20to\x20load");
  }

  function initLaneTools() {
    (seaPickle = W.loginManager.user),
      (UpdateObj = require("Waze/Action/UpdateObject")),
      (MultiAction = require("Waze/Action/MultiAction")),
      (SetTurn = require("Waze/Model/Graph/Actions/SetTurn")),
      (UPDATEDZOOM = W.map.getOLMap().getZoom() === 23);
    const ltCSSClasses = [
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
    message.html(
      [
        "<div\x20class=\x27lt-Toolbar-Container\x27\x20id=\x22lt-toolbar-container\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-Toolbar-Wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-toolbar-button-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20type=\x27button\x27\x20class=\x27lt-toolbar-button\x27\x20id=\x27copyA-button\x27>Copy\x20A</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-toolbar-button-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20type=\x27button\x27\x20class=\x27lt-toolbar-button\x27\x20id=\x27copyB-button\x27>Copy\x20B</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-toolbar-button-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20type=\x27button\x27\x20class=\x27lt-toolbar-button\x27\x20id=\x27pasteA-button\x27>Paste\x20A</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-toolbar-button-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20type=\x27button\x27\x20class=\x27lt-toolbar-button\x27\x20id=\x27pasteB-button\x27>Paste\x20B</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>",
      ].join("\x20")
    );
    seaPickle = W.loginManager.user;
    _pickleColor = seaPickle["rank"];
    _pickleColor >= 0x0
      ? (WazeWrap.Interface.LtSettings("LT", initMsg.html, setupOptions, "LT"),
        $("<style\x20type=\x22text/css\x22>" + ltCSSClasses + "</style>").appendTo("head"),
        $(constantStrings.mapTag).append(message.html()),
        WazeWrap.Interface.ShowScriptUpdate(
          GM_info.script.name,
          GM_info.script.version,
          LI_UPDATE_NOTES,
          GF_LINK,
          FORUM_LINK
        ),
        console.log("LaneTools:\x20Loaded"))
      : console.error("LaneTools:\x20loading\x20error....");
  }

  async function setupOptions() {
    function processOptionSettings() {
      setSetting("lt-ScriptEnabled", LtSettings.ScriptEnabled),
        setSetting("lt-UIEnable", LtSettings.UIEnable),
        setSetting("lt-AutoOpenWidth", LtSettings.AutoOpenWidth),
        setSetting("lt-AutoExpandLanes", LtSettings.AutoExpandLanes),
        setSetting("lt-AutoLanesTab", LtSettings.AutoLanesTab),
        setSetting("lt-HighlightsEnable", LtSettings.HighlightsEnable),
        setSetting("lt-LabelsEnable", LtSettings.LabelsEnable),
        setSetting("lt-NodesEnable", LtSettings.NodesEnable),
        setSetting("lt-LIOEnable", LtSettings.LIOEnable),
        setSetting("lt-CSEnable", LtSettings.CSEnable),
        setSetting("lt-highlightOverride", LtSettings.highlightOverride),
        setSetting("lt-CopyEnable", LtSettings.CopyEnable),
        setSetting("lt-SelAllEnable", LtSettings.SelAllEnable),
        setSetting("lt-serverSelect", LtSettings.serverSelect),
        setSetting("lt-AutoFocusLanes", LtSettings.AutoFocusLanes),
        setSetting("lt-ReverseLanesIcon", LtSettings.ReverseLanesIcon),
        setSetting("lt-ClickSaveEnable", LtSettings.ClickSaveEnable),
        setSetting("lt-ClickSaveStraight", LtSettings.ClickSaveStraight),
        setSetting("lt-ClickSaveTurns", LtSettings.ClickSaveTurns),
        setSetting("lt-LaneHeurPosHighlight", LtSettings.LaneHeurPosHighlight),
        setSetting("lt-LaneHeurNegHighlight", LtSettings.LaneHeurNegHighlight),
        setSetting("lt-LaneHeuristicsChecks", LtSettings.LaneHeuristicsChecks),
        setSetting("lt-highlightCSIcons", LtSettings.highlightCSIcons),
        setSetting("lt-AddTIO", LtSettings.addTIO),
        setSetting("lt-IconsEnable", LtSettings.IconsEnable),
        setSetting("lt-IconsRotate", LtSettings.IconsRotate),
        setCSSBorder("lt-ABColor", LtSettings.ABColor),
        setCSSBorder("lt-BAColor", LtSettings.BAColor),
        setCSSBorder("lt-LabelColor", LtSettings.LabelColor),
        setCSSBorder("lt-ErrorColor", LtSettings.ErrorColor),
        setCSSBorder("lt-NodeColor", LtSettings.NodeColor),
        setCSSBorder("lt-TIOColor", LtSettings.TIOColor),
        setCSSBorder("lt-LIOColor", LtSettings.LIOColor),
        setCSSBorder("lt-CS1Color", LtSettings.CS1Color),
        setCSSBorder("lt-CS2Color", LtSettings.CS2Color),
        setCSSBorder("lt-HeurColor", LtSettings.HeurColor),
        setCSSBorder("lt-HeurFailColor", LtSettings.HeurFailColor);
      !getId("lt-ClickSaveEnable").checked && $("#lt-ClickSaveEnable").hide();
      !getId("lt-UIEnable").checked && $("#lt-UI-wrapper").hide();
      !getId("lt-HighlightsEnable").checked && $("#lt-highlights-wrapper").hide();
      !getId("lt-LaneHeuristicsChecks").checked && $("#lt-heur-wrapper").hide();
      function setSetting(propertyID, propertyValue) {
        $("#" + propertyID).prop("checked", propertyValue);
      }
      function setCSSBorder(idName, value) {
        const idSelector = $("#" + idName);
        idSelector.attr("value", value), idSelector.css("border", "2px\x20solid" + value);
      }
    }
    await loadSettings(),
      await loadSpreadsheet(),
      initLaneGuidanceClickSaver(),
      (LTHighlightLayer = new OpenLayers.Layer.Vector("LTHighlightLayer", { uniqueName: "_LTHighlightLayer" })),
      W.map.addLayer(LTHighlightLayer),
      LTHighlightLayer.setVisibility(true),
      (LTLaneGraphics = new OpenLayers.Layer.Vector("LTLaneGraphics", { uniqueName: "LTLaneGraphics" })),
      W.map.addLayer(LTLaneGraphics),
      LTLaneGraphics.setVisibility(true);
    const style_map = new OpenLayers["Style"]({
      fontFamily: "Open Sans, Alef, helvetica, sans-serif, monospace",
      labelOutlineColor: "black",
      fontColor: "${labelColor}",
      fontSize: "16",
      labelXOffset: 0xf,
      labelYOffset: -0xf,
      labelOutlineWidth: "3",
      label: "${labelText}",
      angle: "",
      labelAlign: "cm",
      "stroke-width": "0",
    });
    (LTNamesLayer = new OpenLayers.Layer.Vector("LTNamesLayer", {
      uniqueName: "LTNamesLayer",
      styleMap: new OpenLayers.StyleMap(style_map),
    })),
      W.map.addLayer(LTNamesLayer),
      LTNamesLayer.setVisibility(true),
      WazeWrap.Events.register("moveend", null, scanArea),
      WazeWrap.Events.register("moveend", null, displayLaneGraphics),
      WazeWrap.Events.register("zoomend", null, scanArea),
      WazeWrap.Events.register("zoomend", null, displayLaneGraphics),
      WazeWrap.Events.register("afteraction", null, scanArea),
      WazeWrap.Events.register("afteraction", null, lanesTabSetup),
      WazeWrap.Events.register("afteraction", null, displayLaneGraphics),
      WazeWrap.Events.register("afterundoaction", null, scanArea),
      WazeWrap.Events.register("afterundoaction", null, lanesTabSetup),
      WazeWrap.Events.register("afterundoaction", null, displayLaneGraphics),
      WazeWrap.Events.register("afterclearactions", null, scanArea),
      WazeWrap.Events.register("selectionchanged", null, scanArea),
      WazeWrap.Events.register("selectionchanged", null, lanesTabSetup),
      WazeWrap.Events.register("selectionchanged", null, displayLaneGraphics),
      WazeWrap.Events.register(getString(0x414), null, scanArea);
    try {
      new WazeWrap.Interface.Shortcut(
        "enableHighlights",
        "Toggle\x20lane\x20highlights",
        "wmelt",
        "Lane\x20Tools",
        LtSettings["enableHighlights"],
        toggleHighlights,
        null
      ).add();
      new WazeWrap.Interface.Shortcut(
        "enableUIEnhancements",
        "Toggle\x20UI\x20enhancements",
        "wmelt",
        "Lane\x20Tools",
        LtSettings["enableUIEnhancements"],
        toggleUIEnhancements,
        null
      ).add();
      new WazeWrap.Interface.Shortcut(
        "enableHeuristics",
        "Toggle\x20heuristic\x20highlights",
        "wmelt",
        "Lane\x20Tools",
        LtSettings["enableHeuristics"],
        toggleLaneHeuristicsChecks,
        null
      ).add();
      new WazeWrap.Interface.Shortcut(
        "enableScript",
        "Toggle\x20script",
        "wmelt",
        "Lane\x20Tools",
        LtSettings["enableScript"],
        toggleScript,
        null
      ).add();
    } catch (err) {
      console.log("LT\x20Error\x20creating\x20shortcuts.\x20This\x20feature\x20will\x20be\x20disabled."),
        $("#lt-EnableShortcut").text("" + TRANSLATIONS.default.disabled),
        $("#lt-HighlightShortcut").text("" + TRANSLATIONS.default.disabled),
        $("#lt-UIEnhanceShortcut").text("" + TRANSLATIONS.default.disabled),
        $("#lt-LaneHeurChecksShortcut").text("" + TRANSLATIONS.default.disabled),
        (shortcutsDisabled = true);
    }
    const highlightsEnabledID = $("#lt-HighlightsEnable"),
      colorTitleID = $("#lt-color-title"),
      laneHeuristicsChecksID = $("#lt-LaneHeuristicsChecks");
    processOptionSettings();
    setTimeout(() => {
      updateShortcutLabels();
    }, 50);
    setHeuristics();
    setTranslations();
    if (_pickleColor > 0x1) {
      let ltEnabledFeatures = "LaneTools:\x20The\x20following\x20special\x20access\x20features\x20are\x20enabled:\x20";
      $("#lt-adv-tools").css("display", "block");
      $("#lt-trans-quickTog").attr(getString(0x3f4), "" + strings[getString(0x466)]);
      $("#lt-trans-quickTog").tooltip();
      _.each(RBSArray, (argument) => {
        argument[0x0] === seaPickle["userName"] &&
          (argument[0x1] === "1" && (isRBS = true), argument[0x2] === "1" && (allowCpyPst = true));
      });
      isRBS && ($("#lt-serverSelectContainer").css("display", "block"), (ltEnabledFeatures += "RBS\x20Heuristics"));
      allowCpyPst &&
        ($("#lt-sheet-link").css({ display: "block", margin: "2px" }),
        $("#lt-sheet-link > a").css({
          padding: "2px",
          border: "2px\x20solid\x20black",
          "border-radius": "6px",
          "text-decoration": "none",
        }),
        $("#lt-sheet-link\x20>\x20a").hover(
          function () {
            $(this).css("background-color", "orange");
          },
          function () {
            $(this).css("background-color", "#eeeeee");
          }
        ),
        $(".lt-toolbar-button").click(function () {
          $(this)[0x0].id === "copyA-button" && copyLaneInfo("A"),
            $(this)[0x0].id === "copyB-button" && copyLaneInfo("B"),
            $(this)[0x0].id === "pasteA-button" && pasteLaneInfo("A"),
            $(this)[0x0].id === "pasteB-button" && pasteLaneInfo("B");
        }),
        (ltEnabledFeatures = isRBS ? ltEnabledFeatures + ",\x20Copy/Paste" : ltEnabledFeatures + "Copy/Paste")),
        (isRBS || allowCpyPst) && console.log(ltEnabledFeatures);
    } else {
      $("#lt-LaneTabFeatures").css("display", "none");
    }
    $(".lt-checkbox").click(function () {
      let settingName = $(this)[0x0].id.substr(0x3);
      (LtSettings[settingName] = this.checked), saveSettings();
    });
    $(".lt-color-input").change(function () {
      let color_input = $(this)[0].id.substr(3);
      LtSettings[color_input] = this["value"];
      saveSettings();
      $("#lt-" + color_input).css("border", "2px\x20solid" + this["value"]);
      removeHighlights();
      scanArea();
    });
    $("#lt-ScriptEnabled").click(() => {
      getId("lt-ScriptEnabled").checked ? scanArea() : (removeHighlights(), removeLaneGraphics());
    });
    highlightsEnabledID.click(() => {
      getId("lt-HighlightsEnable").checked ? scanArea() : removeHighlights(), scanArea();
    });
    $("#lt-LabelsEnable").click(() => {
      getId("lt-LabelsEnable").checked ? scanArea() : (removeHighlights(), scanArea());
    });
    $("#lt-NodesEnable").click(() => {
      getId("lt-NodesEnable").checked ? scanArea() : (removeHighlights(), scanArea());
    });
    $("#lt-LIOEnable").click(() => {
      getId("lt-LIOEnable").checked ? scanArea() : (removeHighlights(), scanArea());
    });
    $("#lt-IconsEnable").click(() => {
      getId("lt-IconsEnable").checked ? displayLaneGraphics() : removeLaneGraphics();
    });
    $("#lt-highlightOverride").click(() => {
      getId("lt-highlightOverride").checked ? scanArea() : (removeHighlights(), scanArea());
    });
    colorTitleID.click(() => {
      $("#lt-color-inputs").toggle();
    });
    $("#lt-ClickSaveEnable").click(() => {
      $(".lt-option-container.clk-svr").toggle();
    });
    $("#lt-UIEnable").click(() => {
      $("#lt-UI-wrapper").toggle(), removeLaneGraphics();
    });
    highlightsEnabledID.click(() => {
      $("#lt-highlights-wrapper").toggle();
    });
    laneHeuristicsChecksID.click(() => {
      $("#lt-heur-wrapper").toggle();
    });
    laneHeuristicsChecksID.click(() => {
      getId("lt-LaneHeuristicsChecks").checked ? scanArea() : (removeHighlights(), scanArea());
    });
    $("#lt-LaneHeurPosHighlight").click(() => {
      getId("lt-LaneHeurPosHighlight").checked ? scanArea() : (removeHighlights(), scanArea());
    });
    $("#lt-LaneHeurNegHighlight").click(() => {
      getId("lt-LaneHeurNegHighlight").checked ? scanArea() : (removeHighlights(), scanArea());
    });
    $("#lt-serverSelect").click(() => {
      setHeuristics();
      removeHighlights();
      scanArea();
    });
    $.fn.hide = function () {
      return this["trigger"]("hide"), $.fn.hide.apply(this, arguments);
    };
    $("#keyboard-dialog")["on"]("hide", () => {
      checkShortcutsChanged();
    });
    colorTitleID.tooltip();
  }
  async function loadSettings() {
    const getString = getString,
      _0x1a5064 = $[getString(0x267)](localStorage[getString(0x366)](getString(0x2a2))),
      _0x2414f3 = await WazeWrap[getString(0x3bf)][getString(0x33d)]("LT_Settings");
    !_0x2414f3 && console[getString(0x32b)](getString(0x2b3));
    const _0x483de2 = {
      lastSaveAction: 0x0,
      ScriptEnabled: true,
      UIEnable: true,
      AutoOpenWidth: ![],
      AutoExpandLanes: ![],
      AutoLanesTab: ![],
      HighlightsEnable: true,
      LabelsEnable: true,
      NodesEnable: true,
      ABColor: getString(0x276),
      BAColor: getString(0x3b0),
      LabelColor: "#FFAD08",
      ErrorColor: getString(0x29b),
      NodeColor: getString(0x425),
      TIOColor: "#ff9900",
      LIOColor: getString(0x350),
      CS1Color: getString(0x361),
      CS2Color: getString(0x289),
      HeurColor: getString(0x458),
      HeurFailColor: getString(0x232),
      CopyEnable: ![],
      SelAllEnable: ![],
      serverSelect: ![],
      LIOEnable: true,
      CSEnable: true,
      AutoFocusLanes: true,
      ReverseLanesIcon: ![],
      ClickSaveEnable: true,
      ClickSaveStraight: ![],
      ClickSaveTurns: true,
      enableScript: "",
      enableHighlights: "",
      enableUIEnhancements: "",
      enableHeuristics: "",
      LaneHeurNegHighlight: ![],
      LaneHeurPosHighlight: ![],
      LaneHeuristicsChecks: ![],
      highlightCSIcons: ![],
      highlightOverride: true,
      AddTIO: ![],
      IconsEnable: true,
      IconsRotate: true,
    };
    LtSettings = $[getString(0x3dd)]({}, _0x483de2, _0x1a5064);
    if (_0x2414f3 && _0x2414f3["lastSaveAction"] > LtSettings[getString(0x419)]) $["extend"](LtSettings, _0x2414f3);
    else {
    }
    Object[getString(0x47d)](_0x483de2)[getString(0x357)]((_0x5404e3) => {
      const _0x51067f = getString;
      !LtSettings[_0x51067f(0x403)](_0x5404e3) && (LtSettings[_0x5404e3] = _0x483de2[_0x5404e3]);
    });
  }
  async function saveSettings() {
    const {
        ScriptEnabled: _0x2da5e1,
        HighlightsEnable: _0x745c7a,
        LabelsEnable: _0x36baff,
        NodesEnable: _0x3e8deb,
        UIEnable: _0x5e8779,
        AutoLanesTab: _0x223b60,
        AutoOpenWidth: _0x43ad59,
        AutoExpandLanes: _0x5951ee,
        ABColor: _0x20a7e4,
        BAColor: _0x37127d,
        LabelColor: _0x178529,
        ErrorColor: _0x4b7321,
        NodeColor: _0x36f178,
        TIOColor: _0x211d6c,
        LIOColor: _0xa024a4,
        CS1Color: _0x270556,
        CS2Color: _0x526320,
        CopyEnable: _0x34b214,
        SelAllEnable: _0xb763db,
        serverSelect: _0x1af807,
        LIOEnable: _0x22a8dc,
        CSEnable: _0x127a42,
        AutoFocusLanes: _0x12cefc,
        ReverseLanesIcon: _0x55ecb0,
        ClickSaveEnable: _0x282cb6,
        ClickSaveStraight: _0x258aa9,
        ClickSaveTurns: _0xd8d0f0,
        enableScript: _0x1becb4,
        enableHighlights: _0x814add,
        enableUIEnhancements: _0x198071,
        enableHeuristics: _0x210674,
        HeurColor: _0x325a53,
        HeurFailColor: _0x2d11e5,
        LaneHeurPosHighlight: _0x3b18b7,
        LaneHeurNegHighlight: _0x5560e4,
        LaneHeuristicsChecks: _0x5f21ec,
        highlightCSIcons: _0x430a83,
        highlightOverride: _0x175645,
        AddTIO: _0x3cc839,
        IconsEnable: _0x2b4c31,
        IconsRotate: _0x3b2352,
      } = LtSettings,
      _0x5bc4fe = {
        lastSaveAction: Date["now"](),
        ScriptEnabled: _0x2da5e1,
        HighlightsEnable: _0x745c7a,
        LabelsEnable: _0x36baff,
        NodesEnable: _0x3e8deb,
        UIEnable: _0x5e8779,
        AutoOpenWidth: _0x43ad59,
        AutoLanesTab: _0x223b60,
        AutoExpandLanes: _0x5951ee,
        ABColor: _0x20a7e4,
        BAColor: _0x37127d,
        LabelColor: _0x178529,
        ErrorColor: _0x4b7321,
        NodeColor: _0x36f178,
        TIOColor: _0x211d6c,
        LIOColor: _0xa024a4,
        CS1Color: _0x270556,
        CS2Color: _0x526320,
        CopyEnable: _0x34b214,
        SelAllEnable: _0xb763db,
        serverSelect: _0x1af807,
        LIOEnable: _0x22a8dc,
        CSEnable: _0x127a42,
        AutoFocusLanes: _0x12cefc,
        ReverseLanesIcon: _0x55ecb0,
        ClickSaveEnable: _0x282cb6,
        ClickSaveStraight: _0x258aa9,
        ClickSaveTurns: _0xd8d0f0,
        enableScript: _0x1becb4,
        enableHighlights: _0x814add,
        enableUIEnhancements: _0x198071,
        enableHeuristics: _0x210674,
        HeurColor: _0x325a53,
        HeurFailColor: _0x2d11e5,
        LaneHeurPosHighlight: _0x3b18b7,
        LaneHeurNegHighlight: _0x5560e4,
        LaneHeuristicsChecks: _0x5f21ec,
        highlightCSIcons: _0x430a83,
        highlightOverride: _0x175645,
        AddTIO: _0x3cc839,
        IconsEnable: _0x2b4c31,
        IconsRotate: _0x3b2352,
      };
    for (const _0x3c89a5 in W[getString(0x2ab)]["Actions"]) {
      const { shortcut: _0x2783a6, group: _0x5e73d9 } = W[getString(0x2ab)][getString(0x265)][_0x3c89a5];
      if (_0x5e73d9 === getString(0x339)) {
        let _0x413fe0 = "";
        _0x2783a6
          ? (_0x2783a6[getString(0x3fd)] === true && (_0x413fe0 += "A"),
            _0x2783a6["shiftKey"] === true && (_0x413fe0 += "S"),
            _0x2783a6[getString(0x21c)] === true && (_0x413fe0 += "C"),
            _0x413fe0 !== "" && (_0x413fe0 += "+"),
            _0x2783a6[getString(0x1ea)] && (_0x413fe0 += _0x2783a6[getString(0x1ea)]))
          : (_0x413fe0 = "-1"),
          (_0x5bc4fe[_0x3c89a5] = _0x413fe0);
      }
    }
    LtSettings = _0x5bc4fe;
    localStorage && localStorage["setItem"](getString(0x2a2), JSON[getString(0x25a)](_0x5bc4fe));
    const _0x6edf6 = await WazeWrap[getString(0x3bf)][getString(0x33c)]("LT_Settings", _0x5bc4fe);
    _0x6edf6 === null
      ? console[getString(0x2ae)](getString(0x302))
      : _0x6edf6 === ![] && console["error"](getString(0x236));
  }
  async function loadSpreadsheet() {
    let _0x4d1b99 = false;
    const spreadsheetID = "AIzaSyDZjmkSx5xWc-86hsAIzedgDgRgy8vB7BQ",
      _0x2a0637 = (_0x135a7d, _0x3e3ad5, _0x5d931b) => {
        console.error("LaneTools: Error loading settings:", _0x5d931b);
      },
      _0x283eac = (_0x2d5151, _0x4e197b, _0x4cc7f4) => {
        console[getString(0x32b)](getString(0x44c), _0x4cc7f4),
          !RBSArray[getString(0x40a)] &&
            (WazeWrap[getString(0x46a)][getString(0x32b)](GM_info.script[getString(0x412)], getString(0x1f3)),
            (RBSArray[getString(0x40a)] = true));
      },
      _0x4f837b = (_0x4e546b, _0x559463, _0x2eb7ed) => {
        const _0x2c7900 = getString;
        console[_0x2c7900(0x32b)](_0x2c7900(0x2f1), _0x2eb7ed);
      };
    try {
      await $["getJSON"](
        "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Translations!A2:C?key=" +
          spreadsheetID
      )
        ["done"](async (_0xa6fa70) => {
          _0xa6fa70[getString(0x24d)][getString(0x408)] > 0x0
            ? _[getString(0x3e2)](_0xa6fa70[getString(0x24d)], (_0x1f6053) => {
                const _0x5ab21b = getString;
                !TRANSLATIONS[_0x1f6053[0x1]] &&
                  Number[_0x5ab21b(0x320)](_0x1f6053[0x2], 0xa) === 0x1 &&
                  (TRANSLATIONS[_0x1f6053[0x1]] = JSON[_0x5ab21b(0x2f0)](_0x1f6053[0x0]));
              })
            : _0x4f837b();
        })
        ["fail"](_0x4f837b);
    } catch (_0x20eeab) {
      _0x4f837b(null, null, _0x20eeab);
    }
    try {
      await $[getString(0x28d)](getString(0x3cb) + spreadsheetID)
        [getString(0x47a)]((_0x27c1b9) => {
          const _0x5c0b99 = getString;
          _0x27c1b9["values"][_0x5c0b99(0x408)] > 0x0
            ? (_[_0x5c0b99(0x3e2)](_0x27c1b9["values"], (_0x1e3c4a) => {
                !configArray[_0x1e3c4a[0x1]] && (configArray[_0x1e3c4a[0x1]] = JSON["parse"](_0x1e3c4a[0x0]));
              }),
              (_0x4d1b99 = true))
            : _0x2a0637();
        })
        [getString(0x200)](_0x2a0637);
    } catch (_0x54f45f) {
      _0x2a0637(null, null, _0x54f45f);
    }
    try {
      await $[getString(0x28d)](
        "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/RBS_Access!A2:C?key=" +
          spreadsheetID
      )
        ["done"]((_0xc4656a) => {
          const _0x14f41f = getString;
          if (_0xc4656a["values"][_0x14f41f(0x408)] > 0x0) {
            for (let _0x1ca942 = 0x0; _0x1ca942 < _0xc4656a[_0x14f41f(0x24d)][_0x14f41f(0x408)]; _0x1ca942++) {
              RBSArray[_0x1ca942] = _0xc4656a[_0x14f41f(0x24d)][_0x1ca942];
            }
            RBSArray[_0x14f41f(0x40a)] = ![];
          } else _0x283eac();
        })
        [getString(0x200)](_0x283eac);
    } catch (_0x6e77b8) {
      _0x283eac(null, null, _0x6e77b8);
    }
    _0x4d1b99 &&
      _["each"](configArray, (_0x28373e) => {
        const _0x324735 = getString;
        for (const _0x13fab4 in _0x28373e) {
          if (_0x28373e["hasOwnProperty"](_0x13fab4)) {
            let _0x5097d4 = _0x28373e[_0x13fab4];
            _0x28373e[_0x13fab4] = Number[_0x324735(0x30b)](_0x5097d4);
          }
        }
      });
  }
  function setTranslations() {
    const getString = getString;
    langLocality = I18n["currentLocale"]()[getString(0x467)]();
    if (TRANSLATIONS[langLocality]) strings = TRANSLATIONS[langLocality];
    else
      langLocality[getString(0x410)]("-") && TRANSLATIONS[langLocality[getString(0x202)]("-")[0x0]]
        ? (strings = TRANSLATIONS[langLocality[getString(0x202)]("-")[0x0]])
        : (strings = TRANSLATIONS[getString(0x30c)]);
    Object[getString(0x47d)](TRANSLATIONS["default"])["forEach"]((_0x4c3cb4) => {
      const _0x2adceb = getString;
      (!strings[_0x2adceb(0x403)](_0x4c3cb4) || strings[_0x4c3cb4] == "") &&
        (strings[_0x4c3cb4] = TRANSLATIONS[_0x2adceb(0x30c)][_0x4c3cb4]);
    }),
      $(getString(0x356))[getString(0x278)](strings["enabled"]),
      $(getString(0x3cc))[getString(0x278)](strings[getString(0x335)]),
      $("#lt-trans-uiEnhance")[getString(0x278)](strings[getString(0x331)]),
      $(getString(0x473))[getString(0x278)](strings[getString(0x22e)]),
      $(getString(0x37b)).text(strings[getString(0x399)]),
      $(getString(0x272))[getString(0x278)](strings[getString(0x439)]),
      $("#lt-trans-autoFocus")[getString(0x278)](strings[getString(0x27e)]),
      $(getString(0x296))[getString(0x278)](strings[getString(0x3b8)]),
      $(getString(0x354))[getString(0x278)](strings[getString(0x450)]),
      $("#lt-trans-straClick").text(strings[getString(0x45f)]),
      $("#lt-trans-turnClick")[getString(0x278)](strings[getString(0x23e)]),
      $("#lt-trans-mapHigh")[getString(0x278)](strings["mapHighlight"]),
      $(getString(0x2a4))[getString(0x278)](strings[getString(0x435)]),
      $(getString(0x1dc))[getString(0x278)](strings[getString(0x3b2)]),
      $(getString(0x29f))[getString(0x278)](strings[getString(0x35a)]),
      $("#lt-trans-csOver").text(strings[getString(0x24a)]),
      $(getString(0x20b))[getString(0x278)](strings[getString(0x270)]),
      $(getString(0x359))[getString(0x278)](strings[getString(0x40f)]),
      $("#lt-trans-heurNeg")[getString(0x278)](strings[getString(0x1da)]),
      $("#lt-trans-highCol").text(strings[getString(0x1f6)]),
      $(getString(0x228))[getString(0x278)](strings[getString(0x325)]),
      $(getString(0x3a2)).text(strings["revCol"]),
      $("#lt-trans-labelCol").text(strings[getString(0x34d)]),
      $("#lt-trans-errorCol")[getString(0x278)](strings[getString(0x231)]),
      $(getString(0x2fb))[getString(0x278)](strings[getString(0x253)]),
      $(getString(0x2e0))[getString(0x278)](strings[getString(0x42b)]),
      $("#lt-trans-laoCol")[getString(0x278)](strings["LAOCol"]),
      $(getString(0x3a9))[getString(0x278)](strings[getString(0x25d)]),
      $(getString(0x44f))[getString(0x278)](strings[getString(0x24f)]),
      $(getString(0x3c1))[getString(0x278)](strings["heurPosCol"]),
      $(getString(0x433))[getString(0x278)](strings[getString(0x2a3)]),
      $(getString(0x3da))[getString(0x278)](strings[getString(0x35b)]),
      $("#lt-trans-quickTog")[getString(0x278)](strings[getString(0x32c)]),
      $("#lt-trans-heurRBS")[getString(0x278)](strings["showRBS"]),
      $(getString(0x474))[getString(0x278)](strings["csIcons"]),
      $(getString(0x3d1))[getString(0x278)](strings["highlightOverride"]),
      $("#lt-trans-AddTIO")[getString(0x278)](strings[getString(0x31f)]),
      $(getString(0x3b9))[getString(0x278)](strings[getString(0x348)]),
      $(getString(0x2b6)).text(strings[getString(0x42a)]),
      $(getString(0x2e7))["attr"](getString(0x3f4), strings[getString(0x3c2)]),
      shortcutsDisabled &&
        ($("#lt-EnableShortcut")[getString(0x278)]("" + strings[getString(0x3eb)]),
        $(getString(0x370)).text("" + strings[getString(0x3eb)]),
        $("#lt-UIEnhanceShortcut").text("" + strings["disabled"]),
        $(getString(0x440)).text("" + strings["disabled"]));
  }
  function setHeuristics() {
    if (RBSArray[getString(0x40a)]) return;
    let _0x5e2564 =
      isRBS && getId("lt-serverSelect").checked
        ? configArray[getString(0x446)]
        : configArray[getString(0x3ff)];
    (MAX_LEN_HEUR = _0x5e2564["MAX_LEN_HEUR"]),
      (MAX_PERP_DIF = _0x5e2564[getString(0x311)]),
      (MAX_PERP_DIF_ALT = _0x5e2564[getString(0x255)]),
      (MAX_PERP_TO_CONSIDER = _0x5e2564[getString(0x437)]),
      (MAX_STRAIGHT_TO_CONSIDER = _0x5e2564[getString(0x261)]),
      (MAX_STRAIGHT_DIF = _0x5e2564[getString(0x2f5)]);
  }
  function checkShortcutsChanged() {
    let _0x91c506 = false;
    for (const _0x57f80e in W[getString(0x2ab)][getString(0x265)]) {
      const { shortcut: _0x2642ce, group: _0x135b0b } = W[getString(0x2ab)][getString(0x265)][_0x57f80e];
      if (_0x135b0b === getString(0x339)) {
        let _0x5cbe2b = "";
        _0x2642ce
          ? (_0x2642ce[getString(0x3fd)] === true && (_0x5cbe2b += "A"),
            _0x2642ce[getString(0x444)] === true && (_0x5cbe2b += "S"),
            _0x2642ce[getString(0x21c)] === true && (_0x5cbe2b += "C"),
            _0x5cbe2b !== "" && (_0x5cbe2b += "+"),
            _0x2642ce[getString(0x1ea)] && (_0x5cbe2b += _0x2642ce[getString(0x1ea)]))
          : (_0x5cbe2b = "-1");
        if (LtSettings[_0x57f80e] !== _0x5cbe2b) {
          (_0x91c506 = true),
            console[getString(0x387)](
              "LaneTools:\x20Stored\x20shortcut\x20" +
                _0x57f80e +
                ":\x20" +
                LtSettings[_0x57f80e] +
                getString(0x428) +
                _0x5cbe2b
            );
          break;
        }
      }
    }
    _0x91c506 &&
      (saveSettings(),
      setTimeout(() => {
        updateShortcutLabels();
      }, 0xc8));
  }
  function getKeyboardShortcut(_0x2c608f) {
    const _0x3984c9 = getString,
      _0x58f1b4 = LtSettings[_0x2c608f];
    let _0x3e242d = "";
    if (_0x58f1b4[_0x3984c9(0x3bc)]("+") > -0x1) {
      const _0x134cc7 = _0x58f1b4[_0x3984c9(0x202)]("+")[0x0];
      for (let _0x321435 = 0x0; _0x321435 < _0x134cc7["length"]; _0x321435++) {
        _0x3e242d[_0x3984c9(0x408)] > 0x0 && (_0x3e242d += "+"),
          _0x134cc7[_0x321435] === "C" && (_0x3e242d += _0x3984c9(0x2d7)),
          _0x134cc7[_0x321435] === "S" && (_0x3e242d += _0x3984c9(0x2b1)),
          _0x134cc7[_0x321435] === "A" && (_0x3e242d += _0x3984c9(0x3d8));
      }
      _0x3e242d["length"] > 0x0 && (_0x3e242d += "+");
      let _0x1a0c0a = _0x58f1b4[_0x3984c9(0x202)]("+")[0x1];
      _0x1a0c0a >= 0x60 && _0x1a0c0a <= 0x69 && ((_0x1a0c0a -= 0x30), (_0x3e242d += _0x3984c9(0x2d0))),
        (_0x3e242d += String[_0x3984c9(0x275)](_0x1a0c0a));
    } else {
      let _0x1a8cd3 = Number[_0x3984c9(0x320)](_0x58f1b4, 0xa);
      _0x1a8cd3 >= 0x60 && _0x1a8cd3 <= 0x69 && ((_0x1a8cd3 -= 0x30), (_0x3e242d += "[num\x20pad]")),
        (_0x3e242d += String[_0x3984c9(0x275)](_0x1a8cd3));
    }
    return _0x3e242d;
  }
  function updateShortcutLabels() {
    !shortcutsDisabled &&
      ($("#lt-EnableShortcut").text(getKeyboardShortcut("enableScript")),
      $("#lt-HighlightShortcut").text(getKeyboardShortcut("enableHighlights")),
      $("#lt-UIEnhanceShortcut").text(getKeyboardShortcut("enableUIEnhancements")),
      $("#lt-LaneHeurChecksShortcut").text(getKeyboardShortcut("enableHeuristics")));
  }
  function getSegObj(_0x10546d) {
    return W[getString(0x240)][getString(0x30e)]["getObjectById"](_0x10546d);
  }
  function getNodeObj(_0x3dbcff) {
    return W[getString(0x240)][getString(0x447)][getString(0x393)](_0x3dbcff);
  }
  function lanesTabSetup() {
    if (getId(getString(0x291))[getString(0x349)](getString(0x3d9))[getString(0x408)] == 0x0) {
      setTimeout(lanesTabSetup, 0x1f40), console.log(getString(0x1de));
      return;
    }
    const _0x3cd891 = W["selectionManager"][getString(0x476)]();
    let _0xc1406f = false,
      _0x4c54c4 = false,
      _0xe8a45d = false;
    function _0x47ffa9() {
      const getString = getString;
      W[getString(0x240)][getString(0x447)]["get"](
        W["selectionManager"][getString(0x3fe)]()[getString(0x30e)][0x0][getString(0x395)][getString(0x28a)]
      )[getString(0x395)][getString(0x28f)],
        document[getString(0x3b5)](
          W[getString(0x240)][getString(0x447)][getString(0x250)](
            W["selectionManager"][getString(0x3fe)]()[getString(0x30e)][0x0][getString(0x395)][getString(0x28a)]
          )[getString(0x395)][getString(0x28f)]["id"]
        ),
        console[getString(0x387)](getString(0x3de));
    }
    function _0x758543() {
      const _0xa8dc92 = getString;
      W[_0xa8dc92(0x240)]["nodes"][_0xa8dc92(0x250)](
        W[_0xa8dc92(0x281)][_0xa8dc92(0x3fe)]()[_0xa8dc92(0x30e)][0x0][_0xa8dc92(0x395)][_0xa8dc92(0x3bd)]
      )[_0xa8dc92(0x395)][_0xa8dc92(0x28f)],
        document[_0xa8dc92(0x3b5)](
          W[_0xa8dc92(0x240)][_0xa8dc92(0x447)][_0xa8dc92(0x250)](
            W[_0xa8dc92(0x281)][_0xa8dc92(0x3fe)]()[_0xa8dc92(0x30e)][0x0]["attributes"][_0xa8dc92(0x3bd)]
          )["attributes"][_0xa8dc92(0x28f)]["id"]
        ),
        console[_0xa8dc92(0x387)](_0xa8dc92(0x379));
    }
    function _0x5a28b7() {
      getId(getString(0x390)).checked && !_0xe8a45d && _0x8ccdf2();
      getId(getString(0x43b)).checked && _0x50c216();
      if (_pickleColor >= 0x1 || editorInfo["editableCountryIDS"][getString(0x408)] > 0x0) {
        if (getId(getString(0x43f))) $("#li-del-opp-btn")[getString(0x264)]();
        let _0x8b5acb = $(getString(0x2ed) + strings[getString(0x1eb)] + getString(0x400)),
          _0x2f9ee4 = $(
            "<button\x20type=\x22button\x22\x20id=\x22li-del-rev-btn\x22\x20style=\x22height:20px;background-color:white;border:1px\x20solid\x20grey;border-radius:8px;\x22>" +
              strings[getString(0x321)] +
              getString(0x400)
          ),
          _0x336aa4 = $(getString(0x248) + strings[getString(0x29d)] + getString(0x400)),
          _0x52f96d = $("<div\x20style=\x22display:inline-block;position:relative;\x22\x20/>"),
          _0x52daad = $(getString(0x2e4)),
          _0x55302b = $(getString(0x2e4));
        _0x8b5acb["appendTo"](_0x52f96d), _0x2f9ee4[getString(0x3dc)](_0x52daad), _0x336aa4["appendTo"](_0x55302b);
        const _0x26df67 = $(getString(0x216)),
          _0x24898c = $(getString(0x445)),
          _0xf4d645 = $(getString(0x343));
        _0x26df67[getString(0x2c5)](), _0x24898c["off"](), _0xf4d645[getString(0x2c5)]();
        if (
          !getId(getString(0x2c2)) &&
          !_0x4c54c4 &&
          _0x3cd891[0x0][getString(0x395)][getString(0x23a)][getString(0x3db)]["getRevLanes"]()[getString(0x316)] > 0x0
        ) {
          if ($(getString(0x454))[getString(0x408)] > 0x0)
            _0x52daad[getString(0x3ab)](getString(0x454)),
              $(getString(0x454))[getString(0x1e9)](getString(0x464), getString(0x42e) + LtSettings[getString(0x344)]);
          else
            _0x3cd891[0x0]["attributes"][getString(0x23a)][getString(0x3db)][getString(0x395)][getString(0x223)] !=
              true && (_0x336aa4[getString(0x36f)]("title", "rev"), _0x336aa4[getString(0x3ab)](getString(0x3fc)));
        } else $(getString(0x454)).css(getString(0x464), "4px\x20dashed\x20" + LtSettings[getString(0x344)]);
        if (
          !getId(getString(0x210)) &&
          !_0xc1406f &&
          _0x3cd891[0x0][getString(0x395)][getString(0x23a)][getString(0x3db)]["getFwdLanes"]()[getString(0x316)] > 0x0
        ) {
          if ($(getString(0x391))[getString(0x408)] > 0x0)
            _0x52f96d[getString(0x3ab)](getString(0x391)),
              $(getString(0x391))[getString(0x1e9)]("border-bottom", getString(0x42e) + LtSettings["ABColor"]);
          else
            _0x3cd891[0x0][getString(0x395)][getString(0x23a)][getString(0x3db)]["attributes"][getString(0x2f9)] !=
              true &&
              (_0x336aa4[getString(0x36f)](getString(0x3f7), getString(0x374)),
              _0x336aa4[getString(0x3ab)](getString(0x3fc)));
        } else
          $(
            ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction"
          )[getString(0x1e9)](getString(0x464), "4px\x20dashed\x20" + LtSettings[getString(0x20c)]);
        $("#li-del-fwd-btn")[getString(0x304)](function () {
          const _0x33647a = getString;
          delLanes(_0x33647a(0x374)),
            (_0xc1406f = true),
            setTimeout(function () {
              _0x5a28b7();
            }, 0xc8);
        }),
          $(getString(0x445))[getString(0x304)](function () {
            delLanes("rev"),
              (_0x4c54c4 = true),
              setTimeout(function () {
                _0x5a28b7();
              }, 0xc8);
          }),
          $(getString(0x343)).click(function () {
            const _0x1f68e4 = getString;
            let _0x535f00 = $(this)[_0x1f68e4(0x36f)](_0x1f68e4(0x3f7));
            delLanes(_0x535f00), _0x535f00 === _0x1f68e4(0x3f5) ? (_0x4c54c4 = true) : (_0xc1406f = true), _0x5a28b7();
          });
      }
      const _0x36d323 = $(getString(0x301));
      _0x36d323[getString(0x2c5)](),
        _0x36d323[getString(0x304)](function () {
          const getString = getString;
          $(this)["parents"](".fwd-lanes")[getString(0x408)] &&
            setTimeout(function () {
              const _0x1bb58d = getString;
              _0x16065d(_0x1bb58d(0x374)), _0x414f9a(), _0x816cf7(), _0x3e0f42(), _0x1a7fee();
              if (getId("lt-AddTIO").checked) addTIOUI(_0x1bb58d(0x374));
            }, 0x64),
            $(this)[getString(0x219)](getString(0x2ef))[getString(0x408)] &&
              setTimeout(function () {
                const getString = getString;
                _0x16065d(getString(0x3f5)), _0x414f9a(), _0x816cf7(), _0x3e0f42(), _0x1a7fee();
                if (getId("lt-AddTIO").checked) addTIOUI(getString(0x3f5));
              }, 0x64);
        }),
        !_0xc1406f && !_0x4c54c4 && _0x2308e1(),
        _0x816cf7();
    }
    function _0x1a7fee() {
      const getString = getString;
      $(".apply-button.waze-btn.waze-btn-blue")[getString(0x2c5)](), $(getString(0x246))[getString(0x2c5)]();
      const _0x5ee852 = $(getString(0x351)),
        _0x3df49c = $(getString(0x2ef));
      _0x5ee852[getString(0x46c)](getString(0x1df)).click(() => {
        (_0xc1406f = true),
          setTimeout(function () {
            _0x5a28b7();
          }, 0xc8);
      }),
        _0x3df49c[getString(0x46c)](getString(0x1df))[getString(0x304)](() => {
          (_0x4c54c4 = true),
            setTimeout(function () {
              _0x5a28b7();
            }, 0xc8);
        }),
        _0x5ee852[getString(0x46c)](".cancel-button")[getString(0x304)](() => {
          (_0xc1406f = true),
            setTimeout(function () {
              _0x5a28b7();
            }, 0xc8);
        }),
        _0x3df49c[getString(0x46c)](getString(0x246))[getString(0x304)](() => {
          (_0x4c54c4 = true),
            setTimeout(function () {
              _0x5a28b7();
            }, 0xc8);
        });
    }
    function _0x2308e1() {
      const getString = getString;
      if (getId(getString(0x402)).checked) {
        if (!_0xc1406f) {
        }
        if (!_0x4c54c4) {
        }
      }
      getId(getString(0x215)).checked &&
        (!_0xc1406f && $(getString(0x351))[getString(0x46c)](getString(0x329))[getString(0x304)](),
        !_0x4c54c4 && $(getString(0x2ef))[getString(0x46c)](getString(0x329))[getString(0x304)]());
    }
    function _0x816cf7() {
      const _0x23df2c = getString;
      $(_0x23df2c(0x39e))[_0x23df2c(0x1e9)]({
        padding: "5px\x205px\x2010px",
        "margin-bottom": _0x23df2c(0x44e),
      }),
        $(_0x23df2c(0x306))[_0x23df2c(0x1e9)]({
          padding: _0x23df2c(0x2c8),
          margin: _0x23df2c(0x418),
        }),
        $(_0x23df2c(0x2bb))[_0x23df2c(0x1e9)]("padding-top", _0x23df2c(0x44e)),
        $(_0x23df2c(0x340)).css("padding-top", "10px"),
        $(_0x23df2c(0x40e))[_0x23df2c(0x1e9)](_0x23df2c(0x421), "4px"),
        $(
          ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)"
        )[_0x23df2c(0x1e9)]("margin-bottom", _0x23df2c(0x457));
    }
    function _0x414f9a() {
      if (
        $(getString(0x351))[getString(0x46c)](getString(0x37a))[getString(0x268)]()[getString(0x408)] > 0x0 &&
        !getId(getString(0x2e8))
      ) {
        let _0x2b94d9 = $(getString(0x221)),
          _0x52a43b = $(getString(0x38e)),
          _0x412e1c = $(getString(0x1f2)),
          _0x33f37e = $("<div\x20class=\x22lt-add-lanes\x20fwd\x22>4</div>"),
          _0x49ddf1 = $(getString(0x22f)),
          _0x1b5970 = $(getString(0x37d)),
          _0x171747 = $(getString(0x241)),
          _0x1f039b = $(getString(0x3f1)),
          _0x5490f0 = $(getString(0x416));
        _0x2b94d9[getString(0x3dc)](_0x5490f0),
          _0x52a43b[getString(0x3dc)](_0x5490f0),
          _0x412e1c[getString(0x3dc)](_0x5490f0),
          _0x33f37e[getString(0x3dc)](_0x5490f0),
          _0x49ddf1[getString(0x3dc)](_0x5490f0),
          _0x1b5970[getString(0x3dc)](_0x5490f0),
          _0x171747[getString(0x3dc)](_0x5490f0),
          _0x1f039b[getString(0x3dc)](_0x5490f0),
          _0x5490f0[getString(0x3dc)](getString(0x1dd));
      }
      if (
        $(getString(0x2ef))[getString(0x46c)](getString(0x37a))[getString(0x268)]()[getString(0x408)] > 0x0 &&
        !getId(getString(0x242))
      ) {
        let _0x57f36f = $(getString(0x2c7)),
          _0x2ee8bb = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>2</div>"),
          _0x3896e8 = $(getString(0x286)),
          _0x396769 = $(getString(0x3c3)),
          _0x33c5cf = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>5</div>"),
          _0x26959f = $(getString(0x35c)),
          _0x19d5d7 = $(getString(0x45c)),
          _0x2081eb = $("<div\x20class=\x22lt-add-lanes\x20rev\x22>8</div>"),
          _0x24c3c2 = $(getString(0x3ac));
        _0x57f36f[getString(0x3dc)](_0x24c3c2),
          _0x2ee8bb[getString(0x3dc)](_0x24c3c2),
          _0x3896e8[getString(0x3dc)](_0x24c3c2),
          _0x396769[getString(0x3dc)](_0x24c3c2),
          _0x33c5cf[getString(0x3dc)](_0x24c3c2),
          _0x26959f[getString(0x3dc)](_0x24c3c2),
          _0x19d5d7[getString(0x3dc)](_0x24c3c2),
          _0x2081eb[getString(0x3dc)](_0x24c3c2),
          _0x24c3c2[getString(0x3dc)](getString(0x24b));
      }
      $(getString(0x26e)).click(function () {
        const _0x5df878 = getString;
        let _0xa2f2b3 = $(this)[_0x5df878(0x278)]();
        _0xa2f2b3 = Number[_0x5df878(0x320)](_0xa2f2b3, 0xa);
        if ($(this)[_0x5df878(0x2bf)](_0x5df878(0x347))) {
          const _0x11380e = $(_0x5df878(0x351));
          _0x11380e[_0x5df878(0x46c)](_0x5df878(0x436))["val"](_0xa2f2b3),
            _0x11380e[_0x5df878(0x46c)](_0x5df878(0x436))["change"](),
            _0x11380e[_0x5df878(0x46c)](_0x5df878(0x436))["focus"]();
        }
        if ($(this)[_0x5df878(0x2bf)](_0x5df878(0x431))) {
          const _0x4d157 = $(_0x5df878(0x2ef));
          _0x4d157[_0x5df878(0x46c)](_0x5df878(0x436))["val"](_0xa2f2b3),
            _0x4d157["find"](_0x5df878(0x436))["change"](),
            _0x4d157[_0x5df878(0x46c)](_0x5df878(0x436))["focus"]();
        }
      });
      if (
        $(getString(0x351))[getString(0x46c)](getString(0x2ea))[getString(0x268)]()[getString(0x408)] > 0x0 &&
        !getId(getString(0x453))
      ) {
        let _0x3bd717 = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>1</div>"),
          _0x51b664 = $(getString(0x21b)),
          _0x58e147 = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>3</div>"),
          _0x4482c6 = $(getString(0x47c)),
          _0x2eff2b = $(getString(0x239)),
          _0x2429bd = $(getString(0x23d)),
          _0x491910 = $("<div\x20class=\x22lt-add-Width\x20fwd\x22>7</div>"),
          _0x5e983f = $(getString(0x287)),
          _0x40723d = $(getString(0x2b2));
        _0x3bd717[getString(0x3dc)](_0x40723d),
          _0x51b664[getString(0x3dc)](_0x40723d),
          _0x58e147[getString(0x3dc)](_0x40723d),
          _0x4482c6[getString(0x3dc)](_0x40723d),
          _0x2eff2b[getString(0x3dc)](_0x40723d),
          _0x2429bd[getString(0x3dc)](_0x40723d),
          _0x491910[getString(0x3dc)](_0x40723d),
          _0x5e983f[getString(0x3dc)](_0x40723d),
          _0x40723d["prependTo"](getString(0x310));
      }
      if (
        $(getString(0x2ef))[getString(0x46c)](".lane-width-card")["children"]()["length"] > 0x0 &&
        !getId(getString(0x420))
      ) {
        let _0x358be5 = $("<div\x20class=\x22lt-add-Width\x20rev\x22>1</div>"),
          _0x32ba32 = $(getString(0x3d5)),
          _0x1e5f13 = $(getString(0x36e)),
          _0x5290a9 = $("<div\x20class=\x22lt-add-Width\x20rev\x22>4</div>"),
          _0x32eec1 = $(getString(0x2f6)),
          _0x456698 = $(getString(0x23c)),
          _0x47b449 = $(getString(0x1e7)),
          _0x5ab690 = $(getString(0x333)),
          _0x21fcce = $(getString(0x35e));
        _0x358be5[getString(0x3dc)](_0x21fcce),
          _0x32ba32[getString(0x3dc)](_0x21fcce),
          _0x1e5f13[getString(0x3dc)](_0x21fcce),
          _0x5290a9[getString(0x3dc)](_0x21fcce),
          _0x32eec1[getString(0x3dc)](_0x21fcce),
          _0x456698[getString(0x3dc)](_0x21fcce),
          _0x47b449["appendTo"](_0x21fcce),
          _0x5ab690[getString(0x3dc)](_0x21fcce),
          _0x21fcce[getString(0x3ab)](getString(0x1fe));
      }
      $(".lt-add-Width")[getString(0x304)](function () {
        const _0x258b5b = getString;
        let _0xc7a72 = $(this)[_0x258b5b(0x278)]();
        _0xc7a72 = Number[_0x258b5b(0x320)](_0xc7a72, 0xa);
        if ($(this)["hasClass"](_0x258b5b(0x41d))) {
          const _0x5b51d6 = $(_0x258b5b(0x351));
          _0x5b51d6["find"](_0x258b5b(0x31a))[_0x258b5b(0x432)](_0xc7a72),
            _0x5b51d6["find"](_0x258b5b(0x31a))["change"](),
            _0x5b51d6[_0x258b5b(0x46c)](_0x258b5b(0x31a))[_0x258b5b(0x3d0)]();
        }
        if ($(this)[_0x258b5b(0x2bf)](_0x258b5b(0x2aa))) {
          const _0xeed673 = $(".rev-lanes");
          _0xeed673[_0x258b5b(0x46c)](_0x258b5b(0x31a))[_0x258b5b(0x432)](_0xc7a72),
            _0xeed673[_0x258b5b(0x46c)](_0x258b5b(0x31a))[_0x258b5b(0x247)](),
            _0xeed673["find"]("#number-of-lanes")["focus"]();
        }
      });
    }
    function _0x3e0f42() {
      const _0x4695aa = getString;
      if (getId("lt-AutoFocusLanes").checked) {
        const _0x3797e1 = $(_0x4695aa(0x351)),
          _0x36859d = $(_0x4695aa(0x2ef));
        if (_0x3797e1[_0x4695aa(0x46c)](_0x4695aa(0x39f))[_0x4695aa(0x268)]()[_0x4695aa(0x408)] > 0x0 && !_0xc1406f)
          _0x3797e1[_0x4695aa(0x46c)](_0x4695aa(0x436))[_0x4695aa(0x3d0)]();
        else
          _0x36859d[_0x4695aa(0x46c)](_0x4695aa(0x39f))["children"]()["length"] > 0x0 &&
            !_0x4c54c4 &&
            _0x36859d["find"](".form-control")[_0x4695aa(0x3d0)]();
      }
    }
    function _0x16065d(_0x3bf55f) {
      const _0x474df1 = getString;
      if (getId(_0x474df1(0x243)).checked) {
        $(_0x474df1(0x355))[_0x474df1(0x1e9)](_0x474df1(0x397), _0x474df1(0x460));
        let _0x430051 =
            _0x3bf55f === _0x474df1(0x374)
              ? $(".fwd-lanes")[_0x474df1(0x46c)](_0x474df1(0x436))[0x0]
              : $(_0x474df1(0x2ef))[_0x474df1(0x46c)](".form-control")[0x0],
          _0x36b726 = $(_0x430051)[_0x474df1(0x432)]();
        $(_0x430051)[_0x474df1(0x247)](function () {
          const _0x337a0b = _0x474df1;
          let _0x2588e2;
          if ($(this)[_0x337a0b(0x219)](".fwd-lanes")[_0x337a0b(0x408)])
            _0x2588e2 = $(".fwd-lanes")[_0x337a0b(0x46c)](_0x337a0b(0x2d9));
          else
            $(this)["parents"](_0x337a0b(0x2ef))["length"] &&
              (_0x2588e2 = $(_0x337a0b(0x2ef))[_0x337a0b(0x46c)](".controls-container.turns-region"));
          _0x2588e2 = $(".street-name", _0x2588e2);
          for (let _0x542cc8 = 0x0; _0x542cc8 < _0x2588e2["length"]; _0x542cc8++) {
            $(_0x2588e2[_0x542cc8])[_0x337a0b(0x2c5)](),
              $(_0x2588e2[_0x542cc8])[_0x337a0b(0x304)](function () {
                const getString = _0x337a0b;
                let _0x3d91bf = $(this)[getString(0x250)](0x0),
                  _0x569f4 = _0x3d91bf["parentElement"],
                  _0xe979f1 = $(getString(0x33e), _0x569f4);
                const _0x3412ed = !getId(_0xe979f1[0x0]["id"]).checked;
                for (let _0x5682a8 = 0x0; _0x5682a8 < _0xe979f1[getString(0x408)]; _0x5682a8++) {
                  const _0x179ec = $("#" + _0xe979f1[_0x5682a8]["id"]);
                  _0x179ec[getString(0x36f)]("checked", _0x3412ed), _0x179ec[getString(0x247)]();
                }
              });
          }
        }),
          _0x36b726 > 0x0 && $(_0x430051)[_0x474df1(0x247)]();
      }
    }
    function _0x50c216() {
      const _0x1765ca = _0x3cd891[0x0][getString(0x395)][getString(0x23a)][getString(0x3db)],
        _0x25cb3c = getNodeObj(_0x1765ca[getString(0x395)]["toNodeID"]),
        _0x41ae3f = getNodeObj(_0x1765ca["attributes"][getString(0x3bd)]);
      let _0x54880b = checkLanesConfiguration(
          _0x1765ca,
          _0x25cb3c,
          _0x25cb3c[getString(0x395)][getString(0x3a6)],
          _0x1765ca["attributes"][getString(0x334)]
        ),
        _0x21c6d0 = checkLanesConfiguration(
          _0x1765ca,
          _0x41ae3f,
          _0x41ae3f[getString(0x395)][getString(0x3a6)],
          _0x1765ca["attributes"]["revLaneCount"]
        );
      if (_0x54880b[0x4] > 0x0) {
        let _0x59815e = _0x54880b[0x4] === 0x1 ? LtSettings["CS1Color"] : LtSettings[getString(0x38d)],
          _0x1d2fa0 = $(
            "#segment-edit-lanes\x20>\x20div\x20>\x20div\x20>\x20div.fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.lane-arrows\x20>\x20div"
          )["children"]();
        for (i = 0x0; i < _0x1d2fa0[getString(0x408)]; i++) {
          _0x1d2fa0[i][getString(0x3f7)] == _0x54880b[0x5] &&
            $(_0x1d2fa0[i])[getString(0x1e9)](getString(0x234), _0x59815e);
        }
      }
      if (_0x21c6d0[0x4] > 0x0) {
        let _0xc39df0 = _0x21c6d0[0x4] === 0x1 ? LtSettings[getString(0x1ee)] : LtSettings["CS2Color"],
          _0x37b735 = $(getString(0x38a))[getString(0x268)]();
        for (i = 0x0; i < _0x37b735[getString(0x408)]; i++) {
          _0x37b735[i]["title"] == _0x21c6d0[0x5] && $(_0x37b735[i]).css("background-color", _0xc39df0);
        }
      }
    }
    function _0x8ccdf2() {
      const getString = getString;
      let _0x5d59a3 = document[getString(0x2e5)](getString(0x336)),
        _0x2b66d6 = $(getString(0x2ca))[getString(0x250)]();
      for (let _0x1fc88e = 0x0; _0x1fc88e < _0x5d59a3[getString(0x408)]; _0x1fc88e++) {
        if (_0x5d59a3[_0x1fc88e]["textContent"][getString(0x410)](getString(0x3e7))) {
          let _0x523424 = $(_0x2b66d6[_0x1fc88e])[getString(0x268)]();
          $(_0x523424)[getString(0x1e9)]("transform", getString(0x442)),
            $(_0x2b66d6[_0x1fc88e])[getString(0x394)](_0x523424[getString(0x250)]()["reverse"]());
        }
      }
      _0xe8a45d = true;
    }
    if (
      getId(getString(0x3c8)).checked &&
      getId("lt-ScriptEnabled").checked &&
      _0x3cd891[getString(0x408)] > 0x0
    ) {
      if (
        _0x3cd891[getString(0x408)] === 0x1 &&
        _0x3cd891[0x0][getString(0x395)]["wazeFeature"][getString(0x3db)][getString(0x478)] === getString(0x1f7)
      )
        $(getString(0x3c5))[getString(0x304)](() => {
          (_0xc1406f = ![]),
            (_0x4c54c4 = ![]),
            setTimeout(() => {
              _0x5a28b7();
            }, 0x64);
        }),
          getId(getString(0x295)).checked &&
            setTimeout(() => {
              const _0x3c07d2 = getString;
              $(_0x3c07d2(0x3c5))[_0x3c07d2(0x304)]();
            }, 0x64);
      else _0x3cd891[getString(0x408)] === 0x2 && scanHeuristicsCandidates(_0x3cd891);
    }
  }
  function toggleScript() {
    const _0x579acc = getString;
    $(_0x579acc(0x285))[_0x579acc(0x304)]();
  }

  function getString(index, _0x1cdf9f) {
    const stringArray = getStringArray();
    let resultString = stringArray[index - 334];
    return resultString;
  }

  function toggleHighlights() {
    $(getString(0x3ee)).click();
  }

  function getStringArray() {
    const predefinedStrings = [
      "\x20at\x20",
      "getZoom",
      "data-original-title",
      "rev",
      "REVERSE",
      "title",
      "Tab",
      "lanes",
      "lt-NodeColor",
      "input[type=\x22checkbox\x22].lt-checkbox\x20{position:relative;top:3px;vertical-align:top;margin:0;}",
      "#edit-panel\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20div.segment-edit-section\x20>\x20wz-tabs\x20>\x20wz-tab.lanes-tab",
      "altKey",
      "getSegmentSelection",
      "RPS",
      "</button>",
      "ShowScriptUpdate",
      "lt-AutoExpandLanes",
      "hasOwnProperty",
      "serializeToString",
      "HIGHLIGHT",
      "inSeg",
      "Azm\x20to\x20node\x20",
      "length",
      "ClickSaveTurns",
      "failed",
      "inSegDir",
      "Turn\x20lanes",
      "Straight\x20turn\x20lane\x20count\x20does\x20not\x20match",
      ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)",
      "posHeur",
      "includes",
      "LTLaneGraphics",
      "name",
      "#lt-LabelsEnable",
      "changelayer",
      "join",
      "<div\x20style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22\x20id=\x22lt-fwd-add-lanes\x22\x20/>",
      "data:image/svg+xml;base64,",
      "0px",
      "lastSaveAction",
      "Keep\x20Right",
      "components",
      "Rev\x20(B>A)",
      "lt-add-Width\x20fwd",
      "https://github.com/SkiDooGuy/WME-LaneTools/blob/master/WME-LaneTools.user.js",
      "removeAllFeatures",
      "lt-rev-add-Width",
      "margin-bottom",
      "graphicHeight",
      "map",
      "#26bae8",
      "#66ccff",
      "Shortcut",
      "lt-IconsRotate",
      "\x20changed\x20to\x20",
      "Turn\x20Right",
      "IconsRotate",
      "nodeTIOCol",
      "label.lt-label\x20{position:relative;max-width:90%;font-weight:normal;padding-left:5px}",
      "LaneTools:\x20initializing...",
      "4px\x20dashed\x20",
      "roadType",
      "NodeColor",
      "lt-add-lanes\x20rev",
      "val",
      "#lt-trans-negCol",
      "#lt-highlightOverride",
      "laneLabel",
      ".form-control",
      "MAX_PERP_TO_CONSIDER",
      "layerSwitcherController",
      "autoExpand",
      "addLayer",
      "lt-highlightCSIcons",
      "_LTHighlightLayer",
      "lt-LabelsEnable",
      "Highlight\x20CS\x20Icons",
      "li-del-opp-btn",
      "#lt-LaneHeurChecksShortcut",
      "input",
      "rotate(180deg)",
      "1006486hQNMjC",
      "shiftKey",
      "#li-del-rev-btn",
      "RBS",
      "nodes",
      "FAIL",
      "LaneHeurNegHighlight",
      "${labelColor}",
      "Rotate\x20map\x20icons\x20with\x20segment\x20direction",
      "LaneTools:\x20Error\x20loading\x20RBS:",
      "lt-ErrorColor",
      "10px",
      "#lt-trans-hearCol",
      "enClick",
      ".85",
      "DASH_THIN",
      "lt-fwd-add-Width",
      ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction",
      "add",
      "Point",
      "4px",
      "#00aa00",
      "LaneHeurPosHighlight",
      ".lt-color-input",
      "Ready",
      "<div\x20class=\x22lt-add-lanes\x20rev\x22>7</div>",
      "LaneTools\x20Dev\x20Msg:\x20",
      "ReverseLanesIcon",
      "clickStraight",
      "none",
      "toggle",
      ".lt-option-container.color\x20{text-decoration:none;}",
      "number",
      "border-bottom",
      "setAttribute",
      "selAllTooltip",
      "toLowerCase",
      "#lt-EnableShortcut",
      "NodesEnable",
      "Alerts",
      "Toggle\x20UI\x20enhancements",
      "find",
      "seg",
      "beta.waze.com",
      "396CKTurr",
      "Enable\x20ClickSaver",
      "start",
      "ErrorColor",
      "#lt-trans-autoTab",
      "#lt-trans-csIcons",
      "ClickSaveEnable",
      "getSelectedFeatures",
      "2546485hRBZxR",
      "type",
      "highlightCSIcons",
      "done",
      "fill",
      "<div\x20class=\x22lt-add-Width\x20fwd\x22>4</div>",
      "keys",
      "negHeur",
      "call",
      "#lt-trans-nodeHigh",
      ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)\x20>\x20div",
      "Edit\x20panel\x20not\x20yet\x20loaded.",
      ".apply-button.waze-btn.waze-btn-blue",
      "zoomend",
      "#lt-UIEnable",
      "hide",
      "#lt-highlights-wrapper",
      "Open\x20Sans,\x20Alef,\x20helvetica,\x20sans-serif,\x20monospace",
      "trigger",
      "Waze\x20Selected",
      "<div\x20class=\x22lt-add-Width\x20rev\x22>7</div>",
      "?\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20",
      "css",
      "keyCode",
      "delFwd",
      "lt-CSEnable",
      "2px\x20solid\x20black",
      "CS1Color",
      "246188fslQvy",
      "Turn\x20Left",
      "LaneHeuristicsChecks",
      "<div\x20class=\x22lt-add-lanes\x20fwd\x22>3</div>",
      "Unable\x20to\x20load\x20heuristics\x20data\x20for\x20LG.\x20This\x20feature\x20will\x20not\x20be\x20available",
      "Continue",
      "getFeatureAttributes",
      "highColor",
      "segment",
      "pasteB-button",
      "#lt-LaneTabFeatures",
      "lt-LIOEnable",
      "\x20\x20\x20Not\x20eligible\x20as\x20altIn1:\x20",
      "reduce",
      "CopyEnable",
      ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-from\x20>\x20.instruction\x20>\x20.road-width-edit\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20.lane-width-card",
      "lt-add-lanes",
      "fail",
      "getGuidanceMode",
      "split",
      ".lt-section-wrapper\x20{display:block;width:100%;padding:4px;}",
      "Click\x20on\x20turn\x20name\x20to\x20toggle\x20all\x20lane\x20associations",
      "Use\x20RBS\x20heuristics",
      "toLaneIndex",
      "Enabled",
      "projection",
      "Vector",
      "lt-CS1Color",
      "#lt-trans-heurCan",
      "ABColor",
      "Exit\x20Left",
      "\x20node\x20",
      "https://www.waze.com/forum/viewtopic.php?f=819&t=301158",
      "li-del-fwd-btn",
      "lt-ClickSaveEnable",
      "lt-BAColor",
      "Copy/Paste",
      "getCentroid",
      "lt-AutoOpenWidth",
      "#li-del-fwd-btn",
      "${labelText}",
      "className",
      "parents",
      "7CccpnK",
      "<div\x20class=\x22lt-add-Width\x20fwd\x22>2</div>",
      "ctrlKey",
      "register",
      "Layer",
      "OVER_HIGHLIGHT",
      "version",
      "<div\x20class=\x22lt-add-lanes\x20fwd\x22>1</div>",
      "doSubAction",
      "revDirection",
      "AutoExpandLanes",
      "angle-0",
      "#lt-UI-wrapper",
      "width",
      "#lt-trans-fwdCol",
      "HighlightsEnable",
      "parentElement",
      "#lt-color-title\x20{display:block;width:100%;padding:5px\x200\x205px\x200;font-weight:bold;text-decoration:underline;cursor:pointer;}",
      "border",
      "fill-opacity",
      "autoOpen",
      "<div\x20class=\x22lt-add-lanes\x20fwd\x22>5</div>",
      "primaryStreetID",
      "errorCol",
      "#E804F6",
      "LabelColor",
      "background-color",
      "miniuturn",
      "LaneTools:\x20Unable\x20to\x20save\x20settings\x20to\x20server",
      "rank",
      "Auto-focus\x20lane\x20input",
      "<div\x20class=\x22lt-add-Width\x20fwd\x22>5</div>",
      "wazeFeature",
      "lt-CS2Color",
      "<div\x20class=\x22lt-add-Width\x20rev\x22>6</div>",
      "<div\x20class=\x22lt-add-Width\x20fwd\x22>6</div>",
      "clickTurn",
      "AutoFocusLanes",
      "model",
      "<div\x20class=\x22lt-add-lanes\x20fwd\x22>7</div>",
      "lt-rev-add-lanes",
      "lt-SelAllEnable",
      "PASS",
      "lt-AddTIO",
      ".cancel-button",
      "change",
      "<button\x20type=\x22button\x22\x20id=\x22li-del-opp-btn\x22\x20style=\x22height:auto;background-color:orange;border:1px\x20solid\x20grey;border-radius:8px;\x20margin-bottom:5px;\x22>",
      "Advanced\x20Tools",
      "CSOHigh",
      ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.edit-region\x20>\x20div\x20>\x20div\x20>\x20div:nth-child(1)\x20>\x20div",
      "floor",
      "values",
      "0.9",
      "hearCSCol",
      "get",
      "orange",
      "<style\x20type=\x22text/css\x22>",
      "laneNodeCol",
      "getTurnData",
      "MAX_PERP_DIF_ALT",
      "getTogglerState",
      "href",
      "segment:\x20",
      "timeoutID",
      "stringify",
      "order",
      "\x20attrs\x20len:\x20",
      "viewCSCol",
      "Only\x20highlight\x20if\x20segment\x20layer\x20active",
      "Lane\x20heuristics\x20-\x20not\x20qualified",
      "Display\x20lane\x20icons\x20on\x20map",
      "MAX_STRAIGHT_TO_CONSIDER",
      "lt-CopyEnable",
      "<b>NEW:</b><br>\x0a<b>FIXES:</b><br><br>\x0a",
      "remove",
      "Actions",
      "warning",
      "parseJSON",
      "children",
      "116729CFFamr",
      "getSegmentIds",
      "All\x20straight\x20lanes",
      "#lt-ClickSaveEnable",
      "#lt-LaneHeurPosHighlight",
      ".lt-add-lanes",
      "Labels",
      "heuristics",
      "clearTimeout",
      "#lt-trans-autoExpand",
      "selectionchanged",
      "https://editor-assets.waze.com/production/font/aae5ed152758cb6a9191b91e6cedf322.svg",
      "fromCharCode",
      "#990033",
      "LinearRing",
      "text",
      ".lt-wrapper\x20{position:relative;width:100%;font-size:12px;font-family:\x22Rubik\x22,\x20\x22Boing-light\x22,\x20sans-serif;user-select:none;}",
      "isHeuristicsCandidate\x20received\x20bad\x20argument\x20(null)",
      "head",
      "ITEM_ROAD",
      "findIndex",
      "autoFocus",
      "Lane\x20heuristics\x20likely",
      "lt-ScriptEnabled",
      "selectionManager",
      "Turn\x20angle\x20from\x20inseg\x20",
      "enableUIEnhancements",
      "uturn",
      "#lt-ScriptEnabled",
      "<div\x20class=\x22lt-add-lanes\x20rev\x22>3</div>",
      "<div\x20class=\x22lt-add-Width\x20fwd\x22>8</div>",
      "Pasted\x20some\x20lane\x20stuff",
      "#8F47FA",
      "toNodeID",
      "30770070DOGVeo",
      "#lt-UIEnhanceShortcut",
      "getJSON",
      ".lt-tio-select\x20{max-width:80%;color:rgb(32,\x2033,\x2036);background-color:rgb(242,\x20243,\x20244);border:0px;border-radius:6px;padding:0\x2016px\x200\x2010px;cursor:pointer;}",
      "geometry",
      "angle-135",
      "edit-panel",
      "Nodes\x20with\x20lanes",
      "21lOwPjv",
      "enableHeuristics",
      "lt-AutoLanesTab",
      "#lt-trans-orient",
      "getNumZoomLevels",
      "#lt-color-inputs",
      "6px",
      "HeurColor",
      "#F50E0E",
      "enableScript",
      "delOpp",
      "Lane\x20Tools",
      "#lt-trans-laOver",
      "direction",
      "#lt-adv-tools",
      "LT_Settings",
      "heurNegCol",
      "#lt-trans-lnLabel",
      "<div\x20class=\x27lt-wrapper\x27\x20id=\x27lt-tab-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-tab-body\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27\x20style=\x27border-bottom:2px\x20double\x20grey;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<a\x20href=\x27https://www.waze.com/forum/viewtopic.php?f=819&t=301158\x27\x20style=\x27font-weight:bold;font-size:12px;text-decoration:underline;\x27\x20\x20target=\x27_blank\x27>LaneTools\x20-\x20v",
      "setVisibility",
      "lt-LIOColor",
      "observe",
      "angle--90",
      "lt-add-Width\x20rev",
      "accelerators",
      "#lt-sheet-link\x20>\x20a",
      "afterundoaction",
      "warn",
      "Driving\x20direction\x20restriction\x20applies",
      "#eeeeee",
      "Shift",
      "<div\x20style=\x22position:relative;display:block;width:100%;\x22\x20id=\x22lt-fwd-add-Width\x22\x20/>",
      "LaneTools:\x20Error\x20communicating\x20with\x20WW\x20settings\x20server",
      "Lane\x20angle\x20overrides",
      "getLaneData",
      "#lt-trans-IconsRotate",
      "LT\x20errors\x20found,\x20scanning\x20again",
      "svg",
      "graphicWidth",
      "Error:\x20>1\x20qualifying\x20entry\x20segment\x20for\x20",
      ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit",
      "Node\x20highlights",
      "Error:\x20>1\x20qualifying\x20segment\x20for\x20",
      "stroke-opacity",
      "hasClass",
      "SelAllEnable",
      "cancel",
      "li-del-rev-btn",
      "abs",
      "#keyboard-dialog",
      "off",
      "#ffffff",
      "<div\x20class=\x22lt-add-lanes\x20rev\x22>1</div>",
      "5px\x205px\x2010px",
      "Alt\x20incoming-1\x20segment\x20found:\x20",
      ".lane-arrows\x20>\x20div",
      "#lt-",
      "rotate",
      "Auto-open\x20road\x20width",
      "UIEnable",
      "NONE",
      "[num\x20pad]",
      "2px",
      "LIOColor",
      "lt-TIOColor",
      "user",
      ".lane-arrow",
      "substr",
      "Ctrl",
      "copyA-button",
      ".controls-container.turns-region",
      "fromLaneIndex",
      "Toggle\x20lane\x20highlights",
      "MIN_ZOOM_ALL",
      ".lt-Toolbar-Container\x20{display:none;position:absolute;background-color:orange;border-radius:6px;border:1.5px\x20solid;box-size:border-box;z-index:1050;}",
      "Disabled",
      "FORWARD",
      "#lt-trans-tioCol",
      "wz-checkbox",
      "Negative\x20heuristics\x20candidate",
      "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Translations!A2:C?key=",
      "<div\x20style=\x22display:inline-block;position:relative;\x22\x20/>",
      "getElementsByClassName",
      "stroke-dasharray",
      "#lt-color-title",
      "lt-fwd-add-lanes",
      "10\x2010",
      ".lane-width-card",
      "Waze/Action/UpdateObject",
      "getExtent",
      "<button\x20type=\x22button\x22\x20id=\x22li-del-fwd-btn\x22\x20style=\x22height:20px;background-color:white;border:1px\x20solid\x20grey;border-radius:8px;\x22>",
      "AutoOpenWidth",
      ".rev-lanes",
      "parse",
      "LaneTools:\x20Error\x20loading\x20trans:",
      "getOLMap",
      "lt-HeurColor",
      "lt-ClickSaveTurns",
      "MAX_STRAIGHT_DIF",
      "<div\x20class=\x22lt-add-Width\x20rev\x22>5</div>",
      "fromVertex",
      "Turn\x20angle\x20from\x20inseg\x20(supplementary)\x20",
      "fwdDirection",
      "withLanes",
      "#lt-trans-nodeCol",
      "Feature",
      "getElementsByName",
      "155432OeGIQS",
      ".lt-add-lanes\x20{display:inline-block;width:15px;height:15px;border:1px\x20solid\x20black;border-radius:8px;margin:0\x203px\x200\x203px;line-height:\x201.5;text-align:center;font-size:10px;}",
      ".lt-option-container\x20{padding:3px;}",
      ".edit-lane-guidance",
      "LaneTools:\x20User\x20PIN\x20not\x20set\x20in\x20WazeWrap\x20tab",
      "getGeodesicLength",
      "click",
      "Auto-expand\x20lane\x20editor",
      ".rev-lanes\x20>\x20div\x20>\x20.direction-lanes",
      "hasOverrideAngle",
      "Waze/Model/Graph/Actions/SetTurn",
      "script",
      "copyB-button",
      "parseFloat",
      "default",
      "angle-90",
      "segments",
      "enableHighlights",
      ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-from\x20>\x20.instruction\x20>\x20.road-width-edit\x20>\x20div\x20>\x20div\x20>\x20div\x20>\x20.lane-width-card",
      "MAX_PERP_DIF",
      "LT:\x20Error\x20creating\x20shortcuts.\x20This\x20feature\x20will\x20be\x20disabled.",
      "LaneTools:\x20The\x20following\x20special\x20access\x20features\x20are\x20enabled:\x20",
      "block",
      "#lt-sheet-link",
      "laneCount",
      "btoa",
      ".lt-add-Width:hover\x20{border:1px\x20solid\x20#26bae8;background-color:#26bae8;cursor:pointer;}",
      "streets",
      "#number-of-lanes",
      "Interface",
      "DASH_THICK",
      "8\x2010",
      "695094iWfXcp",
      "addTIO",
      "parseInt",
      "delRev",
      "Nodes\x20with\x20TIOs",
      ".lt-Toolbar-Wrapper\x20{position:relative;padding:3px;}",
      "\x20|\x20",
      "fwdCol",
      ".lt-option-container.clk-svr",
      "lt-AutoFocusLanes",
      "LT:\x20icon\x20angle\x20is\x20out\x20of\x20bounds",
      ".set-road-width\x20>\x20wz-button",
      "checked",
      "error",
      "quickTog",
      "Events",
      "==\x20No\x20inseg\x20found\x20==================================================================",
      "#lt-heur-wrapper",
      "Geometry",
      "UIEnhance",
      "Checking\x20heuristics\x20candidate:\x20seg\x20",
      "<div\x20class=\x22lt-add-Width\x20rev\x22>8</div>",
      "fwdLaneCount",
      "toggleShortcut",
      "heading",
      "Delete\x20FWD\x20Lanes",
      "Allow\x20from\x20",
      "wmelt",
      "lt-HighlightsEnable",
      "\x20nodeExitSegIds:",
      "SaveSettings",
      "RetrieveSettings",
      ".checkbox-large.checkbox-white",
      "TIOColor",
      ".rev-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit",
      "lt-LaneHeurPosHighlight",
      "pasteA-button",
      "#li-del-opp-btn",
      "BAColor",
      "iconborderheight",
      "boxincwidth",
      "lt-add-lanes\x20fwd",
      "enIcons",
      "getElementsByTagName",
      "LaneTools:\x20Failed\x20to\x20load",
      "lt-NodesEnable",
      "clone",
      "labelCol",
      "Toggle\x20Shortcut",
      "View\x20and\x20hear\x20CS",
      "#ff9900",
      ".fwd-lanes",
      "LaneTools:\x20loaded",
      "Positive\x20heuristics\x20candidate",
      "#lt-trans-enClick",
      ".street-name",
      ".lt-trans-enabled",
      "forEach",
      "angle--135",
      "#lt-trans-heurPos",
      "LAOHigh",
      "advTools",
      "<div\x20class=\x22lt-add-lanes\x20rev\x22>6</div>",
      "addEventListener",
      "<div\x20style=\x22position:relative;display:block;width:100%;\x22\x20id=\x22lt-rev-add-Width\x22\x20/>",
      "Found\x20inseg\x20candidate:\x20",
      "HeurFailColor",
      "#04E6F6",
      "Turn\x20",
      "withTurnData",
      "LaneTools:\x20Error\x20loading\x20settings:",
      "\x20to\x20",
      "getItem",
      "Lane\x20heuristics\x20candidates",
      "#lt-serverSelect",
      "isTurnAllowed",
      "display",
      "lt-ClickSaveStraight",
      ".lt-toolbar-button-container\x20{display:inline-block;padding:5px;}",
      "Exit\x20Right",
      "<div\x20class=\x22lt-add-Width\x20rev\x22>3</div>",
      "prop",
      "#lt-HighlightShortcut",
      "afterclearactions",
      "round",
      "hasLanes",
      "fwd",
      "isLeftHand",
      "LTNamesLayer",
      "ceil",
      "lt-serverSelect",
      "hovering\x20to\x20A",
      ".direction-lanes",
      "#lt-trans-autoWidth",
      "value",
      "<div\x20class=\x22lt-add-lanes\x20fwd\x22>6</div>",
      "getTurnThroughNode",
      "setTimeout",
      "lt-highlightOverride",
      "boxheight",
      "stroke-width",
      "Keep\x20Left",
      "#lt-LaneHeuristicsChecks",
      "Error:\x20>1\x20qualifying\x20exit2\x20segment\x20for\x20",
      "setZIndex",
      "log",
      "sort",
      "View\x20only\x20CS",
      "#segment-edit-lanes\x20>\x20div\x20>\x20div\x20>\x20div.rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-to\x20>\x20div.instruction\x20>\x20div.lane-arrows\x20>\x20div",
      "addFeatures",
      "input[type=\x22text\x22].lt-color-input\x20{position:relative;width:70px;padding:3px;border:2px\x20solid\x20black;border-radius:6px;}",
      "CS2Color",
      "<div\x20class=\x22lt-add-lanes\x20fwd\x22>2</div>",
      "IconsEnable",
      "lt-ReverseLanesIcon",
      ".fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction",
      "StyleMap",
      "getObjectById",
      "append",
      "attributes",
      "LIOEnable",
      "user-select",
      "attr",
      "autoWidth",
      "Found\x20a\x20heuristics\x20candidate!\x20",
      "turn-lane-edit-top",
      "isTurnAllowedBySegDirections",
      "angle--45",
      ".fwd-lanes\x20>\x20div\x20>\x20.direction-lanes",
      ".edit-region",
      "lt-HeurFailColor",
      "html",
      "#lt-trans-revCol",
      "(failed)",
      "2px\x20solid\x20",
      "state",
      "segIDs",
      "slice",
      ".lt-checkbox",
      "#lt-trans-viewCol",
      "U-Turn",
      "prependTo",
      "<div\x20style=\x22display:inline-flex;flex-direction:row;justify-content:space-around;margin-top:4px;\x22\x20id=\x22lt-rev-add-lanes\x22\x20/>",
      "atan2",
      "\x20\x20\x20Not\x20eligible\x20as\x20inseg:\x20",
      "getTurnGraph",
      "#0033cc",
      "\x20/\x20",
      "nodeHigh",
      "lt-IconsEnable",
      "</a>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-EnableShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ScriptEnabled\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ScriptEnabled\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-LaneTabFeatures\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-uiEnhance\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-UIEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-UIEnable\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-UI-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-UIEnhanceShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoOpenWidth\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoOpenWidth\x27><span\x20id=\x27lt-trans-autoWidth\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoLanesTab\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoLanesTab\x27><span\x20id=\x27lt-trans-autoTab\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoExpandLanes\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoExpandLanes\x27><span\x20title=\x22Feature\x20disabled\x20as\x20of\x20Aug\x2027,\x202022\x20to\x20prevent\x20flickering\x20issue\x22\x20id=\x27lt-trans-autoExpand\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoFocusLanes\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoFocusLanes\x27><span\x20id=\x27lt-trans-autoFocus\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-highlightCSIcons\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-highlightCSIcons\x27><span\x20id=\x27lt-trans-csIcons\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ReverseLanesIcon\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ReverseLanesIcon\x27><span\x20id=\x27lt-trans-orient\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AddTIO\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AddTIO\x27><span\x20id=\x27lt-trans-AddTIO\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveEnable\x27><span\x20id=\x27lt-trans-enClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20clk-svr\x27\x20style=\x27padding-left:10%;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveStraight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveStraight\x27><span\x20id=\x27lt-trans-straClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20clk-svr\x27\x20style=\x27padding-left:10%;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveTurns\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveTurns\x27><span\x20id=\x27lt-trans-turnClick\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-mapHigh\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-HighlightsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-HighlightsEnable\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-highlights-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-HighlightShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-IconsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-IconsEnable\x27><span\x20id=\x27lt-trans-enIcons\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-IconsRotate\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-IconsRotate\x27><span\x20id=\x27lt-trans-IconsRotate\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LabelsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LabelsEnable\x27><span\x20id=\x27lt-trans-lnLabel\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-NodesEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-NodesEnable\x27><span\x20id=\x27lt-trans-nodeHigh\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LIOEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LIOEnable\x27><span\x20id=\x27lt-trans-laOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-CSEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CSEnable\x27><span\x20id=\x27lt-trans-csOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-highlightOverride\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-highlightOverride\x27><span\x20id=\x27lt-trans-highOver\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27><span\x20id=\x27lt-trans-heurCan\x27></span></span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeuristicsChecks\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeuristicsChecks\x27><span\x20class=\x27lt-trans-enabled\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-heur-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27><span\x20class=\x27lt-trans-tglshcut\x27></span>:<span\x20id=\x27lt-LaneHeurChecksShortcut\x27\x20style=\x27padding-left:10px;\x27></span></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeurPosHighlight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeurPosHighlight\x27><span\x20id=\x27lt-trans-heurPos\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeurNegHighlight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeurNegHighlight\x27><span\x20id=\x27lt-trans-heurNeg\x27></span></label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20id=\x27lt-color-title\x27\x20data-original-title=\x27",
      "getElementById",
      "afteraction",
      "revLaneCount",
      "reOrient",
      "#lt-trans-enIcons",
      "setModel",
      "getOwnPropertyNames",
      "indexOf",
      "fromNodeID",
      "getObjectArray",
      "Remote",
      "push",
      "#lt-trans-posCol",
      "colTooltip",
      "<div\x20class=\x22lt-add-lanes\x20rev\x22>4</div>",
      "lt-LaneHeuristicsChecks",
      ".lanes-tab",
      "#map",
      "==================================================================================",
      "lt-UIEnable",
      "\x20computed\x20len:\x20",
      "stroke",
      "https://sheets.googleapis.com/v4/spreadsheets/1_3sF09sMOid_us37j5CQqJZlBGGr1vI_3Rrmp5K-KCQ/values/Angles!A2:B?key=",
      ".lt-trans-tglshcut",
      "#lt-trans-quickTog",
      "==\x20No\x20alt\x20incoming-1\x20segment\x20found\x20==================================================================",
      "#lt-NodesEnable",
      "focus",
      "#lt-trans-highOver",
      "angle-45",
      "Continue\x20straight\x20overrides",
      "iconbordermargin",
      "<div\x20class=\x22lt-add-Width\x20rev\x22>2</div>",
      "Highlight\x20Colors",
      "LineString",
      "Alt",
      "wz-tabs",
      "#lt-trans-advTools",
      "_wmeObject",
      "appendTo",
      "extend",
      "hovering\x20to\x20B",
      "Delete\x20Rev\x20Lanes",
      "AddTIO",
      "<div>",
      "each",
      "loginManager",
      "Straight\x20turn\x20has\x20no\x20lanes:",
      "Found\x20a\x20failed\x20candidate\x20for\x20",
      "calculate",
      "south",
      "Toggle\x20script",
      "_description",
      "iconborderwidth",
      "disabled",
      "==\x20No\x20Outseg2\x20found\x20==================================================================",
      "There\x20are\x20a\x20different\x20number\x20of\x20enabled\x20turns\x20on\x20this\x20segment/node",
      "#lt-HighlightsEnable",
      "intersectsBounds",
      "ERROR",
      "<div\x20class=\x22lt-add-lanes\x20fwd\x22>8</div>",
    ];
    getStringArray = function () {
      return predefinedStrings;
    };
    return getStringArray();
  }

  function toggleUIEnhancements() {
    const _0x4ca7db = getString;
    $(_0x4ca7db(0x1e1))[_0x4ca7db(0x304)]();
  }
  function toggleLaneHeuristicsChecks() {
    const _0x258528 = getString;
    $(_0x258528(0x384))[_0x258528(0x304)]();
  }
  function displayToolbar() {
    const _0x228b94 = getString,
      _0x4afd09 = W[_0x228b94(0x281)]["getSelectedFeatures"]();
    if (
      _0x4afd09[_0x228b94(0x408)] === 0x1 &&
      getId(_0x228b94(0x262)).checked &&
      getId("lt-ScriptEnabled").checked
    ) {
      if (
        _0x4afd09[0x0]["attributes"][_0x228b94(0x23a)]["_wmeObject"][_0x228b94(0x478)][_0x228b94(0x467)]() ===
        _0x228b94(0x1f7)
      ) {
        const _0x5df401 = $("#map");
        $("#lt-toolbar-container")[_0x228b94(0x1e9)]({
          display: _0x228b94(0x314),
          left: _0x5df401[_0x228b94(0x227)]() * 0.1,
          top: _0x5df401["height"]() * 0.1,
        });
      }
    } else $("#lt-toolbar-container")[_0x228b94(0x1e9)]("display", _0x228b94(0x460));
  }

  function getId(elementId) {
    return document.getElementById(elementId);
  }

  function onScreen(_0x1d94fe, _0x4edaf4) {
    if (!_0x1d94fe["geometry"] || !_0x1d94fe["attributes"]) return false;
    if (
      _0x4edaf4 >= DisplayLevels["MIN_ZOOM_NONFREEWAY"] ||
      (_0x1d94fe["type"] === getString(0x1f7) && _0x1d94fe["attributes"]["roadType"] === LT_ROAD_TYPE["FREEWAY"])
    )
      return W.map[getString(0x2ec)]()[getString(0x3ef)](_0x1d94fe[getString(0x28f)]["getBounds"]());
    return ![];
  }
  function getCardinalAngle(_0x5f13ca, _0x261fce) {
    const _0x11591c = getString;
    if (_0x5f13ca == null || _0x261fce == null) return null;
    let _0x529918, _0x573f8b;
    _0x261fce[_0x11591c(0x395)]["fromNodeID"] === _0x5f13ca
      ? ((_0x529918 = lt_get_second_point(_0x261fce)["x"] - lt_get_first_point(_0x261fce)["x"]),
        (_0x573f8b = lt_get_second_point(_0x261fce)["y"] - lt_get_first_point(_0x261fce)["y"]))
      : ((_0x529918 = lt_get_next_to_last_point(_0x261fce)["x"] - lt_get_last_point(_0x261fce)["x"]),
        (_0x573f8b = lt_get_next_to_last_point(_0x261fce)["y"] - lt_get_last_point(_0x261fce)["y"]));
    let _0x45f593 = Math[_0x11591c(0x3ad)](_0x573f8b, _0x529918),
      _0x1d47ac = ((_0x45f593 * 0xb4) / Math["PI"]) % 0x168;
    if (_0x1d47ac < 0x0) _0x1d47ac = _0x1d47ac + 0x168;
    return Math[_0x11591c(0x372)](_0x1d47ac);
  }
  function lt_get_first_point(_0x1ee745) {
    const _0x3b9cc2 = getString;
    return _0x1ee745[_0x3b9cc2(0x28f)][_0x3b9cc2(0x41b)][0x0];
  }
  function lt_get_last_point(_0x5c9b90) {
    const _0x229b34 = getString;
    return _0x5c9b90[_0x229b34(0x28f)][_0x229b34(0x41b)][_0x5c9b90[_0x229b34(0x28f)][_0x229b34(0x41b)]["length"] - 0x1];
  }
  function lt_get_second_point(_0x24de9d) {
    const _0x3efebc = getString;
    return _0x24de9d["geometry"][_0x3efebc(0x41b)][0x1];
  }
  function lt_get_next_to_last_point(_0x2ea5d3) {
    const _0x204dea = getString;
    return _0x2ea5d3["geometry"][_0x204dea(0x41b)][_0x2ea5d3["geometry"][_0x204dea(0x41b)][_0x204dea(0x408)] - 0x2];
  }
  function delLanes(_0x8ffe09) {
    const _0x51ecc1 = getString,
      _0x288153 = W[_0x51ecc1(0x281)][_0x51ecc1(0x476)](),
      _0xcf7dc7 = _0x288153[0x0]["attributes"]["wazeFeature"][_0x51ecc1(0x3db)],
      _0x4c55fb = W[_0x51ecc1(0x240)][_0x51ecc1(0x3af)](),
      _0x27ef3b = new MultiAction();
    let _0x3f6f3a,
      _0x4297f0,
      _0x357841 = {};
    _0x27ef3b[_0x51ecc1(0x3ba)](W[_0x51ecc1(0x240)]);
    if (_0x8ffe09 === _0x51ecc1(0x374)) {
      (_0x357841[_0x51ecc1(0x334)] = 0x0),
        (_0x3f6f3a = getNodeObj(_0xcf7dc7["attributes"][_0x51ecc1(0x28a)])),
        (_0x4297f0 = _0x3f6f3a["getSegmentIds"]());
      const _0xfa6629 = $(_0x51ecc1(0x351));
      _0xfa6629[_0x51ecc1(0x46c)](_0x51ecc1(0x436))["val"](0x0),
        _0xfa6629[_0x51ecc1(0x46c)](_0x51ecc1(0x436))[_0x51ecc1(0x247)]();
    }
    if (_0x8ffe09 === _0x51ecc1(0x3f5)) {
      (_0x357841[_0x51ecc1(0x3b7)] = 0x0),
        (_0x3f6f3a = getNodeObj(_0xcf7dc7[_0x51ecc1(0x395)][_0x51ecc1(0x3bd)])),
        (_0x4297f0 = _0x3f6f3a[_0x51ecc1(0x26a)]());
      const _0x5c7972 = $(_0x51ecc1(0x2ef));
      _0x5c7972[_0x51ecc1(0x46c)](_0x51ecc1(0x436))[_0x51ecc1(0x432)](0x0),
        _0x5c7972[_0x51ecc1(0x46c)](_0x51ecc1(0x436))["change"]();
    }
    _0x27ef3b[_0x51ecc1(0x222)](new UpdateObj(_0xcf7dc7, _0x357841));
    for (let _0x5c55d3 = 0x0; _0x5c55d3 < _0x4297f0[_0x51ecc1(0x408)]; _0x5c55d3++) {
      let _0x58ea8c = _0x4c55fb[_0x51ecc1(0x37e)](_0x3f6f3a, _0xcf7dc7, getSegObj(_0x4297f0[_0x5c55d3])),
        _0x5c9c0e = _0x58ea8c[_0x51ecc1(0x254)]();
      _0x5c9c0e["hasLanes"]() &&
        ((_0x5c9c0e = _0x5c9c0e[_0x51ecc1(0x2fa)]()),
        (_0x58ea8c = _0x58ea8c[_0x51ecc1(0x363)](_0x5c9c0e)),
        _0x27ef3b["doSubAction"](new SetTurn(_0x4c55fb, _0x58ea8c)));
    }
    (_0x27ef3b[_0x51ecc1(0x3e9)] = "Deleted\x20lanes\x20and\x20turn\x20associations"),
      W[_0x51ecc1(0x240)]["actionManager"][_0x51ecc1(0x455)](_0x27ef3b);
  }
  function removeHighlights() {
    const _0x5431b9 = getString;
    LTHighlightLayer[_0x5431b9(0x41f)](), LTNamesLayer["removeAllFeatures"]();
  }
  function removeLaneGraphics() {
    const _0x14eedc = getString;
    LTLaneGraphics[_0x14eedc(0x41f)]();
  }
  function applyName(_0x27e648, _0x2d5f66, _0x3e4f08) {
    const _0x20ed82 = getString;
    let _0x2e0a0c = _0x27e648[_0x20ed82(0x34c)](),
      _0x58bfcc = _0x2d5f66 + "\x20/\x20" + _0x3e4f08,
      _0x118707 = new OpenLayers[_0x20ed82(0x2fc)]["Vector"](_0x2e0a0c, {
        labelText: _0x58bfcc,
        labelColor: LtSettings[_0x20ed82(0x233)],
      });
    LTNamesLayer[_0x20ed82(0x38b)]([_0x118707]);
  }
  function highlightSegment(
    _0x16f8f2,
    _0x58d6bd,
    _0x5f4375,
    _0x52d15e,
    _0x126e8a,
    _0x2c9162,
    _0x147e33,
    _0x40fe5d,
    _0x42e2ed,
    _0x701156,
    _0x2a289c
  ) {
    const getString = getString,
      _0x3c685d = {
        DASH_THIN: 0x1,
        DASH_THICK: 0x2,
        HIGHLIGHT: 0xa,
        OVER_HIGHLIGHT: 0x14,
      },
      _0x1d1809 = _0x16f8f2[getString(0x34c)](),
      _0x4f1c1d = getId(getString(0x1ec)).checked;
    if (_0x1d1809["components"][getString(0x408)] > 0x2) {
      let _0x114781 = _0x1d1809[getString(0x41b)][getString(0x408)],
        _0x17a8e9 = _0x114781 / 0x2,
        _0x5479ec = _0x114781 % 0x2 ? Math[getString(0x377)](_0x17a8e9) - 0x1 : Math[getString(0x377)](_0x17a8e9),
        _0x3a7f64 = _0x114781 % 0x2 ? Math[getString(0x24c)](_0x17a8e9) + 0x1 : Math["floor"](_0x17a8e9);
      if (_0x58d6bd === Direction[getString(0x2df)]) {
        let _0x21e1e8 = _0x1c40ca(_0x1d1809, _0x5479ec, _0x114781);
        _0x5f4375 && _0x58a03b(_0x21e1e8, "" + LtSettings[getString(0x20c)], _0x3c685d[getString(0x452)]),
          _0x43deae(_0x21e1e8, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
      } else {
        if (_0x58d6bd === Direction[getString(0x3f6)]) {
          let _0x3e6b6f = _0x1c40ca(_0x1d1809, 0x0, _0x3a7f64);
          _0x5f4375 && _0x58a03b(_0x3e6b6f, "" + LtSettings[getString(0x344)], _0x3c685d[getString(0x452)]),
            _0x43deae(_0x3e6b6f, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
        }
      }
      if (_0x52d15e && (Direction[getString(0x2df)] || _0x126e8a === 0x0)) {
        if (_0x114781 % 0x2) applyName(_0x1d1809["components"][_0x5479ec], _0x126e8a, _0x2c9162);
        else {
          let _0x3f4fb2 = _0x1d1809["components"][_0x3a7f64 - 0x1],
            _0x196425 = _0x1d1809[getString(0x41b)][_0x5479ec],
            _0x2daf64 = new OpenLayers[getString(0x330)]["Point"](
              (_0x3f4fb2["x"] + _0x196425["x"]) / 0x2,
              (_0x3f4fb2["y"] + _0x196425["y"]) / 0x2
            );
          applyName(_0x2daf64, _0x126e8a, _0x2c9162);
        }
      }
    } else {
      let _0x5b73aa = _0x1d1809[getString(0x41b)][0x0],
        _0x3cd08d = _0x1d1809[getString(0x41b)][0x1],
        _0xa8356b = new OpenLayers[getString(0x330)][getString(0x456)](
          (_0x5b73aa["x"] + _0x3cd08d["x"]) / 0x2,
          (_0x5b73aa["y"] + _0x3cd08d["y"]) / 0x2
        );
      if (_0x58d6bd === Direction[getString(0x2df)]) {
        let _0x196538 = new OpenLayers[getString(0x330)][getString(0x456)](
            _0x1d1809[getString(0x41b)][0x1]["clone"]()["x"],
            _0x1d1809[getString(0x41b)][0x1][getString(0x34c)]()["y"]
          ),
          _0x13e81d = new OpenLayers[getString(0x330)]["LineString"]([_0xa8356b, _0x196538], {});
        _0x5f4375 && _0x58a03b(_0x13e81d, "" + LtSettings["ABColor"], _0x3c685d[getString(0x452)]),
          _0x43deae(_0x13e81d, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
      } else {
        if (_0x58d6bd === Direction[getString(0x3f6)]) {
          let _0x4c870d = new OpenLayers[getString(0x330)][getString(0x456)](
              _0x1d1809[getString(0x41b)][0x0]["clone"]()["x"],
              _0x1d1809[getString(0x41b)][0x0][getString(0x34c)]()["y"]
            ),
            _0x598bfa = new OpenLayers["Geometry"][getString(0x3d7)]([_0xa8356b, _0x4c870d], {});
          _0x5f4375 && _0x58a03b(_0x598bfa, "" + LtSettings["BAColor"], _0x3c685d["DASH_THIN"]),
            _0x43deae(_0x598bfa, _0x147e33, _0x42e2ed, _0x701156, _0x2a289c);
        }
      }
      _0x52d15e && (Direction[getString(0x2df)] || _0x126e8a === 0x0) && applyName(_0xa8356b, _0x126e8a, _0x2c9162);
    }
    function _0x1c40ca(_0x1226a0, _0x5d1ef6, _0x2d2248) {
      const _0x2fb9cd = getString;
      let _0x3411db = [];
      for (let _0x191254 = _0x5d1ef6; _0x191254 < _0x2d2248; _0x191254++) {
        _0x3411db[_0x191254] = _0x1226a0["components"][_0x191254][_0x2fb9cd(0x34c)]();
      }
      return new OpenLayers[_0x2fb9cd(0x330)][_0x2fb9cd(0x3d7)](_0x3411db, {});
    }
    function _0x43deae(_0x3291c0, _0xe37e1, _0x2d6773, _0x5e102e, _0x59dda1 = ![]) {
      const _0xf9329 = getString;
      if (_0x2d6773) {
        _0x58a03b(_0x3291c0[_0xf9329(0x34c)](), "" + LtSettings["ErrorColor"], _0x3c685d["OVER_HIGHLIGHT"]);
        return;
      }
      _0xe37e1 && _0x58a03b(_0x3291c0["clone"](), "" + LtSettings[_0xf9329(0x2d2)], _0x3c685d[_0xf9329(0x405)]);
      _0x40fe5d === 0x1 &&
        _0x4f1c1d &&
        _0x58a03b(_0x3291c0[_0xf9329(0x34c)](), "" + LtSettings[_0xf9329(0x1ee)], _0x3c685d[_0xf9329(0x405)]);
      _0x40fe5d === 0x2 &&
        _0x4f1c1d &&
        _0x58a03b(_0x3291c0["clone"](), "" + LtSettings[_0xf9329(0x38d)], _0x3c685d["HIGHLIGHT"]);
      if (_0x5e102e === HeuristicsCandidate["PASS"])
        _0x58a03b(
          _0x3291c0["clone"](),
          "" + LtSettings[_0xf9329(0x29a)],
          _0x59dda1 ? _0x3c685d[_0xf9329(0x21f)] : _0x3c685d["HIGHLIGHT"]
        );
      else
        _0x5e102e === HeuristicsCandidate[_0xf9329(0x448)] &&
          _0x58a03b(
            _0x3291c0[_0xf9329(0x34c)](),
            "" + LtSettings[_0xf9329(0x360)],
            _0x59dda1 ? _0x3c685d[_0xf9329(0x21f)] : _0x3c685d[_0xf9329(0x405)]
          );
    }
    function _0x58a03b(_0x4e223c, _0x4b1ac8, _0x1d2584) {
      const _0x15236e = getString;
      let _0x3bdb58 = new OpenLayers["Feature"][_0x15236e(0x209)](_0x4e223c, {}, {});
      LTHighlightLayer[_0x15236e(0x38b)]([_0x3bdb58]);
      const _0x5501de = document[_0x15236e(0x3b5)](_0x4e223c["id"]);
      if (_0x5501de) {
        _0x5501de[_0x15236e(0x465)](_0x15236e(0x3ca), "" + _0x4b1ac8);
        if (_0x1d2584 === _0x3c685d["HIGHLIGHT"])
          _0x5501de[_0x15236e(0x465)](_0x15236e(0x382), "15"), _0x5501de[_0x15236e(0x465)](_0x15236e(0x2be), ".6");
        else {
          if (_0x1d2584 === _0x3c685d["OVER_HIGHLIGHT"])
            _0x5501de[_0x15236e(0x465)](_0x15236e(0x382), "18"),
              _0x5501de["setAttribute"](_0x15236e(0x2be), _0x15236e(0x451));
          else {
            _0x5501de[_0x15236e(0x465)]("stroke-opacity", "1");
            if (_0x1d2584 === _0x3c685d[_0x15236e(0x31c)])
              _0x5501de[_0x15236e(0x465)](_0x15236e(0x382), "8"),
                _0x5501de[_0x15236e(0x465)]("stroke-dasharray", _0x15236e(0x31d));
            else
              _0x1d2584 === _0x3c685d[_0x15236e(0x452)] &&
                (_0x5501de["setAttribute"](_0x15236e(0x382), "4"),
                _0x5501de["setAttribute"](_0x15236e(0x2e6), _0x15236e(0x2e9)));
          }
        }
      }
    }
    LTHighlightLayer[getString(0x386)](0x1c2);
  }
  function highlightNode(_0x468e12, _0xcc8670, _0x5c426d = ![]) {
    const _0x1a7e94 = getString,
      _0x5ee4da = _0x468e12["clone"](),
      _0x1313c1 = new OpenLayers[_0x1a7e94(0x2fc)][_0x1a7e94(0x209)](_0x5ee4da, {});
    LTHighlightLayer[_0x1a7e94(0x38b)]([_0x1313c1]);
    const _0x2bd47a = document[_0x1a7e94(0x3b5)](_0x5ee4da["id"]);
    _0x2bd47a &&
      (_0x2bd47a[_0x1a7e94(0x465)](_0x1a7e94(0x47b), _0xcc8670),
      _0x2bd47a[_0x1a7e94(0x465)]("r", _0x5c426d ? "18" : "10"),
      _0x2bd47a["setAttribute"](_0x1a7e94(0x22d), _0x1a7e94(0x24e)),
      _0x2bd47a[_0x1a7e94(0x465)]("stroke-width", "0"));
  }
  let lt_scanArea_timer = {
    start: function () {
      const _0xa123b8 = getString;
      this[_0xa123b8(0x2c1)]();
      let _0x150ba4 = this;
      this["timeoutID"] = window[_0xa123b8(0x37f)](function () {
        const _0x4eaf5a = _0xa123b8;
        _0x150ba4[_0x4eaf5a(0x3e6)]();
      }, 0x1f4);
    },
    calculate: function () {
      const _0x36ca45 = getString;
      scanArea_real(), delete this[_0x36ca45(0x259)];
    },
    cancel: function () {
      const _0x2d7c53 = getString;
      typeof this[_0x2d7c53(0x259)] === _0x2d7c53(0x463) &&
        (window[_0x2d7c53(0x271)](this[_0x2d7c53(0x259)]), delete this["timeoutID"], (lt_scanArea_recursive = 0x0));
    },
  };
  function scanArea() {
    (lt_scanArea_recursive = 0x3), scanArea_real();
  }
  function scanArea_real() {
    const getString = getString,
      _0x122a27 = getId(getString(0x280)).checked,
      _0x583759 = getId(getString(0x33a)).checked,
      _0x59b8dd = getId("lt-LaneHeuristicsChecks").checked,
      _0x34df05 = W[getString(0x423)][getString(0x3f3)]() != null ? W[getString(0x423)]["getZoom"]() : 0x10,
      _0x1e077f = getId(getString(0x380)).checked,
      _0x10e51f =
        W[getString(0x438)][getString(0x256)](getString(0x27c)) ||
        W[getString(0x438)]["getTogglerState"]("ITEM_ROAD_V2");
    removeHighlights();
    if (_0x34df05 < DisplayLevels[getString(0x2dc)]) return;
    if (_0x10e51f || (!_0x10e51f && !_0x1e077f)) {
      _0x122a27 &&
        (_0x583759 || _0x59b8dd) &&
        scanSegments(W[getString(0x240)][getString(0x30e)][getString(0x3be)](), ![]);
      if (_0x122a27) {
        const _0xc4f257 = W[getString(0x281)]["getSelectedFeatures"]();
        _0xc4f257[getString(0x408)] === 0x2 && scanHeuristicsCandidates(_0xc4f257);
      }
    }
  }
  function scanHeuristicsCandidates(_0x482def) {
    const _0x37666c = getString;
    let _0x4174e4 = [],
      _0x232b3f = 0x0;
    return (
      _[_0x37666c(0x3e2)](_0x482def, (_0x249a9b) => {
        const _0x422622 = _0x37666c;
        _0x249a9b &&
          _0x249a9b[_0x422622(0x395)][_0x422622(0x23a)][_0x422622(0x3db)] &&
          _0x249a9b[_0x422622(0x395)][_0x422622(0x23a)][_0x422622(0x3db)]["type"] === _0x422622(0x1f7) &&
          (_0x232b3f = _0x4174e4[_0x422622(0x3c0)](_0x249a9b[_0x422622(0x395)][_0x422622(0x23a)][_0x422622(0x3db)]));
      }),
      scanSegments(_0x4174e4, true),
      _0x232b3f
    );
  }
  function scanSegments(_0x48b407, _0x553a1b) {
    const getString = getString,
      _0x495382 = getId(getString(0x3c4)).checked,
      _0x3a07e5 = _0x495382 && getId("lt-LaneHeurPosHighlight").checked,
      _0x1cbbb8 = _0x495382 && getId("lt-LaneHeurNegHighlight").checked,
      _0x54899b = getId(getString(0x33a)).checked,
      _0x4cbda1 = _0x54899b && getId(getString(0x1fa)).checked,
      _0x1d266a = _0x54899b && getId(getString(0x43d)).checked,
      _0x5a4db6 = W[getString(0x423)][getString(0x3f3)]() != null ? W[getString(0x423)][getString(0x3f3)]() : 0x10,
      _0x193f41 = W["model"]["getTurnGraph"]();
    _[getString(0x3e2)](_0x48b407, (_0x4e91a0) => {
      const _0xc8be01 = getString;
      if (onScreen(_0x4e91a0, _0x5a4db6)) {
        const _0x3598ea = _0x4e91a0["getFeatureAttributes"]();
        let _0x1b6f52 = ![],
          _0x1ca2eb = lt_segment_length(_0x4e91a0);
        _0x1b6f52 = _0x1b6f52 || _0x2ad725(_0x4e91a0, _0x3598ea, Direction[_0xc8be01(0x2df)], _0x1ca2eb, _0x1b6f52);
        if (_0x1b6f52 && lt_scanArea_recursive > 0x0) {
          lt_log(_0xc8be01(0x2b7), 0x2),
            removeHighlights(),
            lt_scanArea_recursive--,
            lt_scanArea_timer[_0xc8be01(0x471)]();
          return;
        }
        _0x1b6f52 = _0x1b6f52 || _0x2ad725(_0x4e91a0, _0x3598ea, Direction[_0xc8be01(0x3f6)], _0x1ca2eb, _0x1b6f52);
        if (_0x1b6f52 && lt_scanArea_recursive > 0x0) {
          lt_log(_0xc8be01(0x2b7), 0x2), removeHighlights(), lt_scanArea_recursive--, lt_scanArea_timer["start"]();
          return;
        }
      }
    });
    function _0x2ad725(_0x6f84fd, _0x37e1f7, _0x17336c, _0x37b92d, _0x402e4b) {
      const getString = getString,
        _0x162a18 = _0x37e1f7[getString(0x334)],
        _0x310dc4 = _0x37e1f7["revLaneCount"];
      let _0x405af6 = getNodeObj(_0x37e1f7["toNodeID"]),
        _0x3f1bfc = getNodeObj(_0x37e1f7["fromNodeID"]),
        _0x5a6ac5 = _0x162a18,
        _0x58763f = _0x310dc4;
      _0x17336c !== Direction[getString(0x2df)] &&
        ((_0x405af6 = getNodeObj(_0x37e1f7[getString(0x3bd)])),
        (_0x3f1bfc = getNodeObj(_0x37e1f7[getString(0x28a)])),
        (_0x5a6ac5 = _0x310dc4),
        (_0x58763f = _0x162a18));
      let _0x5855dd = ![],
        _0x4d3a78 = ![],
        _0x12606 = ![],
        _0x58ba1e = ![],
        _0x3a8c59 = 0x0,
        _0x436364 = HeuristicsCandidate[getString(0x2cf)],
        _0x53f387 = null,
        _0x211d6a = { seg: 0x0, direction: Direction[getString(0x2cf)] };
      if (onScreen(_0x405af6, _0x5a4db6)) {
        const _0x3bcc17 = _0x405af6["getSegmentIds"]();
        if (_0x5a6ac5 > 0x0) {
          let _0x30b899 = checkLanesConfiguration(_0x6f84fd, _0x405af6, _0x3bcc17, _0x5a6ac5);
          (_0x5855dd = _0x30b899[0x0]),
            (_0x4d3a78 = _0x30b899[0x1]),
            (_0x58ba1e = _0x30b899[0x2]),
            (_0x12606 = _0x30b899[0x3]),
            (_0x3a8c59 = _0x30b899[0x4]),
            (_0x402e4b = _0x12606 || _0x402e4b);
        }
        if (_0x37b92d <= MAX_LEN_HEUR) {
          _0x436364 = isHeuristicsCandidate(
            _0x6f84fd,
            _0x405af6,
            _0x3bcc17,
            _0x3f1bfc,
            _0x5a6ac5,
            _0x37b92d,
            _0x193f41,
            _0x211d6a
          );
          _0x436364 === HeuristicsCandidate["ERROR"] && (_0x12606 = true);
          if (!_0x495382) _0x436364 = HeuristicsCandidate[getString(0x2cf)];
          else _0x436364 !== HeuristicsCandidate[getString(0x2cf)] && (_0x53f387 = { ..._0x211d6a });
        }
      }
      if (!_0x553a1b) {
        let _0x5c9960 = null;
        ((_0x3a07e5 && _0x436364 === HeuristicsCandidate[getString(0x244)]) ||
          (_0x1cbbb8 && _0x436364 === HeuristicsCandidate[getString(0x448)])) &&
          (_0x5c9960 = _0x436364),
          (_0x5a6ac5 > 0x0 || _0x5c9960 !== null || _0x12606) &&
            highlightSegment(
              _0x6f84fd[getString(0x28f)],
              _0x17336c,
              _0x54899b,
              _0x1d266a,
              _0x162a18,
              _0x310dc4,
              _0x58ba1e && _0x4cbda1,
              _0x3a8c59,
              _0x12606,
              _0x5c9960,
              ![]
            ),
          _0x54899b &&
            getId(getString(0x34b)).checked &&
            (_0x5855dd && highlightNode(_0x405af6["geometry"], "" + LtSettings[getString(0x430)]),
            _0x4d3a78 && highlightNode(_0x405af6["geometry"], "" + LtSettings[getString(0x33f)]));
      } else {
        lt_log("candidate(f):" + _0x436364);
        if (_0x436364 !== HeuristicsCandidate[getString(0x2cf)]) {
          if (
            _0x53f387 != null &&
            _0x48b407[getString(0x27d)]((_0x12b968) => _0x12b968 === _0x53f387[getString(0x46d)]) > -0x1
          ) {
            let _0x4063ba =
              _0x436364 === HeuristicsCandidate[getString(0x244)]
                ? "" + LtSettings["NodeColor"]
                : "" + LtSettings[getString(0x360)];
            highlightSegment(
              _0x6f84fd[getString(0x28f)],
              _0x17336c,
              ![],
              ![],
              0x0,
              0x0,
              ![],
              _0x3a8c59,
              _0x12606,
              _0x436364,
              true
            ),
              highlightSegment(
                _0x53f387["seg"][getString(0x28f)],
                _0x53f387[getString(0x2a0)],
                ![],
                ![],
                0x0,
                0x0,
                ![],
                0x0,
                ![],
                _0x436364,
                true
              ),
              highlightNode(_0x405af6[getString(0x28f)], _0x4063ba, true),
              highlightNode(_0x3f1bfc[getString(0x28f)], _0x4063ba, true);
          }
        }
      }
      return _0x402e4b;
    }
  }
  function checkLanesConfiguration(_0x57e44b, _0x42e6cf, _0x1d0a74, _0x4e9244) {
    const _0x4fbab6 = getString;
    let _0x739f97 = ![],
      _0x55ea18 = ![],
      _0x16f110 = ![],
      _0x161259 = ![],
      _0x5c5507 = 0x0,
      _0x4211dc = null,
      _0x44a7d8 = [];
    const _0x36da8a = W[_0x4fbab6(0x240)][_0x4fbab6(0x3af)](),
      _0xd63ac8 = W[_0x4fbab6(0x423)][_0x4fbab6(0x3f3)]() != null ? W[_0x4fbab6(0x423)]["getZoom"]() : 0x10;
    for (let _0xe3883a = 0x0; _0xe3883a < _0x1d0a74[_0x4fbab6(0x408)]; _0xe3883a++) {
      const _0x124a73 = getSegObj(_0x1d0a74[_0xe3883a]),
        _0x3f357d = _0x36da8a[_0x4fbab6(0x37e)](_0x42e6cf, _0x57e44b, _0x124a73)[_0x4fbab6(0x254)]();
      if (_0x3f357d[_0x4fbab6(0x3a5)] === 0x1) {
        _0x3f357d["hasInstructionOpcode"]() && (_0x55ea18 = true);
        if (_0x3f357d["hasLanes"]()) {
          _0x739f97 = true;
          _0x3f357d[_0x4fbab6(0x2b5)]()[_0x4fbab6(0x307)]() && (_0x161259 = true);
          if (_0x3f357d[_0x4fbab6(0x2b5)]()[_0x4fbab6(0x201)]() === 0x1)
            (_0x5c5507 = 0x1),
              (_0x4211dc = W[_0x4fbab6(0x240)]["streets"][_0x4fbab6(0x393)](
                _0x124a73[_0x4fbab6(0x395)][_0x4fbab6(0x230)]
              )["name"]);
          else
            _0x3f357d[_0x4fbab6(0x2b5)]()["getGuidanceMode"]() === 0x2 &&
              ((_0x5c5507 = 0x2),
              (_0x4211dc = W[_0x4fbab6(0x240)][_0x4fbab6(0x319)][_0x4fbab6(0x393)](
                _0x124a73[_0x4fbab6(0x395)][_0x4fbab6(0x230)]
              )[_0x4fbab6(0x412)]));
          const _0x21fbe6 = _0x3f357d[_0x4fbab6(0x3f9)][_0x4fbab6(0x2da)],
            _0x40bbd8 = _0x3f357d[_0x4fbab6(0x3f9)][_0x4fbab6(0x206)];
          for (let _0x382bd8 = _0x21fbe6; _0x382bd8 < _0x40bbd8 + 0x1; _0x382bd8++) {
            let _0x18e06a = true;
            for (let _0x774514 = 0x0; _0x774514 < _0x44a7d8[_0x4fbab6(0x408)]; _0x774514++) {
              _0x44a7d8[_0x774514] === _0x382bd8 && (_0x18e06a = ![]);
            }
            _0x18e06a && _0x44a7d8["push"](_0x382bd8);
          }
        }
      }
    }
    _0x44a7d8["sort"]();
    for (let _0x5082cd = 0x0; _0x5082cd < _0x44a7d8[_0x4fbab6(0x408)]; _0x5082cd++) {
      _0x44a7d8[_0x5082cd] !== _0x5082cd && (_0x16f110 = true);
    }
    return (
      _0x44a7d8[_0x4fbab6(0x408)] < _0x4e9244 && onScreen(_0x42e6cf, _0xd63ac8) && (_0x16f110 = true),
      [_0x739f97, _0x55ea18, _0x161259, _0x16f110, _0x5c5507, _0x4211dc]
    );
  }
  function setTurns(_0x32e1b9) {
    const getString = getString;
    if (!getId(getString(0x211)).checked) return;
    let _0x1357ab = document[getString(0x2e5)](_0x32e1b9)[0x0],
      _0x3ce173 =
        _0x1357ab["getElementsByClassName"](getString(0x358))["length"] > 0x0
          ? getString(0x358)
          : _0x1357ab["getElementsByClassName"]("angle--90")["length"] > 0x0
          ? getString(0x2a9)
          : getString(0x39d),
      _0x217ae4 =
        _0x1357ab[getString(0x2e5)](getString(0x290))[getString(0x408)] > 0x0
          ? getString(0x290)
          : _0x1357ab[getString(0x2e5)](getString(0x30d))[getString(0x408)] > 0x0
          ? "angle-90"
          : getString(0x3d2),
      _0x3541df = _0x1357ab[getString(0x2e5)](getString(0x39b)),
      _0x16a6be = ![],
      _0x43ae0b = ![],
      _0x257aea = [][getString(0x3a7)]
        [getString(0x1db)](_0x3541df)
        [getString(0x1fc)](
          (_0x4861b3, _0x2010bf) =>
            _0x4861b3 +
            [][getString(0x3a7)]
              ["call"](_0x2010bf[getString(0x349)](getString(0x441)))
              ["reduce"](
                (_0x58c1c4, _0x4afea1) => (_0x4afea1.checked === true ? _0x58c1c4 + 0x1 : _0x58c1c4),
                0x0
              ),
          0x0
        );
    if (_0x257aea === 0x0) {
      for (let _0x1a1b6e = 0x0; _0x1a1b6e < _0x3541df[getString(0x408)]; _0x1a1b6e++) {
        const _0x496f7c = _0x3541df[_0x1a1b6e];
        let _0x5c6270 = _0x496f7c["getElementsByTagName"](getString(0x2e1));
        if (_0x5c6270 && _0x5c6270[getString(0x408)] > 0x0) {
          if (
            _0x496f7c[getString(0x2e5)](_0x3ce173)[getString(0x408)] > 0x0 &&
            _0x5c6270[0x0].checked !== undefined &&
            _0x5c6270[0x0].checked === ![] &&
            getId("lt-ClickSaveTurns").checked
          )
            (_0x16a6be = true), _0x5c6270[0x0].click();
          else
            _0x496f7c[getString(0x2e5)](_0x217ae4)[getString(0x408)] > 0x0 &&
              _0x5c6270[_0x5c6270["length"] - 0x1].checked !== undefined &&
              _0x5c6270[_0x5c6270[getString(0x408)] - 0x1].checked === ![] &&
              getId("lt-ClickSaveTurns").checked &&
              ((_0x43ae0b = true), _0x5c6270[_0x5c6270[getString(0x408)] - 0x1][getString(0x304)]());
        }
      }
      for (let _0x4bc51f = 0x0; _0x4bc51f < _0x3541df["length"]; _0x4bc51f++) {
        const _0x376ec2 = _0x3541df[_0x4bc51f];
        let _0x58c806 = _0x376ec2[getString(0x349)](getString(0x2e1));
        if (_0x376ec2[getString(0x2e5)](getString(0x225))[getString(0x408)] > 0x0)
          for (let _0x17365b = 0x0; _0x17365b < _0x58c806[getString(0x408)]; _0x17365b++) {
            if (_0x58c806[_0x17365b].checked === ![]) {
              if (_0x17365b === 0x0 && (getId(getString(0x36b)).checked || _0x16a6be === ![]))
                _0x58c806[_0x17365b].click();
              else {
                if (
                  _0x17365b === _0x58c806[getString(0x408)] - 0x1 &&
                  (getId(getString(0x36b)).checked || _0x43ae0b === ![])
                )
                  _0x58c806[_0x17365b][getString(0x304)]();
                else
                  _0x17365b !== 0x0 &&
                    _0x17365b !== _0x58c806[getString(0x408)] - 0x1 &&
                    _0x58c806[_0x17365b][getString(0x304)]();
              }
            }
          }
      }
    }
  }
  function initLaneGuidanceClickSaver() {
    const _0x3dd95f = getString;
    let _0x324acf = new MutationObserver((_0x23b79c) => {
      const getString = getString;
      if (
        W[getString(0x281)]["getSelectedFeatures"]()[0x0] &&
        W[getString(0x281)][getString(0x476)]()[0x0]["attributes"][getString(0x23a)][getString(0x3db)]["type"] ===
          getString(0x1f7) &&
        getId("lt-ScriptEnabled").checked
      ) {
        let _0x21e4b9 = document[getString(0x2fd)](getString(0x316));
        for (let _0x1dd303 = 0x0; _0x1dd303 < _0x21e4b9[getString(0x408)]; _0x1dd303++) {
          _0x21e4b9[_0x1dd303][getString(0x35d)](
            "change",
            function () {
              const _0x253b40 = getString;
              let _0x2cc679 = $(this)[_0x253b40(0x219)]()["eq"](0x9),
                _0x80b8a5 = _0x2cc679[0x0]["parentElement"]["className"];
              setTimeout(setTurns(_0x80b8a5), 0x32);
            },
            ![]
          );
        }
        let _0xb4fbc1 = document[getString(0x2e5)](getString(0x1ff));
        for (let _0x278b52 = 0x0; _0x278b52 < _0xb4fbc1["length"]; _0x278b52++) {
          _0xb4fbc1[_0x278b52]["addEventListener"](
            "click",
            function () {
              const _0x13dc18 = getString;
              let _0x45dfc7 = $(this)[_0x13dc18(0x219)]()["eq"](0x9),
                _0x24c520 = _0x45dfc7[0x0][_0x13dc18(0x22a)][_0x13dc18(0x218)];
              setTimeout(setTurns(_0x24c520), 0x32);
            },
            ![]
          );
        }
      }
    });
    _0x324acf[_0x3dd95f(0x2a8)](document["getElementById"]("edit-panel"), {
      childList: true,
      subtree: true,
    });
  }
  function isHeuristicsCandidate(
    _0x2bb3f1,
    _0x5d08e4,
    _0xac0e82,
    _0x1aa31e,
    _0x20557a,
    _0x25826c,
    _0x5aa7bb,
    _0x1a610d
  ) {
    const _0xbae650 = getString;
    if (
      _0x2bb3f1 == null ||
      _0x5d08e4 == null ||
      _0xac0e82 == null ||
      _0x1aa31e == null ||
      _0x20557a == null ||
      _0x5aa7bb == null ||
      _0x1a610d == null
    )
      return lt_log(_0xbae650(0x27a), 0x1), 0x0;
    let _0x1859f0 = null,
      _0x4f9be7 = null,
      _0x96949d = 0x0,
      _0x4777ff = null,
      _0x28857a = null,
      _0x96fad4 = null,
      _0x4e91d5 = 0x0,
      _0x4fd61c = null,
      _0x1c6b60 = null,
      _0x5063e3 = 0x0,
      _0x296190 = 0x0;
    if (_0x25826c > MAX_LEN_HEUR) return 0x0;
    const _0x453456 = _0x2bb3f1["attributes"]["id"];
    let _0x11d184 = _0x43a6d2(_0x5d08e4[_0xbae650(0x395)]["id"], _0x2bb3f1),
      _0x5349e1 = _0xca5734(_0x1aa31e[_0xbae650(0x395)]["id"], _0x2bb3f1),
      _0x18525c = -0x5a,
      _0x26651c = 0x5a;
    W["model"][_0xbae650(0x375)] && ((_0x18525c = 0x5a), (_0x26651c = -0x5a));
    lt_log("==================================================================================", 0x2),
      lt_log(
        _0xbae650(0x332) +
          _0x453456 +
          _0xbae650(0x20e) +
          _0x5d08e4[_0xbae650(0x395)]["id"] +
          "\x20azm\x20" +
          _0x11d184 +
          _0xbae650(0x33b) +
          _0xac0e82["length"],
        0x2
      );
    let _0x31cf01 = _0x1aa31e[_0xbae650(0x26a)]();
    for (let _0x44e325 = 0x0; _0x44e325 < _0x31cf01[_0xbae650(0x408)]; _0x44e325++) {
      let _0x3d1be6 = 0x0;
      if (_0x31cf01[_0x44e325] === _0x453456) continue;
      const _0x71a39c = getSegObj(_0x31cf01[_0x44e325]);
      if (!_0x493643(_0x71a39c, _0x1aa31e, _0x2bb3f1)) continue;
      let _0x3c6b23 = _0x43a6d2(_0x1aa31e[_0xbae650(0x395)]["id"], _0x71a39c),
        _0x4ef283 = _0xcd5d5b(_0x3c6b23, _0x5349e1);
      lt_log(
        _0xbae650(0x282) + _0x31cf01[_0x44e325] + ":\x20" + _0x4ef283 + "(" + _0x3c6b23 + "," + _0x5349e1 + ")",
        0x3
      );
      if (Math["abs"](_0x4ef283) > MAX_STRAIGHT_DIF) {
        if (Math[_0xbae650(0x2c3)](_0x4ef283) > MAX_STRAIGHT_TO_CONSIDER) continue;
        lt_log(_0xbae650(0x3ae) + _0x4ef283, 0x2), (_0x3d1be6 = HeuristicsCandidate[_0xbae650(0x448)]);
      }
      const _0x4c0fc6 = _0x5aa7bb[_0xbae650(0x37e)](_0x1aa31e, _0x71a39c, _0x2bb3f1),
        _0x264c0a = _0x4c0fc6[_0xbae650(0x254)]();
      if (_0x264c0a[_0xbae650(0x3a5)] !== 0x1 || !_0x264c0a[_0xbae650(0x373)]()) {
        lt_log(_0xbae650(0x3e4) + _0x31cf01[_0x44e325] + "\x20to\x20" + _0x453456, 0x3);
        continue;
      }
      let _0x3354a1 = _0x264c0a[_0xbae650(0x3f9)]["toLaneIndex"] - _0x264c0a[_0xbae650(0x3f9)][_0xbae650(0x2da)] + 0x1;
      _0x3354a1 !== _0x20557a &&
        !(_0x20557a === 0x0 && _0x3354a1 === 0x1) &&
        (lt_log(_0xbae650(0x40d), 0x2), (_0x3d1be6 = HeuristicsCandidate[_0xbae650(0x3f0)]));
      if (_0x4777ff !== null && _0x3d1be6 >= _0x4e91d5) {
        if (_0x4e91d5 === 0x0 && _0x3d1be6 === 0x0)
          return (
            lt_log(
              _0xbae650(0x2ba) +
                _0x2bb3f1["attributes"]["id"] +
                ":\x20" +
                _0x4777ff[_0xbae650(0x395)]["id"] +
                "," +
                _0x71a39c["attributes"]["id"],
              0x2
            ),
            lt_log("==================================================================================", 0x2),
            0x0
          );
      }
      (_0x4777ff = _0x71a39c),
        (_0x28857a = _0x3c6b23),
        (_0x96fad4 = _0x4ef283),
        (_0x296190 = _0x3354a1),
        (_0x4e91d5 = _0x3d1be6),
        (_0x1a610d[_0xbae650(0x406)] = _0x4777ff),
        (_0x1a610d[_0xbae650(0x40b)] =
          _0x4c0fc6[_0xbae650(0x2f7)]["direction"] === "fwd" ? Direction[_0xbae650(0x2df)] : Direction["REVERSE"]);
    }
    if (_0x4777ff == null) return lt_log(_0xbae650(0x32e), 0x2), 0x0;
    else
      lt_log(
        _0xbae650(0x35f) + _0x4777ff[_0xbae650(0x395)]["id"] + "\x20" + (_0x4e91d5 === 0x0 ? "" : _0xbae650(0x3a3)),
        0x2
      );
    for (let _0x17c1e7 = 0x0; _0x17c1e7 < _0xac0e82[_0xbae650(0x408)]; _0x17c1e7++) {
      let _0x10d7bb = 0x0;
      if (_0xac0e82[_0x17c1e7] === _0x453456) continue;
      const _0x3e085f = getSegObj(_0xac0e82[_0x17c1e7]);
      if (!_0x493643(_0x2bb3f1, _0x5d08e4, _0x3e085f)) continue;
      let _0xff74b4 = _0xca5734(_0x5d08e4[_0xbae650(0x395)]["id"], _0x3e085f),
        _0x1bf6a7 = _0xcd5d5b(_0x11d184, _0xff74b4);
      lt_log(
        "Turn\x20angle\x20to\x20outseg2\x20" +
          _0xac0e82[_0x17c1e7] +
          ":\x20" +
          _0x1bf6a7 +
          "(" +
          _0x11d184 +
          "," +
          _0xff74b4 +
          ")",
        0x2
      );
      if (Math["abs"](_0x18525c - _0x1bf6a7) < MAX_PERP_TO_CONSIDER) return 0x0;
      if (Math[_0xbae650(0x2c3)](_0x26651c - _0x1bf6a7) > MAX_PERP_DIF) {
        if (Math["abs"](_0x26651c - _0x1bf6a7) > MAX_PERP_TO_CONSIDER) continue;
        lt_log("\x20\x20\x20Not\x20eligible\x20as\x20outseg2:\x20" + _0x1bf6a7, 0x2),
          (_0x10d7bb = HeuristicsCandidate[_0xbae650(0x448)]);
      }
      if (_0x1859f0 !== null && _0x10d7bb >= _0x96949d) {
        if (_0x96949d === 0x0 && _0x10d7bb === 0x0)
          return (
            lt_log(
              _0xbae650(0x385) +
                _0x2bb3f1[_0xbae650(0x395)]["id"] +
                ":\x20" +
                _0x1859f0[_0xbae650(0x395)]["id"] +
                "," +
                _0x3e085f["attributes"]["id"],
              0x2
            ),
            lt_log("==================================================================================", 0x2),
            0x0
          );
      }
      (_0x1859f0 = _0x3e085f), (_0x4f9be7 = _0x1bf6a7), (_0x96949d = _0x10d7bb);
    }
    if (_0x1859f0 == null) return lt_log(_0xbae650(0x3ec), 0x2), 0x0;
    else
      lt_log(
        "Found\x20outseg2\x20candidate:\x20" +
          _0x1859f0[_0xbae650(0x395)]["id"] +
          "\x20" +
          (_0x96949d === 0x0 ? "" : "(failed)"),
        0x2
      );
    for (let _0x219be8 = 0x0; _0x219be8 < _0x31cf01["length"]; _0x219be8++) {
      if (_0x31cf01[_0x219be8] === _0x453456 || _0x31cf01[_0x219be8] === _0x4777ff[_0xbae650(0x395)]["id"]) continue;
      const _0x1b9808 = getSegObj(_0x31cf01[_0x219be8]);
      let _0x3edc74 = 0x0;
      if (
        (_0x1b9808[_0xbae650(0x395)][_0xbae650(0x2f9)] &&
          _0x1b9808[_0xbae650(0x395)][_0xbae650(0x28a)] !== _0x1aa31e[_0xbae650(0x395)]["id"]) ||
        (_0x1b9808[_0xbae650(0x395)][_0xbae650(0x223)] &&
          _0x1b9808[_0xbae650(0x395)]["fromNodeID"] !== _0x1aa31e[_0xbae650(0x395)]["id"])
      )
        continue;
      let _0x46ff80 = _0x43a6d2(_0x1aa31e[_0xbae650(0x395)]["id"], _0x1b9808),
        _0x58b38d = _0xcd5d5b(_0x28857a, _0x46ff80);
      lt_log(
        _0xbae650(0x2f8) + _0x31cf01[_0x219be8] + ":\x20" + _0x58b38d + "(" + _0x28857a + "," + _0x46ff80 + ")",
        0x3
      );
      if (Math[_0xbae650(0x2c3)](_0x18525c - _0x58b38d) > MAX_PERP_DIF_ALT) {
        if (Math[_0xbae650(0x2c3)](_0x18525c - _0x58b38d) > MAX_PERP_TO_CONSIDER) continue;
        lt_log(_0xbae650(0x1fb) + _0x58b38d, 0x3), (_0x3edc74 = HeuristicsCandidate[_0xbae650(0x448)]);
      }
      if (_0x4fd61c !== null) {
        if (_0x3edc74 < _0x5063e3) continue;
        if (_0x5063e3 === 0x0 && _0x3edc74 === 0x0)
          return (
            lt_log(
              _0xbae650(0x2bd) +
                _0x2bb3f1[_0xbae650(0x395)]["id"] +
                ":\x20" +
                _0x4fd61c[_0xbae650(0x395)]["id"] +
                "," +
                _0x1b9808[_0xbae650(0x395)]["id"],
              0x2
            ),
            lt_log(_0xbae650(0x3c7), 0x2),
            HeuristicsCandidate[_0xbae650(0x448)]
          );
      }
      (_0x4fd61c = _0x1b9808), (_0x1c6b60 = _0x46ff80), (_0x5063e3 = _0x3edc74);
    }
    if (_0x4fd61c == null) return lt_log(_0xbae650(0x3ce), 0x2), 0x0;
    else
      lt_log(
        _0xbae650(0x2c9) + _0x4fd61c[_0xbae650(0x395)]["id"] + "\x20" + (_0x5063e3 === 0x0 ? "" : _0xbae650(0x3a3)),
        0x2
      );
    if (_0x4e91d5 < 0x0 || _0x5063e3 < 0x0 || _0x96949d < 0x0)
      return (
        lt_log(_0xbae650(0x3e5) + _0x453456 + "\x20(\x20" + Math["min"](_0x4e91d5, _0x5063e3, _0x96949d) + ")", 0x2),
        _0x4e91d5 === HeuristicsCandidate["FAIL"] ||
        _0x5063e3 === HeuristicsCandidate[_0xbae650(0x448)] ||
        _0x96949d === HeuristicsCandidate[_0xbae650(0x448)]
          ? HeuristicsCandidate["FAIL"]
          : HeuristicsCandidate["ERROR"]
      );
    lt_log(
      _0xbae650(0x39a) + _0x453456 + "\x20to\x20" + _0x1859f0[_0xbae650(0x395)]["id"] + _0xbae650(0x3f2) + _0x4f9be7,
      0x2
    );
    return 0x1;
    function _0xca5734(_0x15149a, _0x25a1f9) {
      const _0x3604c8 = _0xbae650;
      if (_0x15149a == null || _0x25a1f9 == null) return null;
      let _0x1fef83, _0x3934e8;
      _0x25a1f9["attributes"]["fromNodeID"] === _0x15149a
        ? ((_0x1fef83 = lt_get_second_point(_0x25a1f9)["x"] - lt_get_first_point(_0x25a1f9)["x"]),
          (_0x3934e8 = lt_get_second_point(_0x25a1f9)["y"] - lt_get_first_point(_0x25a1f9)["y"]))
        : ((_0x1fef83 = lt_get_next_to_last_point(_0x25a1f9)["x"] - lt_get_last_point(_0x25a1f9)["x"]),
          (_0x3934e8 = lt_get_next_to_last_point(_0x25a1f9)["y"] - lt_get_last_point(_0x25a1f9)["y"]));
      let _0x21c597 = Math["atan2"](_0x3934e8, _0x1fef83),
        _0x232509 = ((_0x21c597 * 0xb4) / Math["PI"]) % 0x168;
      return (
        lt_log(
          "Azm\x20from\x20node\x20" + _0x15149a + "\x20/\x20" + _0x25a1f9[_0x3604c8(0x395)]["id"] + ":\x20" + _0x232509,
          0x3
        ),
        _0x232509
      );
    }
    function _0x43a6d2(_0x293709, _0x3901cd) {
      const _0x35eb99 = _0xbae650;
      let _0x39f1a3 = _0xca5734(_0x293709, _0x3901cd),
        _0x228ce5 = _0x39f1a3 + 0xb4;
      return (
        _0x228ce5 >= 0xb4 && (_0x228ce5 -= 0x168),
        lt_log(
          _0x35eb99(0x407) + _0x293709 + _0x35eb99(0x3b1) + _0x3901cd[_0x35eb99(0x395)]["id"] + ":\x20" + _0x228ce5,
          0x3
        ),
        _0x228ce5
      );
    }
    function _0xcd5d5b(_0x362a09, _0xd93a20) {
      const _0x21c3d4 = _0xbae650;
      let _0x240602 = _0x362a09,
        _0x56fa6c = _0xd93a20;
      while (_0xd93a20 > 0xb4) {
        _0x56fa6c -= 0x168;
      }
      while (_0xd93a20 < -0xb4) {
        _0x56fa6c += 0x168;
      }
      while (_0x362a09 > 0xb4) {
        _0x240602 -= 0x168;
      }
      while (_0x362a09 < -0xb4) {
        _0x240602 += 0x168;
      }
      let _0x1eb39a = _0x56fa6c - _0x240602;
      return (
        (_0x1eb39a += _0x1eb39a > 0xb4 ? -0x168 : _0x1eb39a < -0xb4 ? 0x168 : 0x0),
        lt_log(_0x21c3d4(0x362) + _0x240602 + "," + _0x56fa6c + ":\x20" + _0x1eb39a, 0x3),
        _0x1eb39a
      );
    }
    function _0x493643(_0x17bc7b, _0x31445a, _0x85690c) {
      const _0xddec1 = _0xbae650;
      lt_log(
        _0xddec1(0x338) +
          _0x17bc7b[_0xddec1(0x395)]["id"] +
          _0xddec1(0x365) +
          _0x85690c[_0xddec1(0x395)]["id"] +
          "\x20via\x20" +
          _0x31445a[_0xddec1(0x395)]["id"] +
          _0xddec1(0x1e8) +
          _0x31445a[_0xddec1(0x39c)](_0x17bc7b, _0x85690c) +
          _0xddec1(0x324) +
          _0x17bc7b[_0xddec1(0x369)](_0x85690c, _0x31445a),
        0x3
      );
      if (!_0x31445a["isTurnAllowedBySegDirections"](_0x17bc7b, _0x85690c)) return lt_log(_0xddec1(0x2af), 0x3), ![];
      if (!_0x17bc7b[_0xddec1(0x369)](_0x85690c, _0x31445a)) return lt_log("Other\x20restriction\x20applies", 0x3), ![];
      return true;
    }
  }
  function lt_segment_length(_0x59d9ca) {
    let _0x1c8c74 = _0x59d9ca[getString(0x28f)][getString(0x303)](W.map.olMap["projection"]);
    return (
      lt_log(
        getString(0x258) +
          _0x59d9ca[getString(0x395)]["id"] +
          getString(0x3c9) +
          _0x1c8c74 +
          getString(0x25c) +
          _0x59d9ca[getString(0x395)][getString(0x408)],
        0x3
      ),
      _0x1c8c74
    );
  }
  function lt_log(_0x46cc1d, _0x20954f = 0x1) {
    const _0x5bd067 = getString;
    _0x20954f <= LANETOOLS_DEBUG_LEVEL && console.log(_0x5bd067(0x45d), _0x46cc1d);
  }
  function copyLaneInfo(_0x4f9c8b) {
    const _0x59cea2 = getString;
    _turnInfo = [];
    const _0x25945e = W[_0x59cea2(0x281)][_0x59cea2(0x476)](),
      _0x1ba7a9 = _0x25945e[0x0]["attributes"][_0x59cea2(0x23a)][_0x59cea2(0x3db)],
      _0x4bfbf5 = _0x1ba7a9["getFeatureAttributes"](),
      _0x1a41f6 = _0x1ba7a9[_0x59cea2(0x28f)]["components"],
      _0x12a54d = _0x4f9c8b === "A" ? _0x4bfbf5[_0x59cea2(0x3bd)] : _0x4bfbf5[_0x59cea2(0x28a)];
    (laneCount = _0x4f9c8b === "A" ? _0x4bfbf5[_0x59cea2(0x3b7)] : _0x4bfbf5[_0x59cea2(0x334)]),
      console[_0x59cea2(0x387)](laneCount);
    const _0x41cbb8 = getNodeObj(_0x12a54d),
      _0x24af2d = _0x41cbb8[_0x59cea2(0x26a)](),
      _0x29bdcc = W[_0x59cea2(0x240)][_0x59cea2(0x3af)]();
    let _0x21c177;
    _0x4f9c8b === "A" ? (_0x21c177 = _0x1a41f6[0x1]) : (_0x21c177 = _0x1a41f6[_0x1a41f6[_0x59cea2(0x408)] - 0x2]);
    let _0x17c96f = _0x21c177["x"] - _0x41cbb8[_0x59cea2(0x28f)]["x"],
      _0x3b764f = _0x21c177["y"] - _0x41cbb8[_0x59cea2(0x28f)]["y"],
      _0x25f24a = Math[_0x59cea2(0x3ad)](_0x3b764f, _0x17c96f),
      _0x1b508f = ((_0x25f24a * 0xb4) / Math["PI"]) % 0x168;
    for (let _0x578df3 = 0x0; _0x578df3 < _0x24af2d[_0x59cea2(0x408)]; _0x578df3++) {
      const _0x53ad06 = getSegObj(_0x24af2d[_0x578df3]);
      let _0x56f831 = _0x53ad06[_0x59cea2(0x1f5)](),
        _0x1830fe = _0x53ad06[_0x59cea2(0x28f)][_0x59cea2(0x41b)],
        _0x165d3c,
        _0x5767e7,
        _0x207537 = _0x29bdcc[_0x59cea2(0x37e)](_0x41cbb8, _0x1ba7a9, _0x53ad06)[_0x59cea2(0x254)]();
      if (_0x207537[_0x59cea2(0x3a5)] === 0x1 && _0x207537[_0x59cea2(0x3f9)]) {
        _0x56f831[_0x59cea2(0x3bd)] === _0x12a54d ? (_0x5767e7 = "A") : (_0x5767e7 = "B");
        _0x5767e7 === "A" ? (_0x165d3c = _0x1830fe[0x1]) : (_0x165d3c = _0x1830fe[_0x1830fe["length"] - 0x2]);
        (_0x17c96f = _0x165d3c["x"] - _0x41cbb8["geometry"]["x"]),
          (_0x3b764f = _0x165d3c["y"] - _0x41cbb8["geometry"]["y"]),
          (_0x25f24a = Math[_0x59cea2(0x3ad)](_0x3b764f, _0x17c96f));
        let _0x422251 = ((_0x25f24a * 0xb4) / Math["PI"]) % 0x168;
        if (_0x1b508f < 0x0) _0x422251 = _0x1b508f - _0x422251;
        _turnData = {};
        let _0x2ca8fc = _0x207537[_0x59cea2(0x2b5)]();
        (_turnData["id"] = _0x53ad06[_0x59cea2(0x395)]["id"]),
          (_turnData[_0x59cea2(0x25b)] = _0x422251),
          (_turnData[_0x59cea2(0x3f9)] = _0x2ca8fc),
          _turnInfo[_0x59cea2(0x3c0)](_turnData);
      }
      _turnInfo["sort"]((_0x1252aa, _0x286486) => (_0x1252aa["order"] > _0x286486[_0x59cea2(0x25b)] ? 0x1 : -0x1));
    }
    console[_0x59cea2(0x387)](_turnInfo);
  }
  function pasteLaneInfo(_0x448ddd) {
    const _0xf89295 = getString,
      _0x1e93ec = new MultiAction();
    _0x1e93ec[_0xf89295(0x3ba)](W[_0xf89295(0x240)]);
    const _0x3fc5ef = W[_0xf89295(0x281)][_0xf89295(0x476)](),
      _0x4ccb0d = _0x3fc5ef[0x0][_0xf89295(0x395)][_0xf89295(0x23a)][_0xf89295(0x3db)],
      _0x53af53 = _0x4ccb0d[_0xf89295(0x28f)][_0xf89295(0x41b)],
      _0x39e642 = _0x4ccb0d[_0xf89295(0x1f5)](),
      _0xdafc0a = _0x448ddd === "A" ? _0x39e642[_0xf89295(0x3bd)] : _0x39e642[_0xf89295(0x28a)];
    let _0x1989c7;
    const _0x32336a = getNodeObj(_0xdafc0a),
      _0x27cbad = _0x32336a["getSegmentIds"](),
      _0x27b04e = W[_0xf89295(0x240)]["getTurnGraph"]();
    let _0x44e9fd = {},
      _0x1b740b = [];
    _0x448ddd === "A" ? (_0x1989c7 = _0x53af53[0x1]) : (_0x1989c7 = _0x53af53[_0x53af53[_0xf89295(0x408)] - 0x2]);
    let _0x2362eb = _0x1989c7["x"] - _0x32336a[_0xf89295(0x28f)]["x"],
      _0x480d3d = _0x1989c7["y"] - _0x32336a[_0xf89295(0x28f)]["y"],
      _0x33018e = Math["atan2"](_0x480d3d, _0x2362eb),
      _0xf2c260 = ((_0x33018e * 0xb4) / Math["PI"]) % 0x168;
    for (let _0x1333e9 = 0x0; _0x1333e9 < _0x27cbad[_0xf89295(0x408)]; _0x1333e9++) {
      let _0x3831b2 = getSegObj(_0x27cbad[_0x1333e9]),
        _0x5842af = _0x3831b2["attributes"],
        _0x3619b7 = _0x3831b2[_0xf89295(0x28f)][_0xf89295(0x41b)],
        _0x3374c6 = {},
        _0x52b37f,
        _0x4fcd04 = _0x27b04e[_0xf89295(0x37e)](_0x32336a, _0x4ccb0d, _0x3831b2)[_0xf89295(0x254)]();
      _0x5842af[_0xf89295(0x3bd)] === _0xdafc0a ? (_0x52b37f = "A") : (_0x52b37f = "B");
      _0x52b37f === "A" ? (_0x3374c6 = _0x3619b7[0x1]) : (_0x3374c6 = _0x3619b7[_0x3619b7[_0xf89295(0x408)] - 0x2]);
      if (_0x4fcd04["state"] === 0x1) {
        (_0x44e9fd = {}),
          (_0x2362eb = _0x3374c6["x"] - _0x32336a[_0xf89295(0x28f)]["x"]),
          (_0x480d3d = _0x3374c6["y"] - _0x32336a[_0xf89295(0x28f)]["y"]),
          (_0x33018e = Math[_0xf89295(0x3ad)](_0x480d3d, _0x2362eb));
        let _0x528fbb = ((_0x33018e * 0xb4) / Math["PI"]) % 0x168;
        if (_0xf2c260 < 0x0) _0x528fbb = _0xf2c260 - _0x528fbb;
        (_0x44e9fd["id"] = _0x5842af["id"]),
          (_0x44e9fd[_0xf89295(0x25b)] = _0x528fbb),
          _0x1b740b[_0xf89295(0x3c0)](_0x44e9fd);
      }
      _0x1b740b[_0xf89295(0x388)]((_0x42b904, _0xb23157) =>
        _0x42b904[_0xf89295(0x25b)] > _0xb23157[_0xf89295(0x25b)] ? 0x1 : -0x1
      );
    }
    console[_0xf89295(0x387)](_0x1b740b);
    if (_turnInfo[_0xf89295(0x408)] === _0x1b740b["length"]) {
      _0x448ddd === "A"
        ? _0x1e93ec[_0xf89295(0x222)](new UpdateObj(_0x4ccb0d, { revLaneCount: laneCount }))
        : _0x1e93ec[_0xf89295(0x222)](new UpdateObj(_0x4ccb0d, { fwdLaneCount: laneCount }));
      for (let _0x392af3 = 0x0; _0x392af3 < _0x1b740b["length"]; _0x392af3++) {
        let _0x1662da = {};
        for (let _0x1f1e9b = 0x0; _0x1f1e9b < _turnInfo[_0xf89295(0x408)]; _0x1f1e9b++) {
          _0x1662da[_0x1f1e9b] = _turnInfo[_0x1f1e9b];
        }
        let _0x1d44a8 = getSegObj(_0x1b740b[_0x392af3]["id"]),
          _0x4e30d7 = _0x27b04e[_0xf89295(0x37e)](_0x32336a, _0x4ccb0d, _0x1d44a8),
          _0x469b71 = _0x4e30d7[_0xf89295(0x254)]();
        (_0x469b71 = _0x469b71["withLanes"](_0x1662da[_0x392af3]["lanes"])),
          (_0x4e30d7 = _0x4e30d7[_0xf89295(0x363)](_0x469b71)),
          _0x1e93ec["doSubAction"](new SetTurn(_0x27b04e, _0x4e30d7));
      }
      (_0x1e93ec[_0xf89295(0x3e9)] = _0xf89295(0x288)),
        W["model"]["actionManager"][_0xf89295(0x455)](_0x1e93ec),
        $(".lanes-tab")[_0xf89295(0x304)]();
    } else WazeWrap[_0xf89295(0x46a)][_0xf89295(0x266)](GM_info["script"]["name"], _0xf89295(0x3ed));
  }
  function displayLaneGraphics() {
    const getString = getString;
    removeLaneGraphics();
    const _0x4559f2 = W[getString(0x281)][getString(0x476)]();
    if (
      !getId(getString(0x280)).checked ||
      !getId(getString(0x3b3)).checked ||
      _0x4559f2["length"] !== 0x1 ||
      _0x4559f2[0x0][getString(0x395)][getString(0x23a)]["_wmeObject"][getString(0x478)] !== "segment"
    )
      return;
    const _0x2d2ac0 = _0x4559f2[0x0][getString(0x395)][getString(0x23a)][getString(0x3db)],
      _0x512da9 = W[getString(0x423)][getString(0x2f2)]()[getString(0x3f3)]();
    if ((_0x2d2ac0[getString(0x395)][getString(0x42f)] !== (0x3 || 0x6 || 0x7) && _0x512da9 < 0x10) || _0x512da9 < 0xf)
      return;
    let _0x2d2a03 =
        _0x2d2ac0[getString(0x395)][getString(0x334)] > 0x0
          ? _0x5694f9(
              $(".fwd-lanes")
                [getString(0x46c)](getString(0x2d5))
                [getString(0x423)](function () {
                  return this;
                })
                ["get"]()
            )
          : ![],
      _0x154122 =
        _0x2d2ac0["attributes"][getString(0x3b7)] > 0x0
          ? _0x5694f9(
              $(getString(0x2ef))
                [getString(0x46c)](getString(0x2d5))
                [getString(0x423)](function () {
                  return this;
                })
                [getString(0x250)]()
            )
          : ![];
    function _0x5694f9(_0x3399d1) {
      const _0x205264 = getString;
      let _0x2c1862 = {};
      for (let _0xa51b27 = 0x0; _0xa51b27 < _0x3399d1["length"]; _0xa51b27++) {
        let _0x3ce23 = {};
        (_0x3ce23[_0x205264(0x284)] =
          $(_0x3399d1[_0xa51b27])[_0x205264(0x46c)](".uturn")[_0x205264(0x1e9)](_0x205264(0x36a)) !== "none"),
          (_0x3ce23[_0x205264(0x235)] =
            $(_0x3399d1[_0xa51b27])[_0x205264(0x46c)](".small-uturn").css(_0x205264(0x36a)) !== _0x205264(0x460)),
          (_0x3ce23[_0x205264(0x2b8)] = $(_0x3399d1[_0xa51b27])
            [_0x205264(0x46c)](_0x205264(0x2b8))
            [_0x205264(0x423)](function () {
              return this;
            })
            [_0x205264(0x250)]()),
          (_0x2c1862[_0xa51b27] = _0x3ce23);
      }
      return _0x2c1862;
    }
    let _0x5dea5f = _0x2d2a03 != ![] ? _0x4db382(_0x2d2a03) : ![],
      _0x326722 = _0x154122 != ![] ? _0x4db382(_0x154122) : ![];
    function _0x4db382(_0x22e6e2) {
      const _0x51d477 = getString,
        _0x16f923 = new XMLSerializer();
      return (
        _[_0x51d477(0x3e2)](_0x22e6e2, (_0xa929da) => {
          const _0x628005 = _0x51d477;
          try {
            let _0x1b9e83 = _0xa929da["svg"][0x0],
              _0x2e4457 = _0x16f923[_0x628005(0x404)](_0x1b9e83);
            _0xa929da["svg"] = _0x628005(0x417) + window[_0x628005(0x317)](_0x2e4457);
          } catch (_0x4dcd47) {
            return;
          }
        }),
        _0x22e6e2
      );
    }
    _0x2d2a03 &&
      _0x19644c(W["model"][getString(0x447)][getString(0x393)](_0x2d2ac0[getString(0x395)]["toNodeID"]), _0x5dea5f);
    _0x154122 &&
      _0x19644c(W["model"][getString(0x447)][getString(0x393)](_0x2d2ac0["attributes"][getString(0x3bd)]), _0x326722);
    function _0x19644c(_0x2866d6, _0x533989) {
      const _0xfc0dd4 = getString;
      let _0x55da4e = _0x24ac62(),
        _0xc7a2c4 = getCardinalAngle(_0x2866d6["attributes"]["id"], _0x2d2ac0),
        _0x1d852d,
        _0x55c2d7 = [],
        _0x1c3e29 = 0x0,
        _0x5095aa = Object[_0xfc0dd4(0x3bb)](_0x533989)["length"];
      if (!getId("lt-IconsRotate").checked) _0xc7a2c4 = -0x5a;
      if (_0xc7a2c4 === 0x0) (_0xc7a2c4 += 0xb4), (_0x1c3e29 = 0x1);
      else {
        if (_0xc7a2c4 > 0x0 && _0xc7a2c4 <= 0x1e) (_0xc7a2c4 += 0x2 * (0x5a - _0xc7a2c4)), (_0x1c3e29 = 0x1);
        else {
          if (_0xc7a2c4 >= 0x14a && _0xc7a2c4 <= 0x168)
            (_0xc7a2c4 -= 0xb4 - 0x2 * (0x168 - _0xc7a2c4)), (_0x1c3e29 = 0x1);
          else {
            if (_0xc7a2c4 > 0x1e && _0xc7a2c4 < 0x3c)
              (_0xc7a2c4 -= 0x5a - 0x2 * (0x168 - _0xc7a2c4)), (_0x1c3e29 = 0x2);
            else {
              if (_0xc7a2c4 >= 0x3c && _0xc7a2c4 <= 0x78)
                (_0xc7a2c4 -= 0x5a - 0x2 * (0x168 - _0xc7a2c4)), (_0x1c3e29 = 0x2);
              else {
                if (_0xc7a2c4 > 0x78 && _0xc7a2c4 < 0x96)
                  (_0xc7a2c4 -= 0x5a - 0x2 * (0x168 - _0xc7a2c4)), (_0x1c3e29 = 0x7);
                else {
                  if (_0xc7a2c4 >= 0x96 && _0xc7a2c4 <= 0xd2) (_0xc7a2c4 = 0xb4 - _0xc7a2c4), (_0x1c3e29 = 0x4);
                  else {
                    if (_0xc7a2c4 > 0xd2 && _0xc7a2c4 < 0xf0)
                      (_0xc7a2c4 -= 0x5a - 0x2 * (0x168 - _0xc7a2c4)), (_0x1c3e29 = 0x6);
                    else {
                      if (_0xc7a2c4 >= 0xf0 && _0xc7a2c4 <= 0x12c)
                        (_0xc7a2c4 -= 0xb4 - 0x2 * (0x168 - _0xc7a2c4)), (_0x1c3e29 = 0x3);
                      else
                        _0xc7a2c4 > 0x12c && _0xc7a2c4 < 0x14a
                          ? ((_0xc7a2c4 -= 0xb4 - 0x2 * (0x168 - _0xc7a2c4)), (_0x1c3e29 = 0x5))
                          : console[_0xfc0dd4(0x387)](_0xfc0dd4(0x328));
                    }
                  }
                }
              }
            }
          }
        }
      }
      let _0x3b5791 = _0xc7a2c4 > 0x13b ? _0xc7a2c4 : _0xc7a2c4 + 0x5a,
        _0x2fcc96 = 0x168 - _0x3b5791;
      function _0x4b99ab(_0x23f39e) {
        const _0x1ad029 = _0xfc0dd4;
        temp = {};
        if (UPDATEDZOOM) {
          if (_0x23f39e === 0x0)
            temp = {
              x: _0x2866d6["geometry"]["x"] + _0x55da4e[_0x1ad029(0x471)] * 0x2,
              y: _0x2866d6["geometry"]["y"] + _0x55da4e[_0x1ad029(0x381)],
            };
          else {
            if (_0x23f39e === 0x1)
              temp = {
                x: _0x2866d6[_0x1ad029(0x28f)]["x"] + _0x55da4e[_0x1ad029(0x381)],
                y: _0x2866d6[_0x1ad029(0x28f)]["y"] + (_0x55da4e[_0x1ad029(0x346)] * _0x5095aa) / 1.8,
              };
            else {
              if (_0x23f39e === 0x2)
                temp = {
                  x:
                    _0x2866d6[_0x1ad029(0x28f)]["x"] -
                    (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e[_0x1ad029(0x346)] * _0x5095aa),
                  y: _0x2866d6[_0x1ad029(0x28f)]["y"] + (_0x55da4e["start"] + _0x55da4e[_0x1ad029(0x381)]),
                };
              else {
                if (_0x23f39e === 0x3)
                  temp = {
                    x: _0x2866d6[_0x1ad029(0x28f)]["x"] + (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e[_0x1ad029(0x346)]),
                    y: _0x2866d6[_0x1ad029(0x28f)]["y"] - (_0x55da4e["start"] + _0x55da4e[_0x1ad029(0x381)]),
                  };
                else {
                  if (_0x23f39e === 0x4)
                    temp = {
                      x: _0x2866d6["geometry"]["x"] - (_0x55da4e["start"] + _0x55da4e[_0x1ad029(0x381)] * 1.5),
                      y:
                        _0x2866d6[_0x1ad029(0x28f)]["y"] -
                        (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e[_0x1ad029(0x346)] * _0x5095aa * 1.5),
                    };
                  else {
                    if (_0x23f39e === 0x5)
                      temp = {
                        x:
                          _0x2866d6[_0x1ad029(0x28f)]["x"] +
                          (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e[_0x1ad029(0x346)] / 0x2),
                        y: _0x2866d6["geometry"]["y"] + _0x55da4e["start"] / 0x2,
                      };
                    else {
                      if (_0x23f39e === 0x6)
                        temp = {
                          x: _0x2866d6[_0x1ad029(0x28f)]["x"] - _0x55da4e[_0x1ad029(0x471)],
                          y:
                            _0x2866d6[_0x1ad029(0x28f)]["y"] -
                            _0x55da4e["start"] * ((_0x55da4e[_0x1ad029(0x346)] * _0x5095aa) / 0x2),
                        };
                      else
                        _0x23f39e === 0x7 &&
                          (temp = {
                            x:
                              _0x2866d6["geometry"]["x"] -
                              _0x55da4e[_0x1ad029(0x471)] * ((_0x55da4e["boxincwidth"] * _0x5095aa) / 0x2),
                            y: _0x2866d6[_0x1ad029(0x28f)]["y"] - _0x55da4e[_0x1ad029(0x471)],
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
              x: _0x2866d6[_0x1ad029(0x28f)]["x"] + _0x55da4e[_0x1ad029(0x471)] * 0x2,
              y: _0x2866d6[_0x1ad029(0x28f)]["y"] + _0x55da4e[_0x1ad029(0x381)],
            };
          else {
            if (_0x23f39e === 0x1)
              temp = {
                x: _0x2866d6["geometry"]["x"] + _0x55da4e["boxheight"],
                y: _0x2866d6[_0x1ad029(0x28f)]["y"] + (_0x55da4e[_0x1ad029(0x346)] * _0x5095aa) / 1.8,
              };
            else {
              if (_0x23f39e === 0x2)
                temp = {
                  x:
                    _0x2866d6[_0x1ad029(0x28f)]["x"] -
                    (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e[_0x1ad029(0x346)] * _0x5095aa),
                  y: _0x2866d6[_0x1ad029(0x28f)]["y"] + (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e["boxheight"]),
                };
              else {
                if (_0x23f39e === 0x3)
                  temp = {
                    x: _0x2866d6["geometry"]["x"] + (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e["boxincwidth"]),
                    y:
                      _0x2866d6[_0x1ad029(0x28f)]["y"] -
                      (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e[_0x1ad029(0x381)] * 0x2),
                  };
                else {
                  if (_0x23f39e === 0x4)
                    temp = {
                      x:
                        _0x2866d6[_0x1ad029(0x28f)]["x"] -
                        (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e[_0x1ad029(0x381)] * 1.5),
                      y:
                        _0x2866d6["geometry"]["y"] -
                        (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e["boxincwidth"] * _0x5095aa * 1.5),
                    };
                  else {
                    if (_0x23f39e === 0x5)
                      temp = {
                        x:
                          _0x2866d6[_0x1ad029(0x28f)]["x"] +
                          (_0x55da4e[_0x1ad029(0x471)] + _0x55da4e[_0x1ad029(0x346)] / 0x2),
                        y: _0x2866d6[_0x1ad029(0x28f)]["y"] + _0x55da4e["start"] / 0x2,
                      };
                    else {
                      if (_0x23f39e === 0x6)
                        temp = {
                          x: _0x2866d6[_0x1ad029(0x28f)]["x"] - _0x55da4e[_0x1ad029(0x471)],
                          y:
                            _0x2866d6[_0x1ad029(0x28f)]["y"] -
                            _0x55da4e["start"] * ((_0x55da4e[_0x1ad029(0x346)] * _0x5095aa) / 0x2),
                        };
                      else
                        _0x23f39e === 0x7 &&
                          (temp = {
                            x:
                              _0x2866d6["geometry"]["x"] -
                              _0x55da4e["start"] * ((_0x55da4e["boxincwidth"] * _0x5095aa) / 0x2),
                            y: _0x2866d6["geometry"]["y"] - _0x55da4e["start"],
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
      var _0xc39253 = new OpenLayers[_0xfc0dd4(0x330)]["Point"](
          _0x2a17ea["x"],
          _0x2a17ea["y"] + _0x55da4e[_0xfc0dd4(0x381)]
        ),
        _0x374f3b = new OpenLayers[_0xfc0dd4(0x330)][_0xfc0dd4(0x456)](
          _0x2a17ea["x"] + _0x55da4e["boxincwidth"] * _0x5095aa,
          _0x2a17ea["y"] + _0x55da4e[_0xfc0dd4(0x381)]
        ),
        _0x3d568a = new OpenLayers[_0xfc0dd4(0x330)]["Point"](
          _0x2a17ea["x"] + _0x55da4e["boxincwidth"] * _0x5095aa,
          _0x2a17ea["y"]
        ),
        _0x12cbe6 = new OpenLayers[_0xfc0dd4(0x330)][_0xfc0dd4(0x456)](_0x2a17ea["x"], _0x2a17ea["y"]);
      _0x55c2d7["push"](_0xc39253, _0x374f3b, _0x3d568a, _0x12cbe6);
      var _0x5b7230 = {
        strokeColor: _0xfc0dd4(0x2c6),
        strokeOpacity: 0x1,
        strokeWidth: 0x8,
        fillColor: _0xfc0dd4(0x2c6),
      };
      let _0x548ba5 = new OpenLayers["Geometry"]["LinearRing"](_0x55c2d7);
      (_0x1d852d = _0x548ba5[_0xfc0dd4(0x214)]()), _0x548ba5[_0xfc0dd4(0x2cc)](_0x2fcc96, _0x1d852d);
      let _0x79291a = new OpenLayers[_0xfc0dd4(0x2fc)][_0xfc0dd4(0x209)](_0x548ba5, null, _0x5b7230);
      LTLaneGraphics["addFeatures"]([_0x79291a]);
      let _0xe41aaa = 0x0;
      _[_0xfc0dd4(0x3e2)](_0x533989, (_0x25119b) => {
        const _0x21418c = _0xfc0dd4;
        let _0x4731ea = [];
        var _0x1bd240 = new OpenLayers[_0x21418c(0x330)]["Point"](
            _0x2a17ea["x"] + _0x55da4e["boxincwidth"] * _0xe41aaa + _0x55da4e["iconbordermargin"],
            _0x2a17ea["y"] + _0x55da4e[_0x21418c(0x345)]
          ),
          _0x47bfb1 = new OpenLayers[_0x21418c(0x330)][_0x21418c(0x456)](
            _0x2a17ea["x"] + _0x55da4e[_0x21418c(0x346)] * _0xe41aaa + _0x55da4e["iconborderwidth"],
            _0x2a17ea["y"] + _0x55da4e[_0x21418c(0x345)]
          ),
          _0x2d1e17 = new OpenLayers[_0x21418c(0x330)][_0x21418c(0x456)](
            _0x2a17ea["x"] + _0x55da4e["boxincwidth"] * _0xe41aaa + _0x55da4e[_0x21418c(0x3ea)],
            _0x2a17ea["y"] + _0x55da4e[_0x21418c(0x3d4)]
          ),
          _0x42e795 = new OpenLayers[_0x21418c(0x330)][_0x21418c(0x456)](
            _0x2a17ea["x"] + _0x55da4e["boxincwidth"] * _0xe41aaa + _0x55da4e[_0x21418c(0x3d4)],
            _0x2a17ea["y"] + _0x55da4e["iconbordermargin"]
          );
        _0x4731ea["push"](_0x1bd240, _0x47bfb1, _0x2d1e17, _0x42e795);
        var _0x2c762f = {
          strokeColor: "#000000",
          strokeOpacity: 0x1,
          strokeWidth: 0x1,
          fillColor: _0x21418c(0x424),
        };
        let _0x30718d = new OpenLayers[_0x21418c(0x330)][_0x21418c(0x277)](_0x4731ea);
        _0x30718d["rotate"](_0x2fcc96, _0x1d852d);
        let _0x5f23a1 = new OpenLayers[_0x21418c(0x2fc)]["Vector"](_0x30718d, null, _0x2c762f);
        LTLaneGraphics[_0x21418c(0x38b)]([_0x5f23a1]);
        let _0x305721 = _0x30718d["getCentroid"](),
          _0x5001ff = new OpenLayers[_0x21418c(0x330)][_0x21418c(0x456)](_0x305721["x"], _0x305721["y"]),
          _0x543941 = "",
          _0x4e547b = { x: 0x0, y: 0x0 },
          _0x43b459 = { x: 0x0, y: 0x0 };
        _0x25119b["uturn"] === true &&
          ((_0x543941 = "https://editor-assets.waze.com/production/font/aae5ed152758cb6a9191b91e6cedf322.svg"),
          (_0x4e547b["x"] = 0.6),
          (_0x4e547b["y"] = 0.6),
          (_0x43b459["x"] = -0x7),
          (_0x43b459["y"] = -0xc));
        _0x25119b["miniuturn"] === true &&
          ((_0x543941 = _0x21418c(0x274)),
          (_0x4e547b["x"] = 0.3),
          (_0x4e547b["y"] = 0.25),
          (_0x43b459["x"] = -0x8),
          (_0x43b459["y"] = 0x4));
        let _0x140285 = {
            externalGraphic: _0x25119b[_0x21418c(0x2b8)],
            graphicHeight: _0x55da4e["graphicHeight"],
            graphicWidth: _0x55da4e[_0x21418c(0x2b9)],
            fillColor: "#26bae8",
            bgcolor: "#26bae8",
            color: "#26bae8",
            rotation: _0x3b5791,
            backgroundGraphic: _0x543941,
            backgroundHeight: _0x55da4e[_0x21418c(0x422)] * _0x4e547b["y"],
            backgroundWidth: _0x55da4e[_0x21418c(0x2b9)] * _0x4e547b["x"],
            backgroundXOffset: _0x43b459["x"],
            backgroundYOffset: _0x43b459["y"],
          },
          _0x3f212b = new OpenLayers[_0x21418c(0x2fc)][_0x21418c(0x209)](_0x5001ff, null, _0x140285);
        LTLaneGraphics["addFeatures"]([_0x3f212b]), _0xe41aaa++;
      }),
        LTLaneGraphics[_0xfc0dd4(0x386)](0x258);
    }

    function _0x24ac62() {
      const _0x1e91f7 = getString;
      var _0x1776ce = {};
      if (UPDATEDZOOM)
        switch (W[_0x1e91f7(0x423)][_0x1e91f7(0x2f2)]()["getZoom"]()) {
          case 0x16:
            (_0x1776ce[_0x1e91f7(0x471)] = 0.5),
              (_0x1776ce[_0x1e91f7(0x381)] = 1.7),
              (_0x1776ce[_0x1e91f7(0x346)] = 1.1),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.1),
              (_0x1776ce[_0x1e91f7(0x345)] = 1.6),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 0x1),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x15:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x1),
              (_0x1776ce[_0x1e91f7(0x381)] = 3.2),
              (_0x1776ce[_0x1e91f7(0x346)] = 2.2),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.2),
              (_0x1776ce[_0x1e91f7(0x345)] = 0x3),
              (_0x1776ce["iconborderwidth"] = 0x2),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x14:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x2),
              (_0x1776ce[_0x1e91f7(0x381)] = 5.2),
              (_0x1776ce[_0x1e91f7(0x346)] = 3.8),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.3),
              (_0x1776ce["iconborderheight"] = 4.9),
              (_0x1776ce["iconborderwidth"] = 3.5),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x13:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x3),
              (_0x1776ce[_0x1e91f7(0x381)] = 0xa),
              (_0x1776ce[_0x1e91f7(0x346)] = 7.2),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.4),
              (_0x1776ce[_0x1e91f7(0x345)] = 9.6),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 6.8),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x12:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x6),
              (_0x1776ce[_0x1e91f7(0x381)] = 0x14),
              (_0x1776ce["boxincwidth"] = 0xe),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.5),
              (_0x1776ce["iconborderheight"] = 19.5),
              (_0x1776ce["iconborderwidth"] = 13.5),
              (_0x1776ce["graphicHeight"] = 0x2a),
              (_0x1776ce["graphicWidth"] = 0x19);
            break;
          case 0x11:
            (_0x1776ce[_0x1e91f7(0x471)] = 0xa),
              (_0x1776ce[_0x1e91f7(0x381)] = 0x27),
              (_0x1776ce[_0x1e91f7(0x346)] = 0x1c),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0x1),
              (_0x1776ce[_0x1e91f7(0x345)] = 0x26),
              (_0x1776ce["iconborderwidth"] = 0x1b),
              (_0x1776ce["graphicHeight"] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x10:
            (_0x1776ce[_0x1e91f7(0x471)] = 0xf),
              (_0x1776ce[_0x1e91f7(0x381)] = 0x50),
              (_0x1776ce[_0x1e91f7(0x346)] = 0x37),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0x2),
              (_0x1776ce["iconborderheight"] = 0x4e),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 0x35),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0xf:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x2),
              (_0x1776ce[_0x1e91f7(0x381)] = 0x78),
              (_0x1776ce["boxincwidth"] = 0x5a),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0x3),
              (_0x1776ce[_0x1e91f7(0x345)] = 0x75),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 0x57),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0xe:
            (_0x1776ce["start"] = 0x2),
              (_0x1776ce[_0x1e91f7(0x381)] = 5.2),
              (_0x1776ce["boxincwidth"] = 3.8),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.3),
              (_0x1776ce[_0x1e91f7(0x345)] = 4.9),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 3.5),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
        }
      else
        switch (W[_0x1e91f7(0x423)][_0x1e91f7(0x2f2)]()[_0x1e91f7(0x3f3)]()) {
          case 0xa:
            (_0x1776ce[_0x1e91f7(0x471)] = 0.5),
              (_0x1776ce[_0x1e91f7(0x381)] = 1.7),
              (_0x1776ce["boxincwidth"] = 1.1),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.1),
              (_0x1776ce[_0x1e91f7(0x345)] = 1.6),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 0x1),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x9:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x1),
              (_0x1776ce["boxheight"] = 3.2),
              (_0x1776ce["boxincwidth"] = 2.2),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.2),
              (_0x1776ce[_0x1e91f7(0x345)] = 0x3),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 0x2),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x8:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x2),
              (_0x1776ce[_0x1e91f7(0x381)] = 5.2),
              (_0x1776ce["boxincwidth"] = 3.8),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.3),
              (_0x1776ce[_0x1e91f7(0x345)] = 4.9),
              (_0x1776ce["iconborderwidth"] = 3.5),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x7:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x3),
              (_0x1776ce[_0x1e91f7(0x381)] = 0xa),
              (_0x1776ce[_0x1e91f7(0x346)] = 7.2),
              (_0x1776ce["iconbordermargin"] = 0.4),
              (_0x1776ce[_0x1e91f7(0x345)] = 9.6),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 6.8),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x6:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x6),
              (_0x1776ce[_0x1e91f7(0x381)] = 0x14),
              (_0x1776ce["boxincwidth"] = 0xe),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.5),
              (_0x1776ce[_0x1e91f7(0x345)] = 19.5),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 13.5),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x5:
            (_0x1776ce["start"] = 0xa),
              (_0x1776ce["boxheight"] = 0x28),
              (_0x1776ce["boxincwidth"] = 0x1d),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0x1),
              (_0x1776ce[_0x1e91f7(0x345)] = 0x26),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 0x1b),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x4:
            (_0x1776ce[_0x1e91f7(0x471)] = 0xf),
              (_0x1776ce[_0x1e91f7(0x381)] = 0x50),
              (_0x1776ce[_0x1e91f7(0x346)] = 0x37),
              (_0x1776ce["iconbordermargin"] = 0x2),
              (_0x1776ce["iconborderheight"] = 0x4e),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 0x35),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x3:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x2),
              (_0x1776ce[_0x1e91f7(0x381)] = 0x78),
              (_0x1776ce["boxincwidth"] = 0x5a),
              (_0x1776ce["iconbordermargin"] = 0x3),
              (_0x1776ce[_0x1e91f7(0x345)] = 0x75),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 0x57),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x2:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x2),
              (_0x1776ce[_0x1e91f7(0x381)] = 5.2),
              (_0x1776ce[_0x1e91f7(0x346)] = 3.8),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.3),
              (_0x1776ce[_0x1e91f7(0x345)] = 4.9),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 3.5),
              (_0x1776ce[_0x1e91f7(0x422)] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
          case 0x1:
            (_0x1776ce[_0x1e91f7(0x471)] = 0x2),
              (_0x1776ce["boxheight"] = 5.2),
              (_0x1776ce["boxincwidth"] = 3.8),
              (_0x1776ce[_0x1e91f7(0x3d4)] = 0.3),
              (_0x1776ce[_0x1e91f7(0x345)] = 4.9),
              (_0x1776ce[_0x1e91f7(0x3ea)] = 3.5),
              (_0x1776ce["graphicHeight"] = 0x2a),
              (_0x1776ce[_0x1e91f7(0x2b9)] = 0x19);
            break;
        }
      return _0x1776ce;
    }
  }
  laneToolsBootstrap();
  while (true) {
    try {
      const _0x4fe049 =
        -parseInt(getStringFunction(0x269)) / 0x1 +
        -parseInt(getStringFunction(0x443)) / 0x2 +
        (-parseInt(getStringFunction(0x293)) / 0x3) * (parseInt(getStringFunction(0x1ef)) / 0x4) +
        -parseInt(getStringFunction(0x477)) / 0x5 +
        (parseInt(getStringFunction(0x31e)) / 0x6) * (-parseInt(getStringFunction(0x21a)) / 0x7) +
        (parseInt(getStringFunction(0x2fe)) / 0x8) * (-parseInt(getStringFunction(0x46f)) / 0x9) +
        parseInt(getStringFunction(0x28b)) / 0xa;
      if (_0x4fe049 === _0x1fd245) break;
      else push(shift());
    } catch (_0x415ba0) {
      push(shift());
    }
  }
})();
