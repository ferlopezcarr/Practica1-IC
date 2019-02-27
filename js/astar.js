
/* a-star algorithm */
var astar = {
    newNode: function(x,y) {
        return {
            x : Number(x),
            y : Number(y),
            f : 0,
            g : 0,
            h : 0,
            visited : false,
            closed : false,
            debug : "",
            parent : null,
            isWall : false
        }
    },

    init: function() {
        for(var x = 0; x < grid.length; x++) {
            for(var y = 0; y < grid[x].length; y++) {
                grid[x][y] = astar.newNode(x, y);
            }  
        }
    },

    generateRandomWalls : function(numberOfWalls, start, end) {
        let numberOfWallsPlaced = 0;
        numberOfWalls = Math.min(grid.length * grid[0].length - 2, numberOfWalls);

        while (numberOfWallsPlaced < numberOfWalls) {

            let row = Math.floor(grid.length * Math.random());
            let column = Math.floor(grid[0].length * Math.random());

            if (astar.checkRange(row, column) && 
                !grid[row][column].isWall){

                    grid[row][column].isWall = true;
                    ++numberOfWallsPlaced;
            }            
        }
        console.log("Walls generated : " + numberOfWallsPlaced);
    },

    search: function(start, end, numberOfWalls) {
        //astar.init();
        //astar.generateRandomWalls(numberOfWalls, start, end);

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
            if(currentNode.x == end.x && currentNode.y == end.y) {
                var curr = currentNode;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors
            openList.splice(lowInd, 1);
            currentNode.closed = true;

            var neighbors = astar.neighbors(currentNode);
            for(var i=0; i<neighbors.length;i++) {
                var neighbor = neighbors[i];

                if(neighbor.closed || neighbor.isWall) {
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
                    neighbor.h = astar.heuristic(neighbor, end);
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
        var d1 = Math.pow(Number(pos1.x) - Number(pos0.x), 2);
        var d2 = Math.pow(Number(pos1.y) - Number(pos0.y), 2);
        return Math.sqrt(d1 + d2);
    },

    checkRange: function(row, column) {
        return row >= 0 && row < grid.length && column >= 0 && column < grid[0].length;
    },

    neighbors: function(node) {
        var ret = [];
        var x = Number(node.x);
        var y = Number(node.y);
   
        // West
        if(astar.checkRange(x, y - 1, grid)) {
            ret.push(grid[x][y-1]);
        }

       
        // East
        if(astar.checkRange(x, y + 1, grid)) {
            ret.push(grid[x][y+1]);
        }

        // South
        if(astar.checkRange(x + 1, y, grid)) {
            ret.push(grid[x+1][y]);
        }

        // North
        if(astar.checkRange(x - 1, y, grid)) {
            ret.push(grid[x-1][y]);
        }

        // Southwest
        if(astar.checkRange(x + 1, y - 1, grid)) {
            ret.push(grid[x+1][y-1]);
        }

        // Southeast
        if(astar.checkRange(x + 1, y + 1, grid)) {
            ret.push(grid[x+1][y+1]);
        }

        // Northwest
        if(astar.checkRange(x - 1, y - 1, grid)) {
            ret.push(grid[x-1][y-1]);
        }

        // Northeast
        if(astar.checkRange(x - 1, y + 1, grid)) {
            ret.push(grid[x-1][y+1]);
        }

        return ret;
    }
  };