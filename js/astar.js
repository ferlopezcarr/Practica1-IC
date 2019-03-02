/* a-star algorithm */
var astar = {

    numberOfWallsPlaced: 0,

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
            isWall : false,
            weight: 0
        }
    },

    initGrid: function() {
        for(var x = 0; x < grid.length; x++) {
            for(var y = 0; y < grid[x].length; y++) {
                grid[x][y] = astar.newNode(x, y);
            }  
        }
    },

    generateRandomWalls : function(numberOfWalls, start, end) {
        numberOfWallsPlaced = 0;
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

    findIndexOfTheNodeWithLowestF(openList) {
        let index = 0;

        for (let i = 1; i < openList.length; ++i) {
            if (openList[i].f < openList[index].f) {
                index = i;
            }
        }

        return index;
    },

    itIsFinalNode(node, endNode) {
        return node.x == endNode.x && node.y == endNode.y;
    },

    getPath(node) {
        let path = [];
        let currentNode = node;
        
        while (currentNode.parent) {
            path.push(currentNode);
            currentNode = currentNode.parent;
        }

        return path.reverse();
    },

    search: function(start, end) {
        let openList = [];
        let neighbors;
        let currentNode;
        let indexOfTheCurrentNode;

        openList.push(start);

        while(openList.length > 0) {
            indexOfTheCurrentNode = astar.findIndexOfTheNodeWithLowestF(openList);
            currentNode = openList[indexOfTheCurrentNode];

            if (astar.itIsFinalNode(currentNode, end)) {
                return astar.getPath(currentNode);
            }

            currentNode.closed = true;
            openList.splice(indexOfTheCurrentNode, 1);

            neighbors = astar.neighbors(currentNode);

            for (let i = 0; i < neighbors.length; ++i) {
                let neighbor = neighbors[i];

                if (!neighbor.visited) {
                    neighbor.parent = currentNode;
                    neighbor.g = currentNode.g + astar.distance(currentNode, neighbor) + currentNode.weight;
                    neighbor.h = astar.distance(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.visited = true;

                    openList.push(neighbor);
                } else if (currentNode.g + astar.distance(currentNode, neighbor) < neighbor.g) {
                    neighbor.parent = currentNode;
                    neighbor.g = currentNode.g + astar.distance(currentNode, neighbor);
                    neighbor.h = astar.distance(neighbor, end);
                    neighbor.f = neighbor.h + neighbor.g;
                }
            }
        }

        return [];
    },

    distance: function(pos0, pos1) {
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
        if(astar.checkRange(x, y - 1, grid) && !grid[x][y - 1].isWall && !grid[x][y - 1].closed) {
            ret.push(grid[x][y-1]);
        }

       
        // East
        if(astar.checkRange(x, y + 1, grid)  && !grid[x][y + 1].isWall && !grid[x][y + 1].closed) {
            ret.push(grid[x][y+1]);
        }

        // South
        if(astar.checkRange(x + 1, y, grid)  && !grid[x + 1][y].isWall && !grid[x + 1][y].closed) {
            ret.push(grid[x+1][y]);
        }

        // North
        if(astar.checkRange(x - 1, y, grid) && !grid[x - 1][y].isWall && !grid[x - 1][y].closed) {
            ret.push(grid[x-1][y]);
        }

        // Southwest
        if(astar.checkRange(x + 1, y - 1, grid) && !grid[x + 1][y - 1].isWall && !grid[x + 1][y - 1].closed) {
            ret.push(grid[x+1][y-1]);
        }

        // Southeast
        if(astar.checkRange(x + 1, y + 1, grid) && !grid[x + 1][y + 1].isWall && !grid[x + 1][y + 1].closed) {
            ret.push(grid[x+1][y+1]);
        }

        // Northwest
        if(astar.checkRange(x - 1, y - 1, grid) && !grid[x - 1][y - 1].isWall && !grid[x - 1][y - 1].closed) {
            ret.push(grid[x-1][y-1]);
        }

        // Northeast
        if(astar.checkRange(x - 1, y + 1, grid) && !grid[x - 1][y + 1].isWall && !grid[x - 1][y + 1].closed) {
            ret.push(grid[x-1][y+1]);
        }

        return ret;
    }
  };