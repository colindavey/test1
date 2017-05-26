var tree;
var titleNode;
var localStorageSupported = true;

var commands = {
	add: {buttonLabel: "+", menuLabel: "Add", kbd: "ctrl+o"}, 
	delete: {buttonLabel:"-", menuLabel:"Delete", kbd: "del"},
	promote: {buttonLabel: "<", menuLabel: "Promote", kbd: "ctrl+h"},
	demote: {buttonLabel: '>', menuLabel: "Demote", kbd: "ctrl+l"},
	moveUp: {buttonLabel: "^", menuLabel: "Move Up", kbd: "ctrl+k"},
	moveDown: {buttonLabel: "v", menuLabel: "Move Down", kbd: "ctrl+j"}
};
var buttons = ["add", "delete", "promote", "demote", "moveUp", "moveDown"];
// var menuItems = ["add", "delete", "promote", "demote", "moveUp", "moveDown"];
var menuItems = ["add", "delete", "----", "promote", "demote", "----", "moveUp", "moveDown"];

// var glyph_opts = {
// 	map: {
// 	  doc: "glyphicon glyphicon-file",
// 	  docOpen: "glyphicon glyphicon-file",
// 	  checkbox: "glyphicon glyphicon-unchecked",
// 	  checkboxSelected: "glyphicon glyphicon-check",
// 	  checkboxUnknown: "glyphicon glyphicon-share",
// 	  dragHelper: "glyphicon glyphicon-play",
// 	  dropMarker: "glyphicon-arrow-right", // "glyphicon glyphicon-file", //glyphicon-arrow-right
// 	  error: "glyphicon glyphicon-warning-sign",
// 	  expanderClosed: "glyphicon glyphicon-menu-right",
// 	  expanderLazy: "glyphicon glyphicon-menu-right",  // glyphicon-plus-sign
// 	  expanderOpen: "glyphicon glyphicon-menu-down",  // glyphicon-collapse-down
// 	  folder: "glyphicon glyphicon-folder-close",
// 	  folderOpen: "glyphicon glyphicon-folder-open",
// 	  loading: "glyphicon glyphicon-refresh glyphicon-spin"
// 	}
// // map: {
// //   expanderClosed: "glyphicon glyphicon-menu-right",
// //   expanderOpen: "glyphicon glyphicon-menu-down"
// // }
// };

$(document).ready(function() {
	// for (var key in commands) {
	// 	console.log(key);
	// }
	var cmd;
	var newBut;
	var newButStr;
	// initialize the edit buttons
	for (var key in buttons) {
		cmd = buttons[key];
		buttonLabel = commands[cmd].buttonLabel;
		console.log(cmd);
		console.log(commands[cmd].buttonLabel);
		// Make buttons w html like
		// <input type="button" value="+" id="addButton" onclick="doCmd('add')">
		newButStr = "<input ";
		newButStr += "type='button' ";
		newButStr += "value='" + buttonLabel + "' ";
		newButStr += "id='" + cmd  + "Button" + "' ";
		newButStr += "onclick=" + '"doCmd(' + "'" + cmd  + "'" + ')"';
		newButStr += '/>';
		console.log(newButStr);
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
		item = {title: "----"};
		if (cmd !== '----') {
			menuLabel = commands[cmd].menuLabel;
			kbd = commands[cmd].kbd;
			menuLabel += '<kbd>' + kbd + '</kbd>';
			item = {title: menuLabel, cmd: cmd, kbd: kbd};
			// item = 
			// item = '{';
			// item += 'title: ' + menuLabel;
			// item += ', cmd: ' +  cmd;
			// item += '},';
		}
		menuItemArray[menuItemArray.length] = item;
	}
	console.log (menuItemArray);

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
			// jsonStore = localStorage.getItem("most_recent");
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
		selectMode :1,
		// forces change of focus to cause change of activation, loosing distinction between focused and active. 
		autoActivate: true,
		extensions: ["wide", "persist", "edit", "dnd"],
		// extensions: ["persist", "edit", "dnd"],
		// extensions: ["wide", "edit", "dnd"],
		// extensions: ["wide", "edit"],
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
			triggerStart: ["f2", "dblclick", "shift+click", "mac+enter"],
			beforeEdit: $.noop,  // Return false to prevent edit mode
			// edit: $.noop,        // Editor was opened (available as data.input)
			edit: function(event, data){
					// Editor was opened (available as data.input)
			},

			beforeClose: $.noop, // Return false to prevent cancel/save (data.input is available)
			save: $.noop,         // Save data.input.val() or return false to keep editor open
			close: $.noop,       // Editor was removed
			close: function(event, data) {
				console.log("edit")
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
		activate: function(event, data) {
	//        alert("activate " + data.node);
			// console.log("activating")
			var node = data.node;
			adjustButtons(node);
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
	//  select: function(event, data) {
	//     // Display list of selected nodes
	//     var selNodes = data.tree.getSelectedNodes();
	//     // convert to title/key array
	//     var selKeys = $.map(selNodes, function(node){
	//          return "[" + node.key + "]: '" + node.title + "'";
	//       });
	//     $("#echoSelection2").text(selKeys.join(", "));
	//   },
	//   click: function(event, data) {
	//     // We should not toggle, if target was "checkbox", because this
	//     // would result in double-toggle (i.e. no toggle)
	//     if( $.ui.fancytree.getEventTargetType(event) === "title" ){
	//       data.node.toggleSelected();
	//     }
	//   },
	//   keydown: function(event, data) {
	//     if( event.which === 32 ) {
	//       data.node.toggleSelected();
	//       return false;
	//     }
	//   },
	});
	tree = $("#tree").fancytree("getTree");
	$("#tree").on("keydown", function(e){
		var cmd = '';
	    var eStr = $.ui.fancytree.eventToString(e);
	    console.log( eStr );
	    // !!!This will be automoated from cmd table.
	    switch( eStr ) {
			case "ctrl+o":
				cmd = 'add';
				break;
			case "del":
				cmd = 'delete';
				break;
			case "ctrl+h":
				cmd = 'promote';
				break;
			case "ctrl+l":
				cmd = 'demote';
				break;
			case "ctrl+k":
				cmd = 'moveUp';
				break;
			case "ctrl+j":
				cmd = 'moveDown';
				break;
	    }
	    if (cmd) {
	    	if (can(cmd, tree.getActiveNode())) {
	 			doCmd(cmd);
	    	}
	    }
	});
	$("#tree").focus(function() {
  		// alert( "Handler for .focus() called." );
  		console.log("tree focus");
		var node = tree.getActiveNode();
		activateNode(node);
	});
	if (newTreeB) {
		setupNewTree();
	} else {
		// var node = tree.getActiveNode();
		var node  = getTitleNode();
		activateNode(node);
	}
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
			var node = $.ui.fancytree.getNode(ui.target);
			adjustMenus(node);
			node.setActive();
		},
		select: function(event, ui) {
			// delay the event, so the menu can close and the click event does
			// not interfere with the edit control
			setTimeout(function(){
				console.log(ui.cmd);
				doCmd(ui.cmd);
			}, 100);
		}
	});
});

function copyToClipboard(some_text) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(some_text).select();
  document.execCommand("copy");
  $temp.remove();
}

function setupNewTree() {
	var titleNode = getTitleNode();
	// titleNode.setActive();
	activateNode(titleNode);
	titleNode.editStart();
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
	// return makeNodeTitle("Untitled");
	return [
		makeNodeTitle("Untitled"), 
		// makeNodeItem("Item 1")
	];
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
				// console.log(parentNode.title);
				// console.log("parent is root");
				if (node.isFirstSibling()) {
					// console.log("is title");
					ret_val = true;
				}
			}
		}
	}
	return ret_val;
}

function doCmd(cmd) {
	console.log(cmd);
	var node = tree.getActiveNode();
	// !!!Is this if necessary? 
	if (node) {
		switch (cmd) {
			case "add":
				node.editCreateNode("after", makeNodeItem(""));
				// var newData = makeNodeItem("");
				// var newSibling = node.appendSibling(newData);
				// // newSibling.setActive();
				// activateNode(newSibling);
				// newSibling.editStart();
				// onOutlineChange();
				break;
			case "delete":
				var nextNodeToActivate = node.getNextSibling();
				if (nextNodeToActivate === null) {
					nextNodeToActivate = node.getPrevSibling();
				}
				if (nextNodeToActivate === null) {
					nextNodeToActivate = node.getParent();
				}
		        node.remove();
		        node = nextNodeToActivate;
				break;
			case "promote":
				var newSibling = node.getParent();
				node.moveTo(newSibling, 'after')
				break;
			case "demote":
				var newParent = node.getPrevSibling();
				node.moveTo(newParent, 'child')
				// necessary because fancy wants to collapse node after giving it a child. 
				newParent.setExpanded(true);
				break;
			case "moveUp":
				var newNextSibling = node.getPrevSibling();
				node.moveTo(newNextSibling, 'before')
				break;
			case "moveDown":
				var newPrevSibling = node.getNextSibling();
				node.moveTo(newPrevSibling, 'after')
				break;
		}
		if (cmd !== 'add') {
			activateNode(node);
			onOutlineChange();
		}
	}
}

function can(cmd, node) {
	var ret_val;
	switch (cmd) {
		case "add":
			ret_val = false;
			break;
		case "delete":
			ret_val = isTitle(node);
			break;
		case "promote":
			ret_val = isTitle(node) || node.getParent().isRootNode();
			break;
		case "demote":
			ret_val = isTitle(node) || isTitle(node.getPrevSibling()) || node.isFirstSibling();
			break;
		case "moveUp":
			ret_val = isTitle(node) || isTitle(node.getPrevSibling()) || node.isFirstSibling();
			break;
		case "moveDown":
			ret_val = isTitle(node) || node.isLastSibling();
			break;
	}
	return !ret_val;
}

function adjustMenus(node) {
	// !!!Is this if necessary? 
	if (node) {
		for (var key in menuItems) {
			cmd = menuItems[key];
			$("#tree").contextmenu("enableEntry", cmd, can(cmd, node));
		}
	}
}

function adjustButtons(node) {
	// !!!Is this if necessary? 
	if (node) {
		for (var key in buttons) {
			cmd = buttons[key];
			$("#" + cmd + "Button").prop('disabled', !can(cmd, node));
		}
	}
}

function activateNode(node) {
	node.setActive();
	node.setFocus();
	adjustButtons(node);
	$("#tree").focus();
}

function getJSON_string() {
	return JSON.stringify(tree.toDict(true));
}

function updateLocalStorage() {
	if (localStorageSupported) {
	  	jsonStore = getJSON_string();
	  	console.log(jsonStore);
		localStorage.setItem("most_recent", jsonStore);
	}
}

function onOutlineChange() {
	updateLocalStorage();
}

function clearOutline() {
	tree.clear();
	jsonStore = makeEmptyOutline();
	tree.reload(jsonStore);
	setupNewTree();
	onOutlineChange();
}

function copyJSON_toClipboard() {
	copyToClipboard(getJSON_string());
	alert("The outline JSON is now in your paste buffer. Save it to a textfile. To load the file, drag it into the browser. The drag does not actually work yet.")
}
