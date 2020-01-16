var file = $("#config").attr("config_file");
var log_name = $("#config").attr("log_name");
var _url = new URL(window.location.href);
var uid = _url.searchParams.get("uid");
if (!uid) uid = "bopo" + Date.now();

$.getJSON(file, function(conf) {

var NodeConfig = conf["nodes"];
var Links = conf["links"];

/*
Logging
*/

function log(msg) {
    var url = "https://lanwg.mikrounix.com/testlogger/";
    var params = "name=" + encodeURI(uid+"@"+log_name+"_gui")
               + "&msg=" + encodeURI(msg);
    var xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    // xhr.withCredentials = true
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
}

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

function textWithBox(content) {
    var annoText = new PointText(100, 100);
    annoText.justification = 'center';
    annoText.fillColor = 'black';
    annoText.content = content;
    annoText.fontSize = 16
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


var current_node = "Z";
function logNode(node, msg) {
    log("[Node " + node + "] " + msg);
}

function onFullNodeEnter(event) {
    name = this.firstChild.lastChild.content;
    if (current_node != name) {
        current_node = name;
        logNode(name, "Show node info and menu");
    }
    this.children[1].visible = true;
    this.children[2].visible = true;
}
function onFullNodeLeave(event) {
    this.children[1].visible = false;
    this.children[2].visible = false;
}

function onFullNodeMenuClick(event) {
    logNode(
        this.parent.parent.parent.lastChild.firstChild.lastChild.content,
        "Toggle interface visibility"
    );
    this.parent.parent.parent.firstChild.visible = 
        !this.parent.parent.parent.firstChild.visible;
}

/*
GUI Graph
*/
var cp = view.center

var NodeList = new Group([]);
for (var i = 0; i < NodeConfig.length; i++) {
    name = NodeConfig[i]["name"];
    isHealthy = NodeConfig[i]["healthy"];
    prefixString = "Prefix: " + NodeConfig[i]["prefix"];
    x = NodeConfig[i]["pos"]['x']
    y = NodeConfig[i]["pos"]['y']
    var n = createFullNode(name, prefixString)
    n.children[0].visible = true;
    // pos = (cp + {x:0, y:-320}).rotate(360/NodeConfig.length * i, cp);
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
            strokeColor: 'yellow',
            strokeWidth: 10,
        }))
        intf = interfaces[j]["intf_name"];
        dst_routers = interfaces[j]["dst"];
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
}

/*
LINKS
*/

var l1 = new Group([])
for (var i = 0; i < Links["expected"].length; i++) {
    l1.addChild(new Path.Line({
        from: NodeList.children[Links["expected"][i][0]].position,
        to: NodeList.children[Links["expected"][i][1]].position,
        strokeColor: 'blue',
        strokeWidth: 5,
    }))
    l1.lastChild.dashArray= [13, 10]
}
l1.sendToBack();

function onResize(event) {
    NodeList.position = view.center + {x:0, y:-50}
    l1.position = view.center + {x:0, y:-50}
}
});