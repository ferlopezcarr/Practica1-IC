$(() => {

    //Button handlers
    $("#generateBtn").click(generateGrid);
    findPath(grid);
    
});

var grid = [];

//Button handlers
function generateGrid() {

    let numRows = $("#rows").val();
    let numCols = $("#columns").val();

    if(numRows && numCols) {
        let rowsCss = "";
        let columnsCss = "";

        for(let i=0; i < Number(numRows); i++) {
            rowsCss += "1fr ";
        }
        rowsCss = rowsCss.trim();

        for(let i=0; i < Number(numCols); i++) {
            columnsCss += "1fr ";
        }
        columnsCss = columnsCss.trim();

        $(".grid").css({
            "grid-template-rows":       rowsCss,
            "grid-template-columns":    columnsCss
        });

        //inicializacion de la matriz tanto en css como en js
        for(let i=0; i < Number(numRows); i++) {
            grid[i] = [];
            for(let j=0; j < Number(numCols); j++) {
                $(".grid").append("<div class='cell'></div>");
                grid[i][j] = {};
            }
        }
    }
    else {

    }

    $("#generatingForm").hide();
    $("#gridContainer").show();
};

function findPath(grid) {
    let initX = $("#initNodeX").val();
    let initY = $("#initNodeY").val();

    let endX = $("#endNodeX").val();
    let endY = $("#endNodeY").val();

    if(initX && initY && endX && endY) {
        let start = astar.newNode(initX, initY);
        let end = astar.newNode(endX, endY);
        let path = a-star.search(grid, start, end);
        draw(path);
    }
    else {

    }
}

function getIndex(row, col) {
    return (grid[0].length * row + col);
}

function draw(path) {
    let gridJqElem = $(".grid");

    for(let node in path) {
        let cell = gridJqElem.index(getIndex(node.x, node.y));
        cell.css({
            "background-color": "red"
        });
    }

}



/* a-star algorithm */
var astar = {

    newNode: function(x,y,f,g,h,debug,parent) {
        return {
            x : (x ? x : -1),
            y : (y ? y : -1),
            f : (f ? f : 0),
            g : (g ? g : 0),
            h : (h ? h : 0),
            visited : (visited ? visited : false),
            closed : (closed ? closed : false),
            debug : (debug ? debug : ""),
            parent : (parent ? parent : null)
        }
    },

    init: function(grid) {
        for(var x = 0; x < grid.length; x++) {
            for(var y = 0; y < grid[x].length; y++) {
                grid[x][y] = newNode(x, y);
            }  
        }
    },

    search: function(grid, start, end) {
        astar.init(grid);

        var openList   = [];
        openList.push(start);

        while(openList.length > 0) {

            // Grab the lowest f(x) to process next
            var lowInd = 0;
            for(var i=0; i<openList.length; i++) {
                if(openList[i].f < openList[lowInd].f) { lowInd = i; }
            }
            var currentNode = openList[lowInd];

            // End case -- result has been found, return the traced path
            if(currentNode == end) {
                var curr = currentNode;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors
            openList.remove(lowInd);
            currentNode.closed = true;

            var neighbors = astar.neighbors(grid, currentNode);
            for(var i=0; i<neighbors.length;i++) {
                var neighbor = neighbors[i];

                if(neighbor.closed || neighbor.isWall()) {
                    // not a valid node to process, skip to next neighbor
                    continue;
                }

                // g score is the shortest distance from start to current node, we need to check if
                //   the path we have arrived at this neighbor is the shortest one we have seen yet
                var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
                var gScoreIsBest = false;

                if(!neighbor.visited) {
                    // This the the first time we have arrived at this node, it must be the best
                    // Also, we need to take the h (heuristic) score since we haven't done so yet

                    gScoreIsBest = true;
                    neighbor.h = heuristic(neighbor.pos, end.pos);
                    neighbor.visited = true;
                    openList.push(neighbor);
                }
                else if(gScore < neighbor.g) {
                    // We have already seen the node, but last time it had a worse g (distance from start)
                    gScoreIsBest = true;
                }

                if(gScoreIsBest) {
                    // Found an optimal (so far) path to this node.  Store info on how we got here and
                    //  just how good it really is...
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
                }
            }
        }

        // No result was found -- empty array signifies failure to find path
        return [];
    },

    heuristic: function(pos0, pos1) {
        var d1 = Math.pow(pos1.x - pos0.x);
        var d2 = Math.pow(pos1.y - pos0.y);
        return Math.sqrt(d1 + d2);
    },

    neighbors: function(grid, node) {
        var ret = [];
        var x = node.pos.x;
        var y = node.pos.y;
   
        // West
        if(grid[x-1] && grid[x-1][y]) {
            ret.push(grid[x-1][y]);
        }

        // East
        if(grid[x+1] && grid[x+1][y]) {
            ret.push(grid[x+1][y]);
        }

        // South
        if(grid[x] && grid[x][y-1]) {
            ret.push(grid[x][y-1]);
        }

        // North
        if(grid[x] && grid[x][y+1]) {
            ret.push(grid[x][y+1]);
        }

        // Southwest
        if(grid[x-1] && grid[x-1][y-1]) {
            ret.push(grid[x-1][y-1]);
        }

        // Southeast
        if(grid[x+1] && grid[x+1][y-1]) {
            ret.push(grid[x+1][y-1]);
        }

        // Northwest
        if(grid[x-1] && grid[x-1][y+1]) {
            ret.push(grid[x-1][y+1]);
        }

        // Northeast
        if(grid[x+1] && grid[x+1][y+1]) {
            ret.push(grid[x+1][y+1]);
        }

        return ret;
    }
  };
