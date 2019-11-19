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
function openFile(a) {
	if (!opentabs[a]) {
		opentabs[a] = true;
		document.getElementById("opentabs").innerHTML += '<a><span onclick="switchTab(\''+a+'\')">Router '+a+'</span>'+
		'<span class="x" onclick="closeTab(\''+a+'\', this)">&#10799;</span></a>';
		toptab = a;
	}
	
	switchTab(a);
}

function closeTab(a,t) {
	opentabs[a] = false;
	t.parentElement.outerHTML = "";
	document.getElementById("content").innerHTML = "";
}

var currentRouter = "";

function switchTab(a) {
	currentRouter = a;
	
	load("res/R"+a+".html", function(t) {
		setContent(t);
	}, function(t) {
		setContent("not found");
	});
	
}
function setContent(t) {
	document.getElementById("content").innerHTML = '<div class="scrollBox"><pre id="text">'+t+'</pre></div>';
}

function openRightMenu() {
	load("res/boxRight.html", function(t) {
		document.getElementById("content").innerHTML += t;
	});
}


function openReachability() {
	load("res/reach"+currentRouter+".html", function(t) {
		document.getElementById("reachability").innerHTML = t;
	});
}

function loadHighlightText() {
	load("res/highlight"+currentRouter+".html", function(t) {
		document.getElementById("text").innerHTML = t;
	});
}