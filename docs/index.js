var tree;
var titleNode;
var localStorageSupported = true;

var commands = [
	{cmd: "add", buttonLabel: "+", menuLabel: "Add", kbd: "ctrl+o"}, 
	{cmd: "addAbove", buttonLabel: "+^", menuLabel: "Add Above", kbd: "ctrl+shift+o"}, 
	{cmd: "addFirstChild", buttonLabel: "+\\", menuLabel: "Add First Child", kbd: "alt+ctrl+o"}, 
	{cmd: "addLastChild", buttonLabel: "+\\^", menuLabel: "Add Last Child", kbd: "alt+ctrl+shift+o"}, 
	{cmd: "delete", buttonLabel:"-", menuLabel:"Delete", kbd: "del"},
	{cmd: "promote", buttonLabel: "<", menuLabel: "Promote", kbd: "ctrl+h"},
	{cmd: "promoteAbove", buttonLabel: "<^", menuLabel: "Promote Above", kbd: "ctrl+shift+h"},
	{cmd: "demote", buttonLabel: '>', menuLabel: "Demote", kbd: "ctrl+l"},
	{cmd: "demoteFirstChild", buttonLabel: '>Y', menuLabel: "Demote To First Child", kbd: "ctrl+shift+l"},
	{cmd: "moveUp", buttonLabel: "^", menuLabel: "Move Up", kbd: "ctrl+k"},
	{cmd: "moveDown", buttonLabel: "v", menuLabel: "Move Down", kbd: "ctrl+j"}
];
var buttons = ["add", "addFirstChild", "delete", "promote", "demote", "moveUp", "moveDown"];
var menuItems = ["add", "addAbove", "addFirstChild", "addLastChild", "delete", "----", "promote", "promoteAbove", "demote", "demoteFirstChild", "----", "moveUp", "moveDown"];

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
			case "promoteAbove":
				var newSibling = node.getParent();
				node.moveTo(newSibling, 'before')
				break;
			case "demote":
				var newParent = node.getPrevSibling();
				node.moveTo(newParent, 'child')
				// necessary because fancy wants to collapse node after giving it a child. 
				newParent.setExpanded(true);
				break;
			case "demoteFirstChild":
				var newParent = node.getPrevSibling();
				if (newParent.hasChildren()) {
					var newAfterNode = newParent.getFirstChild();
					node.moveTo(newAfterNode, 'before')
				}
				else {
					node.moveTo(newParent, 'child')
				}
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
		if (cmd !== 'add' && cmd !== 'addAbove' && cmd !== 'addFirstChild' && cmd !== 'addLastChild') {
			activateNode(node);
			onOutlineChange();
		} else {
			return false;
		}
	}
}

function can(cmd, node) {
	var ret_val;
	// the switch statement determines if it *can't* do it. the result gets negated in the return statement. 
	switch (cmd) {
		case "add":
			ret_val = false;
			break;
		case "addAbove":
		case "addFirstChild":
		case "addFirstChildAbove":
		case "delete":
			ret_val = isTitle(node);
			break;
		case "promoteAbove":
		case "promote":
			ret_val = isTitle(node) || node.getParent().isRootNode();
			break;
		case "demote":
		case "demoteFirstChild":
		case "moveUp":
			ret_val = isTitle(node) || isTitle(node.getPrevSibling()) || node.isFirstSibling();
			break;
		case "moveDown":
			ret_val = isTitle(node) || node.isLastSibling();
			break;
	}
	return !ret_val;
}

$(document).ready(function() {
	var cmd;
	var newBut;
	var newButStr;
	var cmd_el;
	// initialize the edit buttons
	for (var key in buttons) {
		cmd = buttons[key];

			// buttonLabel = commands[cmd].buttonLabel;
		cmd_el = commands.find(commands => commands.cmd === cmd);
		buttonLabel = cmd_el.buttonLabel;

		console.log(cmd);
		console.log(buttonLabel);
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
		console.log(cmd);
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
			console.log("index " + node);
			// console.log("index " + node.getIndex());
			// console.log("index"); //" + node.getIndex());
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
	$.ui.fancytree.debugLevel = 2;
	$("#tree").on("keydown", function(e){
	    var eStr = $.ui.fancytree.eventToString(e);
		var cmd = '';
	    var node = tree.getActiveNode();
	    console.log( eStr );
	    // try edit commands
		cmd_el = commands.find(commands => commands.kbd === eStr);
		if (cmd_el) {
			cmd = cmd_el.cmd;
	    	if (can(cmd, node)) {
	 			doCmd(cmd);
	    	}
	    }
	    // try navigation commands
	    else {
	    	var nextNode = null;
	    	KC = $.ui.keyCode;
		    switch( eStr ) {
		    	// down to next line
				case "j":
					node.navigate(KC.DOWN, true);
					break;
		    	// jump down:
		    	// if next sibling is expanded and has children, jump to next sibling, skipping over children
		    	// otherwise, jump to last sibling (parent's last child)
		    	// otherwise, treat like normal down nav. 
				case "shift+j":
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
				case "k":
					node.navigate(KC.UP, true);
					break;
		    	// jump up:
		    	// if next sibling is expanded and has children, jump to next sibling, skipping over children
		    	// otherwise, jump to first sibling (parent's first child)
		    	// otherwise, treat like normal down nav. 
				case "shift+k":
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
				case "space":
					// cmd = 'expand/collapse';
					// node.setExpanded(!node.isExpanded());
					node.toggleExpanded();
					break;
		    }
	    }
	    // console.log( cmd );
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

function exportFile() {
	alert("Export: Not yet...")
}

function importFile() {
	alert("Import: Not yet...")
}
