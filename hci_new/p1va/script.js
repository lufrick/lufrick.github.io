var selfname = "";

window.onload = function() {
	console.info("loaded");
	selfname = document.getElementById("ide").dataset.name;
}

function log(msg) {
	var url = "https://lanwg.mikrounix.com/testlogger/";
	var params = "name="+encodeURI(selfname)+"&msg="+encodeURI(msg);
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send(params);
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
	log("opened file "+a);
	
	if (!opentabs[a]) {
		opentabs[a] = true;
		currentTabs.push(a);
		toptab = a;
	}
	
	switchTab(a);
}

function closeTab(a,t) {
	log("closed file "+a);
	
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
		tabshtml += '<a '+(tab==a?'class="active"':'')+'><span onclick="switchTab(\''+tab+'\');log(\'switch to tab '+tab+'\');">Router '+tab+'</span>'+
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
	log("open analyze menu on "+currentRouter);
	if (currentRouter != null) load("res_static/boxRight.html", function(t) {
		document.getElementById("content").innerHTML += t;
	});
}


function openReachability() {
	log("expand reachability on "+currentRouter);
	load("res_auto/reach"+currentRouter+".html", function(t) {
		document.getElementById("reachability").innerHTML = t;
	});
}

function loadHighlightText(to) {
	log("highlight lines concerning "+to+" on "+currentRouter);
	load("res_auto/hl"+currentRouter+to+".html", function(t) {
		document.getElementById("text").innerHTML = t;
	});
}