var NodeConfigA = {
    "name": "A",
    "healthy": false,
    "interfaces": [],
    "prefix": "10.11.0.0\/16",
    "pos": {
        "x": 0.2,
        "y": 0.5
    }
}
var NodeConfigB = {
    "name": "B",
    "healthy": true,
    "interfaces": [{
        "intf_name": "4",
        "neighbour": 0,
        "neighbour_name": "A",
        "dst": ["RA"]
    }],
    "prefix": "10.12.0.0\/16",
    "pos": {
        "x": 0.8,
        "y": 0.5
    }
};

var Links = {
    "expected": [
        [0, 1]
    ],
    "normal": [],
    "abnormal": []
}

var current_step = -1;

/*
NODE
*/
function createNode(name) {
    var node = new Path.Rectangle(
        new Point(40,40), new Point(80, 80), new Size(10, 10));
    node.fillColor = 'white';

    var nodeText = new PointText(new Point(60, 67));
    nodeText.justification = 'center';
    nodeText.fillColor = 'white';
    nodeText.content = name;
    nodeText.fontSize = 20;
    nodeText.fontWeight = "bold";

    var nodeGroup = new Group([node, nodeText]);
    nodeGroup.scale(2);
    nodeGroup.translate({x: 50, y: 100});
    nodeGroup.visible = false;
    return nodeGroup
}

/*
MENU
*/
function createMenu() {
    var x = 80;
    var y = 198;
    var l = 200;
    var h = 40;

    var menuBar = new Path.Rectangle(new Point(x, y), new Point(x+l, y+h));
    menuBar.strokeColor = 'white';
    menuBar.fillColor = 'black';
    var menuText = new PointText(new Point(x+l/2, y+h/2+4));
    menuText.justification = 'center';
    menuText.fillColor = 'white';
    menuText.content = 'Reachability';
    menuText.fontSize = 16
    var menuItem = new Group([menuBar, menuText]);

    var menuGroup = new Group([menuItem]);
    var menuItemNum = 4
    var menuTextList = ["Isolation", "Waypoint", "Load Balancing"]
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

function textWithBox(content, instr) {
    var annoText = new PointText(100, 100)
    annoText.justification = 'center';
    annoText.fillColor = 'black';
    annoText.content = content;
    annoText.fontSize = 16
    if (instr) {
        annoText.position = new Point(600, 100)
        annoText.fontSize = 24;
    }
    var annoBar = new Path.Rectangle(annoText.strokeBounds.scale(1.1, 1.3));
    annoBar.fillColor = 'white';
    annoBar.opacity = 0.7
    if (instr) {
        annoBar.opacity = 1;
    }
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
    this.children[1].visible = true;
    this.children[2].visible = true;
    Instruct(1);
}
function onFullNodeLeave(event) {
    this.children[1].visible = false;
    this.children[2].visible = false;
}

var click_times = 0;
function onFullNodeMenuClick(event) {
    this.parent.parent.parent.firstChild.visible = 
        !this.parent.parent.parent.firstChild.visible;
    if (click_times == 0) {
        click_times += 1;
        Instruct(2);
    } else {
        Instruct(3);
    }
}

/*
GUI Graph
*/

name = NodeConfigA["name"];
isHealthy = NodeConfigA["healthy"];
prefixString = "Prefix: " + NodeConfigA["prefix"];
x = NodeConfigA["pos"]['x']
y = NodeConfigA["pos"]['y']
var n = createFullNode(name, prefixString)
n.children[0].visible = true;
n.position = new Point(x*view.viewSize._width, y*view.viewSize._height);

n.onMouseEnter = onFullNodeEnter;
n.onMouseLeave = onFullNodeLeave; 
if (isHealthy) {
    n.children[0].children[0].fillColor = "green";
} else {
    n.children[0].children[0].fillColor = "red";
}
for (var j = 0; j < n.children[1].children.length; j++) {
    if (j == 0) {
        n.children[1].children[j].onMouseEnter = onMenuItemEnter;
    } else {
        n.children[1].children[j].onMouseEnter = onMenuItemEnter2;
    }
    n.children[1].children[j].onMouseLeave = onMenuItemLeave;
}

NodeA = new Group([n]);


name = NodeConfigB["name"];
isHealthy = NodeConfigB["healthy"];
prefixString = "Prefix: " + NodeConfigB["prefix"];
x = NodeConfigB["pos"]['x']
y = NodeConfigB["pos"]['y']
var n = createFullNode(name, prefixString)
n.children[0].visible = true;
n.position = new Point(x*view.viewSize._width, y*view.viewSize._height);

n.onMouseEnter = onFullNodeEnter;
n.onMouseLeave = onFullNodeLeave; 
if (isHealthy) {
    n.children[0].children[0].fillColor = "green";
} else {
    n.children[0].children[0].fillColor = "red";
}
for (var j = 0; j < n.children[1].children.length; j++) {
    if (j == 0) {
        n.children[1].children[j].onMouseEnter = onMenuItemEnter;
    } else {
        n.children[1].children[j].onMouseEnter = onMenuItemEnter2;
    }
    n.children[1].children[j].onMouseLeave = onMenuItemLeave;
}

NodeB = new Group([n]);

/*
Interfaces
*/

function interfaceTo(from, to) {
    return from + (to - from)/3;
}

var lstInterface = new Group([])
    src = NodeB.position
    dst = NodeA.position
    lstInterface.addChild(new Path.Line({
        from: src,
        to: interfaceTo(src, dst),
        strokeColor: 'yellow',
        strokeWidth: 10,
    }))
    intf = 4;
    dst_routers = ["RA"];
    content = "Interface: eth" + intf + "\n" 
            + "Destination(s): " + dst_routers.join();
    anno = textWithBox(content, false);
    // anno.position = interfaceAnnotationPos(src, dst);
    anno.position = interfaceTo(src, dst);
    // anno.visible = true
lstInterface.addChild(anno);
lstInterface.visible = false;


NodeB.addChild(lstInterface);
NodeB.lastChild.sendToBack();
//  interface+node node+menu menu     first item
NodeB.lastChild.children[1].firstChild.onMouseDown = onFullNodeMenuClick;

/*
LINKS
*/

var l1 = new Group([])
for (var i = 0; i < Links["expected"].length; i++) {
    l1.addChild(new Path.Line({
        from: NodeA.position,
        to: NodeB.position,
        strokeColor: 'blue',
        strokeWidth: 5,
    }))
    l1.lastChild.dashArray= [13, 10]
}
l1.sendToBack();

var lstInstr = []
// 0
lstInstr.push(textWithBox(
    "Please hover mouse over node B.",
    true
));
// 1
lstInstr.push(textWithBox(
    "Great! Now you can see the routing prefix on top, \n" + 
    "and the options menu. Try hover over the menu items.\n\n" + 
    "The items with yellow background are clickable.\n" + 
    "And the others are not, because they are irrelevant in our study.\n\n" +
    "Click where possible when you're comfortable.",
    true
));
// 2
lstInstr.push(textWithBox(
    "Now, let's explain the viewport.\n"+
    "The blue dotted lines are the expected node connections.\n"+
    "The yellow short line shows the interface along with name and its destinations.\n\n"+
    "Please click the menu item again to toggle the interface info.",
    true
));
// 3
lstInstr.push(textWithBox(
    "Congrats! You have completed this tutorial.\n\n" +
    "For an explanation, node A is in red because something is wrong.\n" +
    "Node B has an interface to A, while A does not.\n" + 
    "You can find out this information by hovering A and toggle its reachability.",
    true
));

function Instruct(step) {
    if (step <= current_step) return;
    else current_step = step;
    for (var i = 0; i < lstInstr.length; i++) {
        lstInstr[i].visible =  false;
    }

    if (step < 0) return;
    lstInstr[step].visible = true;
}

Instruct(0);

function onResize(event) {
}