let grid = [];
let start;
let end;
let k = 0;
let stepTime = 250;

$(() => {
    $("#generateBtn").click(generateGrid);
    $("#findPathBtn").click(findPathButtonHandler);
    $("#cleanGridBtn").click(cleanGridButtonHandler);
    $(".grid").on("click", ".cell", cellPressedHandler);
});


function getRow(numberOfTheCell) {
    return Math.floor(numberOfTheCell / grid[0].length);
}


function getColumn(numberOfTheCell) {
    return numberOfTheCell % grid[0].length;
}

function cellPressedHandler(event) {
    let row = Number(getRow($(this).index()));
    let column = Number(getColumn($(this).index()));
    let cell = $(".grid").children(".cell").eq(getIndex(row, column));

    if (!start) { 
        if (!grid[row][column].isWall && cell.is(':empty')) {
            start = {x : row, y : column};
            drawStartNode();
            $(".info").text("Push over a cell to indicate the end point");
        }
    } else if (!end && !grid[row][column].isWall && cell.is(':empty')) { 
        if (!grid[row][column].isWall) {
            end = {x : row, y : column};
            drawEndNode();
            $(".info").text("Push over any cell to create a new wall");
            $("#findPathBtn").prop("disabled", false);
        }
    } else if ((row != start.x || column != start.y) && (row != end.x || column != end.y) && !grid[row][column].isWall && cell.is(':empty')){ 
        grid[row][column].isWall = true;
        drawWall(row, column);
    }
}

//Button handlers

function cleanGridButtonHandler() {
    $(".grid").children(".cell").empty();
    for(let i = 0; i < grid.length; ++i) {
        for (let j = 0; j < grid[0].length; ++j) {
            grid[i][j].isWall = false;
        }
    }
}


function findPathButtonHandler() {
    let gridJqElem = $(".grid");
    let cell = gridJqElem.children(".cell").eq(getIndex(start.x, start.y));
    cell.empty();
    cell.append("<img src='img/humo.gif'>");

    $("#intialNodeLegend").attr('src', 'img/humo.gif');

    findPath();
}

function generateGrid() {

    $("#intialNodeLegend").attr('src', 'img/jerry-esperando.png');

    let numRows = Number($("#rows").val());
    let numCols = Number($("#columns").val());
    let numberOfWalls = Number($("#walls").val());
    start = undefined;
    end = undefined;

    if(numRows && numCols && numberOfWalls) {
        $("#rows").removeClass("is-invalid");
        $("#columns").removeClass("is-invalid");
        $("#walls").removeClass("is-invalid");

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

        $(".grid").empty();
        $(".grid").css({
            "grid-template-rows":       rowsCss,
            "grid-template-columns":    columnsCss
        });
        //$(".grid").hide();

        //inicializacion de la matriz tanto en css como en js
        for(let i=0; i < Number(numRows); i++) {
            grid[i] = [];
            for(let j=0; j < Number(numCols); j++) {
                $(".grid").append("<div class='cell'></div>");
                grid[i][j] = {};
            }
        }

        if(numRows > 15 || numCols > 15) {
            let cells = $(".cell");
            let height = cells.css("height");
            let width = cells.css("width");
            height = Number(height.slice(0, height.length-2));
            width = Number(width.slice(0, width.length-2));
            height = height*0.5;
            width = width*0.5;
            cells.css({
                "min-height" : height+"px",
                "min-width" : width+"px",
            });
        }
       
        //$(".grid").show();
        
        astar.init();
        astar.generateRandomWalls(numberOfWalls, start, end);
        drawWalls();
        $(".info").text("Push over a cell to indicate the starting point");

        $("#findPathBtn").prop("disabled", true);
        $("#cleanGridBtn").prop("disabled", false);
    } else {
        if(!numRows) {
            $("#rows").addClass("is-invalid");
            $("#columns").addClass("is-invalid");
            $("#walss").addClass("is-invalid");   
        }
    }
};


function drawStartNode() {
    let gridJqElem = $(".grid");

    let cell = gridJqElem.children(".cell").eq(getIndex(start.x, start.y));
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length-2));
    width = Number(width.slice(0, width.length-2));
    height = height*0.95;
    width = width*0.95;
    cell.append("<img src='img/jerry-esperando.png' height='"+height+"px' width='"+width+"px'>");
}


function drawEndNode() {
    let gridJqElem = $(".grid");

    let cell = gridJqElem.children(".cell").eq(getIndex(end.x, end.y));
    cell.empty();
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length-2));
    width = Number(width.slice(0, width.length-2));
    height = height*0.8;
    width = width*0.8;
    cell.append("<img src='img/agujero-roto.png' height='"+height+"px' width='"+width+"px'>");
}


function findPath(numberOfWalls) {
    let path = astar.search(start, end, numberOfWalls);
    draw(path);
}

function getIndex(row, col) {
    return (grid[0].length * row + col);
}

function drawWall(x, y) {
    let gridJqElem = $(".grid");
    let cell = gridJqElem.children(".cell").eq(getIndex(x, y));
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length-2));
    width = Number(width.slice(0, width.length-2));
    height = height*0.8;
    width = width*0.8;
    cell.append("<img src='img/trampa.png' height='"+height+"px' width='"+width+"px'>");
    cell.css({ "background-color" : "#ECDFBD"});
}

function drawWalls() {
    for(var x = 0; x < grid.length; x++) {
        for(var y = 0; y < grid[x].length; y++) {
            if (grid[x][y].isWall) {
                drawWall(x, y);
            } 
        }  
    }
}


function appendHuellas(cell, path) {
    let gridJqElem = $(".grid");
    let cellHeight = cell.css("height");
    let cellWidth = cell.css("width");
    cellHeight = Number(cellHeight.slice(0, cellHeight.length-2));
    cellWidth = Number(cellWidth.slice(0, cellWidth.length-2));
    let height = cellHeight*0.6;
    let width = cellWidth*0.6;

    if (path[k + 1].x == path[k].x + 1 && path[k + 1].y == path[k].y + 1 ) { //Down and right
        cell.append("<img class='huella' src='img/huella-abajo-derecha.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x + 1 && path[k + 1].y == path[k].y - 1) { //Down and left
        cell.append("<img class='huella' src='img/huella-abajo-izquierda.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x - 1 && path[k + 1].y == path[k].y + 1) { //Up and right
        cell.append("<img class='huella' src='img/huella-arriba-derecha.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x - 1 && path[k + 1].y == path[k].y - 1) { //Up and left
        cell.append("<img class='huella' src='img/huella-arriba-izquierda.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x + 1){ // Down
        cell.append("<img class='huella' src='img/huella-abajo.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x - 1) { // Up
        cell.append("<img class='huella' src='img/huella-arriba.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].y == path[k].y - 1) { // Left
        cell.append("<img class='huella' src='img/huella-izquierda.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].y == path[k].y + 1) { // Right
        cell.append("<img class='huella' src='img/huella-derecha.png' height='"+height+"px' width='"+width+"px'>");
    }

    if(k == path.length -2) {
        ++k;
        cell = gridJqElem.children(".cell").eq(getIndex(path[k].x, path[k].y));
        setTimeout(() => {
            cell.empty();
            cell.append("<img src='img/meta-conseguida.png' height='"+cellHeight+"px' width='"+cellWidth+"px'>");

            $("#gif").append("<img src='img/meta-conseguida.gif'>");
            $("#gif").parent().removeClass("d-none");
            setTimeout(function() {
                $("#gif").empty();
                $("#gif").parent().addClass("d-none");
            }, 7000);
        }, stepTime);
    }
    else if (k < path.length - 2) {
        ++k;
        cell = gridJqElem.children(".cell").eq(getIndex(path[k].x, path[k].y));
        setTimeout(() => {
            appendHuellas(cell, path);
        }, stepTime);
    } else {
        k = 0;
    }
}

function draw(path) {
    let gridJqElem = $(".grid");
    let textInfo = "";
    let cell;

    $(".info").empty();

    if (path.length == 0) {
        textInfo = "<span style='color: #E00024'>The end point is unreachable</span>";
        $("#gif").parent().empty();
        $("#gif").append("<img src='img/meta-conseguida.gif'>");
        $("#gif").parent().removeClass("d-none");
    } else {
        textInfo = "The path took " + path.length + " steps";
        cell = gridJqElem.children(".cell").eq(getIndex(path[k].x, path[k].y));
        appendHuellas(cell, path);
    }

    $(".info").append(textInfo);

    $("#findPathBtn").prop("disabled", true);
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

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