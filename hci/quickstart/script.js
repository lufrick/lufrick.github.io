window.onload = function() {
	console.info("loaded");
}

function load(url, callback, err=null) {
	console.info("loading "+url);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url+"?nocache="+Date.now(), true);
	xhr.onload = function() {
		var status = xhr.status;
		if (this.readyState == 4) {
			if (status === 200) {
				callback(xhr.responseText);
			} else {
				if (err!=null) err();
			}
		}
	};
	xhr.send();
}

var opentabs = [];
var currentTabs = [];
function openFile(a) {
	if (!opentabs[a]) {
		opentabs[a] = true;
		currentTabs.push(a);
		toptab = a;
	}
	
	switchTab(a);
}

function closeTab(a,t) {
	opentabs[a] = false;
	var closeIndex = -1;
	for (var tabidx in currentTabs) {
		var tab = currentTabs[tabidx];
		if (tab==a) closeIndex = tabidx;
	}
	if (closeIndex >= 0) {
		currentTabs.splice(closeIndex,1);
		if (currentTabs.length == 0) {
			switchTab(null);
		}
		else {
			if (currentRouter == a) currentRouter = currentTabs[Math.min(currentTabs.length-1, closeIndex)];
			switchTab(currentRouter);
		}
	}
}

var currentRouter = null;

function switchTab(a) {
	currentRouter = a;
	
	var tabshtml = "";
	for (var tabidx in currentTabs) {
		var tab = currentTabs[tabidx];
		tabshtml += '<a '+(tab==a?'class="active"':'')+'><span onclick="switchTab(\''+tab+'\')">Router '+tab+'</span>'+
			'<span class="x" onclick="closeTab(\''+tab+'\', this)">&#10799;</span></a>';
	}
	document.getElementById("opentabs").innerHTML = tabshtml;
	
	var url = "res_auto/R"+a+".html";
	if (a=="MAP") url = "res_static/RMAP.html";
	if (a !== null) load(url, function(t) {
		setContent(t);
		
		if (a == "MAP") {
			sigma.parsers.json('netw.json', {
			container: 'container',
			settings: {
			  defaultNodeColor: '#ffffff'
			}
			});
		}
	}, function(t) {
		setContent("not found");
	});
	else setContent("");
	
	
	
}
function setContent(t) {
	document.getElementById("content").innerHTML = '<div class="scrollBox"><pre id="text">'+t+'</pre></div>';
}

function openRightMenu() {
	if (currentRouter != null) load("res_static/boxRight.html", function(t) {
		document.getElementById("content").innerHTML += t;
		//setTimeout(function() { nextInstruction(3) }, 100);
		nextInstruction(3);
	});
}


function openReachability() {
	load("res_auto/reach"+currentRouter+".html", function(t) {
		document.getElementById("reachability").innerHTML = t;
		nextInstruction(4);
	});
}

function loadHighlightText(to) {
	load("res_auto/hl"+currentRouter+to+".html", function(t) {
		document.getElementById("text").innerHTML = t;
		nextInstruction(5);
	});
}




var instructionsProgress = 0;
function nextInstruction(step) {
	if (instructionsProgress == step-1) {
		instructionsProgress++;
		
		if (instructionsProgress==1) {
			document.getElementById("msgtxt").innerHTML = "Click here to open configs of any router";
			document.getElementById("msg").style.top = "100px";
		}
		if (instructionsProgress==2) {
			document.getElementById("msgtxt").innerHTML = "This is a router config file. To get a high level network specifications of this router, click here";
			document.getElementById("msgarr").className = "arr right";
			document.getElementById("msg").style.top = "10px";
			document.getElementById("msg").style.left = "50px";
		}
		if (instructionsProgress==3) {
			document.getElementById("msgtxt").innerHTML = "Here you can see certain properties of the router our IDE calculates. For this evaluation, only reachability will be relevant (the other buttons are disabled). Click [+] to see which routers are reachable from this one.";
			document.getElementById("msgarr").className = "arr right";
			document.getElementById("msg").style.top = "90px";
			var rect = document.getElementsByClassName("boxRight")[0].getBoundingClientRect();
			document.getElementById("msg").style.left = (rect.left - 217)+"px";
		}
		if (instructionsProgress==4) {
			document.getElementById("msgtxt").innerHTML = "This is a list of all reachable and unreachable routers. Click on one of the routers to highlight the relevant lines in the config that affect the routing to that router.";
			document.getElementById("msgarr").className = "arr left";
			document.getElementById("msg").style.top = "200px";
			var rect = document.getElementsByClassName("boxRight")[0].getBoundingClientRect();
			document.getElementById("msg").style.left = (rect.left + 160)+"px";
		}
		if (instructionsProgress==5) {
			document.getElementById("msgtxt").innerHTML = "1. These lines tell which prefix range to forward to which <i>router name</i>"
			+ '<br><br><a class="msgbtn" onclick="nextInstruction(6)">What is a <i>router name</i>?</a>';
			document.getElementById("msgarr").className = "arr left";
			document.getElementById("msg").style.top = "520px";
			document.getElementById("msg").style.left = "600px";
		}
		if (instructionsProgress==6) {
			document.getElementById("msgtxt").innerHTML = "2. Here, the <i>router names</i> are defined. These lines specify which physical interface traffic to that specific router should go out of"
			+ '<br><br><a class="msgbtn" onclick="nextInstruction(7)">How do I know these are the correct interfaces?</a>';
			document.getElementById("msgarr").className = "arr left";
			document.getElementById("msg").style.top = "300px";
			document.getElementById("msg").style.left = "600px";
		}
		if (instructionsProgress==7) {
			document.getElementById("block").style.display = "block";
			document.getElementById("msgtxt").innerHTML = "Which interfaces are the correct ones is something the config cannot tell you, because it depends on which cables are plugged into which port on the physical routers.<br><br>"+
			"Each of the following tasks will provide you with a table that tells you which routers are connnected and more importantly, <b>what interface the cables are plugged into</b>."
			+ '<br><br><a class="msgbtn" onclick="nextInstruction(8)">Next</a>';
			document.getElementById("msgarr").className = "";
			document.getElementById("msg").style.width = "400px";
			document.getElementById("msg").style.top = "30%";
			document.getElementById("msg").style.left = "calc(50% - 200px)";
		}
		if (instructionsProgress==8) {
			document.getElementById("msgtxt").innerHTML = "You should have received such a table for this tutorial as well. <br><br>We encourage you to go through some of the configs and compare the interfaces in the interface lists with the ones on your paper. Make sure you undestand how the routing/forwarding of traffic works."
			+ '<br><br><a class="msgbtn" onclick="nextInstruction(9)">Sure</a>';
		}
		if (instructionsProgress==9) {
			document.getElementById("msgtxt").innerHTML = "<b>This concludes the tutorial!</b><br><br>Feel free to take your time and click around and make yourself familiar with the IDE features. Once you feel comfortable, tell us and we can begin."
			+ '<br><br><a class="msgbtn" onclick="nextInstruction(10)">Ok cool cool lemme <b><i>click buttens!!1</i></b></a>';
		}
		if (instructionsProgress==10) {
			document.getElementById("msgtxt").style.display = "none";
			document.getElementById("block").style.display = "none";
		}
	}
}