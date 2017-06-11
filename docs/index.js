var tree;
var titleNode;
var localStorageSupported = true;
var clipboard = null;
var exportText = null;

var commands = [
	{cmd: "editStart", buttonLabel: "", menuLabel: "", kbd: "space"}, 
	{cmd: "add", buttonLabel: "+", menuLabel: "Add", kbd: "return"},
	{cmd: "addAbove", buttonLabel: "+^", menuLabel: "Add Above", kbd: "shift+return"}, 
	{cmd: "addFirstChild", buttonLabel: "+\\", menuLabel: "Add First Child", kbd: "ctrl+shift+return"}, 
	{cmd: "addLastChild", buttonLabel: "+\\^", menuLabel: "Add Last Child", kbd: "ctrl+return"}, 
	{cmd: "delete", buttonLabel:"-", menuLabel:"Delete", kbd: "del"},
	{cmd: "cut", buttonLabel:"^x", menuLabel:"Cut", kbd: "ctrl+x"},
	{cmd: "copy", buttonLabel:"^c", menuLabel:"Copy", kbd: "ctrl+c"},
	{cmd: "paste", buttonLabel:"^v", menuLabel:"Paste", kbd: "ctrl+v"},
	{cmd: "pasteAbove", buttonLabel:"", menuLabel:"Paste Above", kbd: ""},
	{cmd: "pasteFirstChild", buttonLabel:"", menuLabel:"Paste First Child", kbd: ""},
	{cmd: "pasteLastChild", buttonLabel:"", menuLabel:"Paste Last Child", kbd: ""},


	{cmd: "promote", buttonLabel: "<", menuLabel: "Promote", kbd: "ctrl+h"},
	{cmd: "promoteAbove", buttonLabel: "<^", menuLabel: "Promote Above", kbd: "ctrl+shift+h"},
	{cmd: "demote", buttonLabel: '>', menuLabel: "Demote", kbd: "ctrl+l"},
	{cmd: "demoteFirstChild", buttonLabel: '>Y', menuLabel: "Demote To First Child", kbd: "ctrl+shift+l"},
	{cmd: "moveUp", buttonLabel: "^", menuLabel: "Move Up", kbd: "ctrl+k"},
	{cmd: "moveDown", buttonLabel: "v", menuLabel: "Move Down", kbd: "ctrl+j"}
];
var buttons = ["add", "delete", "promote", "demote", "moveUp", "moveDown", "copy", "cut", "paste"];
var menuItems = ["add", "addAbove", "addFirstChild", "addLastChild", "delete", "----", "cut", "copy", "paste", "pasteAbove", "pasteFirstChild", "pasteLastChild", "----", "promote", "promoteAbove", "demote", "demoteFirstChild", "----", "moveUp", "moveDown"];
var navCommands = [
	{cmd: "navDown", kbd: "j"}, 
	{cmd: "navJumpDown", kbd: "shift+j"}, 
	{cmd: "navUp", kbd: "k"}, 
	{cmd: "navJumpUp", kbd: "shift+k"}, 
	{cmd: "navExpand", kbd: "shift+right"}, 
	{cmd: "navCollapse", kbd: "shift+left"}, 
	{cmd: "navToggleExpanded", kbd: "ctrl+space"}, 
	{cmd: "navToggleExpandedAll", kbd: "shift+space"}, 
	{cmd: "navExtendSelUp", kbd: "shift+up"}, 
	{cmd: "navExtendSelDown", kbd: "shift+down"}
];

// handle edit commands
function doCmd(cmd) {
	// console.log(cmd);
	var node = tree.getActiveNode();
	var nodes = tree.getSelectedNodes();
	var activeNodeInd;
	for (activeNodeInd in nodes) {
		if (nodes[activeNodeInd].isActive()) {
			break;
		}
	}
	nodes = getUniqueAncestors(nodes);

	var tmpClipboard = null;
	// !!!Is this if necessary? 
	// if (node) {
		switch (cmd) {
			case "editStart":
				node.editStart();
				break;
			case "add":
				// node.editStart();
				node.editCreateNode("after", makeNodeItem(""));
				break;
			case "addAbove":
				node.editCreateNode("before", makeNodeItem(""));
				break;
			case "addFirstChild":
				if (!node.hasChildren()) {
					node.editCreateNode("child", makeNodeItem(""));
				}
				else {
					node.getFirstChild().editCreateNode("before", makeNodeItem(""));
				}
				break;
			case "addLastChild":
				node.editCreateNode("child", makeNodeItem(""));
				break;
			case "delete":
		        node = removeNodes(nodes);
				break;
			case "cut":
				clipboard = makeClipboard(nodes);
		        node = removeNodes(nodes);
				break;
			case "copy":
				clipboard = makeClipboard(nodes);
				break;
			// second param of addChildren is node to paste before
			case "paste":
				// node = node.addChildren(clipboard);
				// node = node.getParent().addChildren(clipboard, node.getNextSibling());
				// node = node.addNode(clipboard, 'after');
				node = insertNodes(nodes[nodes.length-1], 'after', clipboard);
				break;
			case "pasteAbove":
				// node = node.getParent().addChildren(clipboard, node);
				// node = node.addNode(clipboard, 'before');
				node = insertNodes(node, 'before', clipboard);
				break;
			case "pasteFirstChild":
				if (!node.hasChildren()) {
					// node = node.addNode(clipboard, 'child');
					node = insertNodes(node, 'child', clipboard);
				}
				else {
					// node = node.getFirstChild().addNode(clipboard, "before");
					node = insertNodes(node.getFirstChild(), 'before', clipboard);
				}
				break;
			case "pasteLastChild":
				// node = node.getParent().addChildren(clipboard);
				// node = node.addNode(clipboard, 'child');
				node = insertNodes(node, 'child', clipboard);
				break;

			case "promote":
				// var newSibling = node.getParent();
				var newSibling = nodes[0].getParent();
				// node.moveTo(newSibling, 'after');
				tmpClipboard = makeClipboard(nodes);
		        removeNodes(nodes);
				// node = newPrevSibling.addNode(tmpClipboard, 'after');
				node = insertNodes(newSibling, 'after', tmpClipboard, activeNodeInd);
				break;
			case "promoteAbove":
				var newSibling = nodes[0].getParent();
				// node.moveTo(newSibling, 'before');
				tmpClipboard = makeClipboard(nodes);
		        removeNodes(nodes);
				node = insertNodes(newSibling, 'before', tmpClipboard, activeNodeInd);
				break;
			case "demote":
				// var newParent = node.getPrevSibling();
				var newParent = nodes[0].getPrevSibling();
				tmpClipboard = makeClipboard(nodes);
		        removeNodes(nodes);
				// node.moveTo(newParent, 'child');
				node = insertNodes(newParent, 'child', tmpClipboard, activeNodeInd);
				// necessary because fancy wants to collapse node after giving it a child. 
				newParent.setExpanded(true);
				break;
			case "demoteFirstChild":
				var newParent = nodes[0].getPrevSibling();
				tmpClipboard = makeClipboard(nodes);
		        removeNodes(nodes);
				if (newParent.hasChildren()) {
					var newAfterNode = newParent.getFirstChild();
					// node.moveTo(newAfterNode, 'before');
					node = insertNodes(newAfterNode, 'before', tmpClipboard, activeNodeInd);
				}
				else {
					// node.moveTo(newParent, 'child');
					node = insertNodes(newParent, 'child', tmpClipboard, activeNodeInd);
				}
				// necessary because fancy wants to collapse node after giving it a child. 
				newParent.setExpanded(true);
				break;
			case "moveUp":
				// Single node version
				// var newNextSibling = node.getPrevSibling();
				// node.moveTo(newNextSibling, 'before');
//				// nodes.moveTo(newNextSibling, 'before');

				var newNextSibling = nodes[0].getPrevSibling();
				tmpClipboard = makeClipboard(nodes);
		        removeNodes(nodes);
				// node = newNextSibling.addNode(tmpClipboard, 'before');
				node = insertNodes(newNextSibling, 'before', tmpClipboard, activeNodeInd);
				break;
			case "moveDown":
				// Single node version
				// var newPrevSibling = node.getNextSibling();
				// node.moveTo(newPrevSibling, 'after');
//				// nodes.moveTo(newPrevSibling, 'after');

				var newPrevSibling = nodes[nodes.length-1].getNextSibling();
				tmpClipboard = makeClipboard(nodes);
		        removeNodes(nodes);
				// node = newPrevSibling.addNode(tmpClipboard, 'after');
				node = insertNodes(newPrevSibling, 'after', tmpClipboard, activeNodeInd);
				break;
		}
		// double check logic below here. 
		onOutlineChange();
		if (cmd === 'add' || cmd === 'addAbove' || cmd === 'addFirstChild' || cmd === 'addLastChild') {
			return false;
		} else {
			// activateNode(node);
			return true;
		}
	// }
}

function doNavCmd(cmd) {
    var node = tree.getActiveNode();
	var nextNode = null;
	var KC = $.ui.keyCode;
    switch( cmd ) {
    // switch( eStr ) {
    	// down to next line
		// case "j":
		case "navDown":
			node.navigate(KC.DOWN, true);
			break;
    	// jump down:
    	// if next sibling is expanded and has children, jump to next sibling, skipping over children
    	// otherwise, jump to last sibling (parent's last child)
    	// otherwise, treat like normal down nav. 
		// case "shift+down":
		// case "shift+j":
		case "navJumpDown":
			if (node.hasChildren() && node.isExpanded()) {
				nextNode = node.getNextSibling();
			} 
			else {
				nextNode = node.getParent().getLastChild();
				if (nextNode === node) {
					nextNode = null;
				}
			}
			if (nextNode) {
				activateNode(nextNode);
			}
			else {
				node.navigate(KC.DOWN, true);
			}
			break;
    	// up to next line
		// case "k":
		case "navUp":
			node.navigate(KC.UP, true);
			break;
    	// jump up:
    	// if next sibling is expanded and has children, jump to next sibling, skipping over children
    	// otherwise, jump to first sibling (parent's first child)
    	// otherwise, treat like normal down nav. 
		// case "shift+up":
		// case "shift+k":
		case "navJumpUp":
			var prevSibNode = node.getPrevSibling();
			if (prevSibNode !== null) {
				if (prevSibNode.hasChildren() && prevSibNode.isExpanded()) {
					nextNode = prevSibNode;
				} 
				else {
					nextNode = node.getParent().getFirstChild();
					if (nextNode === node) {
						nextNode = null;
					}
				}
			}
			if (nextNode) {
				activateNode(nextNode);
			}
			else {
				node.navigate(KC.UP, true);
			}
			break;
		// case "shift+right":
		case "navExpand":
			node.visit(function(node){
		        node.setExpanded(true);
		    }, true);
			break;
		// case "shift+left":
		case "navCollapse":
			node.visit(function(node){
		        node.setExpanded(false);
		    }, true);
			break;
		// case "ctrl+space":
		case "navToggleExpanded":
			node.toggleExpanded();
			break;
		// case "shift+space":
		case "navToggleExpandedAll":
			var nodeIsExpanded = node.isExpanded();
			if (!nodeIsExpanded) {
				node.visit(function(node){
			        node.setExpanded(true);
			    }, true);
			}
			else {
				node.visit(function(node){
			        node.setExpanded(false);
			    }, true);
			}
			break;
		// case "shift+up":
		case "navExtendSelUp":					
			var movingNode = findContigSelectionBound();
			var newNode = getPrevNode(movingNode);
			if (newNode) {
				console.log(movingNode.title + ":" + newNode.title);
				selectContigNodes(node, newNode);
			}
			return false;
			// node.navigate(KC.UP, true);
			break;
		// case "shift+down":
		case "navExtendSelDown":
			var movingNode = findContigSelectionBound();
			var newNode = getNextNode(movingNode);
			if (newNode) {
				console.log(movingNode.title + ":" + newNode.title);
				selectContigNodes(node, newNode);
			}
			return false;
			// node.navigate(KC.DOWN, true);
			break;
	}
}

// test if the edit commands are possible for the purpose of disabling menu items and buttons
// !!!make nodes, not node. 
// !!isTitle() should test nodes[0]
function can(cmd, node, nodes) {
	var ret_val;
	// the switch statement determines if it *can't* do it. the result gets negated in the return statement. 
	switch (cmd) {
		case "add":
			ret_val = false;
			break;
		case "paste":
			ret_val = clipboard === null;
			break;
		case "addAbove":
		case "addFirstChild":
		case "addLastChild":
		case "cut":
		case "delete":
			ret_val = isTitle(node);
			break;
		case "pasteAbove":
		case "pasteFirstChild":
		case "pasteLastChild":
			ret_val = isTitle(node) || clipboard === null;
			break;

		// !!!Add tests of contiguous siblings
		// !!!test nodes[0] or nodes[nodes.length-1], depending on the situation
		case "promoteAbove":
		case "promote":
			ret_val = isTitle(node) || node.getParent().isRootNode() || !areContiguousSiblings(nodes);
			break;
		case "demote":
		case "demoteFirstChild":
		case "moveUp":
			ret_val = isTitle(node) || isTitle(node.getPrevSibling()) || node.isFirstSibling() || !areContiguousSiblings(nodes);
			break;
		case "moveDown":
			ret_val = isTitle(nodes[0]) || nodes[nodes.length-1].isLastSibling() || !areContiguousSiblings(nodes);
			break;
	}
	return !ret_val;
}

function insertNodes(nodeIn, mode, clipboardIn, activeNum=0) {
	var nodeOut;
	var nextNode;
	var firstNode = nodeIn.addNode(clipboardIn, mode);

	nextNode = firstNode;
	for (var i = 0; i < activeNum; i++) {
		// nextNode = nextNode.getNextSibling();
		nextNode = getNextNode(nextNode);
	}
	nodeOut = nextNode;
	// nodeOut.setActive();
	activateNode(nodeOut);

	nextNode = firstNode;
	for (var i = 0; i < clipboardIn.length; i++) {
		nextNode.setSelected();
		nextNode = nextNode.getNextSibling();
	}

	return nodeOut;
}

function removeNodes(nodes) {
	// var nextNodeToActivate = nodes[0].getNextSibling();
	var nextNodeToActivate = nodes[nodes.length-1].getNextSibling();
	if (nextNodeToActivate === null) {
		nextNodeToActivate = nodes[0].getPrevSibling();
	}
	if (nextNodeToActivate === null) {
		nextNodeToActivate = nodes[0].getParent();
	}
	for (var nodeInd in nodes) {
	    nodes[nodeInd].remove();
	}
    return nextNodeToActivate;
}

function removeNode(node) {
	var nextNodeToActivate = node.getNextSibling();
	if (nextNodeToActivate === null) {
		nextNodeToActivate = node.getPrevSibling();
	}
	if (nextNodeToActivate === null) {
		nextNodeToActivate = node.getParent();
	}
    node.remove();
    return nextNodeToActivate;
}

function makeClipboard(nodes) {
	// console.log(node.icon)
	var localClipboard = [];
	var newNode;
	// var active = 0;
	for (var i = 0; i < nodes.length; i++) {
		newNode = nodes[i];
		// if (newNode.isActive()) {
		// 	active = i;
		// }
		newNode.icon = false;
		delete newNode.key;
		localClipboard[i] = newNode.toDict(
				true,
				// !!!haven't seen this run w breakpoints
				// is it necessary? 
				// should I say true for recursive? 
				// remove entirely? 
				// what exactly is effect of deleting key? 
				function(n){
					// console.log(n.icon)
					delete n.key;
					// console.log(n.icon)
				}
			)
		;
	}
	return localClipboard;
}

function getTitleNode() {
	return tree.rootNode.getFirstChild();
}

function makeNodeItem(str) {
	return {title: str, icon: false}
	// return {title: str, icon: "bullet.png"}
	// return {title: str, icon: "folder"}
	// return {title: str}
}

function makeEmptyOutline(str) {
	return [makeNodeTitle("Untitled")];
	// return [
	// 	makeNodeTitle("Untitled"), 
	// 	// makeNodeItem("Item 1")
	// ];
}

function makeNodeTitle(str) {
	// return {title: str, icon: "foo.png"}
	// return {title: str, icon: "checkbox"}
	// return {title: str, icon: false}
	return {title: str}
}

// First node is special title node. Can't do most operations on it, i.e. can't move or delte. 
function isTitle (node) {
	var ret_val = false;
	if (node) {
		var parentNode = node.getParent();
		if (parentNode) {
			if (parentNode.isRootNode()) {
				if (node.isFirstSibling()) {
					ret_val = true;
				}
			}
		}
	}
	return ret_val;
}

function adjustMenus() {
	var tree = $("#tree").fancytree("getTree");
	var node = tree.getActiveNode();
	var nodes = tree.getSelectedNodes();
	for (var key in menuItems) {
		cmd = menuItems[key];
		$("#tree").contextmenu("enableEntry", cmd, can(cmd, node, nodes));
	}
}

function adjustButtons() {
	var tree = $("#tree").fancytree("getTree");
	var node = tree.getActiveNode();
	var nodes = tree.getSelectedNodes();
	for (var key in buttons) {
		cmd = buttons[key];
		$("#" + cmd + "Button").prop('disabled', !can(cmd, node, nodes));
	}
}

function activateNode(node) {
	node.setActive();
	// node.setFocus();
	// adjustButtons();
	// $("#tree").focus();
}

function onOutlineChange() {
	updateLocalStorage();
}

function compareNodes(node1, node2) {
	var inds1 = node1.getIndexHier().split('.');
	var inds2 = node2.getIndexHier().split('.');
	var level1 = node1.getLevel();
	var level2 = node2.getLevel();
	// the smallest level number is the one we use. 
	var numLevel = (level1 < level2 ? level1 : level2);
	for (var i = 0; i < numLevel; i++) {
		var i1 = inds1[i];
		var i2 = inds2[i];
		if (i1 !== i2) {
			return ((i1 < i2 ? 1 : 2));
		}
	}
	return (level1 < level2 ? 1 : 2);
}

// from fancytree KC.UP handler
function getPrevNode(node) {
	var sib;
	sib = node.getPrevSibling();
	// #359: skip hidden sibling nodes, preventing a _goto() recursion
	while( sib && !$(sib.span).is(":visible") ) {
		sib = sib.getPrevSibling();
	}
	while( sib && sib.expanded && sib.children && sib.children.length ) {
		sib = sib.children[sib.children.length - 1];
	}
	if( !sib && node.parent && node.parent.parent ){
		sib = node.parent;
	}
	return sib;
}

// from fancytree KC.DOWN handler
function getNextNode(node) {
	var sib;
	if( node.expanded && node.children && node.children.length ) {
		sib = node.children[0];
	} else {
		var parents = node.getParentList(false, true);
		for(var i=parents.length-1; i>=0; i--) {
			sib = parents[i].getNextSibling();
			// #359: skip hidden sibling nodes, preventing a _goto() recursion
			while( sib && !$(sib.span).is(":visible") ) {
				sib = sib.getNextSibling();
			}
			if( sib ){ break; }
		}
	}
	return sib;
}

function selectContigNodes(activeNode, endNode) {
	selectNodesAll(false);
	var betweenNodes = getBetweenNodes(activeNode, endNode);
	for (var tmpNode in betweenNodes) {
		console.log(betweenNodes[tmpNode].title);
		betweenNodes[tmpNode].setSelected(true);
	}
}

// Return the contiguous selected node that is farthest from the active node. 
// Compare the number of contiguous selected above the active node to the number below. 
function findContigSelectionBound(biasDown) {
	var activeNode = tree.getActiveNode();

	// find upper bound
	var numPrev = 0;
	var firstNode = activeNode;
	while (firstNode && getPrevNode(firstNode) && getPrevNode(firstNode).isSelected()) {
		numPrev++;
		firstNode = getPrevNode(firstNode);
	}

	// find lower bound
	var numNext = 0;
	var lastNode = activeNode;
	while (lastNode && getNextNode(lastNode) && getNextNode(lastNode).isSelected()) {
		numNext++;
		lastNode = getNextNode(lastNode);
	}

	if (numPrev === numNext) {
		if (biasDown) {
			return(lastNode);
		}
		else {
			return firstNode;
		}
	}
	else {
		if (numNext > numPrev) {
			return lastNode;
		}
		else {
			return firstNode;
		}
	}
}

function getBetweenNodes(inNode1, inNode2) {
	if (inNode1 === inNode2) {
		return [inNode1];
	}
	var node1 = inNode1;
	var node2 = inNode2;
	if (compareNodes(node1, node2) === 2) {
		node1 = inNode2;
		node2 = inNode1;
	}
	var ret_nodes = [node1];
	var done = false;
	var last;
	var next_node;
	while (!done) {
		last = ret_nodes.length-1;
		next_node = getNextNode(ret_nodes[last]);
		ret_nodes[last+1] = next_node;
		if (next_node === node2) {
			break;
		}
	}
	return ret_nodes;
}

// given a list of nodes, return a list with nodes removed that are descendants of any other node in the list. 
// used for operations on multiple selections. 
function getUniqueAncestors(nodes) {
	var ret_nodes = nodes;
	var ind1 = 0;
	var ind2;
	// only go till next to last one
	while (ind1 < ret_nodes.length-1) {
		ind2 = ind1 + 1;
		while (ret_nodes[ind2].isDescendantOf(ret_nodes[ind1])) {
			ret_nodes.splice([ind2], 1);
			if (ind2 >= ret_nodes.length) {
				break;
			}
		}
		ind1++;
	}
	return ret_nodes;
}

// let's assume that there is more than one node. 
function areContiguousSiblings(nodes) {
	var ret_val = true;
	// only go till next to last one
	for (var i = 0; i < nodes.length-1; i++) {
		if (nodes[i+1] !== nodes[i].getNextSibling()) {
			ret_val = false;
			break;
		}
	}
	return ret_val;
}

function selectNodesAll(val) {
	var selNodes = tree.getSelectedNodes();
	for (var aNode in selNodes) {
		selNodes[aNode].setSelected(val);
		// console.log("unselecting: ", selNodes[aNode].title);
	}
}

// File IO functions

function getJSON_string() {
	// return JSON.stringify(tree.toDict(true));
	return JSON.stringify(tree.toDict(true, function(n){ delete n.key;}));
}

function updateLocalStorage() {
	if (localStorageSupported) {
	  	jsonStore = getJSON_string();
	  	// console.log(jsonStore);
		localStorage.setItem("most_recent", jsonStore);
	}
}

function toSystemClipboard(some_text) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(some_text).select();
  document.execCommand("copy");
  $temp.remove();
}

function makeTextFile(text) {
	var data = new Blob([text], {type: 'text/plain'});

	// If we are replacing a previously generated file we need to
	// manually revoke the object URL to avoid memory leaks.
	if (exportText !== null) {
		window.URL.revokeObjectURL(exportText);
	}

	exportText = window.URL.createObjectURL(data);

	return exportText;
}

function setupNewTree() {
	var titleNode = getTitleNode();
	// titleNode.setActive();
	activateNode(titleNode);
	titleNode.editStart();
}

// File IO called directly from UI

function clearFileName() {
	document.querySelector('#fileload').value = "";
}

function importFile() {
	// console.log('import');
	// var files = document.querySelector('#fileload').files;
	var files = $('#fileload').prop('files');
	if (files.length > 0) {
		var file = files[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			tree.clear();
			tree.reload(JSON.parse(event.target.result));
			onOutlineChange();
		};
		reader.readAsText(file);
		// document.querySelector('#fileload').value = "";
	}
}

function exportFile() {
	// javascript
	// var link = document.getElementById('downloadlink');
	// link.href = makeTextFile($("#theText").val());
	// link.style.display = 'inline';

	// jquery
	var link = $('#downloadlink');
	link.attr('href', makeTextFile(getJSON_string()));
	link.css('display', 'inline')
}

function copyJSON_toClipboard() {
	toSystemClipboard(getJSON_string());
	alert("The outline JSON is now in your paste buffer. Save it to a textfile. To load the file, drag it into the browser. The drag does not actually work yet.")
	// console.log('***debug')
	// var selNodes = tree.getSelectedNodes();
	// var selNodes2 = getUniqueAncestors(selNodes);
	// for (var i = 0; i < selNodes2.length; i++) {
	// 	console.log(selNodes2[i].title);
	// }
}

function clearOutline() {
	tree.clear();
	jsonStore = makeEmptyOutline();
	tree.reload(jsonStore);
	setupNewTree();
	onOutlineChange();
}

// Init function
$(document).ready(function() {
	var cmd;
	var newBut;
	var newButStr;
	var cmd_el;
	// initialize the edit buttons
	for (var key in buttons) {
		cmd = buttons[key];

		cmd_el = commands.find(commands => commands.cmd === cmd);
		buttonLabel = cmd_el.buttonLabel;

		// Make buttons w html like
		// <input type="button" value="+" id="addButton" onclick="doCmd('add')">
		newButStr = "<input ";
		newButStr += "type='button' ";
		newButStr += "value='" + buttonLabel + "' ";
		newButStr += "id='" + cmd  + "Button" + "' ";
		newButStr += "onclick=" + '"doCmd(' + "'" + cmd  + "'" + ')"';
		newButStr += '/>';
	    newBut = $(newButStr);
	    newBut.appendTo($("#editButtons"));
	    // initial state is disabled.
		$("#" + cmd + "Button").prop('disabled', true);
	}
	// initialize the menu items
	var menuItemArray = [];
	var item;
	for (var key in menuItems) {
		cmd = menuItems[key];
		// console.log(cmd);
		item = {title: "----"};
		if (cmd !== '----') {
			// menuLabel = commands[cmd].menuLabel;
			// kbd = commands[cmd].kbd;
			cmd_el = commands.find(commands => commands.cmd === cmd);
			menuLabel = cmd_el.menuLabel;
			kbd = cmd_el.kbd;

			menuLabel += '<kbd>' + kbd + '</kbd>';
			item = {title: menuLabel, cmd: cmd, kbd: kbd};
		}
		menuItemArray[menuItemArray.length] = item;
	}

	if (typeof(Storage) === "undefined") {
	    // Sorry! No Web Storage support..
	    localStorageSupported = false;
	}
	var jsonStore = makeEmptyOutline();
	var newTreeB = true;
	if (localStorageSupported) {
		if (localStorage["most_recent"] !== undefined) {
			jsonStore = JSON.parse(localStorage["most_recent"]);
			newTreeB = false;
		}
	}
	// Attach the fancytree widget to an existing <div id="tree"> element
	// and pass the tree options as an argument to the fancytree() function:
	$("#tree").fancytree({
		source: jsonStore,
		// source: [
		// 	makeNodeTitle("Untitled"), 
		// 	// makeNodeItem("Item 1")
		// ],
		// source: [
		// 	{title: "Title", icon: false},
		// 	{title: "Item 1", icon: false, 
		// 		// children: [
		// 		// 	{title: "Node 2.1", icon: false},
		// 		// 	{title: "Node 2.2", icon: false}
		// 		// ]
		// 	}
		// ],
	 	//  1 - Single select. 2 - Multi select. 3 - Hierarchical multi select.
		// selectMode :2,
		selectMode :2,
		// forces change of focus to cause change of activation, loosing distinction between focused and active. 
		autoActivate: true,
		extensions: ["wide", "persist", "edit", "dnd"],
		// extensions: ["persist", "edit", "dnd"],
		// extensions: ["wide", "edit", "dnd"],
		// extensions: ["wide", "edit"],
		// Various icon fails. 
		// icon: "foo.png",
		// icon: "bullet.gif",
		// icon: "icons.gif",
		// extensions: ["wide", "edit", "dnd", "glyph"],
		// Adjusted to handle no icon 	
	    // glyph: glyph_opts,
		// wide: {
		// 	iconWidth: "0em",       // Adjust this if @fancy-icon-width != "16px"
		// 	iconSpacing: "0.5em",   // Adjust this if @fancy-icon-spacing != "3px"
		// 	labelSpacing: "0em",  // Adjust this if padding between icon and label != "3px"
		// 	levelOfs: "1.5em"       // Adjust this if ul padding != "16px"
		// },
		persist: {
			overrideSource: false,  // true: cookie takes precedence over `source` data attributes.
    		// store: "auto",     // 'cookie': use cookie, 'local': use localStore, 'session': use sessionStore
		    types: "active expanded focus selected"  // which status types to store
		},
		edit: {
			// Available options with their default:
			adjustWidthOfs: 4,   // null: don't adjust input size to content
			inputCss: { minWidth: "3em" },

			// need exactly this one for ability to capture keydown for <return>
			triggerStart: ["f2", "dblclick", "shift+click"],
			// These don't work re ability to capture keydown for <return>
			// triggerStart: ["f2", "dblclick"],
			// triggerStart: ["f2", "shift+click"],
			// triggerStart: ["dblclick", "shift+click"],
			// triggerStart: ["f2"],
			// triggerStart: ["f2", "dblclick", "shift+click", "mac+enter"],
			// f3 and space don't work, as in don't trigger the edit
			// triggerStart: ["f3", "dblclick", "shift+click", "space"],

			beforeEdit: $.noop,  // Return false to prevent edit mode
			// edit: $.noop,        // Editor was opened (available as data.input)
			// beforeEdit: function(event, data){
			// 	return false;
			// },
			edit: function(event, data){
					// Editor was opened (available as data.input)
			},

			beforeClose: $.noop, // Return false to prevent cancel/save (data.input is available)
			save: $.noop,         // Save data.input.val() or return false to keep editor open
			// close: $.noop,       // Editor was removed
			close: function(event, data) {
				// console.log("edit")
				if( data.save ){
					onOutlineChange();
					if( data.isNew ) {
						// Quick-enter: add new nodes until we hit [enter] on an empty title
						// $("#tree").trigger("nodeCommand", {cmd: "addSibling"});
						data.node.editCreateNode("after", makeNodeItem(""));
					}
					activateNode(data.node);
				}
			}
		},
		dnd: {
			autoExpandMS: 400,
			focusOnClick: true,
			preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
			preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
			dragStart: function(node, data) {
				/** This function MUST be defined to enable dragging for the tree.
				 *  Return false to cancel dragging of node.
				 */
				return true;
			},
			dragEnter: function(node, data) {
				/** data.otherNode may be null for non-fancytree droppables.
				 *  Return false to disallow dropping on node. In this case
				 *  dragOver and dragLeave are not called.
				 *  Return 'over', 'before, or 'after' to force a hitMode.
				 *  Return ['before', 'after'] to restrict available hitModes.
				 *  Any other return value will calc the hitMode from the cursor position.
				 */
				// Prevent dropping a parent below another parent (only sort
				// nodes under the same parent)
	/*           if(node.parent !== data.otherNode.parent){
					return false;
				}
				// Don't allow dropping *over* a node (would create a child)
				return ["before", "after"];
	*/
				 return true;
			},
			dragDrop: function(node, data) {
				/** This function MUST be defined to enable dropping of items on
				 *  the tree.
				 */
				data.otherNode.moveTo(node, data.hitMode);
			}
		},
		beforeActivate: function(event, data) {
			// is this if necessary
			if (tree) {
				// console.log('beforeActivate: ' + (tree.getActiveNode() ? tree.getActiveNode().title : "NO ACTIVE") + " " + data.node.title);
				selectNodesAll(false);
				// console.log(event);
			}
		},
		activate: function(event, data) {
			// console.log("activating")
			var node = data.node;
			node.setSelected(true);
			node.setFocus();
			$("#tree").focus();
			adjustButtons();
		},
		expand: function(event, data) {
			onOutlineChange();
		},
		collapse: function(event, data) {
			onOutlineChange();
		},
		lazyLoad: function(event, data) {
			// data.result = {url: "ajax-sub2.json"}
		},
		beforeSelect: function(event, data) {
			// console.log('beforeSelect')
		},
		select: function(event, data) {
			// console.log('*** select');
			// Display list of selected nodes
			// var selNodes = data.tree.getSelectedNodes();
			// console.log(selNodes);
		},
		click: function(event, data) {
			// console.log('*** click');

			var activeNode = tree.getActiveNode();
			var selNodes = data.tree.getSelectedNodes();
			var clickedNode = data.node;

			// If selecting the active node, and it's the only selected one, then it's a noop. 
			if ((event.metaKey) && (clickedNode === activeNode) && (selNodes.length === 0)) {
				return true;
			}
			else if (event.shiftKey) {
				selectContigNodes(activeNode, clickedNode);
				return false;
			}
			else if (event.metaKey) {
				// !!!need to disable double click here --- OR turn it off as edit trigger.
				// If clicking the active node, then the desire is to unselect it. So, have to make another node active. 
				if (clickedNode === activeNode) {
					// Make the first one the active node, unless that was the one they clicked on, in which case go to the next one down. 
					activeNode = selNodes[0];
					if (clickedNode === activeNode) {
						activeNode = selNodes[1];
					}
					activeNode.setActive();
					selectNodesAll(true);
					for (var aNode in selNodes) {
						selNodes[aNode].setSelected(true);
					}
					clickedNode.setSelected(false);
				}
				else {
					activeNode.setActive();
					clickedNode.toggleSelected();
				}

				// console.log('meta')
				// !!!What if activeNode is the one clicked on? Then need to set a different one active. Which one? 
				// and what if it's only one selected? 
				// console.log('last click msg: ' + clickedNode.isSelected());
				// console.log('active: ' + activeNode.title);
				return false;
			}
			// If clicking without the meta key, the idea is to unselect all, and activate the clicked one. 
			// That comes for free - unless the clicked node is the active one. Then need this code. 
			else if (clickedNode === activeNode) {
				// console.log('here');
				selectNodesAll(false);
				activeNode.setActive();
			}
		},
	//   keydown: function(event, data) {
	//     if( event.which === 32 ) {
	//       data.node.toggleSelected();
	//       return false;
	//     }
	//   },
	});
	tree = $("#tree").fancytree("getTree");
	$.ui.fancytree.debugLevel = 2;
	$("#tree").on("keydown", function(e){
	    var eStr = $.ui.fancytree.eventToString(e);
		var cmd = '';
	    // console.log( eStr );
	    // try edit commands
		cmd_el = commands.find(commands => commands.kbd === eStr);
		if (cmd_el) {
			cmd = cmd_el.cmd;
	    	if (can(cmd, tree.getActiveNode(), tree.getSelectedNodes())) {
	 			doCmd(cmd);
	    	}
	    }
	    // try navigation commands
	    else {
			cmd_el = navCommands.find(navCommands => navCommands.kbd === eStr);
			if (cmd_el) {
				cmd = cmd_el.cmd;
				doNavCmd(cmd);
		    }
	    }
	});
	$("#tree").focus(function() {
		var node = tree.getActiveNode();
		activateNode(node);
	});
	if (newTreeB) {
		setupNewTree();
	} else {
		var node  = getTitleNode();
		activateNode(node);
	}
	// $("#tree").focus();
	/*
	* Context menu (https://github.com/mar10/jquery-ui-contextmenu)
	*/
	$("#tree").contextmenu({
		delegate: "span.fancytree-node",
		// menu: [
		// 	{title: "Edit <kbd>[F2]</kbd>", cmd: "rename" },
		// 	{title: "Delete <kbd>[Del]</kbd>", cmd: "remove" },
		// 	{title: "----"},
		// 	{title: "New sibling <kbd>[Ctrl+N]</kbd>", cmd: "addSibling" },
		// 	{title: "New child <kbd>[Ctrl+Shift+N]</kbd>", cmd: "addChild" },
		// 	{title: "----"},
		// 	{title: "Cut <kbd>Ctrl+X</kbd>", cmd: "cut" },
		// 	{title: "Copy <kbd>Ctrl-C</kbd>", cmd: "copy" },
		// 	{title: "Paste as child<kbd>Ctrl+V</kbd>", cmd: "paste" }
		// ],
		menu: menuItemArray,
		beforeOpen: function(event, ui) {
			adjustMenus();
		},
		select: function(event, ui) {
			// delay the event, so the menu can close and the click event does
			// not interfere with the edit control
			setTimeout(function(){
				doCmd(ui.cmd);
			}, 100);
		}
	});
	// document.querySelector("#fileload").onchange=importFile;
});
