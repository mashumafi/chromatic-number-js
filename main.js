var nodes = [], selectedNode = -1, tempEdge = null, relative = {};

function Node(name, x, y, radius) {
  return {
    x: x,
    y: y,
    radius: radius,
    name: name,
    edges: [],
    fill: 'white',
    stroke: 'black',
    color: 'black'
  };
}

$mode = $('#mode');
$display = $('#display').mousedown(function(evt) {
  if($mode.val() === 'node') {
    nodes.push(Node(nodes.length, evt.offsetX, evt.offsetY, 10));
	clearNodeColors();
  } else if($mode.val() === 'edge') {
    for(var i = 0; i < nodes.length; i++) {
      var nodeA = nodes[i];
      if(Math.sqrt(Math.pow(nodeA.x - evt.offsetX, 2) + Math.pow(nodeA.y - evt.offsetY, 2)) < nodeA.radius) {
        selectedNode = i;
        break;
      }
    }
  } else if($mode.val() === 'move') {
    for(var i = 0; i < nodes.length; i++) {
      var nodeA = nodes[i];
      if(Math.sqrt(Math.pow(nodeA.x - evt.offsetX, 2) + Math.pow(nodeA.y - evt.offsetY, 2)) < nodeA.radius) {
        selectedNode = i;
		relative.x = nodeA.x - evt.offsetX;
		relative.y = nodeA.y - evt.offsetY;
        break;
      }
    }
  }
}).mouseup(function(evt) {
  if($mode.val() === 'edge') {
    if(selectedNode !== -1) {
      for(var i = 0; i < nodes.length; i++) {
        var nodeA = nodes[i];
        if(i !== selectedNode && Math.sqrt(Math.pow(nodeA.x - evt.offsetX, 2) + Math.pow(nodeA.y - evt.offsetY, 2)) < nodeA.radius
			&& !isInSet(nodeA.edges, nodes[selectedNode]) && !isInSet(nodes[selectedNode], nodeA.edges)) {
          nodeA.edges.push(nodes[selectedNode]);
          nodeA.radius += 10;
          nodes[selectedNode].edges.push(nodeA);
          nodes[selectedNode].radius += 10;
          clearNodeColors();
          break;
        }
      }
      selectedNode = -1;
      tempEdge = null;
    }
  } else if($mode.val() === 'move' && selectedNode !== -1) {
    selectedNode = -1;
  }
}).mousemove(function(evt) {
  if($mode.val() === 'edge') {
    if(selectedNode !== -1) {
      var nodeA = nodes[selectedNode];
      var vector = {
        x: evt.offsetX - nodeA.x,
        y: evt.offsetY - nodeA.y
      };
      var theta = Math.atan2(vector.y, vector.x);
      var point = {
        x: nodeA.radius * Math.cos(theta),
        y: nodeA.radius * Math.sin(theta)
      };
      tempEdge = [point, vector];
      tempEdge[0].x += nodeA.x;
      tempEdge[0].y += nodeA.y;
      tempEdge[1].x += nodeA.x;
      tempEdge[1].y += nodeA.y;
    }
  } else if($mode.val() === 'move' && selectedNode !== -1) {
	var nodeA = nodes[selectedNode];
	nodeA.x = evt.offsetX + relative.x;
	nodeA.y = evt.offsetY + relative.y;
  }
});
function clearNodeColors() {
	for(var i = 0; i < nodes.length; i++) {
		nodes[i].fill = 'white';
		nodes[i].color = 'black';
	}
}
var context = $display[0].getContext('2d');
setInterval(function() {
  context.clearRect(0, 0, $display.attr('width'), $display.attr('height'));
  for(var i = 0; i < nodes.length; i++) {
    var nodeA = nodes[i];
    context.beginPath();
    context.arc(nodeA.x, nodeA.y, nodeA.radius, 0, 2*Math.PI);
    context.strokeStyle = nodeA.sroke;
    context.stroke();
    context.fillStyle = nodeA.fill;
    context.fill();
    context.fillStyle = nodeA.color;
    context.textAlign = 'center';
    context.font = nodeA.radius + 'px sans-serif';
    context.textBaseline = 'center';
    context.fillText(nodeA.name, nodeA.x, nodeA.y);
    for(var j = 0; j < nodeA.edges.length; j++) {
      var nodeB = nodeA.edges[j];
      var theta = Math.atan2(nodeB.y - nodeA.y, nodeB.x - nodeA.x);
      var start = {
        x: nodeA.radius * Math.cos(theta),
        y: nodeA.radius * Math.sin(theta)
      };
      theta = Math.atan2(nodeA.y - nodeB.y, nodeA.x - nodeB.x);
      var end = {
        x: nodeB.radius * Math.cos(theta),
        y: nodeB.radius * Math.sin(theta)
      };
      var edge = [start, end];
      edge[0].x += nodeA.x;
      edge[0].y += nodeA.y;
      edge[1].x += nodeB.x;
      edge[1].y += nodeB.y;
      context.beginPath();
      context.moveTo(edge[0].x, edge[0].y);
      context.lineTo(edge[1].x, edge[1].y);
      context.stroke();
    }
    if(tempEdge !== null) {
      context.beginPath();
      context.moveTo(tempEdge[0].x, tempEdge[0].y);
      context.lineTo(tempEdge[1].x, tempEdge[1].y);
      context.stroke();
    }
    
  }
}, 1000 / 30);
$('#colorize').click(colorize);
function colorize() {
	nodes.sort(sortByEdgeLength);
	console.log("Sorted Nodes", nodes);
	for(var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		node.edges.sort(sortByEdgeLength);
	}
	console.log("Sorted edges", nodes);
	for(var i = 0; i < nodes.length; i++) {
		var nodeA = nodes[i];
		if(nodeA.fill === 'white') {
			var list = [];
			var color = Colors.rand();
			var complement = Colors.complement(color);
			nodeA.fill = color;
			nodeA.color = complement;
			unionEdges(list, nodeA);
			for(var j = i + 1; j < nodes.length; j++) {
				var nodeB = nodes[j];
				if(!isInSet(list, nodeB)) {
					nodeB.fill = color;
					nodeB.color = complement;
					unionEdges(list, nodeB);
				}
			}
		}
	}
}
function sortByEdgeLength(nodeA, nodeB) {
	return nodeB.edges.length - nodeA.edges.length;
}
function unionEdges(list, node) {
	for(var i = 0; i < list.length; i++) {
		if(list[i] === node) {
			break;
		} else if(list[i].edges.length < node.edges) {
			list.splice(i, 0, node);
			break;
		}
	}
	if(i === list.length) {
		list.push(node);
	}
	for(var i = 0; i < node.edges.length; i++) {
		var edge = node.edges[i];
		for(var j = 0; j < list.length; j++) {
			if(list[i] === edge) {
				break;
			} else if(list[i].edges.length < edge.edges) {
				list.splice(i, 0, edge);
				break;
			}
		}
		if(j === list.length) {
			list.push(edge);
		}
	}
}
function isInSet(list, node) {
	for(var i = 0; i < list.length; i++) {
		if(list[i] === node) {
			return true;
		}
	}
	return false;
}