$(() => {

    //Button handlers
    $("#generateBtn").click(generateGrid);

});

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

        for(let i=0; i < Number(numRows); i++) {
            for(let j=0; j < Number(numCols); j++) {
                $(".grid").append("<div class='cell'></div>");
            }
        }
    }
    else {

    }

    $("#generatingForm").hide();
    $("#gridContainer").show();
};