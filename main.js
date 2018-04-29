//This nb-extension searches the Markdown Cells of Jupyter for the keyword SWAN
// and replace it with it's logo's image at render time, without changing the data. 
define([
	'base/js/namespace',
	'jquery',
	'require',
	'notebook/js/cell',
	'base/js/events'
], function (IPython, $, requirejs, cell, events) {
	"use strict";

	/*
	* This Method finds the SWAN keyword from the to-be-rendered text of the html
	* and replaces it with the logo of the same as an image tag for the html.

	*@method findAndReplace

	*@param cell- the current cell
	*@param text-the text of cell 
	* returns- the new text to be rendered
	*/
	var find_replace = function (orig_text) {
		var tempDivElement = document.createElement("div");
		tempDivElement.innerHTML = orig_text;
		var a = $(tempDivElement).each(function () {
			parseNodes(this);
		});

		function parseNodes(node) {
			var nextNode;
			if (node.nodeType === 1) {
				if (node = node.firstChild) {
					do {
						nextNode = node.nextSibling;
						parseNodes(node);
					} while (node = nextNode);
				}
			} else if (node.nodeType === 3) {
				if (/SWAN/.test(node.data)) {
					var a = node;
					var temp = document.createElement('div');
					temp.setAttribute("style", "display:inline-block;");
					temp.innerHTML = node.data.replace(/SWAN/g, "<img style = \" display:inline; height:1em; position: relative; width:auto\" src = " + requirejs.toUrl('./swan.png') + "/>");
					node.parentNode.replaceChild(temp, node);
				}
			}
		}
		var repl_text = tempDivElement.innerHTML;
		return repl_text;
	};

	// This Method renders the Markdown Code and inputs the new text as html 
	var render_cell = function (cell) {
		var origtext = cell.element.find('div.text_cell_render');
		var newtext = find_replace(origtext[0].innerHTML);
		origtext[0].innerHTML = newtext;
	};

	//When Notebook first open, this function renders all cells which meet criteria
	var on_runtime = function () {
		var ncells = IPython.notebook.ncells();
		var cells = IPython.notebook.get_cells();
		for (var i = 0; i < ncells; i++) {
			var cell = cells[i];
			if (cell.cell_type === "markdown") {
				render_cell(cell)
			}
		}
	};

	// Load the event and cell and begin the rendering change 
	var load_ipython_extension = function () {
		events.on("rendered.MarkdownCell", function (event, data) {
			render_cell(data.cell);
		});
		if (Jupyter.notebook) {
			on_runtime()
		}
	};
	return {
		load_ipython_extension: load_ipython_extension
	};
});