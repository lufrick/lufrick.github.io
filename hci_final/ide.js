var selfname = "";
var selfname = "";

//var opentabs = [[],[],[],[]];
var opentabs = [];
var currentTabs = [[],[],[],[],[]];
var lastInFocus = [];

function closeall() {
	opentabs = [];
	currentTabs = [[],[],[],[],[]];
	lastInFocus = [];
	currentMainTab = 2;
	tabtitles = [];
	currentRouter = null;
	
	document.getElementById("main").className = ""; //disable twotabs
	
	for (var tn = 1; tn<=4; tn++) {
		setContent(tn, "");
	}
	
	opendefaulttabs();
	
}

function openInTab(tabnum, content, title=null) {

	console.log("[open] " +tabnum+" "+content);
	
	/*if (!opentabs[tabnum][content]) {
		opentabs[tabnum][content] = true;
		currentTabs[tabnum].push(content);
	}*/
	if (!opentabs[content]) {
		opentabs[content] = true;
		currentTabs[tabnum].push(content);
	}
	
	//switchToTab(tabnum, content, title);
	
	switchToTabSmart(tabnum, content, title);
}

function switchToTabSmart(tabnum, content, title=null) {
	for (var i =1; i<4; i++) {
		for (var k in currentTabs[i]) {
			if (currentTabs[i][k] == content) {
				switchToTab(i,content,title);
				return;
			}
		}
	}
	switchToTab(tabnum,content,title);
}

function focusOnTab(tn, reloadtab=false) {
	console.info("[focusOnTab] "+tn);
	if (tn == 2 || tn == 3) currentMainTab = tn;
	if (reloadtab && lastInFocus[tn] != null) switchToTab(tn, lastInFocus[tn]);
}

var currentMainTab = 2;
var tabtitles = [];

function switchToTab(tabnum, content, title=null) {
	if (title !== null) {
		tabtitles[content] = title;
	}
	
	for (var tn = 1; tn<=4; tn++) {
		var canclose = tn > 1;
		var tabshtml = "";
		for (var tabidx in currentTabs[tn]) {
			var tab = currentTabs[tn][tabidx];
			tabshtml += '<a '+((tab==content&&tabnum==tn)?'class="active"':'')+'><span onclick="switchToTab('+tn+', \''+tab+'\',null)">'
			+tabtitles[currentTabs[tn][tabidx]]+'</span>'+
			(canclose?('<span class="x" onclick="closeTab2('+tn+', \''+tab+'\')">&#10799;</span></a>'):'');
		}
		document.getElementById("opentabs"+tn).innerHTML = tabshtml;
	}
	
	
	
	if (tabnum == 2 || tabnum == 3) {
		currentMainTab = tabnum;
		currentRouter = content;
	}
	
	var url = content+".html";
	if (content !== null) load(url, function(t) {
		if (url.startsWith("res_auto")) t = '<pre id="text">'+t+'</pre>';
		setContent(tabnum, t);
	}, function(t) {
		setContent(tabnum, "not found");
	});
	else setContent(tabnum, "");

	lastInFocus[tabnum] = content;
}

function moveToTab2 () {
	if (currentTabs[2].length <= 1) return;
	
	document.getElementById("main").className = "twotabs";
	if (currentMainTab == 2) {
		var cr = currentRouter;
		closeTab2(2, cr);
		openInTab(3, cr, tabtitles[cr]);
	}
	
}

function closeTab2(tabnum, a) {
	
	//opentabs[tabnum][a] = false;
	opentabs[a] = false;
	
	var closeIndex = -1;
	for (var tabidx in currentTabs[tabnum]) {
		var tab = currentTabs[tabnum][tabidx];
		if (tab==a) closeIndex = tabidx;
	}
	if (closeIndex >= 0) {
		currentTabs[tabnum].splice(closeIndex,1);
		if (currentTabs[tabnum].length == 0) {
			if (tabnum == 3) {
				document.getElementById("main").className = "";
				setTimeout(function() {
					focusOnTab(2, true);
				}, 100);
				console.log("closing second tab");
			} else {
				switchToTab(tabnum, null);
			}
		}
		else {
			if (currentRouter == a) currentRouter = currentTabs[tabnum][Math.min(currentTabs[tabnum].length-1, closeIndex)];
			switchToTab(tabnum, currentRouter);
		}
	}
	
	
}

window.onload = function() {
	console.info("loaded");
	var prototypeName = document.getElementById("ide").dataset.name;
	
	var url = new URL(window.location.href);
	var uid = url.searchParams.get("uid");
	if (uid == null || uid == "") {
		uid = "anon"+Date.now();
	}
	
	selfname = uid + "@" + prototypeName;
	//document.getElementById("info").innerHTML = selfname;
	
	opendefaulttabs();
}

function opendefaulttabs() {
	openInTab(1, "res_static/dir", "Network", false);
	openInTab(1, "res_static/tree", "Structure", false);
	switchToTab(1, "res_static/dir", "Network", false);
	
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


function openFile(a, title=null) {
	var tt = "Router "+a;
	if (title !== null) {
		if (typeof title === 'string') tt = title;
		else tt = title.innerHTML;
	} 
	openInTab(currentMainTab, a, tt);
}

function openFileRouter(a, title=null) {
	
	var tt = "Router "+a;
	if (title !== null) {
		if (typeof title === 'string') tt = title;
		else tt = title.innerHTML;
	} 
	
	openFile(a, title);
	
	var c = currentMainTab;
	document.getElementById("main").className = "twotabs";
	openInTab(c==2?3:2, "res_static/overview", tt.split(" ")[1]+" Neighbours");
	//openInTab(c==2?3:2, "res_static/green", tt.split(" ")[1]+" Neighbours");
	switchToTab(c, a, tt);
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
function setContent(tabnum, t) {
	//document.getElementById("content"+tabnum).innerHTML = '<div class="scrollBox"><pre id="text">'+t+'</pre></div>';
	document.getElementById("content"+tabnum).innerHTML = '<div class="scrollBox">'+t+'</div>';
}

function openAnalMenu() {
	
	console.log("open analyze menu: "+currentRouter.slice(-3));
	log("open analyze menu on "+currentRouter);
	
	
	document.getElementById("ide").className = "loadingcursor";
	document.getElementById("footer").innerHTML = "Calculating network specifications for "+currentRouter.slice(-3)+'... &emsp;&emsp; <div id="progressbar"><div class="pgbarinner"></div></div>';
	
	setTimeout(function(){
		document.getElementById("progressbar").className = "loading";
	}, 10);
	setTimeout(function(){
		document.getElementById("ide").className = "";
		document.getElementById("footer").innerHTML = "Ready.";
		
		openInTab(4, "res_static/boxRight", "Analyze "+currentRouter.slice(-3), false);
		
	}, 1000);
	
	
	
}
function openRightMenu() {
	log("open analyze menu on "+currentRouter);
	if (currentRouter != null) load("res_static/boxRight.html", function(t) {
		document.getElementById("content").innerHTML += t;
	});
}


function openReachability() {
	log("expand reachability on "+currentRouter);
	load("res_auto/reach"+currentRouter.slice(-3)+".html", function(t) { // .slice(-1) hack
		document.getElementById("reachability").innerHTML = t;
	});
}

function loadHighlightText(to) {
	log("highlight lines concerning "+to+" on "+currentRouter);
	load("res_auto/hl"+currentRouter.slice(-3)+to+".html", function(t) {
		document.getElementById("text").innerHTML = t;
	});
}