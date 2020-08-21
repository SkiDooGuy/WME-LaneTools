// ==UserScript==
// @name         WME LaneTools
// @namespace    https://greasyfork.org/en/users/286957-skidooguy
// @version      2020.08.20.01
// @description  Adds highlights and tools to WME to supplement the lanes feature
// @author       SkiDooGuy, Click Saver by HBiede, Heuristics by kndcajun
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @grant        none
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// ==/UserScript==

const _0x2569 = [
    '?\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20',
    'each',
    'get',
    'shiftKey',
    '.rev-lanes',
    'CS2Color',
    'TIOColor',
    'display',
    'input[type=\x22text\x22].lt-color-input\x20{position:relative;width:70px;padding:3px;border:2px\x20solid\x20black;border-radius:6px;}',
    'stroke-width',
    '.edit-lane-guidance',
    'fwd',
    'ClickSaveStraight',
    'Feature',
    '#04E6F6',
    'LT:\x20Error\x20communicating\x20with\x20WW\x20settings\x20server',
    'getElementsByClassName',
    'lt-CS2Color',
    'now',
    'model',
    'getSelectedFeatures',
    'Azm\x20to\x20node\x20',
    'type',
    'lt-AutoExpandLanes',
    '#E804F6',
    '.lt-section-wrapper.border\x20{border-bottom:1px\x20solid\x20grey;margin-bottom:5px;}',
    'li-del-rev-btn',
    'toNodeID',
    'enableHighlights',
    '#lt-LaneHeurNegHighlight',
    'toLaneIndex',
    '#66ccff',
    '<div\x20class=\x22lt-add-lanes\x20fwd\x22>5</div>',
    '#lt-heur-wrapper',
    'FAIL',
    'AutoLanesTab',
    '.lt-toolbar-button-container\x20{display:inline-block;padding:5px;}',
    'lt-add-lanes\x20rev',
    '.lane-arrow',
    'Actions',
    'slice',
    'hasInstructionOpcode',
    '.lt-option-container.clk-svr',
    'ctrlKey',
    '.fwd-lanes\x20>\x20div\x20>\x20.direction-lanes\x20>\x20.lane-instruction.lane-instruction-from\x20>\x20.instruction',
    'textContent',
    '.lt-Toolbar-Container\x20{display:none;position:absolute;background-color:orange;border-radius:6px;border:1.5px\x20solid;box-size:border-box;z-index:1050;}',
    'angle-135',
    'padding',
    '==================================================================================',
    '.fwd-lanes',
    '.lanes-tab',
    'Events',
    'label.lt-label\x20{position:relative;font-weight:normal;padding-left:5px}',
    'LaneTools\x20KDev:\x20',
    'Lane\x20Tools',
    'className',
    '_LTHighlightLayer',
    '<style\x20type=\x22text/css\x22>',
    '#lt-',
    'lanes',
    '.lt-checkbox',
    'lt-LaneHeuristicsChecks',
    'enableUIEnhancements',
    'clone',
    'Toggle\x20heuristic\x20highlights',
    'ANY',
    '#lt-LabelsEnable',
    '.85',
    'apply',
    'isTurnAllowed',
    'LaneTools\x20loading\x20error....',
    'calculate',
    'angle-0',
    'Vector',
    'reduce',
    'https://www.waze.com/forum/viewtopic.php?f=819&t=301158',
    'zoomend',
    'parents',
    '<div\x20class=\x22lt-add-lanes\x20fwd\x22>6</div>',
    'doSubAction',
    'atan2',
    'attr',
    'start',
    '_description',
    'ABColor',
    'Turn\x20angle\x20to\x20outseg2\x20',
    'LaneTools\x20initializing...',
    '<div\x20class=\x22lt-add-lanes\x20rev\x22>6</div>',
    'findIndex',
    'inSeg',
    'getElementsByName',
    'angle--135',
    'angle--90',
    'segment',
    'input[type=\x22checkbox\x22].lt-checkbox\x20{position:relative;margin:0;top:2px;}',
    'timeoutID',
    'afterclearactions',
    '.lt-toolbar-button\x20{position:relative;display:block;width:60px;height:25px;border-radius:6px;font-size:12px;}',
    'lt-CSEnable',
    '10px',
    'fromLaneIndex',
    'heading',
    'geometry',
    'isLeftHand',
    'isTurnAllowedBySegDirections',
    'user-select',
    'OVER_HIGHLIGHT',
    'wmelt',
    'HighlightsEnable',
    '</a>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</br>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27>Toggle\x20Shortcut:<span\x20id=\x27lt-EnableShortcut\x27\x20style=\x27padding-left:10px;\x27\x20/></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ScriptEnabled\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ScriptEnabled\x27>Enabled</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-LaneTabFeatures\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27>Tab\x20UI\x20Enhancements</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-UIEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-UIEnable\x27>Enabled</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-UI-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27>Toggle\x20Shortcut:<span\x20id=\x27lt-UIEnhanceShortcut\x27\x20style=\x27padding-left:10px;\x27\x20/></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoLanesTab\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoLanesTab\x27>Auto\x20open\x20lanes\x20tab</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoExpandLanes\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoExpandLanes\x27>Auto\x20expand\x20edit\x20lanes</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-AutoFocusLanes\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-AutoFocusLanes\x27>Auto\x20Focus\x20Lane\x20Input</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ReverseLanesIcon\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ReverseLanesIcon\x27>Re-Orient\x20Lane\x20Icons</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveEnable\x27>Enable\x20Click\x20Saver</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20clk-svr\x27\x20style=\x27padding-left:10%;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveStraight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveStraight\x27>All\x20Lanes\x20Straight</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x20clk-svr\x27\x20style=\x27padding-left:10%;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-ClickSaveTurns\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ClickSaveTurns\x27>Turn\x20Lanes</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27>Map\x20Highlights</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-HighlightsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-HighlightsEnable\x27>Enabled</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-highlights-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27>Toggle\x20Shortcut:<span\x20id=\x27lt-HighlightShortcut\x27\x20style=\x27padding-left:10px;\x27\x20/></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LabelsEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LabelsEnable\x27>Lane\x20Labels</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-NodesEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-NodesEnable\x27>Node\x20Highlights</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LIOEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LIOEnable\x27>Lane\x20Angle\x20Override</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-CSEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CSEnable\x27>Continue\x20Straight\x20Override</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27>Lane\x20Heuristics\x20Candidates</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27float:right;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeuristicsChecks\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeuristicsChecks\x27>Enabled</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-heur-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27\x20style=\x27margin-bottom:5px;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x27display:inline-block;\x27>Toggle\x20Shortcut:<span\x20id=\x27lt-LaneHeurChecksShortcut\x27\x20style=\x27padding-left:10px;\x27\x20/></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeurPosHighlight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeurPosHighlight\x27>Positive\x20Candidate\x20Highlights</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-LaneHeurNegHighlight\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LaneHeurNegHighlight\x27>Negative\x20Candidate\x20Highlights</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20id=\x27lt-color-title\x27\x20style=\x27display:block;width:50%;padding:5px\x200\x205px\x200;font-weight:bold;text-decoration:underline;cursor:pointer;\x27\x20data-original-title=\x27Click\x20to\x20toggle\x20color\x20inputs\x27>Highlight\x20Colors:</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20id=\x27lt-color-inputs\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-ABColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ABColor\x27\x20id=\x27lt-ABColorLabel\x27>Fwd\x20(A->B)</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-BAColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-BAColor\x27\x20id=\x27lt-BAColorLabel\x27>Rev\x20(B->A)</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-LabelColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-LabelColor\x27\x20id=\x27lt-LabelColorLabel\x27>Labels</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-ErrorColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-ErrorColor\x27\x20id=\x27lt-ErrorColorLabel\x27>Lane\x20Errors</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-NodeColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-NodeColor\x27\x20id=\x27lt-NodeColorLabel\x27>Nodes\x20with\x20Lanes</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-TIOColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-TIOColor\x27\x20id=\x27lt-TIOColorLabel\x27>Nodes\x20with\x20TIOs</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-LIOColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-TIOColor\x27\x20id=\x27lt-LIOColorLabel\x27>Segments\x20with\x20LAOs</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-CS1Color\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CS1Color\x27\x20id=\x27lt-CS1ColorLabel\x27>View\x20Only\x20CS</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-CS2Color\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-CS2Color\x27\x20id=\x27lt-CS2ColorLabel\x27>View\x20and\x20Hear\x20CS</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-HeurColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-HeurColor\x27\x20id=\x27lt-HeurColorLabel\x27>Lane\x20heuristics\x20likely</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=color\x20class=\x27lt-color-input\x27\x20id=\x27lt-HeurFailColor\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-HeurFailColor\x27\x20id=\x27lt-HeurFailColorLabel\x27>Lane\x20heuristics\x20-\x20Not\x20qualified</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-adv-tools\x27\x20style=\x27display:none;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20style=\x27font-weight:bold;\x27>Advanced\x20Tools</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-option-container\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=checkbox\x20class=\x27lt-checkbox\x27\x20id=\x27lt-SelAllEnable\x27\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x27lt-label\x27\x20for=\x27lt-SelAllEnable\x27>Quick\x20toggle\x20all\x20lanes</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>',
    'fill',
    '#lt-NodesEnable',
    'LaneHeurPosHighlight',
    '\x20(\x20',
    '.fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit',
    'log',
    'focus',
    'getTurnThroughNode',
    'toggle',
    'setTimeout',
    '#F50E0E',
    '.rev-lanes\x20>\x20div\x20>\x20.direction-lanes',
    '\x20/\x20',
    'afterundoaction',
    'padding-top',
    'revDirection',
    'components',
    '\x20computed\x20len:\x20',
    'lt-LIOColor',
    'Interface',
    '\x20to\x20',
    '<button\x20type=\x22button\x22\x20id=\x22li-del-fwd-btn\x22\x20style=\x22height:20px;background-color:white;border:1px\x20solid\x20grey;border-radius:8px;\x22>Delete\x20All\x20Fwd</button>',
    'push',
    'LabelsEnable',
    'lt-LabelColor',
    '#lt-LaneHeuristicsChecks',
    'FORWARD',
    'lt-HeurFailColor',
    '#8F47FA',
    'setVisibility',
    'keyCode',
    'lt-ClickSaveTurns',
    'Checking\x20heuristics\x20candidate:\x20seg\x20',
    '.rev-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction',
    'LabelColor',
    '==\x20No\x20Outseg2\x20found\x20==================================================================',
    'getTurnGraph',
    'stroke-opacity',
    'getGuidanceMode',
    '<div\x20style=\x22position:relative;display:block;width:100%;\x22\x20id=\x22lt-fwd-add-lanes\x22\x20/>',
    'segment:\x20',
    'lt-TIOColor',
    'Style',
    'ErrorColor',
    'observe',
    'sort',
    'WME\x20is\x20not\x20in\x20editing\x20mode',
    'LT:\x20User\x20PIN\x20not\x20set\x20in\x20WazeWrap\x20tab',
    'object',
    'intersectsBounds',
    'append',
    'click',
    'getLaneData',
    'fromCharCode',
    'LaneTools\x20loaded',
    'lt-ScriptEnabled',
    'shortcut',
    'turn-lane-edit-top',
    'LT:\x20Stored\x20shortcut\x20',
    'LaneHeurNegHighlight',
    'call',
    '.fwd-lanes\x20>\x20div\x20>\x20.direction-lanes',
    'setAttribute',
    'length',
    '.cancel-button',
    '<div\x20class=\x22lt-add-lanes\x20fwd\x22>8</div>',
    'ShowScriptUpdate',
    'selectionchanged',
    'REVERSE',
    '<div\x20class=\x22lt-add-lanes\x20rev\x22>7</div>',
    'FREEWAY',
    'lt-LaneHeurPosHighlight',
    '<div\x20class=\x22lt-add-lanes\x20rev\x22>8</div>',
    'DASH_THIN',
    'appendTo',
    '#lt-LaneHeurChecksShortcut',
    'floor',
    '#lt-UIEnhanceShortcut',
    'loginManager',
    'lastSaveAction',
    '<div\x20class=\x22lt-add-lanes\x20rev\x22>2</div>',
    '#lt-EnableShortcut',
    'SaveSettings',
    '[num\x20pad]',
    'indexOf',
    'LTInstructLayer',
    'Open\x20Sans,\x20Alef,\x20helvetica,\x20sans-serif,\x20monospace',
    'change',
    'Turn\x20',
    '#li-del-rev-btn',
    'lt-UIEnable',
    'border-bottom',
    'checked',
    '==\x20No\x20Alt.Incoming-1\x20segment\x20found\x20==================================================================',
    'angle-90',
    'editableCountryIDS',
    'selectionManager',
    'withLanes',
    'getExtent',
    '#00aa00',
    'lt-fwd-add-lanes',
    'addLayer',
    'transform',
    '<div\x20class=\x22lt-add-lanes\x20rev\x22>5</div>',
    'altKey',
    'enableScript',
    'lt-ErrorColor',
    'fromVertex',
    'val',
    'Geometry',
    'Error:\x20>1\x20qualifying\x20segment\x20for\x20',
    'head',
    'lt-ClickSaveEnable',
    '\x20\x20\x20Not\x20eligible\x20as\x20outseg1:\x20',
    'lt-ClickSaveStraight',
    '2px\x20solid\x20',
    'accelerators',
    'NONE',
    'stroke',
    '#lt-adv-tools',
    'attributes',
    'reverse',
    'none',
    'getElementsByTagName',
    '<b>NEW:</b><br>\x0a-\x20All\x20LT\x20text\x20now\x20matches\x20new\x20Waze\x20theme\x20formatting<br><br>\x0a<b>FIXES:</b><br>\x0a-\x20Improved\x20some\x20text\x20formatting\x20throughout\x20interface<br>\x0a-\x20Internal\x20code\x20cleanup<br><br>',
    'HeurColor',
    'extend',
    '.direction-lanes',
    '\x20at\x20',
    'setModel',
    '<div\x20class=\x22lt-add-lanes\x20fwd\x22>4</div>',
    'angle-45',
    'Driving\x20direction\x20restriction\x20applies',
    'zoom',
    '.lt-chkAll-lns\x20{display:inline-block;width:20px;height:20px;text-decoration:underline;font-weight:bold;font-size:10px;padding-left:3px;cursor:pointer;}',
    'Alt\x20incoming-1\x20segment\x20found:\x20',
    'laneCount',
    '10px\x2010px\x2015px\x2010px',
    'getObjectById',
    'setItem',
    'LT_Settings',
    'register',
    'LaneTools\x20-\x20Click\x20Saver\x20Module\x20loaded',
    '.form-control',
    'NodesEnable',
    'rank',
    '.lane-arrows\x20>\x20div',
    'CopyEnable',
    'lt-SelAllEnable',
    '#lt-color-title',
    'fwdDirection',
    'ceil',
    '\x20|\x20',
    'Other\x20restriction\x20applies',
    'split',
    'NodeColor',
    '<div\x20style=\x22display:inline-block;position:relative;padding:0px\x202px\x202px\x202px;\x22\x20/>',
    'Toggle\x20lane\x20highlights',
    'Waze/Action/MultiAction',
    '.lt-section-wrapper\x20{display:block;width:100%;padding:4px;}',
    'getItem',
    'ClickSaveTurns',
    'CS1Color',
    'app',
    '#lt-highlights-wrapper',
    'SelAllEnable',
    'lt-ReverseLanesIcon',
    'LaneTools\x20server\x20settings\x20used',
    'Found\x20outseg2\x20candidate:\x20',
    '#lt-UIEnable',
    'afteraction',
    'removeAllFeatures',
    '#lt-LaneHeurPosHighlight',
    'lt-rev-add-lanes',
    'HeurFailColor',
    '.fwd-lanes\x20>\x20div\x20>\x20div\x20>\x20div.lane-instruction.lane-instruction-from\x20>\x20div.instruction',
    'mode',
    'ScriptEnabled',
    'getFeatureAttributes',
    '.lt-Toolbar-Wrapper\x20{position:relative;padding:3px;}',
    '#lt-color-inputs',
    'value',
    '#990033',
    'nodes',
    'ClickSaveEnable',
    'Found\x20a\x20failed\x20candidate\x20for\x20',
    '#lt-ScriptEnabled',
    'RetrieveSettings',
    'input',
    'add',
    'revLaneCount',
    'LIOColor',
    'moveend',
    'input[type=\x22text\x22].lt-color-input:focus\x20{outline-width:0;}',
    '<div>',
    'css',
    'getSegmentIds',
    'StyleMap',
    '\x20via\x20',
    'fill-opacity',
    '#lt-UI-wrapper',
    'lt-BAColor',
    '.controls-container.turns-region',
    'map',
    'Did\x20some\x20lane\x20stuff',
    '#lt-LIOEnable',
    'BAColor',
    'AutoExpandLanes',
    'LTNamesLayer',
    'off',
    'hasClass',
    'text',
    '4px\x20dashed\x20',
    'Shortcut',
    'HIGHLIGHT',
    '.checkbox-large.checkbox-white',
    '\x20nodeExitSegIds:',
    'Remote',
    'Ctrl',
    'Turn\x20angle\x20to\x20outseg1\x20',
    'name',
    '<div\x20class=\x22lt-add-lanes\x20rev\x22>4</div>',
    '#lt-HighlightsEnable',
    'edit-panel',
    'group',
    '<div\x20class=\x22lt-add-lanes\x20fwd\x22>1</div>',
    'children',
    'movestart',
    'fromNodeID',
    'enableHeuristics',
    'lt-LabelsEnable',
    'segments',
    'parseJSON',
    'hide',
    'LT:\x20Unable\x20to\x20save\x20settings\x20to\x20server',
    'AutoFocusLanes',
    'PASS',
    '.lt-color-input',
    'Error:\x20>1\x20qualifying\x20entry\x20segment\x20for\x20',
    'clearTimeout',
    'Found\x20outseg1\x20candidate:\x20',
    'abs',
    'Point',
    'lt-AutoFocusLanes',
    'LaneHeuristicsChecks',
    'ERROR',
    '<div\x20class=\x22lt-add-lanes\x20fwd\x22>3</div>',
    'getObjectArray',
    'tooltip',
    'inSegDir',
    'Tab',
    'projection',
    'html',
    '<div\x20style=\x22position:relative;display:block;width:100%;\x22\x20id=\x22lt-rev-add-lanes\x22\x20/>',
    '\x20\x20\x20Not\x20eligible\x20as\x20outseg2:\x20',
    'find',
    'fwdLaneCount',
    'user',
    'LineString',
    'prop',
    '</style>',
    '.lt-add-lanes\x20{display:inline-block;width:15px;height:15px;border:1px\x20solid\x20black;border-radius:8px;margin:0\x203px\x200\x203px;line-height:\x201.5;text-align:center;font-size:10px;}',
    'join',
    'Shift',
    'LaneTools\x20local\x20settings\x20used',
    'Error:\x20>1\x20qualifying\x20exit2\x20segment\x20for\x20',
    'hasOwnProperty',
    'lt-add-lanes',
    'script',
    '<button\x20type=\x22button\x22\x20id=\x22li-del-rev-btn\x22\x20style=\x22height:20px;background-color:white;border:1px\x20solid\x20grey;border-radius:8px;\x22>Delete\x20All\x20Rev</button>',
    '\x20changed\x20to\x20',
    'getTurnData',
    'CSEnable',
    '\x20node\x20',
    'getElementById',
    'block',
    'parentElement',
    'Layer',
    'lt-LIOEnable',
    '<div\x20class=\x22lt-add-lanes\x20fwd\x22>7</div>',
    'olMap',
    'Alt',
    'substr',
    '#ff9900',
    'Straight\x20turn\x20lane\x20count\x20does\x20not\x20match',
    '<div\x20class=\x27lt-wrapper\x27\x20id=\x27lt-tab-wrapper\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x27\x20id=\x27lt-tab-body\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x27lt-section-wrapper\x20border\x27\x20style=\x27border-bottom:2px\x20double\x20grey;\x27>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<a\x20href=\x27https://www.waze.com/forum/viewtopic.php?f=819&t=301158\x27\x20style=\x27font-weight:bold;font-size:12px;text-decoration:underline;\x27>LaneTools\x20-\x20v',
    'actionManager',
    'addEventListener',
    'isHeuristicsCandidate\x20received\x20bad\x20argument\x20(null)',
    'addFeatures',
    'lt-HeurColor',
    '.lt-option-container\x20{padding:3px;}',
    '.rev-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit',
    'lt-HighlightsEnable',
    'MIN_ZOOM_NONFREEWAY',
    'Alt.Incoming-1\x20turn\x20angle:\x20',
    'lt-NodesEnable',
    'MIN_ZOOM_ALL',
    'lt-AutoLanesTab',
    '.apply-button.waze-btn.waze-btn-blue',
    '#FFAD08',
    'prependTo',
    '${labelText}',
    '0.9',
    'hasLanes',
    '\x20attrs\x20len:\x20',
    'lt-add-lanes\x20fwd',
    '(failed)',
    'lt-ABColor',
    'LTHighlightLayer',
    '==\x20No\x20Inseg\x20found\x20==================================================================',
    '#lt-LaneTabFeatures',
    '<div\x20class=\x22lt-add-lanes\x20rev\x22>1</div>',
    '.street-name',
    'lt-LaneHeurNegHighlight',
    'events',
    'state',
    '#li-del-fwd-btn',
    'ReverseLanesIcon',
    'https://greasyfork.org/en/scripts/390487-wme-lanesinfo',
    'Toggle\x20UI\x20enhancements',
    'number',
    'border',
    'angle--45'
];
(function (_0x328516, _0x256920) {
    const _0x1a3840 = function (_0x417a4d) {
        while (--_0x417a4d) {
            _0x328516['push'](_0x328516['shift']());
        }
    };
    _0x1a3840(++_0x256920);
}(_0x2569, 0x138));
const _0x1a38 = function (_0x328516, _0x256920) {
    _0x328516 = _0x328516 - 0x0;
    let _0x1a3840 = _0x2569[_0x328516];
    return _0x1a3840;
};
const _0x52248b = '' + GM_info[_0x1a38('0x43')]['version'], _0x145224 = _0x1a38('0x76'), _0x159a83 = _0x1a38('0xc7'), _0x11e5a1 = _0x1a38('0x166'), _0x1393b0 = 0x1, _0x9fe1bd = {
        'REVERSE': -0x1,
        'ANY': 0x0,
        'FORWARD': 0x1
    }, _0x322497 = {
        'NARROW_STREET': 0x16,
        'STREET': 0x1,
        'PRIMARY_STREET': 0x2,
        'RAMP': 0x4,
        'FREEWAY': 0x3,
        'MAJOR_HIGHWAY': 0x6,
        'MINOR_HIGHWAY': 0x7,
        'DIRT_ROAD': 0x8,
        'FERRY': 0xe,
        'PRIVATE_ROAD': 0x11,
        'PARKING_LOT_ROAD': 0x14,
        'WALKING_TRAIL': 0x5,
        'PEDESTRIAN_BOARDWALK': 0xa,
        'STAIRWAY': 0x10,
        'RAILROAD': 0x12,
        'RUNWAY': 0x13
    }, _0x2c68b1 = {
        'MIN_ZOOM_ALL': 0x2,
        'MIN_ZOOM_NONFREEWAY': 0x5
    }, _0x5ceb4b = {
        'ERROR': -0x2,
        'FAIL': -0x1,
        'NONE': 0x0,
        'PASS': 0x1
    }, _0x486a35 = 49.99, _0x586456 = 19.5, _0x639876 = 0x2d, _0x46c2ea = 0x2d, _0x50141c = 22.5;
let _0x548c12 = {}, _0x2f1fc2, _0x5767c7, _0xa6d4c5, _0x350e91, _0x4dad8a, _0x5c5df3, _0x54a225, _0x36baf3, _0x226d15, _0x3bcf2f, _0x3d0b12, _0x3fd8f8, _0xa26135, _0x3c9e3f = 0x0;
console[_0x1a38('0xef')](_0x1a38('0xd2'));
function _0x1c0e98() {
    if (W && W[_0x1a38('0x2')] && W[_0x1a38('0x8e')] && W[_0x1a38('0x138')][_0x1a38('0x38')] && $ && WazeWrap['Ready'])
        _0x4a9597();
    else {
        if (_0x3c9e3f < 0x1f4)
            setTimeout(() => {
                _0x3c9e3f++, _0x1c0e98();
            }, 0xc8);
        else
            console[_0x1a38('0xef')]('Failed\x20to\x20load\x20LaneTools');
    }
}
function _0x4a9597() {
    if (W[_0x1a38('0x18d')]['modeController'][_0x1a38('0x8e')]['attributes'][_0x1a38('0x19a')] !== 0x0)
        return console[_0x1a38('0xef')](_0x1a38('0x118'));
    _0x4dad8a = W[_0x1a38('0x138')][_0x1a38('0x38')], _0x3d0b12 = require('Waze/Action/UpdateObject'), _0x3fd8f8 = require(_0x1a38('0x188')), _0xa26135 = require('Waze/Model/Graph/Actions/SetTurn');
    const _0x1bda53 = [
            '.lt-wrapper\x20{position:relative;width:100%;font-size:12px;font-family:\x22Rubik\x22,\x20\x22Boing-light\x22,\x20sans-serif;user-select:none;}',
            _0x1a38('0x189'),
            _0x1a38('0x94'),
            _0x1a38('0x5a'),
            _0x1a38('0xda'),
            _0x1a38('0x83'),
            _0x1a38('0x1ab'),
            _0x1a38('0xb0'),
            _0x1a38('0xa9'),
            _0x1a38('0x19d'),
            _0x1a38('0x9f'),
            _0x1a38('0xdd'),
            _0x1a38('0x3c'),
            '.lt-add-lanes:hover\x20{border:1px\x20solid\x20#26bae8;background-color:#26bae8;cursor:pointer;}',
            _0x1a38('0x170')
        ][_0x1a38('0x3d')]('\x20'), _0x548db9 = $(_0x1a38('0x1ac'));
    _0x548db9[_0x1a38('0x33')] = [_0x1a38('0x54') + _0x52248b + _0x1a38('0xe9')][_0x1a38('0x3d')]('\x20'), _0x4dad8a = W[_0x1a38('0x138')]['user'], _0x350e91 = _0x4dad8a[_0x1a38('0x17b')];
    let _0x2171b5 = _0x350e91 >= 0x0;
    if (_0x2171b5)
        new WazeWrap['Interface'][(_0x1a38('0x31'))]('LT', _0x548db9[_0x1a38('0x33')], _0x3f011c), $(_0x1a38('0xb5') + _0x1bda53 + _0x1a38('0x3b'))[_0x1a38('0x134')](_0x1a38('0x159')), WazeWrap[_0x1a38('0xfd')][_0x1a38('0x12c')](GM_info[_0x1a38('0x43')][_0x1a38('0x13')], GM_info[_0x1a38('0x43')]['version'], _0x11e5a1, _0x145224, _0x159a83), console[_0x1a38('0xef')](_0x1a38('0x120'));
    else
        console[_0x1a38('0xef')](_0x1a38('0xc2'));
}
async function _0x3f011c() {
    function _0x2d590b() {
        _0x281b9e(_0x1a38('0x121'), _0x548c12[_0x1a38('0x19b')]), _0x281b9e(_0x1a38('0x144'), _0x548c12['UIEnable']), _0x281b9e(_0x1a38('0x92'), _0x548c12[_0x1a38('0x6')]), _0x281b9e(_0x1a38('0x61'), _0x548c12[_0x1a38('0x9e')]), _0x281b9e('lt-HighlightsEnable', _0x548c12[_0x1a38('0xe8')]), _0x281b9e(_0x1a38('0x1d'), _0x548c12[_0x1a38('0x101')]), _0x281b9e('lt-NodesEnable', _0x548c12['NodesEnable']), _0x281b9e(_0x1a38('0x4d'), _0x548c12['LIOEnable']), _0x281b9e(_0x1a38('0xde'), _0x548c12[_0x1a38('0x47')]), _0x281b9e(_0x1a38('0x17e'), _0x548c12[_0x1a38('0x18f')]), _0x281b9e(_0x1a38('0x2a'), _0x548c12[_0x1a38('0x22')]), _0x281b9e(_0x1a38('0x190'), _0x548c12[_0x1a38('0x75')]), _0x281b9e('lt-ClickSaveEnable', _0x548c12[_0x1a38('0x1a2')]), _0x281b9e(_0x1a38('0x15c'), _0x548c12[_0x1a38('0x87')]), _0x281b9e(_0x1a38('0x109'), _0x548c12[_0x1a38('0x18b')]), _0x281b9e(_0x1a38('0x131'), _0x548c12[_0x1a38('0xec')]), _0x281b9e(_0x1a38('0x71'), _0x548c12[_0x1a38('0x125')]), _0x281b9e(_0x1a38('0xb9'), _0x548c12[_0x1a38('0x2b')]), _0x4731dd(_0x1a38('0x6b'), _0x548c12[_0x1a38('0xd0')]), _0x4731dd(_0x1a38('0x0'), _0x548c12[_0x1a38('0x5')]), _0x4731dd(_0x1a38('0x102'), _0x548c12['LabelColor']), _0x4731dd(_0x1a38('0x154'), _0x548c12[_0x1a38('0x115')]), _0x4731dd('lt-NodeColor', _0x548c12[_0x1a38('0x185')]), _0x4731dd(_0x1a38('0x113'), _0x548c12[_0x1a38('0x81')]), _0x4731dd(_0x1a38('0xfc'), _0x548c12['LIOColor']), _0x4731dd('lt-CS1Color', _0x548c12[_0x1a38('0x18c')]), _0x4731dd(_0x1a38('0x8c'), _0x548c12[_0x1a38('0x80')]), _0x4731dd(_0x1a38('0x59'), _0x548c12[_0x1a38('0x167')]), _0x4731dd(_0x1a38('0x105'), _0x548c12[_0x1a38('0x198')]);
        !_0x25d55f('lt-ClickSaveEnable')[_0x1a38('0x146')] && $(_0x1a38('0xa5'))[_0x1a38('0x20')]();
        !_0x25d55f(_0x1a38('0x144'))[_0x1a38('0x146')] && $('#lt-UI-wrapper')['hide']();
        !_0x25d55f(_0x1a38('0x5c'))['checked'] && $('#lt-highlights-wrapper')[_0x1a38('0x20')]();
        !_0x25d55f(_0x1a38('0xb9'))[_0x1a38('0x146')] && $(_0x1a38('0x9c'))['hide']();
        function _0x281b9e(_0x12a985, _0x594dce) {
            $('#' + _0x12a985)[_0x1a38('0x3a')](_0x1a38('0x146'), _0x594dce);
        }
        function _0x4731dd(_0x597dad, _0x13c064) {
            $('#' + _0x597dad)[_0x1a38('0xcd')](_0x1a38('0x19f'), _0x13c064), $('#' + _0x597dad)[_0x1a38('0x1ad')](_0x1a38('0x79'), _0x1a38('0x15d') + _0x13c064);
        }
        _0x5c5df3 = '46103', _0x54a225 = '1220';
    }
    await _0x5baca6(), _0x52b91f(), _0x2f1fc2 = new OpenLayers[(_0x1a38('0x4c'))][(_0x1a38('0xc5'))](_0x1a38('0x6c'), { 'uniqueName': _0x1a38('0xb4') }), W[_0x1a38('0x2')][_0x1a38('0x14f')](_0x2f1fc2), _0x2f1fc2[_0x1a38('0x107')](!![]), _0xa6d4c5 = new OpenLayers['Layer'][(_0x1a38('0xc5'))](_0x1a38('0x13f')), W[_0x1a38('0x2')][_0x1a38('0x14f')](_0xa6d4c5), _0xa6d4c5[_0x1a38('0x107')](!![]);
    const _0x1f49eb = new OpenLayers[(_0x1a38('0x114'))]({
        'fontFamily': _0x1a38('0x140'),
        'labelOutlineColor': 'white',
        'fontColor': '${labelColor}',
        'fontSize': '16',
        'labelXOffset': 0xf,
        'labelYOffset': -0xf,
        'labelOutlineWidth': '3',
        'label': _0x1a38('0x65'),
        'angle': '',
        'labelAlign': 'cm',
        'stroke-width': '0'
    });
    _0x5767c7 = new OpenLayers['Layer']['Vector'](_0x1a38('0x7'), {
        'uniqueName': '_LTNamesLayer',
        'styleMap': new OpenLayers[(_0x1a38('0x1af'))](_0x1f49eb)
    }), W[_0x1a38('0x2')][_0x1a38('0x14f')](_0x5767c7), _0x5767c7[_0x1a38('0x107')](!![]), W[_0x1a38('0x2')][_0x1a38('0x72')][_0x1a38('0x177')](_0x1a38('0x1a'), null, _0x257001), WazeWrap[_0x1a38('0xaf')][_0x1a38('0x177')](_0x1a38('0x1aa'), null, _0x3f641c), WazeWrap[_0x1a38('0xaf')]['register'](_0x1a38('0xc8'), null, _0x257001), WazeWrap[_0x1a38('0xaf')]['register']('zoomend', null, _0x3f641c), WazeWrap[_0x1a38('0xaf')][_0x1a38('0x177')](_0x1a38('0x194'), null, _0x257001), WazeWrap[_0x1a38('0xaf')][_0x1a38('0x177')](_0x1a38('0x194'), null, _0x3f641c), WazeWrap[_0x1a38('0xaf')][_0x1a38('0x177')](_0x1a38('0xf7'), null, _0x3f641c), WazeWrap[_0x1a38('0xaf')][_0x1a38('0x177')]('afterclearactions', null, _0x257001), WazeWrap['Events'][_0x1a38('0x177')](_0x1a38('0xdc'), null, _0x3f641c), WazeWrap[_0x1a38('0xaf')][_0x1a38('0x177')](_0x1a38('0x12d'), null, _0x1aa636), WazeWrap[_0x1a38('0xaf')][_0x1a38('0x177')](_0x1a38('0x12d'), null, _0x257001), WazeWrap[_0x1a38('0xaf')]['register']('selectionchanged', null, _0x3f641c), WazeWrap[_0x1a38('0xaf')]['register'](_0x1a38('0x194'), null, _0x1aa636), WazeWrap[_0x1a38('0xaf')][_0x1a38('0x177')](_0x1a38('0xf7'), null, _0x1aa636);
    _0x350e91 > 0x1 ? $(_0x1a38('0x161'))[_0x1a38('0x1ad')]('display', _0x1a38('0x4a')) : $(_0x1a38('0x6e'))['css'](_0x1a38('0x82'), _0x1a38('0x164'));
    new WazeWrap[(_0x1a38('0xfd'))][(_0x1a38('0xc'))](_0x1a38('0x97'), _0x1a38('0x187'), _0x1a38('0xe7'), _0x1a38('0xb2'), _0x548c12[_0x1a38('0x97')], _0x2625bc, null)[_0x1a38('0x1a7')](), new WazeWrap[(_0x1a38('0xfd'))][(_0x1a38('0xc'))](_0x1a38('0xba'), _0x1a38('0x77'), _0x1a38('0xe7'), _0x1a38('0xb2'), _0x548c12[_0x1a38('0xba')], _0x5d752b, null)[_0x1a38('0x1a7')](), new WazeWrap[(_0x1a38('0xfd'))][(_0x1a38('0xc'))](_0x1a38('0x1c'), _0x1a38('0xbc'), _0x1a38('0xe7'), _0x1a38('0xb2'), _0x548c12['enableHeuristics'], _0xb1983, null)[_0x1a38('0x1a7')](), new WazeWrap[(_0x1a38('0xfd'))][(_0x1a38('0xc'))](_0x1a38('0x153'), 'Toggle\x20script', _0x1a38('0xe7'), 'Lane\x20Tools', _0x548c12[_0x1a38('0x153')], _0x2f0130, null)[_0x1a38('0x1a7')](), _0x36baf3 = _0x4dad8a['id'], _0x2d590b(), setTimeout(() => {
        _0x1aa576();
    }, 0x32), $(_0x1a38('0xb8'))[_0x1a38('0x11d')](function () {
        let _0x37ee58 = $(this)[0x0]['id'][_0x1a38('0x51')](0x3);
        _0x548c12[_0x37ee58] = this[_0x1a38('0x146')], _0xe1eb82();
    }), $(_0x1a38('0x24'))[_0x1a38('0x141')](function () {
        let _0x31199a = $(this)[0x0]['id']['substr'](0x3);
        _0x548c12[_0x31199a] = this[_0x1a38('0x19f')], _0xe1eb82(), $(_0x1a38('0xb6') + _0x31199a)[_0x1a38('0x1ad')](_0x1a38('0x79'), _0x1a38('0x15d') + this[_0x1a38('0x19f')]), _0x257001(), _0x3f641c();
    }), $(_0x1a38('0x1a4'))['click'](() => {
        if (_0x25d55f(_0x1a38('0x121'))[_0x1a38('0x146')])
            _0x3f641c();
        else
            _0x257001();
    }), $(_0x1a38('0x15'))[_0x1a38('0x11d')](() => {
        if (_0x25d55f(_0x1a38('0x5c'))[_0x1a38('0x146')])
            _0x3f641c();
        else
            _0x257001();
        _0x3f641c();
    }), $(_0x1a38('0xbe'))[_0x1a38('0x11d')](() => {
        if (_0x25d55f(_0x1a38('0x1d'))[_0x1a38('0x146')])
            _0x3f641c();
        else
            _0x257001(), _0x3f641c();
    }), $(_0x1a38('0xeb'))[_0x1a38('0x11d')](() => {
        if (_0x25d55f(_0x1a38('0x5f'))['checked'])
            _0x3f641c();
        else
            _0x257001(), _0x3f641c();
    }), $(_0x1a38('0x4'))[_0x1a38('0x11d')](() => {
        if (_0x25d55f(_0x1a38('0x4d'))[_0x1a38('0x146')])
            _0x3f641c();
        else
            _0x257001(), _0x3f641c();
    }), $(_0x1a38('0x17f'))[_0x1a38('0x11d')](() => {
        $(_0x1a38('0x19e'))['toggle']();
    }), $('#lt-ClickSaveEnable')['click'](() => {
        $(_0x1a38('0xa5'))[_0x1a38('0xf2')]();
    }), $('#lt-UIEnable')['click'](() => {
        $(_0x1a38('0x1b2'))[_0x1a38('0xf2')]();
    }), $(_0x1a38('0x15'))['click'](() => {
        $(_0x1a38('0x18e'))[_0x1a38('0xf2')]();
    }), $(_0x1a38('0x103'))[_0x1a38('0x11d')](() => {
        $(_0x1a38('0x9c'))['toggle']();
    }), $('#lt-LaneHeuristicsChecks')['click'](() => {
        if (_0x25d55f('lt-LaneHeuristicsChecks')['checked'])
            _0x3f641c();
        else
            _0x257001(), _0x3f641c();
    }), $(_0x1a38('0x196'))[_0x1a38('0x11d')](() => {
        if (_0x25d55f(_0x1a38('0x131'))[_0x1a38('0x146')])
            _0x3f641c();
        else
            _0x257001(), _0x3f641c();
    }), $(_0x1a38('0x98'))[_0x1a38('0x11d')](() => {
        if (_0x25d55f(_0x1a38('0x71'))[_0x1a38('0x146')])
            _0x3f641c();
        else
            _0x257001(), _0x3f641c();
    });
    const _0x4b3c84 = $['fn'][_0x1a38('0x20')];
    _0x226d15 = _0x5c5df3 + _0x54a225, $['fn'][_0x1a38('0x20')] = function () {
        return this['trigger']('hide'), _0x4b3c84[_0x1a38('0xc0')](this, arguments);
    }, $('#keyboard-dialog')['on'](_0x1a38('0x20'), () => {
        _0x1fd6f8();
    }), $(_0x1a38('0x17f'))[_0x1a38('0x2f')]();
}
async function _0x5baca6() {
    const _0x19a3b6 = $[_0x1a38('0x1f')](localStorage[_0x1a38('0x18a')](_0x1a38('0x176'))), _0x5b38e9 = await WazeWrap['Remote'][_0x1a38('0x1a5')](_0x1a38('0x176'));
    if (!_0x5b38e9)
        console[_0x1a38('0xef')](_0x1a38('0x8a'));
    const _0x3b763b = {
        'lastSaveAction': 0x0,
        'ScriptEnabled': !![],
        'UIEnable': !![],
        'AutoExpandLanes': !![],
        'AutoLanesTab': ![],
        'HighlightsEnable': !![],
        'LabelsEnable': !![],
        'NodesEnable': !![],
        'ABColor': _0x1a38('0x1a0'),
        'BAColor': '#0033cc',
        'LabelColor': _0x1a38('0x63'),
        'ErrorColor': _0x1a38('0xf4'),
        'NodeColor': _0x1a38('0x9a'),
        'TIOColor': _0x1a38('0x52'),
        'LIOColor': _0x1a38('0x52'),
        'CS1Color': _0x1a38('0x89'),
        'CS2Color': _0x1a38('0x106'),
        'HeurColor': _0x1a38('0x14d'),
        'HeurFailColor': _0x1a38('0x93'),
        'CopyEnable': ![],
        'SelAllEnable': ![],
        'LIOEnable': !![],
        'CSEnable': !![],
        'AutoFocusLanes': !![],
        'ReverseLanesIcon': ![],
        'ClickSaveEnable': !![],
        'ClickSaveStraight': ![],
        'ClickSaveTurns': !![],
        'enableScript': '',
        'enableHighlights': '',
        'enableUIEnhancements': '',
        'enableHeuristics': '',
        'LaneHeurNegHighlight': ![],
        'LaneHeurPosHighlight': ![],
        'LaneHeuristicsChecks': ![]
    };
    _0x548c12 = $[_0x1a38('0x168')]({}, _0x3b763b, _0x19a3b6);
    if (_0x5b38e9 && _0x5b38e9['lastSaveAction'] > _0x548c12[_0x1a38('0x139')])
        $[_0x1a38('0x168')](_0x548c12, _0x5b38e9), console[_0x1a38('0xef')](_0x1a38('0x191'));
    else
        console[_0x1a38('0xef')](_0x1a38('0x3f'));
    for (const _0x437671 in _0x3b763b) {
        if (!_0x548c12[_0x1a38('0x41')](_0x437671))
            _0x548c12[_0x437671] = _0x3b763b[_0x437671];
    }
}
async function _0xe1eb82() {
    const _0x10c9c7 = {
        'lastSaveAction': Date[_0x1a38('0x8d')](),
        'ScriptEnabled': _0x548c12['ScriptEnabled'],
        'HighlightsEnable': _0x548c12['HighlightsEnable'],
        'LabelsEnable': _0x548c12[_0x1a38('0x101')],
        'NodesEnable': _0x548c12[_0x1a38('0x17a')],
        'UIEnable': _0x548c12['UIEnable'],
        'AutoLanesTab': _0x548c12[_0x1a38('0x9e')],
        'AutoExpandLanes': _0x548c12[_0x1a38('0x6')],
        'ABColor': _0x548c12[_0x1a38('0xd0')],
        'BAColor': _0x548c12[_0x1a38('0x5')],
        'LabelColor': _0x548c12[_0x1a38('0x10c')],
        'ErrorColor': _0x548c12[_0x1a38('0x115')],
        'NodeColor': _0x548c12[_0x1a38('0x185')],
        'TIOColor': _0x548c12[_0x1a38('0x81')],
        'LIOColor': _0x548c12[_0x1a38('0x1a9')],
        'CS1Color': _0x548c12['CS1Color'],
        'CS2Color': _0x548c12[_0x1a38('0x80')],
        'CopyEnable': _0x548c12[_0x1a38('0x17d')],
        'SelAllEnable': _0x548c12[_0x1a38('0x18f')],
        'LIOEnable': _0x548c12['LIOEnable'],
        'CSEnable': _0x548c12['CSEnable'],
        'AutoFocusLanes': _0x548c12['AutoFocusLanes'],
        'ReverseLanesIcon': _0x548c12[_0x1a38('0x75')],
        'ClickSaveEnable': _0x548c12['ClickSaveEnable'],
        'ClickSaveStraight': _0x548c12[_0x1a38('0x87')],
        'ClickSaveTurns': _0x548c12[_0x1a38('0x18b')],
        'enableScript': _0x548c12[_0x1a38('0x153')],
        'enableHighlights': _0x548c12['enableHighlights'],
        'enableUIEnhancements': _0x548c12[_0x1a38('0xba')],
        'enableHeuristics': _0x548c12[_0x1a38('0x1c')],
        'HeurColor': _0x548c12['HeurColor'],
        'HeurFailColor': _0x548c12['HeurFailColor'],
        'LaneHeurPosHighlight': _0x548c12[_0x1a38('0xec')],
        'LaneHeurNegHighlight': _0x548c12[_0x1a38('0x125')],
        'LaneHeuristicsChecks': _0x548c12[_0x1a38('0x2b')]
    };
    for (const _0x51df94 in W[_0x1a38('0x15e')][_0x1a38('0xa2')]) {
        let _0x22b11c = '';
        W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x51df94]['group'] == _0x1a38('0xe7') && (W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x51df94][_0x1a38('0x122')] ? (W['accelerators'][_0x1a38('0xa2')][_0x51df94][_0x1a38('0x122')]['altKey'] == !![] && (_0x22b11c += 'A'), W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x51df94]['shortcut'][_0x1a38('0x7e')] == !![] && (_0x22b11c += 'S'), W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x51df94]['shortcut'][_0x1a38('0xa6')] == !![] && (_0x22b11c += 'C'), _0x22b11c !== '' && (_0x22b11c += '+'), W[_0x1a38('0x15e')]['Actions'][_0x51df94][_0x1a38('0x122')][_0x1a38('0x108')] && (_0x22b11c += W[_0x1a38('0x15e')]['Actions'][_0x51df94]['shortcut'][_0x1a38('0x108')])) : _0x22b11c = '-1', _0x10c9c7[_0x51df94] = _0x22b11c);
    }
    _0x548c12 = _0x10c9c7;
    localStorage && localStorage[_0x1a38('0x175')](_0x1a38('0x176'), JSON['stringify'](_0x10c9c7));
    const _0x5a1592 = await WazeWrap[_0x1a38('0x10')][_0x1a38('0x13c')](_0x1a38('0x176'), _0x10c9c7);
    if (_0x5a1592 === null)
        console['log'](_0x1a38('0x119'));
    else {
        if (_0x5a1592 === ![])
            console[_0x1a38('0xef')](_0x1a38('0x21'));
    }
}
function _0x1fd6f8() {
    let _0x22149e = ![];
    for (const _0x1cc0bf in W[_0x1a38('0x15e')][_0x1a38('0xa2')]) {
        let _0x3e1453 = '';
        if (W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x1cc0bf][_0x1a38('0x17')] == _0x1a38('0xe7')) {
            W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x1cc0bf][_0x1a38('0x122')] ? (W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x1cc0bf]['shortcut'][_0x1a38('0x152')] == !![] && (_0x3e1453 += 'A'), W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x1cc0bf][_0x1a38('0x122')][_0x1a38('0x7e')] == !![] && (_0x3e1453 += 'S'), W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x1cc0bf][_0x1a38('0x122')][_0x1a38('0xa6')] == !![] && (_0x3e1453 += 'C'), _0x3e1453 !== '' && (_0x3e1453 += '+'), W[_0x1a38('0x15e')][_0x1a38('0xa2')][_0x1cc0bf][_0x1a38('0x122')][_0x1a38('0x108')] && (_0x3e1453 += W[_0x1a38('0x15e')]['Actions'][_0x1cc0bf][_0x1a38('0x122')]['keyCode'])) : _0x3e1453 = '-1';
            if (_0x548c12[_0x1cc0bf] != _0x3e1453) {
                _0x22149e = !![], console[_0x1a38('0xef')](_0x1a38('0x124') + _0x1cc0bf + ':\x20' + _0x548c12[_0x1cc0bf] + _0x1a38('0x45') + _0x3e1453);
                break;
            }
        }
    }
    _0x22149e && (_0xe1eb82(), setTimeout(() => {
        _0x1aa576();
    }, 0xc8));
}
function _0x588079(_0x2ac82a) {
    const _0x2c348e = _0x548c12[_0x2ac82a];
    let _0xd9e596 = '';
    if (_0x2c348e[_0x1a38('0x13e')]('+') > -0x1) {
        const _0x119d06 = _0x2c348e['split']('+')[0x0];
        for (let _0x2fecbe = 0x0; _0x2fecbe < _0x119d06[_0x1a38('0x129')]; _0x2fecbe++) {
            _0xd9e596[_0x1a38('0x129')] > 0x0 && (_0xd9e596 += '+'), _0x119d06[_0x2fecbe] == 'C' && (_0xd9e596 += _0x1a38('0x11')), _0x119d06[_0x2fecbe] == 'S' && (_0xd9e596 += _0x1a38('0x3e')), _0x119d06[_0x2fecbe] == 'A' && (_0xd9e596 += _0x1a38('0x50'));
        }
        _0xd9e596[_0x1a38('0x129')] > 0x0 && (_0xd9e596 += '+');
        let _0x2836d4 = _0x2c348e[_0x1a38('0x184')]('+')[0x1];
        _0x2836d4 >= 0x60 && _0x2836d4 <= 0x69 && (_0x2836d4 -= 0x30, _0xd9e596 += _0x1a38('0x13d')), _0xd9e596 += String[_0x1a38('0x11f')](_0x2836d4);
    } else {
        let _0x2cf369 = parseInt(_0x2c348e);
        _0x2cf369 >= 0x60 && _0x2cf369 <= 0x69 && (_0x2cf369 -= 0x30, _0xd9e596 += _0x1a38('0x13d')), _0xd9e596 += String[_0x1a38('0x11f')](_0x2cf369);
    }
    return _0xd9e596;
}
function _0x1aa576() {
    $(_0x1a38('0x13b'))[_0x1a38('0xa')](_0x588079(_0x1a38('0x153'))), $('#lt-HighlightShortcut')['text'](_0x588079(_0x1a38('0x97'))), $(_0x1a38('0x137'))[_0x1a38('0xa')](_0x588079(_0x1a38('0xba'))), $(_0x1a38('0x135'))['text'](_0x588079(_0x1a38('0x1c')));
}
function _0x1aa636() {
    let _0x5bd2b8 = ![], _0x569c84 = ![], _0x552b7e = ![];
    function _0x4dc11a() {
        if (_0x25d55f(_0x1a38('0x190'))[_0x1a38('0x146')] && !_0x552b7e)
            _0x410919();
        if (_0x350e91 >= 0x2 || editorInfo[_0x1a38('0x149')][_0x1a38('0x129')] > 0x0) {
            let _0x3f0a7e = $(_0x1a38('0xff')), _0x20e2e6 = $(_0x1a38('0x44')), _0x4a3aa2 = $(_0x1a38('0x186')), _0xc2b7f = $(_0x1a38('0x186'));
            $('#li-del-fwd-btn')[_0x1a38('0x8')](), $(_0x1a38('0x143'))[_0x1a38('0x8')]();
            if ($(_0x1a38('0xad'))[_0x1a38('0x36')](_0x1a38('0xa1'))[_0x1a38('0x129')] > 0x0)
                _0x3f0a7e[_0x1a38('0x134')](_0x4a3aa2);
            if ($(_0x1a38('0x7f'))[_0x1a38('0x36')](_0x1a38('0xa1'))[_0x1a38('0x129')] > 0x0)
                _0x20e2e6[_0x1a38('0x134')](_0xc2b7f);
            !_0x25d55f(_0x1a38('0x95')) && (_0xc2b7f[_0x1a38('0x64')]('.rev-lanes\x20>\x20div\x20>\x20.direction-lanes\x20>\x20.lane-instruction.lane-instruction-from\x20>\x20.instruction'), $(_0x1a38('0x10b'))[_0x1a38('0x1ad')](_0x1a38('0x145'), _0x1a38('0xb') + _0x548c12[_0x1a38('0x5')])), !_0x25d55f('li-del-fwd-btn') && (_0x4a3aa2[_0x1a38('0x64')](_0x1a38('0xa7')), $(_0x1a38('0x199'))['css'](_0x1a38('0x145'), _0x1a38('0xb') + _0x548c12[_0x1a38('0xd0')])), $(_0x1a38('0x74'))['click'](() => {
                _0x454a8a(_0x1a38('0x86')), _0x5bd2b8 = !![], setTimeout(function () {
                    _0x4dc11a();
                }, 0xc8);
            }), $(_0x1a38('0x143'))[_0x1a38('0x11d')](() => {
                _0x454a8a('rev'), _0x569c84 = !![], setTimeout(function () {
                    _0x4dc11a();
                }, 0xc8);
            });
        }
        $(_0x1a38('0x85'))[_0x1a38('0x8')](), $(_0x1a38('0x85'))['click'](function () {
            if ($(this)[_0x1a38('0xc9')]('.fwd-lanes')[_0x1a38('0x129')])
                setTimeout(function () {
                    _0x413e0a(_0x1a38('0x86')), _0x1b4e7b(), _0x4a1cd2(), _0x4fff45(), _0x4480ed();
                }, 0x64);
            if ($(this)[_0x1a38('0xc9')](_0x1a38('0x7f'))[_0x1a38('0x129')])
                setTimeout(function () {
                    _0x413e0a('rev'), _0x1b4e7b(), _0x4a1cd2(), _0x4fff45(), _0x4480ed();
                }, 0x64);
        });
        if (!_0x5bd2b8 && !_0x569c84)
            _0x2dd00b();
        _0x4a1cd2();
    }
    function _0x4480ed() {
        $(_0x1a38('0x62'))['off'](), $(_0x1a38('0x12a'))[_0x1a38('0x8')](), $(_0x1a38('0xad'))[_0x1a38('0x36')](_0x1a38('0x62'))['click'](() => {
            _0x5bd2b8 = !![], setTimeout(function () {
                _0x4dc11a();
            }, 0xc8);
        }), $(_0x1a38('0x7f'))[_0x1a38('0x36')](_0x1a38('0x62'))[_0x1a38('0x11d')](() => {
            _0x569c84 = !![], setTimeout(function () {
                _0x4dc11a();
            }, 0xc8);
        }), $(_0x1a38('0xad'))[_0x1a38('0x36')](_0x1a38('0x12a'))['click'](() => {
            _0x5bd2b8 = !![], setTimeout(function () {
                _0x4dc11a();
            }, 0xc8);
        }), $('.rev-lanes')[_0x1a38('0x36')](_0x1a38('0x12a'))[_0x1a38('0x11d')](() => {
            _0x569c84 = !![], setTimeout(function () {
                _0x4dc11a();
            }, 0xc8);
        });
    }
    function _0x2dd00b() {
        _0x25d55f(_0x1a38('0x92'))[_0x1a38('0x146')] && (!_0x5bd2b8 && $(_0x1a38('0xad'))[_0x1a38('0x36')]('.edit-lane-guidance')[_0x1a38('0x11d')](), !_0x569c84 && $(_0x1a38('0x7f'))[_0x1a38('0x36')](_0x1a38('0x85'))[_0x1a38('0x11d')]());
    }
    function _0x4a1cd2() {
        $(_0x1a38('0x127'))[_0x1a38('0x1ad')](_0x1a38('0xab'), _0x1a38('0x173')), $(_0x1a38('0xf5'))[_0x1a38('0x1ad')](_0x1a38('0xab'), '10px\x2010px\x2015px\x2010px'), $(_0x1a38('0xee'))[_0x1a38('0x1ad')](_0x1a38('0xf8'), _0x1a38('0xdf')), $('.rev-lanes\x20>\x20div\x20>\x20div\x20>\x20.lane-instruction.lane-instruction-to\x20>\x20.instruction\x20>\x20.lane-edit\x20>\x20.edit-region\x20>\x20div\x20>\x20.controls.direction-lanes-edit')[_0x1a38('0x1ad')](_0x1a38('0xf8'), _0x1a38('0xdf'));
    }
    function _0x1b4e7b() {
        if ($('.fwd-lanes')[_0x1a38('0x36')](_0x1a38('0x169'))[_0x1a38('0x19')]()[_0x1a38('0x129')] > 0x0 && !_0x25d55f(_0x1a38('0x14e'))) {
            let _0x3c62c7 = $(_0x1a38('0x18')), _0x1f5e12 = $('<div\x20class=\x22lt-add-lanes\x20fwd\x22>2</div>'), _0x22c3da = $(_0x1a38('0x2d')), _0x36a86d = $(_0x1a38('0x16c')), _0x2b573b = $(_0x1a38('0x9b')), _0x43b510 = $(_0x1a38('0xca')), _0x2a6430 = $(_0x1a38('0x4e')), _0x3f0941 = $(_0x1a38('0x12b')), _0x4a91dd = $(_0x1a38('0x111'));
            _0x3c62c7[_0x1a38('0x134')](_0x4a91dd), _0x1f5e12['appendTo'](_0x4a91dd), _0x22c3da[_0x1a38('0x134')](_0x4a91dd), _0x36a86d[_0x1a38('0x134')](_0x4a91dd), _0x2b573b[_0x1a38('0x134')](_0x4a91dd), _0x43b510[_0x1a38('0x134')](_0x4a91dd), _0x2a6430[_0x1a38('0x134')](_0x4a91dd), _0x3f0941[_0x1a38('0x134')](_0x4a91dd), _0x4a91dd[_0x1a38('0x64')](_0x1a38('0xee'));
        }
        if ($('.rev-lanes')[_0x1a38('0x36')](_0x1a38('0x169'))[_0x1a38('0x19')]()[_0x1a38('0x129')] > 0x0 && !_0x25d55f(_0x1a38('0x197'))) {
            let _0x593f94 = $(_0x1a38('0x6f')), _0x52d52c = $(_0x1a38('0x13a')), _0x46b8af = $('<div\x20class=\x22lt-add-lanes\x20rev\x22>3</div>'), _0x5d8875 = $(_0x1a38('0x14')), _0x30c224 = $(_0x1a38('0x151')), _0x5ee8f4 = $(_0x1a38('0xd3')), _0x465c84 = $(_0x1a38('0x12f')), _0x1edd8a = $(_0x1a38('0x132')), _0x2b281e = $(_0x1a38('0x34'));
            _0x593f94[_0x1a38('0x134')](_0x2b281e), _0x52d52c[_0x1a38('0x134')](_0x2b281e), _0x46b8af['appendTo'](_0x2b281e), _0x5d8875[_0x1a38('0x134')](_0x2b281e), _0x30c224['appendTo'](_0x2b281e), _0x5ee8f4[_0x1a38('0x134')](_0x2b281e), _0x465c84[_0x1a38('0x134')](_0x2b281e), _0x1edd8a[_0x1a38('0x134')](_0x2b281e), _0x2b281e[_0x1a38('0x64')](_0x1a38('0x5b'));
        }
        $('.lt-add-lanes')[_0x1a38('0x11d')](function () {
            let _0x74c42c = $(this)[_0x1a38('0xa')]();
            _0x74c42c = parseInt(_0x74c42c), $(this)[_0x1a38('0x9')](_0x1a38('0x69')) && ($('.fwd-lanes')[_0x1a38('0x36')]('.form-control')[_0x1a38('0x156')](_0x74c42c), $(_0x1a38('0xad'))[_0x1a38('0x36')](_0x1a38('0x179'))[_0x1a38('0x141')](), $(_0x1a38('0xad'))[_0x1a38('0x36')](_0x1a38('0x179'))['focus']()), $(this)[_0x1a38('0x9')](_0x1a38('0xa0')) && ($(_0x1a38('0x7f'))['find'](_0x1a38('0x179'))[_0x1a38('0x156')](_0x74c42c), $(_0x1a38('0x7f'))[_0x1a38('0x36')](_0x1a38('0x179'))['change'](), $(_0x1a38('0x7f'))[_0x1a38('0x36')](_0x1a38('0x179'))[_0x1a38('0xf0')]());
        });
    }
    function _0x4fff45() {
        if (_0x25d55f(_0x1a38('0x2a'))[_0x1a38('0x146')]) {
            if ($(_0x1a38('0xad'))[_0x1a38('0x36')]('.edit-region')[_0x1a38('0x19')]()[_0x1a38('0x129')] > 0x0 && !_0x5bd2b8)
                $(_0x1a38('0xad'))['find']('.form-control')[_0x1a38('0xf0')]();
            else {
                if ($(_0x1a38('0x7f'))[_0x1a38('0x36')]('.edit-region')[_0x1a38('0x19')]()['length'] > 0x0 && !_0x569c84)
                    $('.rev-lanes')[_0x1a38('0x36')](_0x1a38('0x179'))[_0x1a38('0xf0')]();
            }
        }
    }
    function _0x413e0a(_0x44705d) {
        if (_0x25d55f(_0x1a38('0x17e'))[_0x1a38('0x146')]) {
            $('.street-name')['css'](_0x1a38('0xe5'), _0x1a38('0x164'));
            let _0x4fd2d7 = _0x44705d == 'fwd' ? $(_0x1a38('0xad'))['find'](_0x1a38('0x179'))[0x0] : $(_0x1a38('0x7f'))[_0x1a38('0x36')](_0x1a38('0x179'))[0x0], _0x5add3b = $(_0x4fd2d7)[_0x1a38('0x156')]();
            $(_0x4fd2d7)[_0x1a38('0x141')](function () {
                let _0x4ea9b9;
                if ($(this)[_0x1a38('0xc9')]('.fwd-lanes')['length'])
                    _0x4ea9b9 = $(_0x1a38('0xad'))[_0x1a38('0x36')](_0x1a38('0x1'));
                else
                    $(this)[_0x1a38('0xc9')]('.rev-lanes')['length'] && (_0x4ea9b9 = $(_0x1a38('0x7f'))[_0x1a38('0x36')]('.controls-container.turns-region'));
                _0x4ea9b9 = $(_0x1a38('0x70'), _0x4ea9b9);
                for (let _0x277bfa = 0x0; _0x277bfa < _0x4ea9b9[_0x1a38('0x129')]; _0x277bfa++) {
                    $(_0x4ea9b9[_0x277bfa])[_0x1a38('0x8')](), $(_0x4ea9b9[_0x277bfa])['click'](function () {
                        let _0x5c271a = $(this)[_0x1a38('0x7d')](0x0), _0x48bf3d = _0x5c271a[_0x1a38('0x4b')], _0x4b3f25 = $(_0x1a38('0xe'), _0x48bf3d);
                        for (i = 0x0; i < _0x4b3f25[_0x1a38('0x129')]; i++) {
                            let _0x2d41a8 = _0x4b3f25[i]['id'];
                            _0x25d55f(_0x2d41a8)[_0x1a38('0x146')] ? ($('#' + _0x2d41a8)['prop'](_0x1a38('0x146'), ![]), $('#' + _0x2d41a8)[_0x1a38('0x141')]()) : ($('#' + _0x2d41a8)[_0x1a38('0x3a')](_0x1a38('0x146'), !![]), $('#' + _0x2d41a8)[_0x1a38('0x141')]());
                        }
                    });
                }
            });
            if (_0x5add3b > 0x0)
                $(_0x4fd2d7)[_0x1a38('0x141')]();
        }
    }
    function _0x410919() {
        let _0x4cc442 = document[_0x1a38('0x8b')](_0x1a38('0xe1')), _0x9844aa = $(_0x1a38('0x17c'))['get']();
        for (let _0x499419 = 0x0; _0x499419 < _0x4cc442[_0x1a38('0x129')]; _0x499419++) {
            if (_0x4cc442[_0x499419][_0x1a38('0xa8')]['includes']('south')) {
                let _0x2482e5 = $(_0x9844aa[_0x499419])[_0x1a38('0x19')]();
                $(_0x2482e5)[_0x1a38('0x1ad')](_0x1a38('0x150'), 'rotate(180deg)'), $(_0x9844aa[_0x499419])[_0x1a38('0x11c')](_0x2482e5[_0x1a38('0x7d')]()[_0x1a38('0x163')]());
            }
        }
        _0x552b7e = !![];
    }
    if (_0x25d55f(_0x1a38('0x144'))[_0x1a38('0x146')] && _0x25d55f('lt-ScriptEnabled')['checked'] && W['selectionManager'][_0x1a38('0x8f')]()[_0x1a38('0x129')] > 0x0) {
        selFeat = W[_0x1a38('0x14a')][_0x1a38('0x8f')](), _0x3bcf2f = _0x36baf3 != _0x226d15;
        if (selFeat[_0x1a38('0x129')] == 0x1 && selFeat[0x0][_0x1a38('0x8e')][_0x1a38('0x91')] == _0x1a38('0xd9') && _0x3bcf2f)
            $('.lanes-tab')[_0x1a38('0x11d')](() => {
                _0x5bd2b8 = ![], _0x569c84 = ![], setTimeout(() => {
                    _0x4dc11a();
                }, 0x64);
            }), _0x25d55f(_0x1a38('0x61'))[_0x1a38('0x146')] && setTimeout(() => {
                $(_0x1a38('0xae'))['click']();
            }, 0x64);
        else
            selFeat[_0x1a38('0x129')] == 0x2 && _0x4ef858(selFeat, _0x9fe1bd[_0x1a38('0xbd')]);
    }
}
function _0x2f0130() {
    $(_0x1a38('0x1a4'))[_0x1a38('0x11d')]();
}
function _0x2625bc() {
    $('#lt-HighlightsEnable')[_0x1a38('0x11d')]();
}
function _0x5d752b() {
    $(_0x1a38('0x193'))[_0x1a38('0x11d')]();
}
function _0xb1983() {
    $(_0x1a38('0x103'))[_0x1a38('0x11d')]();
}
function _0x25d55f(_0x314abb) {
    return document['getElementById'](_0x314abb);
}
function _0x5c8a4b(_0x56dae2, _0x2d22b0) {
    if (!_0x56dae2[_0x1a38('0xe2')] || !_0x56dae2[_0x1a38('0x162')])
        return ![];
    if (_0x2d22b0 >= _0x2c68b1[_0x1a38('0x5d')] || _0x56dae2[_0x1a38('0x91')] === 'segment' && _0x56dae2[_0x1a38('0x162')]['roadType'] === _0x322497[_0x1a38('0x130')])
        return W[_0x1a38('0x2')][_0x1a38('0x14c')]()[_0x1a38('0x11b')](_0x56dae2[_0x1a38('0xe2')]['getBounds']());
    return ![];
}
function _0x454a8a(_0x1dfeff) {
    const _0x31fd6e = W[_0x1a38('0x14a')][_0x1a38('0x8f')](), _0x2e4d30 = _0x31fd6e[0x0][_0x1a38('0x8e')], _0x2144d7 = W['model'][_0x1a38('0x10e')](), _0x31327a = new _0x3fd8f8();
    let _0x1a36fc, _0x387cec, _0x1cf6be = {};
    _0x31327a[_0x1a38('0x16b')](W[_0x1a38('0x8e')]);
    _0x1dfeff === _0x1a38('0x86') && (_0x1cf6be[_0x1a38('0x37')] = 0x0, _0x1a36fc = W[_0x1a38('0x8e')][_0x1a38('0x1a1')]['getObjectById'](_0x2e4d30[_0x1a38('0x162')][_0x1a38('0x96')]), _0x387cec = _0x1a36fc[_0x1a38('0x1ae')](), $(_0x1a38('0xad'))[_0x1a38('0x36')]('.form-control')[_0x1a38('0x156')](0x0), $('.fwd-lanes')[_0x1a38('0x36')](_0x1a38('0x179'))[_0x1a38('0x141')]());
    _0x1dfeff === 'rev' && (_0x1cf6be[_0x1a38('0x1a8')] = 0x0, _0x1a36fc = W[_0x1a38('0x8e')][_0x1a38('0x1a1')]['getObjectById'](_0x2e4d30[_0x1a38('0x162')]['fromNodeID']), _0x387cec = _0x1a36fc[_0x1a38('0x1ae')](), $(_0x1a38('0x7f'))[_0x1a38('0x36')]('.form-control')[_0x1a38('0x156')](0x0), $(_0x1a38('0x7f'))['find'](_0x1a38('0x179'))['change']());
    _0x31327a[_0x1a38('0xcb')](new _0x3d0b12(_0x2e4d30, _0x1cf6be));
    for (let _0x325442 = 0x0; _0x325442 < _0x387cec[_0x1a38('0x129')]; _0x325442++) {
        let _0x24bc61 = _0x2144d7[_0x1a38('0xf1')](_0x1a36fc, _0x2e4d30, W['model'][_0x1a38('0x1e')][_0x1a38('0x174')](_0x387cec[_0x325442])), _0x5940df = _0x24bc61[_0x1a38('0x46')]();
        _0x5940df[_0x1a38('0x67')]() && (_0x5940df = _0x5940df[_0x1a38('0x14b')](), _0x24bc61 = _0x24bc61['withTurnData'](_0x5940df), _0x31327a[_0x1a38('0xcb')](new _0xa26135(_0x2144d7, _0x24bc61)));
    }
    _0x31327a[_0x1a38('0xcf')] = _0x1a38('0x3'), W[_0x1a38('0x8e')][_0x1a38('0x55')][_0x1a38('0x1a7')](_0x31327a);
}
function _0x257001() {
    _0x2f1fc2['removeAllFeatures'](), _0x5767c7['removeAllFeatures'](), _0xa6d4c5[_0x1a38('0x195')]();
}
function _0x38edd8(_0x46a289, _0x2db4dc, _0x1241e3) {
    let _0x253ca7 = _0x46a289[_0x1a38('0xbb')](), _0x107357 = _0x2db4dc + _0x1a38('0xf6') + _0x1241e3, _0x236c81 = new OpenLayers[(_0x1a38('0x88'))][(_0x1a38('0xc5'))](_0x253ca7, {
            'labelText': _0x107357,
            'labelColor': _0x548c12['LabelColor']
        });
    _0x5767c7[_0x1a38('0x58')]([_0x236c81]);
}
function _0x5688e1(_0x3f68dd, _0x161dd0, _0x27ccc0, _0x1205ff, _0x399d78, _0x16b1de, _0x116274, _0x33490f, _0x44cf71, _0x58b2d6, _0x12e15e) {
    const _0x3438ba = {
            'DASH_THIN': 0x1,
            'DASH_THICK': 0x2,
            'HIGHLIGHT': 0xa,
            'OVER_HIGHLIGHT': 0x14
        }, _0x148a0c = _0x3f68dd['clone'](), _0x167eae = _0x25d55f(_0x1a38('0xde'))[_0x1a38('0x146')];
    if (_0x148a0c[_0x1a38('0xfa')]['length'] > 0x2) {
        let _0x56781e = _0x148a0c[_0x1a38('0xfa')][_0x1a38('0x129')], _0x5461bd = _0x56781e / 0x2, _0x17d2c2 = _0x56781e % 0x2 ? Math['ceil'](_0x5461bd) - 0x1 : Math[_0x1a38('0x181')](_0x5461bd), _0x2d6cc1 = _0x56781e % 0x2 ? Math[_0x1a38('0x136')](_0x5461bd) + 0x1 : Math['floor'](_0x5461bd);
        if (_0x161dd0 == _0x9fe1bd[_0x1a38('0x104')]) {
            let _0x9fe8e3 = _0x47ff60(_0x148a0c, _0x17d2c2, _0x56781e);
            if (_0x27ccc0)
                _0x4462e0(_0x9fe8e3, '' + _0x548c12[_0x1a38('0xd0')], _0x3438ba[_0x1a38('0x133')]);
            _0x3da8cf(_0x9fe8e3, _0x116274, _0x44cf71, _0x58b2d6, _0x12e15e);
        } else {
            if (_0x161dd0 == _0x9fe1bd['REVERSE']) {
                let _0x8af080 = _0x47ff60(_0x148a0c, 0x0, _0x2d6cc1);
                if (_0x27ccc0)
                    _0x4462e0(_0x8af080, '' + _0x548c12[_0x1a38('0x5')], _0x3438ba[_0x1a38('0x133')]);
                _0x3da8cf(_0x8af080, _0x116274, _0x44cf71, _0x58b2d6, _0x12e15e);
            }
        }
        if (_0x1205ff && (_0x9fe1bd['FORWARD'] || _0x399d78 == 0x0)) {
            if (_0x56781e % 0x2)
                _0x38edd8(_0x148a0c[_0x1a38('0xfa')][_0x17d2c2], _0x399d78, _0x16b1de);
            else {
                let _0x3520cc = _0x148a0c['components'][_0x2d6cc1 - 0x1], _0x4d9600 = _0x148a0c[_0x1a38('0xfa')][_0x17d2c2], _0x576e1e = new OpenLayers[(_0x1a38('0x157'))][(_0x1a38('0x29'))]((_0x3520cc['x'] + _0x4d9600['x']) / 0x2, (_0x3520cc['y'] + _0x4d9600['y']) / 0x2);
                _0x38edd8(_0x576e1e, _0x399d78, _0x16b1de);
            }
        }
    } else {
        let _0x1b80e8 = _0x148a0c['components'][0x0], _0x200890 = _0x148a0c[_0x1a38('0xfa')][0x1], _0x1d1817 = new OpenLayers[(_0x1a38('0x157'))][(_0x1a38('0x29'))]((_0x1b80e8['x'] + _0x200890['x']) / 0x2, (_0x1b80e8['y'] + _0x200890['y']) / 0x2);
        if (_0x161dd0 == _0x9fe1bd[_0x1a38('0x104')]) {
            let _0x1fcd6d = new OpenLayers[(_0x1a38('0x157'))][(_0x1a38('0x29'))](_0x148a0c['components'][0x1][_0x1a38('0xbb')]()['x'], _0x148a0c[_0x1a38('0xfa')][0x1][_0x1a38('0xbb')]()['y']), _0x3d8ac8 = new OpenLayers[(_0x1a38('0x157'))][(_0x1a38('0x39'))]([
                    _0x1d1817,
                    _0x1fcd6d
                ], {});
            if (_0x27ccc0)
                _0x4462e0(_0x3d8ac8, '' + _0x548c12[_0x1a38('0xd0')], _0x3438ba[_0x1a38('0x133')]);
            _0x3da8cf(_0x3d8ac8, _0x116274, _0x44cf71, _0x58b2d6, _0x12e15e);
        } else {
            if (_0x161dd0 == _0x9fe1bd[_0x1a38('0x12e')]) {
                let _0x3104b3 = new OpenLayers[(_0x1a38('0x157'))][(_0x1a38('0x29'))](_0x148a0c[_0x1a38('0xfa')][0x0][_0x1a38('0xbb')]()['x'], _0x148a0c[_0x1a38('0xfa')][0x0][_0x1a38('0xbb')]()['y']), _0x27f889 = new OpenLayers[(_0x1a38('0x157'))]['LineString']([
                        _0x1d1817,
                        _0x3104b3
                    ], {});
                if (_0x27ccc0)
                    _0x4462e0(_0x27f889, '' + _0x548c12[_0x1a38('0x5')], _0x3438ba[_0x1a38('0x133')]);
                _0x3da8cf(_0x27f889, _0x116274, _0x44cf71, _0x58b2d6, _0x12e15e);
            }
        }
        _0x1205ff && (_0x9fe1bd['FORWARD'] || _0x399d78 == 0x0) && _0x38edd8(_0x1d1817, _0x399d78, _0x16b1de);
    }
    function _0x47ff60(_0x2dc044, _0x2bb63c, _0x1e11f4) {
        let _0x5f0913 = [];
        for (let _0x523391 = _0x2bb63c; _0x523391 < _0x1e11f4; _0x523391++) {
            _0x5f0913[_0x523391] = _0x2dc044[_0x1a38('0xfa')][_0x523391][_0x1a38('0xbb')]();
        }
        return new OpenLayers[(_0x1a38('0x157'))][(_0x1a38('0x39'))](_0x5f0913, {});
    }
    function _0x3da8cf(_0x2ade68, _0x224db4, _0x4d83ba, _0x14a1b6, _0x5bef3d = ![]) {
        if (_0x4d83ba) {
            _0x4462e0(_0x2ade68['clone'](), '' + _0x548c12[_0x1a38('0x115')], _0x3438ba[_0x1a38('0xe6')]);
            return;
        }
        _0x224db4 && _0x4462e0(_0x2ade68['clone'](), '' + _0x548c12['LIOColor'], _0x3438ba[_0x1a38('0xd')]);
        _0x33490f == 0x1 && _0x167eae && _0x4462e0(_0x2ade68[_0x1a38('0xbb')](), '' + _0x548c12[_0x1a38('0x18c')], _0x3438ba[_0x1a38('0xd')]);
        _0x33490f == 0x2 && _0x167eae && _0x4462e0(_0x2ade68[_0x1a38('0xbb')](), '' + _0x548c12[_0x1a38('0x80')], _0x3438ba[_0x1a38('0xd')]);
        if (_0x14a1b6 == _0x5ceb4b[_0x1a38('0x23')])
            _0x4462e0(_0x2ade68[_0x1a38('0xbb')](), '' + _0x548c12['HeurColor'], _0x5bef3d ? _0x3438ba[_0x1a38('0xe6')] : _0x3438ba['HIGHLIGHT']);
        else
            _0x14a1b6 == _0x5ceb4b[_0x1a38('0x9d')] && _0x4462e0(_0x2ade68['clone'](), '' + _0x548c12['HeurFailColor'], _0x5bef3d ? _0x3438ba[_0x1a38('0xe6')] : _0x3438ba[_0x1a38('0xd')]);
    }
    function _0x4462e0(_0x54dbc7, _0x4bdad1, _0x57d1d7) {
        let _0x38d12b = new OpenLayers[(_0x1a38('0x88'))][(_0x1a38('0xc5'))](_0x54dbc7, {}, {});
        _0x2f1fc2[_0x1a38('0x58')]([_0x38d12b]);
        const _0x445157 = document[_0x1a38('0x49')](_0x54dbc7['id']);
        if (_0x445157) {
            _0x445157[_0x1a38('0x128')](_0x1a38('0x160'), '' + _0x4bdad1);
            if (_0x57d1d7 == _0x3438ba[_0x1a38('0xd')])
                _0x445157[_0x1a38('0x128')](_0x1a38('0x84'), '15'), _0x445157[_0x1a38('0x128')](_0x1a38('0x10f'), '.6');
            else {
                if (_0x57d1d7 == _0x3438ba[_0x1a38('0xe6')])
                    _0x445157[_0x1a38('0x128')](_0x1a38('0x84'), '18'), _0x445157[_0x1a38('0x128')](_0x1a38('0x10f'), _0x1a38('0xbf'));
                else {
                    _0x445157[_0x1a38('0x128')](_0x1a38('0x10f'), '1');
                    if (_0x57d1d7 == _0x3438ba['DASH_THICK'])
                        _0x445157[_0x1a38('0x128')](_0x1a38('0x84'), '8'), _0x445157[_0x1a38('0x128')]('stroke-dasharray', '8\x2010');
                    else
                        _0x57d1d7 == _0x3438ba[_0x1a38('0x133')] && (_0x445157[_0x1a38('0x128')](_0x1a38('0x84'), '4'), _0x445157[_0x1a38('0x128')]('stroke-dasharray', '10\x2010'));
                }
            }
        }
    }
}
function _0x1dac5a(_0x42ef58, _0x1e6c8e, _0x154d6c = ![]) {
    const _0xee2834 = _0x42ef58[_0x1a38('0xbb')](), _0x2e85b3 = new OpenLayers[(_0x1a38('0x88'))]['Vector'](_0xee2834, {});
    _0x2f1fc2['addFeatures']([_0x2e85b3]);
    const _0x1f329c = document[_0x1a38('0x49')](_0xee2834['id']);
    _0x1f329c && (_0x1f329c['setAttribute'](_0x1a38('0xea'), _0x1e6c8e), _0x1f329c[_0x1a38('0x128')]('r', _0x154d6c ? '18' : '10'), _0x1f329c[_0x1a38('0x128')](_0x1a38('0x1b1'), _0x1a38('0x66')), _0x1f329c[_0x1a38('0x128')](_0x1a38('0x84'), '0'));
}
let _0x3ceffa = {
    'start': function () {
        this['cancel']();
        let _0xc3e603 = this;
        this[_0x1a38('0xdb')] = window[_0x1a38('0xf3')](function () {
            _0xc3e603[_0x1a38('0xc3')]();
        }, 0x1f4);
    },
    'calculate': function () {
        _0xcebec1(), delete this[_0x1a38('0xdb')];
    },
    'cancel': function () {
        typeof this[_0x1a38('0xdb')] === _0x1a38('0x78') && (window[_0x1a38('0x26')](this[_0x1a38('0xdb')]), delete this[_0x1a38('0xdb')], _0x196c95 = 0x0);
    }
};
var _0x196c95 = 0x0;
function _0x3f641c() {
    _0x196c95 = 0x3, _0xcebec1();
}
function _0xcebec1() {
    const _0x201862 = _0x25d55f(_0x1a38('0x121'))[_0x1a38('0x146')], _0x3e0aa2 = _0x25d55f(_0x1a38('0x5c'))['checked'], _0x29e9f8 = _0x25d55f(_0x1a38('0xb9'))[_0x1a38('0x146')], _0x4079b2 = window['W']['map']['olMap'][_0x1a38('0x16f')];
    _0x3bcf2f = _0x36baf3 != _0x226d15;
    if (_0x4079b2 < _0x2c68b1[_0x1a38('0x60')])
        return;
    _0x201862 && (_0x3e0aa2 || _0x29e9f8) && _0x3bcf2f && _0x2fd08a(W[_0x1a38('0x8e')][_0x1a38('0x1e')][_0x1a38('0x2e')](), ![]), _0x201862 && (selFeat = W[_0x1a38('0x14a')][_0x1a38('0x8f')](), selFeat[_0x1a38('0x129')] == 0x2 && _0x4ef858(selFeat, _0x9fe1bd[_0x1a38('0xbd')]));
}
function _0x4ef858(_0x5160eb, _0x3ebccd) {
    let _0x1b54c0 = [], _0x3ddb0e = 0x0;
    return _[_0x1a38('0x7c')](_0x5160eb, _0x353300 => {
        _0x353300 && _0x353300[_0x1a38('0x8e')] && _0x353300[_0x1a38('0x8e')][_0x1a38('0x91')] == _0x1a38('0xd9') && (_0x3ddb0e = _0x1b54c0[_0x1a38('0x100')](_0x353300[_0x1a38('0x8e')]));
    }), _0x2fd08a(_0x1b54c0, !![]), _0x3ddb0e;
}
function _0x2fd08a(_0x46d5d6, _0x434727) {
    const _0x3e894c = _0x25d55f(_0x1a38('0xb9'))[_0x1a38('0x146')], _0x241ad7 = _0x3e894c && _0x25d55f(_0x1a38('0x131'))['checked'], _0x4cb008 = _0x3e894c && _0x25d55f(_0x1a38('0x71'))[_0x1a38('0x146')], _0x4e8e9c = _0x25d55f(_0x1a38('0x5c'))[_0x1a38('0x146')], _0x103b21 = _0x4e8e9c && _0x25d55f(_0x1a38('0x4d'))[_0x1a38('0x146')], _0x231207 = _0x4e8e9c && _0x25d55f(_0x1a38('0x1d'))[_0x1a38('0x146')], _0x50c8da = window['W'][_0x1a38('0x2')][_0x1a38('0x4f')][_0x1a38('0x16f')], _0x115e53 = W[_0x1a38('0x8e')]['getTurnGraph']();
    _[_0x1a38('0x7c')](_0x46d5d6, _0x580326 => {
        if (_0x5c8a4b(_0x580326, _0x50c8da)) {
            const _0x5b1097 = _0x580326[_0x1a38('0x19c')](), _0x29ce94 = W[_0x1a38('0x8e')]['nodes']['getObjectById'](_0x5b1097[_0x1a38('0x96')]), _0x2d9bb7 = W['model'][_0x1a38('0x1a1')][_0x1a38('0x174')](_0x5b1097[_0x1a38('0x1b')]), _0x5ad3f8 = _0x5b1097[_0x1a38('0x37')], _0x166bd9 = _0x5b1097[_0x1a38('0x1a8')];
            let _0x4a174e = ![], _0x3501c6 = ![], _0xbc8a09 = ![], _0x41304d = ![], _0x2d14e7 = ![], _0x2c1cb0 = ![], _0x2a7205 = ![], _0x2ee746 = ![], _0x521d6c = 0x0, _0x3f8952 = 0x0, _0xd7e9 = ![], _0x481138 = _0x5ceb4b[_0x1a38('0x15f')], _0x4124f6 = _0x5ceb4b['NONE'], _0x273e33 = null, _0x8e3146 = null, _0xc77fc6 = {
                    'inSeg': 0x0,
                    'inSegDir': _0x9fe1bd[_0x1a38('0x15f')]
                };
            if (_0x5ad3f8 > 0x0 && _0x5c8a4b(_0x29ce94, _0x50c8da)) {
                const _0x577ef3 = _0x29ce94[_0x1a38('0x1ae')]();
                let _0x211bad = _0x5d3e2d(_0x580326, _0x29ce94, _0x577ef3, _0x5ad3f8);
                _0x4a174e = _0x211bad[0x0], _0xbc8a09 = _0x211bad[0x1], _0x2a7205 = _0x211bad[0x2], _0x2d14e7 = _0x211bad[0x3], _0x521d6c = _0x211bad[0x4], _0xd7e9 = _0x2d14e7 || _0xd7e9, _0x481138 = _0x24518b(_0x580326, _0x29ce94, _0x577ef3, _0x2d9bb7, _0x5ad3f8, _0x115e53, _0xc77fc6);
                _0x481138 == _0x5ceb4b[_0x1a38('0x2c')] && (_0x2d14e7 = !![]);
                if (!_0x3e894c)
                    _0x481138 = _0x5ceb4b['NONE'];
                else
                    _0x481138 != _0x5ceb4b[_0x1a38('0x15f')] && (_0x273e33 = { ..._0xc77fc6 });
            }
            if (_0x166bd9 > 0x0 && _0x5c8a4b(_0x2d9bb7, _0x50c8da)) {
                const _0x1eec56 = _0x2d9bb7[_0x1a38('0x1ae')]();
                let _0x38eeb2 = _0x5d3e2d(_0x580326, _0x2d9bb7, _0x1eec56, _0x166bd9);
                _0x3501c6 = _0x38eeb2[0x0], _0x41304d = _0x38eeb2[0x1], _0x2ee746 = _0x38eeb2[0x2], _0x2c1cb0 = _0x38eeb2[0x3], _0x3f8952 = _0x38eeb2[0x4], _0xd7e9 = _0x2c1cb0 || _0xd7e9, _0x4124f6 = _0x24518b(_0x580326, _0x2d9bb7, _0x1eec56, _0x29ce94, _0x166bd9, _0x115e53, _0xc77fc6);
                _0x4124f6 == _0x5ceb4b[_0x1a38('0x2c')] && (_0x2c1cb0 = !![]);
                if (!_0x3e894c)
                    _0x4124f6 = _0x5ceb4b[_0x1a38('0x15f')];
                else
                    _0x4124f6 != _0x5ceb4b['NONE'] && (_0x8e3146 = { ..._0xc77fc6 });
            }
            if (_0xd7e9 && _0x196c95 > 0x0) {
                _0x28451f('LT\x20errors\x20found,\x20scanning\x20again', 0x1), _0x257001(), _0x196c95--, _0x3ceffa[_0x1a38('0xce')]();
                return;
            }
            if (!_0x434727) {
                let _0xf8ea84 = null;
                (_0x241ad7 && _0x481138 == _0x5ceb4b[_0x1a38('0x23')] || _0x4cb008 && _0x481138 == _0x5ceb4b[_0x1a38('0x9d')]) && (_0xf8ea84 = _0x481138);
                _0x5ad3f8 > 0x0 && (_0x5688e1(_0x580326[_0x1a38('0xe2')], _0x9fe1bd['FORWARD'], _0x4e8e9c, _0x231207, _0x5ad3f8, _0x166bd9, _0x2a7205 && _0x103b21, _0x521d6c, _0x2d14e7, _0xf8ea84, ![]), _0xf8ea84 = null);
                (_0x241ad7 && _0x4124f6 == _0x5ceb4b[_0x1a38('0x23')] || _0x4cb008 && _0x4124f6 == _0x5ceb4b[_0x1a38('0x9d')]) && (_0xf8ea84 = _0x4124f6);
                _0x166bd9 > 0x0 && _0x5688e1(_0x580326[_0x1a38('0xe2')], _0x9fe1bd[_0x1a38('0x12e')], _0x4e8e9c, _0x231207, _0x5ad3f8, _0x166bd9, _0x2ee746 && _0x103b21, _0x3f8952, _0x2c1cb0, _0xf8ea84, ![]);
                if (_0x4e8e9c && _0x25d55f('lt-NodesEnable')[_0x1a38('0x146')]) {
                    if (_0x4a174e)
                        _0x1dac5a(_0x29ce94[_0x1a38('0xe2')], '' + _0x548c12[_0x1a38('0x185')]);
                    if (_0xbc8a09)
                        _0x1dac5a(_0x29ce94[_0x1a38('0xe2')], '' + _0x548c12[_0x1a38('0x81')]);
                    if (_0x3501c6)
                        _0x1dac5a(_0x2d9bb7[_0x1a38('0xe2')], '' + _0x548c12[_0x1a38('0x185')]);
                    if (_0x41304d)
                        _0x1dac5a(_0x2d9bb7[_0x1a38('0xe2')], '' + _0x548c12[_0x1a38('0x81')]);
                }
            } else {
                _0x28451f('candidate(f/r):' + _0x481138 + ',' + _0x4124f6);
                if (_0x481138 != _0x5ceb4b[_0x1a38('0x15f')]) {
                    if (_0x5ad3f8 > 0x0 && _0x273e33 != null && _0x46d5d6[_0x1a38('0xd4')](_0x331266 => _0x331266 === _0x273e33[_0x1a38('0xd5')]) > -0x1) {
                        let _0x539ff0 = _0x481138 == _0x5ceb4b[_0x1a38('0x23')] ? '' + _0x548c12[_0x1a38('0x185')] : '' + _0x548c12[_0x1a38('0x198')];
                        _0x5688e1(_0x580326['geometry'], _0x9fe1bd['FORWARD'], ![], ![], 0x0, 0x0, ![], _0x521d6c, _0x2d14e7, _0x481138, !![]), _0x5688e1(_0x273e33['inSeg']['geometry'], _0x273e33[_0x1a38('0x30')], ![], ![], 0x0, 0x0, ![], 0x0, ![], _0x481138, !![]), _0x1dac5a(_0x29ce94['geometry'], _0x539ff0, !![]), _0x1dac5a(_0x2d9bb7['geometry'], _0x539ff0, !![]);
                    }
                }
                if (_0x4124f6 != _0x5ceb4b[_0x1a38('0x15f')]) {
                    if (_0x166bd9 > 0x0 && _0x8e3146 != null && _0x46d5d6['findIndex'](_0x4ba6af => _0x4ba6af === _0x8e3146[_0x1a38('0xd5')]) > -0x1) {
                        let _0x5048d7 = _0x4124f6 == _0x5ceb4b[_0x1a38('0x23')] ? '' + _0x548c12['NodeColor'] : '' + _0x548c12['HeurFailColor'];
                        _0x5688e1(_0x580326['geometry'], _0x9fe1bd[_0x1a38('0x12e')], ![], ![], 0x0, 0x0, ![], _0x3f8952, _0x2c1cb0, _0x4124f6, !![]), _0x5688e1(_0x8e3146[_0x1a38('0xd5')][_0x1a38('0xe2')], _0x8e3146[_0x1a38('0x30')], ![], ![], 0x0, 0x0, ![], 0x0, ![], _0x4124f6, !![]), _0x1dac5a(_0x29ce94[_0x1a38('0xe2')], _0x5048d7, !![]), _0x1dac5a(_0x2d9bb7[_0x1a38('0xe2')], _0x5048d7, !![]);
                    }
                }
            }
        }
    });
    function _0x5d3e2d(_0x4f1ed6, _0x13e4dc, _0x1de9c4, _0x510ea6) {
        let _0x545746 = ![], _0x20b113 = ![], _0x3b3625 = ![], _0x63d610 = ![], _0x232392 = 0x0, _0x19227f = [];
        for (let _0x582748 = 0x0; _0x582748 < _0x1de9c4[_0x1a38('0x129')]; _0x582748++) {
            const _0x25f1a5 = W[_0x1a38('0x8e')]['segments']['getObjectById'](_0x1de9c4[_0x582748]), _0x3f042d = _0x115e53[_0x1a38('0xf1')](_0x13e4dc, _0x4f1ed6, _0x25f1a5)[_0x1a38('0x46')]();
            if (_0x3f042d['state'] == 0x1) {
                _0x3f042d[_0x1a38('0xa4')]() && (_0x20b113 = !![]);
                if (_0x3f042d[_0x1a38('0x67')]()) {
                    _0x545746 = !![];
                    _0x3f042d[_0x1a38('0x11e')]()['hasOverrideAngle']() && (_0x63d610 = !![]);
                    if (_0x3f042d[_0x1a38('0x11e')]()['getGuidanceMode']() == 0x1)
                        _0x232392 = 0x1;
                    else
                        _0x3f042d['getLaneData']()[_0x1a38('0x110')]() == 0x2 && (_0x232392 = 0x2);
                    const _0x53e8b5 = _0x3f042d[_0x1a38('0xb7')]['fromLaneIndex'], _0x5cfa36 = _0x3f042d['lanes'][_0x1a38('0x99')];
                    for (let _0xfce103 = _0x53e8b5; _0xfce103 < _0x5cfa36 + 0x1; _0xfce103++) {
                        let _0x74a1fe = !![];
                        for (let _0x1da8d7 = 0x0; _0x1da8d7 < _0x19227f[_0x1a38('0x129')]; _0x1da8d7++) {
                            _0x19227f[_0x1da8d7] == _0xfce103 && (_0x74a1fe = ![]);
                        }
                        _0x74a1fe && _0x19227f[_0x1a38('0x100')](_0xfce103);
                    }
                }
            }
        }
        _0x19227f[_0x1a38('0x117')]();
        for (let _0x5d6ea5 = 0x0; _0x5d6ea5 < _0x19227f['length']; _0x5d6ea5++) {
            _0x19227f[_0x5d6ea5] != _0x5d6ea5 && (_0x3b3625 = !![]);
        }
        return _0x19227f[_0x1a38('0x129')] < _0x510ea6 && _0x5c8a4b(_0x13e4dc, _0x50c8da) && (_0x3b3625 = !![]), [
            _0x545746,
            _0x20b113,
            _0x63d610,
            _0x3b3625,
            _0x232392
        ];
    }
}
function _0x21a39d(_0xff55cd) {
    if (!_0x25d55f(_0x1a38('0x15a'))['checked'])
        return;
    let _0xa1778f = document[_0x1a38('0x8b')](_0xff55cd)[0x0], _0x3cd60f = _0xa1778f[_0x1a38('0x8b')](_0x1a38('0xd7'))[_0x1a38('0x129')] > 0x0 ? _0x1a38('0xd7') : _0xa1778f[_0x1a38('0x8b')](_0x1a38('0xd8'))[_0x1a38('0x129')] > 0x0 ? _0x1a38('0xd8') : _0x1a38('0x7a'), _0x5bc76b = _0xa1778f[_0x1a38('0x8b')](_0x1a38('0xaa'))[_0x1a38('0x129')] > 0x0 ? _0x1a38('0xaa') : _0xa1778f[_0x1a38('0x8b')](_0x1a38('0x148'))[_0x1a38('0x129')] > 0x0 ? _0x1a38('0x148') : _0x1a38('0x16d'), _0x3911e7 = _0xa1778f[_0x1a38('0x8b')](_0x1a38('0x123')), _0x479c66 = ![], _0x2dcee4 = ![], _0x28e5a5 = [][_0x1a38('0xa3')][_0x1a38('0x126')](_0x3911e7)[_0x1a38('0xc6')]((_0x29b96d, _0x53bc0b) => {
            return _0x29b96d + [][_0x1a38('0xa3')][_0x1a38('0x126')](_0x53bc0b[_0x1a38('0x165')](_0x1a38('0x1a6')))[_0x1a38('0xc6')]((_0x18c7b6, _0x5bdb9a) => {
                return _0x5bdb9a[_0x1a38('0x146')] === !![] ? _0x18c7b6 + 0x1 : _0x18c7b6;
            }, 0x0);
        }, 0x0);
    if (_0x28e5a5 === 0x0) {
        for (let _0x23e03b = 0x0; _0x23e03b < _0x3911e7['length']; _0x23e03b++) {
            let _0x50103b = _0x3911e7[_0x23e03b]['getElementsByTagName'](_0x1a38('0x1a6'));
            if (_0x50103b && _0x50103b[_0x1a38('0x129')] > 0x0) {
                if (_0x3911e7[_0x23e03b][_0x1a38('0x8b')](_0x3cd60f)[_0x1a38('0x129')] > 0x0 && _0x50103b[0x0][_0x1a38('0x146')] !== undefined && _0x50103b[0x0][_0x1a38('0x146')] === ![] && _0x25d55f(_0x1a38('0x109'))[_0x1a38('0x146')])
                    _0x479c66 = !![], _0x50103b[0x0][_0x1a38('0x11d')]();
                else
                    _0x3911e7[_0x23e03b][_0x1a38('0x8b')](_0x5bc76b)[_0x1a38('0x129')] > 0x0 && _0x50103b[_0x50103b[_0x1a38('0x129')] - 0x1][_0x1a38('0x146')] !== undefined && _0x50103b[_0x50103b['length'] - 0x1]['checked'] === ![] && _0x25d55f(_0x1a38('0x109'))['checked'] && (_0x2dcee4 = !![], _0x50103b[_0x50103b[_0x1a38('0x129')] - 0x1]['click']());
            }
        }
        for (let _0x3da374 = 0x0; _0x3da374 < _0x3911e7[_0x1a38('0x129')]; _0x3da374++) {
            let _0x443436 = _0x3911e7[_0x3da374][_0x1a38('0x165')]('input');
            if (_0x3911e7[_0x3da374]['getElementsByClassName'](_0x1a38('0xc4'))[_0x1a38('0x129')] > 0x0)
                for (let _0x1e2e3c = 0x0; _0x1e2e3c < _0x443436[_0x1a38('0x129')]; _0x1e2e3c++) {
                    if (_0x443436[_0x1e2e3c][_0x1a38('0x146')] === ![]) {
                        if (_0x1e2e3c === 0x0 && (_0x25d55f(_0x1a38('0x15c'))[_0x1a38('0x146')] || _0x479c66 === ![]))
                            _0x443436[_0x1e2e3c][_0x1a38('0x11d')]();
                        else {
                            if (_0x1e2e3c === _0x443436[_0x1a38('0x129')] - 0x1 && (_0x25d55f(_0x1a38('0x15c'))['checked'] || _0x2dcee4 === ![]))
                                _0x443436[_0x1e2e3c][_0x1a38('0x11d')]();
                            else
                                _0x1e2e3c !== 0x0 && _0x1e2e3c !== _0x443436[_0x1a38('0x129')] - 0x1 && _0x443436[_0x1e2e3c][_0x1a38('0x11d')]();
                        }
                    }
                }
        }
    }
}
function _0x52b91f() {
    let _0x538a4e = new MutationObserver(function (_0x5b10ce) {
        if (W[_0x1a38('0x14a')][_0x1a38('0x8f')]()[0x0] && W[_0x1a38('0x14a')]['getSelectedFeatures']()[0x0][_0x1a38('0x8e')]['type'] === _0x1a38('0xd9') && _0x25d55f(_0x1a38('0x121'))[_0x1a38('0x146')]) {
            let _0xd3ad69 = document[_0x1a38('0xd6')](_0x1a38('0x172'));
            for (let _0x15aabf = 0x0; _0x15aabf < _0xd3ad69[_0x1a38('0x129')]; _0x15aabf++) {
                _0xd3ad69[_0x15aabf][_0x1a38('0x56')](_0x1a38('0x141'), function () {
                    let _0x32c93f = $(this)[_0x1a38('0xc9')]()['eq'](0x9), _0x489545 = _0x32c93f[0x0][_0x1a38('0xb3')];
                    setTimeout(_0x21a39d(_0x489545), 0x32);
                }, ![]);
            }
            let _0x3d569a = document[_0x1a38('0x8b')](_0x1a38('0x42'));
            for (let _0x355faf = 0x0; _0x355faf < _0x3d569a[_0x1a38('0x129')]; _0x355faf++) {
                _0x3d569a[_0x355faf][_0x1a38('0x56')](_0x1a38('0x11d'), function () {
                    let _0x293698 = $(this)[_0x1a38('0xc9')]()['eq'](0x9), _0xec9cd9 = _0x293698[0x0][_0x1a38('0xb3')];
                    setTimeout(_0x21a39d(_0xec9cd9), 0x32);
                }, ![]);
            }
        }
    });
    _0x538a4e[_0x1a38('0x116')](document[_0x1a38('0x49')](_0x1a38('0x16')), {
        'childList': !![],
        'subtree': !![]
    }), console[_0x1a38('0xef')](_0x1a38('0x178'));
}
function _0x24518b(_0x1f079b, _0x54a0e1, _0x4afe0b, _0x56e10f, _0x4a4cec, _0x361d67, _0x2458dd) {
    if (_0x1f079b == null || _0x54a0e1 == null || _0x4afe0b == null || _0x56e10f == null || _0x4a4cec == null || _0x361d67 == null || _0x2458dd == null)
        return _0x28451f(_0x1a38('0x57'), 0x1), 0x0;
    let _0x103b25 = null, _0x1d1a64 = null, _0x363d56 = 0x0, _0x255381 = null, _0x44a597 = null, _0x1afd55 = 0x0, _0x173d86 = null, _0x3eaf1e = null, _0x3df5ee = null, _0x45e351 = 0x0, _0x524363 = null, _0x11dd4f = 0x0;
    if (_0x3ff5e2(_0x1f079b) > _0x486a35)
        return 0x0;
    const _0x24e37f = _0x1f079b[_0x1a38('0x162')]['id'];
    let _0x5e5ed1 = _0x3f5b98(_0x54a0e1['attributes']['id'], _0x1f079b), _0x44b55f = _0x4b7058(_0x56e10f['attributes']['id'], _0x1f079b), _0x3504ec = -0x5a, _0x3d1ef9 = 0x5a;
    W[_0x1a38('0x8e')][_0x1a38('0xe3')] && (_0x3504ec = 0x5a, _0x3d1ef9 = -0x5a);
    _0x28451f(_0x1a38('0xac'), 0x2), _0x28451f(_0x1a38('0x10a') + _0x24e37f + _0x1a38('0x48') + _0x54a0e1[_0x1a38('0x162')]['id'] + '\x20azm\x20' + _0x5e5ed1 + _0x1a38('0xf') + _0x4afe0b[_0x1a38('0x129')], 0x2);
    let _0x3794d0 = _0x56e10f['getSegmentIds']();
    for (let _0xb885c0 = 0x0; _0xb885c0 < _0x3794d0[_0x1a38('0x129')]; _0xb885c0++) {
        let _0x2d8924 = 0x0;
        if (_0x3794d0[_0xb885c0] == _0x24e37f)
            continue;
        const _0xf3ac5e = W[_0x1a38('0x8e')][_0x1a38('0x1e')][_0x1a38('0x174')](_0x3794d0[_0xb885c0]);
        if (!_0x5c8fcf(_0xf3ac5e, _0x56e10f, _0x1f079b))
            continue;
        let _0x3d1eee = _0x3f5b98(_0x56e10f[_0x1a38('0x162')]['id'], _0xf3ac5e), _0x531412 = _0x47e0de(_0x3d1eee, _0x44b55f);
        _0x28451f('Turn\x20angle\x20from\x20inseg\x20' + _0x3794d0[_0xb885c0] + ':\x20' + _0x531412 + '(' + _0x3d1eee + ',' + _0x44b55f + ')', 0x3);
        if (Math[_0x1a38('0x28')](_0x531412) > _0x50141c) {
            if (Math[_0x1a38('0x28')](_0x531412) > _0x46c2ea)
                continue;
            _0x28451f('\x20\x20\x20Not\x20eligible\x20as\x20inseg:\x20' + _0x531412, 0x2), _0x2d8924 = _0x5ceb4b[_0x1a38('0x9d')];
        }
        const _0x27964a = _0x361d67[_0x1a38('0xf1')](_0x56e10f, _0xf3ac5e, _0x1f079b), _0x3d1dca = _0x27964a[_0x1a38('0x46')]();
        if (_0x3d1dca[_0x1a38('0x73')] != 0x1 || !_0x3d1dca[_0x1a38('0x67')]()) {
            _0x28451f('Straight\x20turn\x20has\x20no\x20lanes:' + _0x3794d0[_0xb885c0] + '\x20to\x20' + _0x24e37f, 0x3);
            continue;
        }
        let _0x2ca60b = _0x3d1dca[_0x1a38('0xb7')][_0x1a38('0x99')] - _0x3d1dca[_0x1a38('0xb7')][_0x1a38('0xe0')] + 0x1;
        _0x2ca60b != _0x4a4cec && (_0x28451f(_0x1a38('0x53'), 0x2), _0x2d8924 = _0x5ceb4b[_0x1a38('0x2c')]);
        if (_0x173d86 !== null && _0x2d8924 >= _0x45e351) {
            if (_0x45e351 == 0x0 && _0x2d8924 == 0x0)
                return _0x28451f(_0x1a38('0x25') + _0x1f079b[_0x1a38('0x162')]['id'] + ':\x20' + _0x173d86[_0x1a38('0x162')]['id'] + ',' + _0xf3ac5e[_0x1a38('0x162')]['id'], 0x2), _0x28451f(_0x1a38('0xac'), 0x2), 0x0;
        }
        _0x173d86 = _0xf3ac5e, _0x3eaf1e = _0x3d1eee, _0x3df5ee = _0x531412, _0x11dd4f = _0x2ca60b, _0x45e351 = _0x2d8924, _0x2458dd[_0x1a38('0xd5')] = _0x173d86, _0x2458dd[_0x1a38('0x30')] = _0x27964a[_0x1a38('0x155')]['direction'] == _0x1a38('0x86') ? _0x9fe1bd[_0x1a38('0x104')] : _0x9fe1bd[_0x1a38('0x12e')];
    }
    if (_0x173d86 == null)
        return _0x28451f(_0x1a38('0x6d'), 0x2), 0x0;
    else
        _0x28451f('Found\x20inseg\x20candidate:\x20' + _0x173d86['attributes']['id'] + '\x20' + (_0x45e351 == 0x0 ? '' : _0x1a38('0x6a')), 0x2);
    for (let _0x2734cc = 0x0; _0x2734cc < _0x4afe0b[_0x1a38('0x129')]; _0x2734cc++) {
        let _0x40a6b5 = 0x0;
        if (_0x4afe0b[_0x2734cc] == _0x24e37f)
            continue;
        const _0xbef7e0 = W[_0x1a38('0x8e')][_0x1a38('0x1e')]['getObjectById'](_0x4afe0b[_0x2734cc]);
        if (!_0x5c8fcf(_0x1f079b, _0x54a0e1, _0xbef7e0))
            continue;
        let _0x4a8b1c = _0x4b7058(_0x54a0e1['attributes']['id'], _0xbef7e0), _0x3311b2 = _0x47e0de(_0x5e5ed1, _0x4a8b1c);
        _0x28451f(_0x1a38('0xd1') + _0x4afe0b[_0x2734cc] + ':\x20' + _0x3311b2 + '(' + _0x5e5ed1 + ',' + _0x4a8b1c + ')', 0x2);
        if (Math[_0x1a38('0x28')](_0x3d1ef9 - _0x3311b2) > _0x586456) {
            if (Math['abs'](_0x3d1ef9 - _0x3311b2) > _0x639876)
                continue;
            _0x28451f(_0x1a38('0x35') + _0x3311b2, 0x2), _0x40a6b5 = _0x5ceb4b['FAIL'];
        }
        if (_0x103b25 !== null && _0x40a6b5 >= _0x363d56) {
            if (_0x363d56 == 0x0 && _0x40a6b5 == 0x0)
                return _0x28451f(_0x1a38('0x40') + _0x1f079b[_0x1a38('0x162')]['id'] + ':\x20' + _0x103b25['attributes']['id'] + ',' + _0xbef7e0[_0x1a38('0x162')]['id'], 0x2), _0x28451f(_0x1a38('0xac'), 0x2), 0x0;
        }
        _0x103b25 = _0xbef7e0, _0x1d1a64 = _0x3311b2, _0x363d56 = _0x40a6b5;
    }
    if (_0x103b25 == null)
        return _0x28451f(_0x1a38('0x10d'), 0x2), 0x0;
    else
        _0x28451f(_0x1a38('0x192') + _0x103b25[_0x1a38('0x162')]['id'] + '\x20' + (_0x363d56 == 0x0 ? '' : '(failed)'), 0x2);
    for (let _0x3dac9f = 0x0; _0x3dac9f < _0x3794d0[_0x1a38('0x129')]; _0x3dac9f++) {
        let _0x5b52cc = 0x0;
        if (_0x3794d0[_0x3dac9f] == _0x24e37f)
            continue;
        if (_0x3794d0[_0x3dac9f] == _0x173d86[_0x1a38('0x162')]['id'])
            continue;
        const _0x28cc1e = W[_0x1a38('0x8e')][_0x1a38('0x1e')][_0x1a38('0x174')](_0x3794d0[_0x3dac9f]);
        if (!_0x5c8fcf(_0x173d86, _0x56e10f, _0x28cc1e))
            continue;
        let _0x57a755 = _0x4b7058(_0x56e10f[_0x1a38('0x162')]['id'], _0x28cc1e), _0x2ee6e2 = _0x47e0de(_0x3eaf1e, _0x57a755);
        _0x28451f(_0x1a38('0x12') + _0x3794d0[_0x3dac9f] + ':\x20' + _0x2ee6e2 + '(' + _0x3eaf1e + ',' + _0x57a755 + ')', 0x2);
        if (Math[_0x1a38('0x28')](_0x3504ec - _0x2ee6e2) > _0x586456) {
            if (Math[_0x1a38('0x28')](_0x3504ec - _0x2ee6e2) > _0x639876)
                continue;
            _0x28451f(_0x1a38('0x15b') + _0x2ee6e2, 0x3), _0x5b52cc = _0x5ceb4b[_0x1a38('0x9d')];
        }
        if (_0x255381 != null && _0x5b52cc !== 0x0) {
            if (_0x1afd55 == 0x0 && _0x5b52cc == 0x0)
                return _0x28451f(_0x1a38('0x158') + _0x1f079b[_0x1a38('0x162')]['id'] + ':\x20' + _0x255381[_0x1a38('0x162')]['id'] + ',' + _0x28cc1e[_0x1a38('0x162')]['id'], 0x2), _0x28451f(_0x1a38('0xac'), 0x2), _0x5ceb4b['FAIL'];
        }
        _0x255381 = _0x28cc1e, _0x44a597 = _0x57a755, _0x1afd55 = _0x5b52cc;
    }
    if (_0x255381 == null)
        return _0x28451f('==\x20No\x20Outseg1\x20found\x20==================================================================', 0x2), 0x0;
    else
        _0x28451f(_0x1a38('0x27') + _0x255381['attributes']['id'] + '\x20' + (_0x1afd55 == 0x0 ? '' : _0x1a38('0x6a')), 0x2);
    for (let _0x423c8e = 0x0; _0x423c8e < _0x3794d0[_0x1a38('0x129')]; _0x423c8e++) {
        if (_0x3794d0[_0x423c8e] == _0x24e37f)
            continue;
        if (_0x3794d0[_0x423c8e] == _0x255381[_0x1a38('0x162')]['id'])
            continue;
        if (_0x3794d0[_0x423c8e] == _0x173d86[_0x1a38('0x162')]['id'])
            continue;
        const _0x2ded93 = W[_0x1a38('0x8e')][_0x1a38('0x1e')][_0x1a38('0x174')](_0x3794d0[_0x423c8e]);
        if (_0x2ded93[_0x1a38('0x162')][_0x1a38('0x180')] && _0x2ded93[_0x1a38('0x162')][_0x1a38('0xf9')])
            continue;
        if (!_0x5c8fcf(_0x2ded93, _0x56e10f, _0x255381))
            continue;
        let _0x1d6fb7 = _0x3f5b98(_0x56e10f[_0x1a38('0x162')]['id'], _0x2ded93), _0x223f6e = _0x47e0de(_0x1d6fb7, _0x44a597);
        _0x28451f(_0x1a38('0x5e') + _0x223f6e + _0x1a38('0xed') + _0x1d6fb7 + ',' + _0x44a597 + ')', 0x3);
        if (Math[_0x1a38('0x28')](_0x223f6e) > _0x50141c)
            continue;
        _0x524363 = _0x2ded93, _0x28451f(_0x1a38('0x171') + _0x3794d0[_0x423c8e], 0x2);
    }
    if (_0x524363 == null)
        return _0x28451f(_0x1a38('0x147'), 0x2), 0x0;
    if (_0x45e351 < 0x0 || _0x1afd55 < 0x0 || _0x363d56 < 0x0)
        return _0x28451f(_0x1a38('0x1a3') + _0x24e37f + _0x1a38('0xed') + Math['min'](_0x45e351, _0x1afd55, _0x363d56) + ')', 0x2), _0x45e351 === _0x5ceb4b['FAIL'] || _0x1afd55 === _0x5ceb4b[_0x1a38('0x9d')] || _0x363d56 === _0x5ceb4b[_0x1a38('0x9d')] ? _0x5ceb4b[_0x1a38('0x9d')] : _0x5ceb4b[_0x1a38('0x2c')];
    _0x28451f('Found\x20a\x20heuristics\x20candidate!\x20' + _0x24e37f + _0x1a38('0xfe') + _0x103b25[_0x1a38('0x162')]['id'] + _0x1a38('0x16a') + _0x1d1a64, 0x2);
    return 0x1;
    function _0x355ebb(_0x35fee5) {
        return _0x35fee5[_0x1a38('0xe2')][_0x1a38('0xfa')][0x0];
    }
    function _0x527c4f(_0x2dade0) {
        return _0x2dade0[_0x1a38('0xe2')][_0x1a38('0xfa')][_0x2dade0[_0x1a38('0xe2')][_0x1a38('0xfa')][_0x1a38('0x129')] - 0x1];
    }
    function _0x360f58(_0x55d008) {
        return _0x55d008[_0x1a38('0xe2')][_0x1a38('0xfa')][0x1];
    }
    function _0x4f4f25(_0x1553be) {
        return _0x1553be[_0x1a38('0xe2')][_0x1a38('0xfa')][_0x1553be[_0x1a38('0xe2')]['components'][_0x1a38('0x129')] - 0x2];
    }
    function _0x3ff5e2(_0x2632f3) {
        let _0x2be124 = _0x2632f3[_0x1a38('0xe2')]['getGeodesicLength'](window['W'][_0x1a38('0x2')]['olMap'][_0x1a38('0x32')]);
        return _0x28451f(_0x1a38('0x112') + _0x2632f3[_0x1a38('0x162')]['id'] + _0x1a38('0xfb') + _0x2be124 + _0x1a38('0x68') + _0x2632f3[_0x1a38('0x162')][_0x1a38('0x129')], 0x3), _0x2be124;
    }
    function _0x4b7058(_0x1f307f, _0x42e9e4) {
        if (_0x1f307f == null || _0x42e9e4 == null)
            return null;
        let _0x156ff6, _0x2228d1;
        _0x42e9e4[_0x1a38('0x162')][_0x1a38('0x1b')] === _0x1f307f ? (_0x156ff6 = _0x360f58(_0x42e9e4)['x'] - _0x355ebb(_0x42e9e4)['x'], _0x2228d1 = _0x360f58(_0x42e9e4)['y'] - _0x355ebb(_0x42e9e4)['y']) : (_0x156ff6 = _0x4f4f25(_0x42e9e4)['x'] - _0x527c4f(_0x42e9e4)['x'], _0x2228d1 = _0x4f4f25(_0x42e9e4)['y'] - _0x527c4f(_0x42e9e4)['y']);
        let _0x3ee02a = Math[_0x1a38('0xcc')](_0x2228d1, _0x156ff6), _0x270f82 = _0x3ee02a * 0xb4 / Math['PI'] % 0x168;
        return _0x28451f('Azm\x20from\x20node\x20' + _0x1f307f + _0x1a38('0xf6') + _0x42e9e4['attributes']['id'] + ':\x20' + _0x270f82, 0x3), _0x270f82;
    }
    function _0x3f5b98(_0x1efaab, _0x5e2cd2) {
        let _0x3f7e44 = _0x4b7058(_0x1efaab, _0x5e2cd2), _0xecbaf = _0x3f7e44 + 0xb4;
        if (_0xecbaf >= 0xb4)
            _0xecbaf -= 0x168;
        return _0x28451f(_0x1a38('0x90') + _0x1efaab + _0x1a38('0xf6') + _0x5e2cd2['attributes']['id'] + ':\x20' + _0xecbaf, 0x3), _0xecbaf;
    }
    function _0x47e0de(_0x5156dc, _0x3fb2ad) {
        while (_0x3fb2ad > 0xb4) {
            _0x3fb2ad -= 0x168;
        }
        while (_0x3fb2ad < -0xb4) {
            _0x3fb2ad += 0x168;
        }
        while (_0x5156dc > 0xb4) {
            _0x5156dc -= 0x168;
        }
        while (_0x5156dc < -0xb4) {
            _0x5156dc += 0x168;
        }
        return a = _0x3fb2ad - _0x5156dc, a += a > 0xb4 ? -0x168 : a < -0xb4 ? 0x168 : 0x0, _0x28451f(_0x1a38('0x142') + _0x5156dc + ',' + _0x3fb2ad + ':\x20' + a, 0x3), a;
    }
    function _0x5c8fcf(_0x598b39, _0x3bb072, _0x4e884f) {
        _0x28451f('Allow\x20from\x20' + _0x598b39[_0x1a38('0x162')]['id'] + _0x1a38('0xfe') + _0x4e884f[_0x1a38('0x162')]['id'] + _0x1a38('0x1b0') + _0x3bb072['attributes']['id'] + _0x1a38('0x7b') + _0x3bb072[_0x1a38('0xe4')](_0x598b39, _0x4e884f) + _0x1a38('0x182') + _0x598b39[_0x1a38('0xc1')](_0x4e884f, _0x3bb072), 0x3);
        if (!_0x3bb072[_0x1a38('0xe4')](_0x598b39, _0x4e884f))
            return _0x28451f(_0x1a38('0x16e'), 0x3), ![];
        if (!_0x598b39[_0x1a38('0xc1')](_0x4e884f, _0x3bb072))
            return _0x28451f(_0x1a38('0x183'), 0x3), ![];
        return !![];
    }
}
function _0x28451f(_0x4667df, _0x3d689a) {
    typeof _0x3d689a === 'undefined' && (_0x3d689a = 0x1), _0x3d689a <= _0x1393b0 && (typeof _0x4667df === _0x1a38('0x11a') ? console['log'](_0x4667df) : console[_0x1a38('0xef')](_0x1a38('0xb1') + _0x4667df));
}
_0x1c0e98();
