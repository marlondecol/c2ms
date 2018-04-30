function read() {
    console.log("read");
}

function write() {
    console.log("write");
}

function clear() {
    $("#values").trigger("reset");
}

$("#read").click(read);
$("#write").click(write);

$("#reset").click(clear);