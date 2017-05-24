var tree;
var titleNode;
var localStorageSupported = true;
var glyph_opts = {
	map: {
	  doc: "glyphicon glyphicon-file",
	  docOpen: "glyphicon glyphicon-file",
	  checkbox: "glyphicon glyphicon-unchecked",
	  checkboxSelected: "glyphicon glyphicon-check",
	  checkboxUnknown: "glyphicon glyphicon-share",
	  dragHelper: "glyphicon glyphicon-play",
	  dropMarker: "glyphicon-arrow-right", // "glyphicon glyphicon-file", //glyphicon-arrow-right
	  error: "glyphicon glyphicon-warning-sign",
	  expanderClosed: "glyphicon glyphicon-menu-right",
	  expanderLazy: "glyphicon glyphicon-menu-right",  // glyphicon-plus-sign
	  expanderOpen: "glyphicon glyphicon-menu-down",  // glyphicon-collapse-down
	  folder: "glyphicon glyphicon-folder-close",
	  folderOpen: "glyphicon glyphicon-folder-open",
	  loading: "glyphicon glyphicon-refresh glyphicon-spin"
	}
// map: {
//   expanderClosed: "glyphicon glyphicon-menu-right",
//   expanderOpen: "glyphicon glyphicon-menu-down"
// }
};

$(document).ready(function() {
	// !!!redundancy alert
	$("#addButton").prop('disabled', true);
	$("#delButton").prop('disabled', true);
	$("#promoteButton").prop('disabled', true);
	$("#demoteButton").prop('disabled', true);
	$("#moveUpButton").prop('disabled', true);
	$("#moveDownButton").prop('disabled', true);
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
			console.log("activating")
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

function adjustButtons(node) {
	if (node) {
		var addDisable = false;
		var delDisable = false;
		var promoteDisable = false;
		var demoteDisable = false;
		var moveUpDisable = false;
		var moveDownDisable = false;
		if (isTitle(node)) {
			console.log("title activated");
			delDisable = true;
			promoteDisable = true;
			demoteDisable = true;
			moveUpDisable = true;
			moveDownDisable = true;
		} else if (isTitle(node.getPrevSibling())) {
			console.log("title is parent")
			promoteDisable = true;
			demoteDisable = true;
			moveUpDisable = true;
			if (node.isLastSibling()) {
				console.log("is last sibling")
				moveDownDisable = true;
			}
		} else {
			if (node.isFirstSibling()) {
				console.log("first sibling")
				moveUpDisable = true;
				demoteDisable = true;
			}
			if (node.isLastSibling()) {
				console.log("last sibling")
				moveDownDisable = true;
			}
			// if (node.isLastSibling()) {
			// 	moveDownDisable = true;
			// }
			if (node.getParent().isRootNode()) {
				console.log("parent is root, ie up against left wall")
				promoteDisable = true;
			}
		}
		// !!!redundancy alert
		$("#addButton").prop('disabled', addDisable);
		$("#delButton").prop('disabled', delDisable);
		$("#promoteButton").prop('disabled', promoteDisable);
		$("#demoteButton").prop('disabled', demoteDisable);
		$("#moveUpButton").prop('disabled', moveUpDisable);
		$("#moveDownButton").prop('disabled', moveDownDisable);
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

function addNode() {
	console.log('add');
	var node = tree.getActiveNode();
	if (node) {
		node.editCreateNode("after", makeNodeItem(""));
		// var newData = makeNodeItem("");
		// var newSibling = node.appendSibling(newData);
		// // newSibling.setActive();
		// activateNode(newSibling);
		// newSibling.editStart();
		// onOutlineChange();
	}
}

function delNode() {
	console.log('del')
	var node = tree.getActiveNode();
	if (node) {
		var nextNodeToActivate = node.getNextSibling();
		if (nextNodeToActivate === null) {
			nextNodeToActivate = node.getPrevSibling();
		}
		if (nextNodeToActivate === null) {
			nextNodeToActivate = node.getParent();
		}
        node.remove();
		activateNode(nextNodeToActivate);
		onOutlineChange();
	}
}

function promoteNode() {
	console.log('promote')
	var node = tree.getActiveNode();
	if (node) {
		var newSibling = node.getParent();
		node.moveTo(newSibling, 'after')
		// node.setActive();
		// sleep(200);
		activateNode(node);
		onOutlineChange();
	}
	copyToClipboard("foo");
}

function demoteNode() {
	console.log('demote')
	var node = tree.getActiveNode();
	if (node) {
		var newParent = node.getPrevSibling();
		node.moveTo(newParent, 'child')
		// necessary because fancy wants to collapse node after giving it a child. 
		newParent.setExpanded(true);
		// node.setActive();
		activateNode(node);
		onOutlineChange();
	}
}

function moveUpNode() {
	console.log('up')
	var node = tree.getActiveNode();
	if (node) {
		var newNextSibling = node.getPrevSibling();
		node.moveTo(newNextSibling, 'before')
		// node.setActive();
		activateNode(node);
		onOutlineChange();
	}
}

function moveDownNode() {
	console.log('down')
	var node = tree.getActiveNode();
	if (node) {
		var newPrevSibling = node.getNextSibling();
		node.moveTo(newPrevSibling, 'after')
		// node.setActive();
		activateNode(node);
		onOutlineChange();
	}
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
