var file = $("#config").attr("config_file");

// For final proto
var ABBR = {
	"HMB": "Hamburg",
	"BER": "Berlin",
	"LON": "London",
	"PRS": "Paris",
	"ZRH": "Zurich",
	"MDR": "Madrid",
	"CAT": "Catalonio",
	"MIL": "Milan",
	"VNA": "Vienna",
	"PRG": "Prague",
};

// node Size
var NODE_SIDE = 40;
// textSize
var MAX_TEXT_HEIGHT = 40;
// colors
var EXPECTED_LINK_COLOR = "white";
var INTERFACE_LINK_COLOR = "yellow";
// var WAYPOINT_LINKS_COLOR = '#99ff66';
var WAYPOINT_LINKS_COLOR = '#00ff00';

$.getJSON(file, function(conf) {

var NodeConfig = conf["nodes"];
var Links = conf["links"];
var manualMode = true;

/*
NODE
*/
function createNode(name) {
    var _size = new Size(2 * NODE_SIDE, NODE_SIDE);
    var round_corner = new Size(NODE_SIDE, NODE_SIDE)/4;
    var node = new Path.Rectangle(new Point(0, 0), _size, round_corner);
    node.fillColor = 'white';

    var nodeText = new PointText(new Point(NODE_SIDE, NODE_SIDE/1.3));
    nodeText.justification = 'center';
    nodeText.fillColor = 'white';
    nodeText.content = name;
    nodeText.fontSize = NODE_SIDE/1.3;
    nodeText.fontWeight = "bold";

    var nodeGroup = new Group([node, nodeText]);
    // nodeGroup.scale(2);
    // nodeGroup.translate({x: 50, y: 100});
    nodeGroup.visible = false;
    return nodeGroup
}

/*
MENU
*/
function createMenu() {
    var x = 0;
    var y = NODE_SIDE-(0.1*NODE_SIDE);
    var menu_unit = Math.min(NODE_SIDE, MAX_TEXT_HEIGHT);
    var l = menu_unit * 5;
    var h = menu_unit;

    var menuBar = new Path.Rectangle(new Point(x, y), new Point(x+l, y+h));
    menuBar.strokeColor = 'white';
    menuBar.fillColor = 'black';
    var menuText = new PointText(new Point(x+l/2, y+0.6*h));
    menuText.justification = 'center';
    menuText.fillColor = 'white';
    menuText.content = 'Reachability';
    menuText.fontSize = menu_unit*0.4;
    var menuItem = new Group([menuBar, menuText]);

    var menuGroup = new Group([menuItem]);
    var menuItemNum = 4
    var menuTextList = ["Waypoint", "Load Balancing", "Isolation"]
    for (var i = 1; i < menuItemNum; i++) {
        var menu = menuItem.clone().translate({x: 0, y: h*i});
        menu.children[1].content = menuTextList[i-1]
        menuGroup.addChild(menu);
    }
    menuGroup.visible = false;
    return menuGroup
}

function onMenuItemEnter(event) {
    this.children[0].fillColor = 'yellow';
    this.children[1].fillColor = 'black';
    document.body.style.cursor = 'pointer';
}
function onMenuItemEnter2(event) {
    this.children[0].fillColor = 'grey';
    this.children[1].fillColor = 'black';
    document.body.style.cursor = 'not-allowed';
}
function onMenuItemLeave(event) {
    this.children[0].fillColor = 'black';
    this.children[1].fillColor = 'white';
    document.body.style.cursor = 'default';
}

/*
Text box
*/

function textWithBox(content) {
    var box_unit = Math.min(NODE_SIDE, MAX_TEXT_HEIGHT)
    var annoText = new PointText(NODE_SIDE, -NODE_SIDE/3);
    annoText.justification = 'center';
    annoText.fillColor = 'black';
    annoText.content = content;
    annoText.fontSize = 0.4*box_unit;
    var annoBar = new Path.Rectangle(annoText.strokeBounds.scale(1.1, 1.3));
    annoBar.fillColor = 'white';
    annoBar.opacity = 0.7
    var annoAddress = new Group([annoBar, annoText]);
    // annoAddress.visible = false;
    return annoAddress;
}

/*
FULL NODE: Node, Menu, Prefix address
*/

function createFullNode(name, address) {
    nodeGroup = createNode(name);
    menuGroup = createMenu();
    annoAddress = textWithBox(address);
    annoAddress.visible = false;

    return new Group([nodeGroup, menuGroup, annoAddress]);
}


function onFullNodeEnter(event) {
    name = this.firstChild.lastChild.content;
    if (manualMode) {
        this.children[1].visible = true;
    }
    this.children[2].visible = true;
}
function onFullNodeLeave(event) {
    if (manualMode) {
        this.children[1].visible = false;
    }
    this.children[2].visible = false;
}
function onFullNodeEnterFinal(event) {
    document.body.style.cursor = 'pointer';
}
function onFullNodeLeaveFinal(event) {
    document.body.style.cursor = 'default';
}

function onFullNodeMenuClick(event) {
    this.parent.parent.parent.firstChild.visible = 
        !this.parent.parent.parent.firstChild.visible;
}

function onFullNodeMenuClick2(event) {
    event_key = "R"+this.parent.parent.firstChild.lastChild.content;

    for (var k in intfDict) {
        if (k != event_key) intfDict[k].visible = false;
        else intfDict[k].visible = ! intfDict[k].visible;
    }
}

/*
GUI Graph
*/
var cp = view.center
var name2ID = {};

var intfDict = {};

var NodeList = new Group([]);
for (var i = 0; i < NodeConfig.length; i++) {
    name = NodeConfig[i]["name"];
    name2ID[name] = i;
    intfDict["R"+name] = new Group([]);
    intfDict["R"+name].sendToBack();
    intfDict["R"+name].visible = false;

    isHealthy = NodeConfig[i]["healthy"];
    // prefixString = "Prefix: " + NodeConfig[i]["prefix"];
    prefixString = ABBR[name]
    x = NodeConfig[i]["pos"]['x'] * 0.8 
    y = NodeConfig[i]["pos"]['y'] * 0.8
    var n = createFullNode(name, prefixString)
    n.children[0].visible = true;
    // pos = (cp + {x:0, y:-320}).rotate(360/NodeConfig.length * i, cp);
    n.position = new Point(x*view.viewSize._width + 50, y*view.viewSize._height + 100);

    // n.onMouseEnter = onFullNodeEnter;
    // n.onMouseLeave = onFullNodeLeave; 
    n.onMouseEnter = onFullNodeEnterFinal;
    n.onMouseLeave = onFullNodeLeaveFinal; 
    // redefine healthy
    n.children[0].children[0].fillColor = "green";
    if (isHealthy) {
        n.children[0].children[0].fillColor = "green";
    } else {
        n.children[0].children[0].fillColor = "red";
    }
    for (var j = 0; j < n.children[1].children.length; j++) {
        if (j == 0 || j == 1) {
            n.children[1].children[j].onMouseEnter = onMenuItemEnter;
        } else {
            n.children[1].children[j].onMouseEnter = onMenuItemEnter2;
        }
        n.children[1].children[j].onMouseLeave = onMenuItemLeave;
    }

    NodeList.addChild(new Group([n]));
}

/*
Interfaces
*/

function interfaceTo(from, to) {
    return from + (to - from)/3;
}

for (var i = 0; i < NodeConfig.length; i++) {
    var nodeWithInterface = NodeList.children[i]
    var lstInterface = new Group([])
    interfaces = NodeConfig[i]["interfaces"]
    for (var j = 0; j < interfaces.length; j++) {
        src = NodeList.children[i].position
        dst = NodeList.children[interfaces[j]["neighbour"]].position
        lstInterface.addChild(new Path.Line({
            from: src,
            to: interfaceTo(src, dst),
            strokeColor: INTERFACE_LINK_COLOR,
            strokeWidth: NODE_SIDE/6,
        }))
        intf = interfaces[j]["intf_name"];
        dst_routers = interfaces[j]["dst"];
        for (var k = 0; k < dst_routers.length; k++) {
            intfDict[dst_routers[k]].addChild(
                new Path.Line({
                    from: src,
                    to: interfaceTo(src, dst),
                    strokeColor: WAYPOINT_LINKS_COLOR,
                    strokeWidth: NODE_SIDE/6,
                    // visible: false,
                })
            );
        }
        content = "Interface: eth" + intf + "\n" 
                + "Destination(s): " + dst_routers.join();
        anno = textWithBox(content);
        // anno.position = interfaceAnnotationPos(src, dst);
        anno.position = interfaceTo(src, dst);
        // anno.visible = true
        lstInterface.addChild(anno);
    }
    lstInterface.visible = false;


    nodeWithInterface.addChild(lstInterface);
    nodeWithInterface.lastChild.sendToBack();
    //  interface+node node+menu menu     first item
    nodeWithInterface.lastChild.children[1].firstChild.onMouseDown = onFullNodeMenuClick;
    nodeWithInterface.lastChild.children[1].children[1].onMouseDown = onFullNodeMenuClick2;
}

// for (var i = 0; i < NodeList.children.length; i++) {
//     n = NodeList.children[i];
//     for (var j = 0; j < n.firstChild.children.length)
// }

/*
LINKS
*/

var l1 = new Group([])
for (var i = 0; i < Links["expected"].length; i++) {
    l1.addChild(new Path.Line({
        from: NodeList.children[Links["expected"][i][0]].position,
        to: NodeList.children[Links["expected"][i][1]].position,
        strokeColor: EXPECTED_LINK_COLOR,
        strokeWidth: NODE_SIDE/16,
    }))
    l1.lastChild.dashArray= [13, 10]
}
l1.sendToBack();

window.enterNode = function(node) {
    manualMode = false;
    NodeList.children[name2ID[node]].children[1].emit("mouseenter");
    manualMode = true;
}

window.leaveNode = function(node) {
    manualMode = false;
    NodeList.children[name2ID[node]].children[1].emit("mouseleave");
    manualMode = true;
}

window.interfaceToggle = function(node) {
    manualMode = false;
    NodeList.children[name2ID[node]]
            .lastChild.children[1].firstChild.emit("mousedown");
    manualMode = true;
}

window.waypointToggle = function(node) {
    manualMode = false;
    NodeList.children[name2ID[node]]
            .lastChild.children[1].children[1].emit("mousedown");
    manualMode = true;
}

function onResize(event) {
    NodeList.position = view.center + {x:0, y:-50}
    l1.position = view.center + {x:0, y:-50}
}
});