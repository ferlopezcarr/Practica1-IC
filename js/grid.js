/* ------ Grid Javascript : Practica 1 - IC ------ */
/*Vars*/
let grid = [];
let initialStateGrid;
let start;
let end;
let k = 0;
let stepTime = 250;

let gridHtmlClon;
let gridMatrixClon = [];
var imgNode;

var numRows = 0;
var numCols = 0;

var waypointList = [];
var dangerpointList = [];


/*On load*/
$(() => {
    $('[data-toggle="popover"]').popover();

    $("#generateBtn").click(handleGenerateGrid);
    $("#findPathBtn").click(handleFindPath);
    $("#cleanPathBtn").click(handleRestoreClonedGrid);
    $(".legend-node").click(legendNodePressedHandler);
    $(".grid").on("click", ".cell", cellPressedHandler);
});


/*Aux funtions*/
function getIndex(row, col) {
    return (grid[0].length * row + col);
}

function getRow(numberOfTheCell) {
    return Math.floor(numberOfTheCell / grid[0].length);
}

function getColumn(numberOfTheCell) {
    return numberOfTheCell % grid[0].length;
}

function getJQuerySelectorOfCellPressed(row, column) {
    return $(".grid").children(".cell").eq(getIndex(row, column));
}

// The weight is equal to 20% of the diagonal size of the grid
function getWeightOfDangerpointNode() {
    return 0.2 * Math.sqrt(Math.pow(grid.length, 2) + Math.pow(grid[0].length, 2));
}

function freeNodes() {
    let totalNodes = numRows*numCols;
    if(start)
        totalNodes--;
    if(end)
        totalNodes--;
    totalNodes = totalNodes - numberOfWallsPlaced - waypointList.length - dangerpointList.length;
}

// This function establishes all the values to their inital values
function restart() {
    astar.initGridValuesToCleanPath();
    addNodeToLegend("#initialNode");
    addNodeToLegend("#endNode");
    $("#initialNode").attr('src', 'img/jerry-esperando.png');
    $("body").find(".selected").removeClass("selected");
    imgNode = undefined;
    start = undefined;
    end = undefined;
    k = 0;
    waypointList = [];
    dangerpointList = []
}

function addNodeToLegend(selector) {
    $(selector).parent().addClass("legend-node");
    $(selector).parent().removeClass("not-allowed");
}


/*Cell pressed handler*/

function cellPressedHandler(event) {
    let row = Number(getRow($(this).index()));
    let column = Number(getColumn($(this).index()));
    let cell = getJQuerySelectorOfCellPressed(row, column);
    
    if(imgNode) {
        switch($(imgNode).attr("id")) {
            case "initialNode":
                imgNode.parent().removeClass("selected");
                handleAddInitialNode(row, column, cell);
            break;
            case "wallNode":
                handleAddWallNode(row, column, cell);
            break;
            case "waypointNode":
                handleAddWaypointNode(row, column, cell);
            break;
            case "dangerpointNode":
                handleAddDangerpointNode(row, column, cell);
            break;
            case "endNode":
                imgNode.parent().removeClass("selected");
                handleAddEndNode(row, column, cell);
            break;
            case "removeNode":
                handleRemoveNode(row, column, cell);
            break;
        }
    }   
}

function legendNodePressedHandler(event) {
    imgNode = $(this).find("img");
    
    if ($(this).hasClass("selected")) {
        $(this).removeClass("selected");
        imgNode = undefined;
    } else if (!$(this).hasClass("not-allowed")) {
        $("body").find(".selected").removeClass("selected");
        $(this).addClass("selected");
    }
}

function handleAddInitialNode(row, column, cell) {
    if(freeNodes() == 0) {
        tomSay("No space!");
    }
    else if(grid[row][column].isWall || !cell.is(':empty')) {
        notifyNotEmptyNode();
    }
    else if(start) {
        tomSay("The start node is placed");
    }
    else {
        start = astar.newNode(row, column);
        drawStartNode();
        if(end) {
            $("#findPathBtn").prop("disabled", false);
        }
        $(imgNode).parent().removeClass("legend-node");
        $(imgNode).parent().addClass("not-allowed");
        imgNode = undefined;
    }
}

function handleAddWallNode(row, column, cell) {
    let canDrawWallNode = false;
    if(freeNodes() == 0) {
        tomSay("No space!");
    }
    else {
        if(start && end) {
            canDrawWallNode = ((row != start.x || column != start.y) && (row != end.x || column != end.y) && /*grid[row][column].isWall && */cell.is(':empty'));
        }
        else {
            canDrawWallNode = (!grid[row][column].isWall && cell.is(':empty'));
        }

        if(canDrawWallNode) {
            grid[row][column].isWall = true;
            drawWall(row, column);
            numberOfWallsPlaced++;
        }
        else {
            notifyNotEmptyNode();
        }
    }
}

function handleAddWaypointNode(row, column, cell) {
    if(freeNodes() == 0) {
        tomSay("No space!");
    }
    else if(grid[row][column].isWall || !cell.is(':empty')) {
        notifyNotEmptyNode();
    }
    else {
        grid[row][column].isWaypoint = true;
        waypointList.push(grid[row][column]);
        drawWaypointNode(row, column, waypointList.length-1);
    }
}

function handleAddDangerpointNode(row, column, cell) {
    if(freeNodes() == 0) {
        tomSay("No space!");
    }
    else if(grid[row][column].isWall || !cell.is(':empty')) {
        notifyNotEmptyNode();
    }
    else {
        grid[row][column].isDangerpoint = true;
        grid[row][column].weight = getWeightOfDangerpointNode();
        dangerpointList.push(grid[row][column]);
        drawDangerpointNode(row, column);
    }
}

function handleAddEndNode(row, column, cell) {
    if(freeNodes() == 0) {
        tomSay("No space!");
    }
    else if(grid[row][column].isWall || !cell.is(':empty')) {
        notifyNotEmptyNode();
    }
    else if(end) {
        tomSay("The end node is placed");
    }
    else {
        end = astar.newNode(row, column);
        drawEndNode();
        if(start) {
            $("#findPathBtn").prop("disabled", false);
        }
        $(imgNode).parent().removeClass("legend-node");
        $(imgNode).parent().addClass("not-allowed");
        imgNode = undefined;
    }
}

function handleRemoveNode(row, column, cell) {
    if(freeNodes() == (numRows*numCols)) {
        tomSay("Nothing to remove!");
    }
    else if(!cell.is(':empty')) {
        if(start && (start.x == row && start.y == column)) {
            start = undefined;
            $("#initialNode").parent().addClass("legend-node");
            $("#initialNode").parent().removeClass("not-allowed");
            $("#findPathBtn").prop("disabled", true);
        }
        else if(end && (end.x == row && end.y == column)) {
            end = undefined;
            $("#endNode").parent().addClass("legend-node");
            $("#endNode").parent().removeClass("not-allowed");
            $("#findPathBtn").prop("disabled", true);
        }
        else if(grid[row][column].isWall) {
            grid[row][column].isWall = false;
            numberOfWallsPlaced--;
        }
        else if(grid[row][column].isWaypoint) {
            grid[row][column].isWaypoint = false;
            let i = 0;
            let found = false;
            while(i < waypointList.length && !found) {
                found = ((waypointList[i].x == grid[row][column].x) && (waypointList[i].y == grid[row][column].y));
                i++;
            }
            if(found) {
                waypointList.splice(i-1, 1);
                drawWaypoints();
                
            }
        }
        else if(grid[row][column].isDangerpoint) {
            grid[row][column].isDangerpoint = false;
            let i = 0;
            let found = false;
            while(i < dangerpointList.length && !found) {
                found = ((dangerpointList[i].x == grid[row][column].x) && (dangerpointList[i].y == grid[row][column].y));
                i++;
            }
            if(found) {
                dangerpointList.splice(i-1, 1);
            }
        }

        cell.empty();
    }
}


/*Button handlers*/

function handleGenerateGrid() {
    restart();
    $("#initialNode").attr('src', 'img/jerry-esperando.png');

    numRows = Number($("#rows").val());
    numCols = Number($("#columns").val());
    let numberOfWalls = Number($("#walls").val());
    

    $("#rows").removeClass("is-invalid");
    $("#columns").removeClass("is-invalid");
    $("#walls").removeClass("is-invalid");

    if((numRows > 1 && numCols > 1 || (numRows + numCols) >= 3) && numberOfWalls >= 0) {
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
       
        $("#grid-card").removeClass("d-none");
        
        astar.initGrid();
        astar.generateRandomWalls(numberOfWalls, start, end);
        initialStateGrid = grid;

        drawWalls();

        tomSay("Select the node you want to add from the node list and then click on the desired cell", 4);

        $("#findPathBtn").prop("disabled", true);
        $("#cleanPathBtn").prop("disabled", true);
    } else {
        let positiveText = "You must introduce a positive number";
        if(numRows < 1) {
            $("#rowsInvalid").text(positiveText);
            $("#rows").addClass("is-invalid");
        }
        if(numCols < 1) {
            $("#columnsInvalid").text(positiveText);
            $("#columns").addClass("is-invalid");
        }
        if(numberOfWalls < 0) {
            $("#wallsInvalid").text(positiveText);
            $("#walls").addClass("is-invalid");
        }

        if(numRows == 1 && numCols == 1) {
            $("#rowsInvalid").text("The min dimension is 2x1 or 1x2");
            $("#rows").addClass("is-invalid");
        }
    }
};


function handleFindPath() {
    let cell = getJQuerySelectorOfCellPressed(start.x, start.y);
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length - 2));
    width = Number(width.slice(0, width.length - 2));
    height = height*0.85;
    width = width*0.85;
    cell.empty();
    cell.append("<img src='img/humo.gif' height='"+height+"' width='"+width+"'>");

    $("#initialNode").attr('src', 'img/humo.gif');

    findPath();
}

function handleRestoreClonedGrid() {
    grid = initialStateGrid;
    console.log(grid);
    drawGrid();
    drawWalls();
    restart();
}


/*Grid functions*/
/*--start node*/

function drawGrid() {
    $(".grid").empty();
    //inicializacion de la matriz tanto en css como en js
        for(let i=0; i < Number(numRows); i++) {
            for(let j=0; j < Number(numCols); j++) {
                $(".grid").append("<div class='cell'></div>");
            }
        }
}


function drawStartNode() {
    let cell = getJQuerySelectorOfCellPressed(start.x, start.y);
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length - 2));
    width = Number(width.slice(0, width.length - 2));
    height = height*0.95;
    width = width*0.95;
    cell.append("<img src='img/jerry-esperando.png' height='"+height+"px' width='"+width+"px'>");
}

/*--waypoint node*/
function drawWaypointNode(x, y, waypointListIndex) {
    let cell = getJQuerySelectorOfCellPressed(x, y);
    cell.empty();
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length-2));
    width = Number(width.slice(0, width.length-2));
    height = height*0.8;
    width = width*0.8;
    cell.append("<img src='img/queso.png' height='"+height+"px' width='"+width+"px'>");
    cell.append("<div class='number'><span>"+(Number(waypointListIndex)+1)+"</span></div>");
}


function drawWaypoints() {
    waypointList.forEach((wayPoint, index) => {
        drawWaypointNode(wayPoint.x, wayPoint.y, index);
    });
}

/*--dangerpoint node*/
function drawDangerpointNode(x, y) {
    let cell = getJQuerySelectorOfCellPressed(x, y);
    cell.empty();
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length-2));
    width = Number(width.slice(0, width.length-2));
    height = height*0.6;
    width = width*0.8;
    cell.append("<img src='img/dinamita.png' height='"+height+"px' width='"+width+"px'>");
}


/*--end node*/
function drawEndNode() {
    let cell = getJQuerySelectorOfCellPressed(end.x, end.y);
    cell.empty();
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length-2));
    width = Number(width.slice(0, width.length-2));
    height = height*0.8;
    width = width*0.8;
    cell.append("<img src='img/agujero-roto.png' height='"+height+"px' width='"+width+"px'>");
}

/*-- walls*/
function drawWalls() {
    for(var x = 0; x < grid.length; x++) {
        for(var y = 0; y < grid[x].length; y++) {
            if (grid[x][y].isWall) {
                drawWall(x, y);
            } 
        }  
    }
}

function drawWall(x, y) {
    let cell = getJQuerySelectorOfCellPressed(x, y);
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length-2));
    width = Number(width.slice(0, width.length-2));
    height = height*0.8;
    width = width*0.8;
    cell.append("<img src='img/trampa.png' height='"+height+"px' width='"+width+"px'>");
    cell.css({ "background-color" : "#ECDFBD"});
}

/*--path*/
function findPath() {
    console.log(waypointList);
    let path = [];
    if(!waypointList || waypointList.length == 0) {
        path = astar.search(grid[start.x][start.y], grid[end.x][end.y]);
        draw(path);
    }
    else if(waypointList.length >= 1) {
        let i = 0;

        path.push.apply(path, astar.search(grid[start.x][start.y], waypointList[i]));
        astar.initGridValuesForWaypointsPath();
        
        for(i = 0; i < waypointList.length - 1; i++) {
            // To append the entire content of the list to the path list
            path.push.apply(path, astar.search(waypointList[i], waypointList[i + 1]));
            astar.initGridValuesForWaypointsPath();
        }
        path.push.apply(path, astar.search(waypointList[waypointList.length - 1], grid[end.x][end.y]));
        draw(path);
    }
    
    //$(".tom").popover('hide');
}

function draw(path) {
    let textInfo = "";
    let cell;

    if (path.length == 0) {
        textInfo = "The point is unreachable";
        //$(".popover-body").addClass("no-path");
        //creo que cuando dice none es por esto
       
        $('#tv').modal('toggle');
        $("#tv-content").attr('src', 'img/no-camino.gif');
    } else if (path.length == 1) {
        textInfo = "The path took " + path.length + " steps";
        cell = getJQuerySelectorOfCellPressed(path[k].x, path[k].y);
        drawEndOfThePath(cell);
    } else {
        textInfo = "The path took " + path.length + " steps";
        cell = getJQuerySelectorOfCellPressed(path[k].x, path[k].y);
        appendHuellas(cell, path);
    }

    tomSay(textInfo, 3);

    $("#findPathBtn").prop("disabled", true);
    $("#cleanPathBtn").prop("disabled", false);
}

function appendHuellas(cell, path) {
    let cellHeight = cell.css("height");
    let cellWidth = cell.css("width");
    cellHeight = Number(cellHeight.slice(0, cellHeight.length-2));
    cellWidth = Number(cellWidth.slice(0, cellWidth.length-2));
    let height = cellHeight*0.6;
    let width = cellWidth*0.6;

    /*Calculate direction*/
    if(path[k].isDangerpoint) {
        cell.empty();
        cell.append("<img src='img/dinamita-apagada.png' height='"+cellHeight*0.5+"px' width='"+cellWidth*0.9+"px'>");
    } else if (path[k].isWaypoint) {
        // Only consider the waypoint if it's the next one
        if (waypointList[0].y == Number(getColumn(cell.index())) && waypointList[0].x == Number(getRow(cell.index()))) {
            cell.find("img").attr("src", "img/queso-mordido.png");
            waypointList.splice(0, 1);
        }
    } else if (path[k + 1].x == path[k].x + 1 && path[k + 1].y == path[k].y + 1 ) { //Down and right
        cell.find("img").css({"opacity": "0.5"});
        cell.append("<img style='position: absolute' class='huella' src='img/huella-abajo-derecha.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x + 1 && path[k + 1].y == path[k].y - 1) { //Down and left
        cell.find("img").css({"opacity": "0.5"});
        cell.append("<img style='position: absolute' class='huella' src='img/huella-abajo-izquierda.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x - 1 && path[k + 1].y == path[k].y + 1) { //Up and right
        cell.find("img").css({"opacity": "0.5"});
        cell.append("<img style='position: absolute' class='huella' src='img/huella-arriba-derecha.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x - 1 && path[k + 1].y == path[k].y - 1) { //Up and left
        cell.find("img").css({"opacity": "0.5"});
        cell.append("<img  style='position: absolute' class='huella' src='img/huella-arriba-izquierda.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x + 1){ // Down
        cell.find("img").css({"opacity": "0.5"});
        cell.append("<img style='position: absolute' class='huella' src='img/huella-abajo.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].x == path[k].x - 1) { // Up
        cell.find("img").css({"opacity": "0.5"});
        cell.append("<img style='position: absolute' class='huella' src='img/huella-arriba.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].y == path[k].y - 1) { // Left
        cell.find("img").css({"opacity": "0.5"});
        cell.append("<img style='position: absolute' class='huella' src='img/huella-izquierda.png' height='"+height+"px' width='"+width+"px'>");
    } else if (path[k + 1].y == path[k].y + 1) { // Right
        cell.find("img").css({"opacity": "0.5"});
        cell.append("<img style='position: absolute' class='huella' src='img/huella-derecha.png' height='"+height+"px' width='"+width+"px'>");
    }

    if(k == path.length - 2) {
        ++k;
        cell = getJQuerySelectorOfCellPressed(path[k].x, path[k].y);
        setTimeout(function() {
            cell.empty();
            if(path[k].isWaypoint) {
                cell.append("<img src='img/jerry-queso.png' height='"+cellHeight*0.9+"px' width='"+cellWidth*0.9+"px'>");
            }
            else {
                drawEndOfThePath(cell);
                
            }
        }, stepTime, path);
    }
    else if (k < path.length - 2) {
        ++k;
        cell = getJQuerySelectorOfCellPressed(path[k].x, path[k].y);
        setTimeout(() => {
            appendHuellas(cell, path);
        }, stepTime);
    } else {
        k = 0;
    }
}

function drawEndOfThePath(cell) {
    let cellHeight = cell.css("height");
    let cellWidth = cell.css("width");

    cell.empty();
    cell.append("<img src='img/meta-conseguida.png' height='"+cellHeight+"px' width='"+cellWidth+"px'>");
                
    $('#tv').modal('toggle');
    $("#tv-content").attr('src', 'img/meta-conseguida.gif');
    if(waypointList && waypointList.length > 0) {
        setTimeout(function() {
            $("#tv-content").attr('src', 'img/jerry-comiendo.gif');
        }, 4000);
    }
}

/*Notifiers*/
function notifyNotEmptyNode() {
    $(".tom").popover('show');
    $(".popover-body").text("The node is not empty");
    setTimeout(function() {
        $(".tom").popover('hide');
    },2000);
}

function tomSay(text, seconds) {
    $(".tom").popover('show');
    $(".popover-body").text(text);
    setTimeout(function() {
        $(".tom").popover('hide');
    }, (seconds ? seconds * 1000 : 2000 ));
}