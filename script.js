// element declarations
const grid_btn = document.getElementById("grid-btn");
const solve_btn = document.getElementById("solve-btn");
const maze_grid = document.getElementById("maze-grid");
const width_entry = document.getElementById("maze-width");
const height_entry = document.getElementById("maze-height");
const algorithm_select = document.getElementById("algo-select");
const stepper_bar = document.getElementById("stepper");
const reset_btn = document.getElementById("reset-btn");
const modal = document.getElementById("modal");
const help_btn = document.getElementById("help-btn");
const close_span = document.getElementById("close-span");

// constants
const WALL = 0;
const START = 1;
const END = 2;

// vars
var mode = WALL;
var start_node = null;
var end_node = null;
var walls = [];
var columns = 0;
var rows = 0;

// stepper vars
var logs = [];
var old_step = 0;

// event listeners
grid_btn.addEventListener("click", makeGrid);
solve_btn.addEventListener("click", solveMaze);
stepper_bar.addEventListener("input", changeState);
reset_btn.addEventListener("click", resetGrid);
close_span.addEventListener("click", function (){modal.style.display = "none";});
help_btn.addEventListener("click", function (){modal.style.display = "block";})


// history struct
class history {
    constructor(node, old_state, new_state){
        this.node = node;
        this.old_state = old_state;
        this.new_state = new_state;
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function add_log(node, new_state){
    if (node.classList.length > 1){
        const ret = new history(node, node.classList[1], new_state);
        return ret;
    } else {
        const ret = new history(node, null, new_state);
        return ret;
    }
}

function changeState(){
    let new_step = Number(stepper_bar.value);
    let current = null;
    if (new_step == old_step){
    } else if (new_step >= old_step){
        for (let i = old_step; i < new_step; i++){
            current = logs[i];
            if (current.old_state != null){
                current.node.classList.remove(current.old_state);
            }
            current.node.classList.add(current.new_state);
        }
        old_step = new_step;
    } else {
        for (let i = old_step - 1; i >= new_step; i--){
            current = logs[i];
            current.node.classList.remove(current.new_state);
            if (current.old_state != null){
                current.node.classList.add(current.old_state);
            }
            
        }
        old_step = new_step;
    }
}

function resetGrid(){
    let current = null;
    for (let row = 0; row < rows; row++){
        for (let col = 0; col < columns; col++){
            current = document.getElementById("btn-" + col + "-" + row);
            if (current.classList.contains("closed")){
                current.classList.remove("closed");
            }
            if (current.classList.contains("open")){
                current.classList.remove("open");
            }
            if (current.classList.contains("path")){
                current.classList.remove("path");
            }
            current.setAttribute("data-parent-x", "");
            current.setAttribute("data-parent-y", "");
            current.setAttribute("data-f", -1);
            current.setAttribute("data-g", -1);
            current.setAttribute("data-h", -1);
        }
    }
    logs = [];
    old_step = 0;
    stepper_bar.value = 0;
    stepper_bar.max = 0;
}

function makeGrid(){
    // create new grid in new_body
    const old_body = maze_grid.getElementsByTagName("tbody")[0];
    const new_body = document.createElement("tbody");
    new_body.classList.add("maze-body");

    columns = width_entry.value;
    rows = height_entry.value;

    for (var row = 0; row < rows; row++){
        const maze_row = document.createElement("tr");
        for (var col = 0; col < columns; col++){
            // button initialization
            const maze_elem = document.createElement("td");
            const elem_btn = document.createElement("button");
            const x_attr = document.createAttribute("data-x");
            const y_attr = document.createAttribute("data-y");
            const f_cost_attr = document.createAttribute("data-f");
            const g_cost_attr = document.createAttribute("data-g");
            const h_cost_attr = document.createAttribute("data-h");
            const parent_x = document.createAttribute("data-parent-x");
            const parent_y = document.createAttribute("data-parent-y");

            x_attr.value = col;
            y_attr.value = row;
            f_cost_attr.value = -1;
            g_cost_attr.value = -1;
            h_cost_attr.value = -1;
            elem_btn.setAttributeNode(x_attr);
            elem_btn.setAttributeNode(y_attr);
            elem_btn.setAttributeNode(f_cost_attr);
            elem_btn.setAttributeNode(g_cost_attr);
            elem_btn.setAttributeNode(h_cost_attr);
            elem_btn.setAttributeNode(parent_x);
            elem_btn.setAttributeNode(parent_y);

            elem_btn.id = "btn-" + col + "-" + row;
            elem_btn.classList.add("grid-node");
            maze_elem.appendChild(elem_btn);
            maze_row.appendChild(maze_elem);

            elem_btn.onclick = function (){
                clickGrid(elem_btn);
            }
        }
        new_body.appendChild(maze_row);
    }
    maze_grid.replaceChild(new_body, old_body);
    start_node = null;
    end_node = null;
    walls = [];
}

function clickGrid(self){
    if (mode == WALL){
        if (self.classList.contains("wall")){
            self.classList.remove("wall");
            walls = walls.filter(x => x != self);
        } else {
            self.classList.add("wall");
            walls.push(self);
            if (self.classList.contains("start")){
                start_node = null;
                self.classList.remove("start");
            }
            if (self.classList.contains("end")){
                end_node = null;
                self.classList.remove("end");
            }
        }
    } else if (mode == START){
        if (start_node != null){
            start_node.classList.remove("start");
        }
        if (self.classList.contains("start")){
            start_node = null;
            self.classList.remove("start");
        } else {
            self.classList.add("start");
            start_node = self;
            if (self.classList.contains("end")){
                end_node = null;
                self.classList.remove("end");
            }
            if (self.classList.contains("wall")){
                self.classList.remove("wall");
            }
        }
    } else if (mode == END){
        if (end_node != null){
            end_node.classList.remove("end");
        }
        if (self.classList.contains("end")){
            end_node = null;
            self.classList.remove("end");
        } else {
            self.classList.add("end");
            end_node = self;
            if (self.classList.contains("start")){
                start_node = null;
                self.classList.remove("start");
            }
            if (self.classList.contains("wall")){
                self.classList.remove("wall");
            }
        }
    } else {
        console.log("clickGrid -- unknown mode selected");
    }
}

// inserts node into array of nodes by comparing f costs
// assumes all f initialized.
function insert_sorted_node(node, array){
    const node_value = Number(node.getAttribute("data-f"));

    var temp = null;
    var history = null;

    for (let index = 0; index < array.length; index++){
        if (temp != null){
            history = array[index];
            array[index] = temp;
            temp = history;
        } else if (Number(array[index].getAttribute("data-f")) >= node_value){
            temp = array[index];
            array[index] = node;
        }
    }
    

    // push remaining node
    if (temp == null){
        array.push(node);
    } else {
        array.push(temp);
    }
}

function in_array(node, array){
    for (let index = 0; index < array.length; index++){
        let i = array[index];
        if(node == i){
            return true;
        }
    }
    return false;
}

function solveMaze(){
    if (start_node == null || end_node == null){
        console.log("solveMaze -- missing start/end node");
        return false;
    }
    resetGrid();
    // triggers solvers depending on algorithm selected
    switch(algorithm_select.value){
        case "a-star":
            logs = solve_astar();
            break;
        case "bfs":
            logs = solve_bfs();
            break;
        case "bestfs":
            logs = solve_bestfs();
            break;
        case "djisktra":
            logs = solve_dji();
            break;
        default:
            console.log("solveMaze -- unknown case reached");
    }
    stepper_bar.max = logs.length;
    stepper_bar.value = logs.length;
    old_step = logs.length;
    return true;
}

function solve_astar(){
    // dist_h: heuristic value, aka distance from end.
    // node_x, node_y, end_x, end_y == numbers, absolute positions
    function dist_h(node_x, node_y, end_x, end_y){
        const x_diff = Math.abs(end_x - node_x);
        const y_diff = Math.abs(end_y - node_y);

        if (x_diff >= y_diff){
            const h = y_diff * 14 + (x_diff - y_diff) * 10;
            return h / 10;
        } else {
            const h = x_diff * 14 + (y_diff - x_diff) * 10;
            return h / 10;
        }
    }

    // dist_g: distance from start via shortest known path
    // offset_x, offset_y == numbers, relative position from old
    function dist_g(offset_x, offset_y){
        if (offset_x == 0 || offset_y == 0){
            return 1;
        } else {
            return 1.4;
        }
    }

    var opened = [];
    var closed = [];
    var logs = [];
    var current;

    const end_x = Number(end_node.getAttribute("data-x"));
    const end_y = Number(end_node.getAttribute("data-y"));

    opened.push(start_node);
    closed.push(end_node);
    start_node.setAttribute("data-f", -1);
    start_node.setAttribute("data-g", -1);
    
    while (opened.length > 0){
        current = opened[0];
        if (!current.classList.contains("start")){
            logs.push(add_log(current, "closed"));
            current.classList.add("closed");
        }
        current.classList.remove("open");
        const current_x = Number(current.getAttribute("data-x"));
        const current_y = Number(current.getAttribute("data-y"));
        const current_g = Number(current.getAttribute("data-g"));

        closed.push(current);
        opened = opened.splice(1);

        for (var x_offset = -1; x_offset < 2; x_offset++){
            for (var y_offset = -1; y_offset < 2; y_offset++){
                const abs_x = current_x + x_offset;
                const abs_y = current_y + y_offset;

                if (abs_x < 0 || abs_y < 0 || abs_x >= columns || abs_y >= rows){
                    continue;
                }

                const adj_node = document.getElementById("btn-" + abs_x + "-" + abs_y);

                if (adj_node == end_node){
                    console.log("end found");
                    while(current != start_node){
                        logs.push(add_log(current, "path"));
                        current.classList.remove("closed");
                        current.classList.add("path");
                        current = document.getElementById("btn-" + current.getAttribute("data-parent-x") + "-" + current.getAttribute("data-parent-y"));
                    }
                    return logs;
                } else if (in_array(adj_node, closed) || in_array(adj_node, walls)){
                    continue;
                }

                const h = dist_h(abs_x, abs_y, end_x, end_y);
                var t_g = (current_g * 10 + dist_g(x_offset, y_offset) * 10) / 10;
                var t_f = (h * 10 + t_g * 10) / 10;

                if (adj_node.getAttribute("data-f") != "-1"){
                    const g = Number(adj_node.getAttribute("data-g"));
                    const f = Number(adj_node.getAttribute("data-f"));
                    if (t_g < g){
                        adj_node.setAttribute("data-g", t_g);
                        adj_node.setAttribute("data-f", t_f);
                        adj_node.setAttribute("data-parent-x", current_x);
                        adj_node.setAttribute("data-parent-y", current_y);
                        if (in_array(adj_node, opened)){
                            opened = opened.filter(x => x != adj_node);
                        } else if (!adj_node.classList.contains("start")){
                            adj_node.classList.add("open");
                            logs.push(add_log(adj_node, "open"));
                        }
                        insert_sorted_node(adj_node, opened);
                    }
                } else {
                    adj_node.setAttribute("data-g", t_g);
                    adj_node.setAttribute("data-f", t_f);
                    adj_node.setAttribute("data-h", h);
                    adj_node.setAttribute("data-parent-x", current_x);
                    adj_node.setAttribute("data-parent-y", current_y);
                    if (!adj_node.classList.contains("start")){
                        insert_sorted_node(adj_node, opened);
                        logs.push(add_log(adj_node, "open"));
                        adj_node.classList.add("open");
                    }
                }
            }
        }
    }
    console.log("path not found");
    return false;
}

function solve_bfs(){
    console.log("start");
    var opened = [];
    var closed = [];
    var temp = [];
    var logs = [];
    var current;
    var steps = 1;

    const end_x = Number(end_node.getAttribute("data-x"));
    const end_y = Number(end_node.getAttribute("data-y"));

    opened.push(start_node);
    closed.push(end_node);
    while(opened.length > 0 || temp.length > 0){
        while (opened.length > 0){
            current = opened.pop();
            closed.push(current);
            temp.push(current);

            if (!current.classList.contains("start")){
                logs.push(add_log(current, "closed"));
                current.classList.add("closed");
            }

            current.classList.remove("open");
            const current_x = Number(current.getAttribute("data-x"));
            const current_y = Number(current.getAttribute("data-y"));

            for (let x_offset = -1; x_offset < 2; x_offset++){
                for (var y_offset = -1; y_offset < 2; y_offset++){
                    const abs_x = current_x + x_offset;
                    const abs_y = current_y + y_offset;

                    if (abs_x < 0 || abs_y < 0 || abs_x >= columns || abs_y >= rows){
                        continue;
                    }

                    const adj_node = document.getElementById("btn-" + abs_x + "-" + abs_y);
                    if (adj_node == end_node){
                        console.log("end found");
                        while(current != start_node){
                            logs.push(add_log(current, "path"));
                            current.classList.remove("closed");
                            current.classList.add("path");
                            current = document.getElementById("btn-" + current.getAttribute("data-parent-x") + "-" + current.getAttribute("data-parent-y"));
                        }
                        old_step = logs.length - 1;
                        return logs;
                    } else if (in_array(adj_node, closed) || 
                        in_array(adj_node, walls) || 
                        in_array(adj_node, temp) || 
                        in_array(adj_node, opened)){
                        continue;
                    } else {
                        temp.push(adj_node);
                        adj_node.setAttribute("data-parent-x", current_x);
                        adj_node.setAttribute("data-parent-y", current_y);
                        adj_node.setAttribute("data-f", steps);
                        logs.push(add_log(adj_node, "open"));
                        adj_node.classList.add("open");
                    }
                }
            }
        }

        if (temp.length != 0){
            opened = temp;
            temp = [];
            steps++;
        }
    }
    console.log("path not found");
    return false;
}

function solve_bestfs(){
    // dist_h: heuristic value, aka distance from end.
    // node_x, node_y, end_x, end_y == numbers, absolute positions
    function dist_h(node_x, node_y, end_x, end_y){
        const x_diff = Math.abs(end_x - node_x);
        const y_diff = Math.abs(end_y - node_y);

        if (x_diff >= y_diff){
            const h = y_diff * 14 + (x_diff - y_diff) * 10;
            return h / 10;
        } else {
            const h = x_diff * 14 + (y_diff - x_diff) * 10;
            return h / 10;
        }
    }

    var opened = [];
    var closed = [];
    var current;
    var logs = [];

    const end_x = Number(end_node.getAttribute("data-x"));
    const end_y = Number(end_node.getAttribute("data-y"));

    opened.push(start_node);
    closed.push(end_node);
    start_node.setAttribute("data-f", -1);
    start_node.setAttribute("data-h", -1);
    
    while (opened.length > 0){
        current = opened[0];
        if (!current.classList.contains("start")){
            logs.push(add_log(current, "closed"));
            current.classList.add("closed");
        }

        current.classList.remove("open");
        const current_x = Number(current.getAttribute("data-x"));
        const current_y = Number(current.getAttribute("data-y"));

        closed.push(current);
        opened = opened.splice(1);

        for (var x_offset = -1; x_offset < 2; x_offset++){
            for (var y_offset = -1; y_offset < 2; y_offset++){
                const abs_x = current_x + x_offset;
                const abs_y = current_y + y_offset;

                if (abs_x < 0 || abs_y < 0 || abs_x >= columns || abs_y >= rows){
                    continue;
                }

                const adj_node = document.getElementById("btn-" + abs_x + "-" + abs_y);
                
                if (adj_node == end_node){
                    console.log("end found");
                    while(current != start_node){
                        logs.push(add_log(current, "path"));
                        current.classList.remove("closed");
                        current.classList.add("path");
                        current = document.getElementById("btn-" + current.getAttribute("data-parent-x") + "-" + current.getAttribute("data-parent-y"));
                    }
                    old_step = logs.length - 1;
                    return logs;
                } else if (in_array(adj_node, closed) || in_array(adj_node, walls)){
                    continue;
                }

                const h = dist_h(abs_x, abs_y, end_x, end_y);

                if (adj_node.getAttribute("data-h") == "-1"){
                    adj_node.setAttribute("data-h", h);
                    adj_node.setAttribute("data-f", h)
                    adj_node.setAttribute("data-parent-x", current_x);
                    adj_node.setAttribute("data-parent-y", current_y);
                    if (!adj_node.classList.contains("start")){
                        logs.push(add_log(adj_node, "open"));
                        adj_node.classList.add("open");
                        insert_sorted_node(adj_node, opened);
                    }
                }
            }
        }
    }
    console.log("path not found");
    return false;
}

function solve_dji(){
    // modify this to allow for custom weight paths
    // dist_g: distance from start via shortest known path
    // offset_x, offset_y == numbers, relative position from old
    function dist_g(offset_x, offset_y){
        if (offset_x == 0 || offset_y == 0){
            return 1;
        } else {
            return 1.4;
        }
    }

    var opened = [];
    var closed = [];
    var current;
    var logs = [];

    const end_x = Number(end_node.getAttribute("data-x"));
    const end_y = Number(end_node.getAttribute("data-y"));

    opened.push(start_node);
    closed.push(end_node);
    start_node.setAttribute("data-f", 0);
    start_node.setAttribute("data-g", 0);
    
    while (opened.length > 0){
        current = opened[0];
        if (!current.classList.contains("start")){
            logs.push(add_log(current, "closed"));
            current.classList.add("closed");
        }
        current.classList.remove("open");
        const current_x = Number(current.getAttribute("data-x"));
        const current_y = Number(current.getAttribute("data-y"));
        const current_g = Number(current.getAttribute("data-g"));

        closed.push(current);
        opened = opened.splice(1);

        for (var x_offset = -1; x_offset < 2; x_offset++){
            for (var y_offset = -1; y_offset < 2; y_offset++){
                const abs_x = current_x + x_offset;
                const abs_y = current_y + y_offset;

                if (abs_x < 0 || abs_y < 0 || abs_x >= columns || abs_y >= rows){
                    continue;
                }

                const adj_node = document.getElementById("btn-" + abs_x + "-" + abs_y);

                if (adj_node == end_node){
                    console.log("end found");
                    while(current != start_node){
                        logs.push(add_log(current, "path"));
                        current.classList.remove("closed");
                        current.classList.add("path");
                        current = document.getElementById("btn-" + current.getAttribute("data-parent-x") + "-" + current.getAttribute("data-parent-y"));
                    }
                    old_step = logs.length - 1;
                    return logs;
                } else if (in_array(adj_node, closed) || in_array(adj_node, walls)){
                    continue;
                }

                var t_g = (current_g * 10 + dist_g(x_offset, y_offset) * 10) / 10;
                var t_f = t_g;

                if (adj_node.getAttribute("data-f") != "-1"){
                    const g = Number(adj_node.getAttribute("data-g"));
                    const f = Number(adj_node.getAttribute("data-f"));
                    if (t_g < g){
                        adj_node.setAttribute("data-g", t_g);
                        adj_node.setAttribute("data-f", t_f);
                        adj_node.setAttribute("data-parent-x", current_x);
                        adj_node.setAttribute("data-parent-y", current_y);
                        if (adj_node in opened){
                            opened = opened.filter(x => x != adj_node);
                        } else {
                            logs.push(add_log(adj_node, "open"));
                            adj_node.classList.add("open");
                        }
                        insert_sorted_node(adj_node, opened);
                    }
                } else {
                    adj_node.setAttribute("data-g", t_g);
                    adj_node.setAttribute("data-f", t_f);
                    adj_node.setAttribute("data-parent-x", current_x);
                    adj_node.setAttribute("data-parent-y", current_y);
                    logs.push(add_log(adj_node, "open"));
                    insert_sorted_node(adj_node, opened);
                    adj_node.classList.add("open");
                }
            }
        }
    }
    console.log("path not found");
    return false;
}
