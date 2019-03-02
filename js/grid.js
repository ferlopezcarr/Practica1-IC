let grid = [];
let start;
let end;
let k = 0;
let stepTime = 250;
let generatedGridClon;

$(() => {
    $('[data-toggle="popover"]').popover();

    $("#generateBtn").click(generateGrid);
    $("#findPathBtn").click(findPathButtonHandler);
    $("#cleanPathBtn").click(restoreClonedGrid);
    $("#initialNodeDiv").click(drawStartNode);
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
            start = astar.newNode(row, column);
            drawStartNode();
            $(".tom").attr("data-content", "Push over a cell to indicate the end point");
            $(".tom").popover('show');
        }
    } else if (!end && !grid[row][column].isWall && cell.is(':empty')) { 
        if (!grid[row][column].isWall) {
            end = astar.newNode(row, column);
            drawEndNode();
            $(".tom").attr("data-content", "Push over a cell to to create a new wall");
            $(".tom").popover('show');
            $("#findPathBtn").prop("disabled", false);
            $("#cleanPathBtn").prop("disabled", true);
        }
    } else if ((row != start.x || column != start.y) && (row != end.x || column != end.y) && !grid[row][column].isWall && cell.is(':empty')){ 
        grid[row][column].isWall = true;
        drawWall(row, column);
    }
}

//Button handlers

function findPathButtonHandler() {
    let gridJqElem = $(".grid");
    let cell = gridJqElem.children(".cell").eq(getIndex(start.x, start.y));
    cell.empty();
    cell.append("<img src='img/humo.gif'>");

    $("#intialNodeLegend").attr('src', 'img/humo.gif');

    findPath();
}

function restoreClonedGrid() {
    
    let gridContainer = $(".grid").parent();
    gridContainer.empty();
    gridContainer.append(generatedGridClon);
}

function generateGrid() {

    $("#intialNodeLegend").attr('src', 'img/jerry-esperando.png');

    let numRows = Number($("#rows").val());
    let numCols = Number($("#columns").val());
    let numberOfWalls = Number($("#walls").val());
    start = undefined;
    end = undefined;

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
        drawWalls();
        generatedGridClon = $(".grid").clone();

        $(".tom").attr("data-content", "Select the node you want to add from the node list and then click on the desired cell");
        $(".tom").popover('show');

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


function drawStartNode() {
    let gridJqElem = $(".grid");

    let cell = gridJqElem.children(".cell").eq(getIndex(start.x, start.y));
    let height = cell.css("height");
    let width = cell.css("width");
    height = Number(height.slice(0, height.length - 2));
    width = Number(width.slice(0, width.length - 2));
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


function findPath() {
    let path = astar.search(grid[start.x][start.y], grid[end.x][end.y]);
    $(".tom").popover('hide');
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

    if(k == path.length - 2) {
        ++k;
        cell = gridJqElem.children(".cell").eq(getIndex(path[k].x, path[k].y));
        setTimeout(() => {
            cell.empty();
            cell.append("<img src='img/meta-conseguida.png' height='"+cellHeight+"px' width='"+cellWidth+"px'>");

            $('#tv').modal('toggle');
            $("#tv-content").attr('src', 'img/meta-conseguida.gif');
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

    $(".tom").attr("data-content", "");

    if (path.length == 0) {
        textInfo = "The end point is unreachable";
        $(".popover-body").addClass("no-path");
        setTimeout(function() {
            $(".popover-body").removeClass("no-path");
            $(".tom").popover('hide');
        },3000);
        $('#tv').modal('toggle');
        $("#tv-content").attr('src', 'img/no-camino.gif');
    } else {
        textInfo = "The path took " + path.length + " steps";
        cell = gridJqElem.children(".cell").eq(getIndex(path[k].x, path[k].y));
        appendHuellas(cell, path);
    }

    $(".tom").attr("data-content", textInfo);
    $(".tom").popover('show');

    $("#findPathBtn").prop("disabled", true);
    $("#cleanPathBtn").prop("disabled", false);
}

