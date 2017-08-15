
var app = function() {

    var self = {};
    self.is_configured = false;

    var server_url = "https://luca-ucsc-teaching-backend.appspot.com/keystore/";
    var call_interval = 2000;

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    self.my_identity = randomString(20);
    self.empty_board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];

    self.empty_board = function(length) {
        if (length === undefined)
        { 
        length = 64
        } 
        var squareArray = Array(length);
        for (var i = 0; i < length; i++)
        {  
        squareArray[i] = ""; 
        }
        return squareArray;
    }; 
    
    // Enumerates an array.
    var enumerate = function(v) {
        var k=0;
        v.map(function(e) {e._idx = k++;});
    };

    // Initializes an attribute of an array of objects.
    var set_array_attribute = function (v, attr, x) {
        v.map(function (e) {e[attr] = x;});
    };

    self.initialize = function () {
        document.addEventListener('deviceready', self.ondeviceready, false);
    };

    self.ondeviceready = function () {
        // This callback is called once Cordova has finished its own initialization.
        console.log("The device is ready");

        $("#vue-div").show();
        self.is_configured = true;
    };   

    // This is the object that contains the information coming from the server.
    self.player_x = null;
    self.player_o = null;

    // This is the main control loop.
    function call_server() {
        console.log("Calling the server");
        if (self.vue.chosen_magic_word === null) {
            console.log("No magic word.");
            setTimeout(call_server, call_interval);
        } else {
            // We can do a server call.
            $.ajax({
                dataType: 'json',
                url: server_url +'read',
                data: {key:  "Battleship"+ self.vue.chosen_magic_word},
                success: self.process_server_data,
                complete: setTimeout(call_server, call_interval) // Here we go again.
            });
        }
    }

    // Main function for sending the state.
    self.send_state = function () {
        $.post(server_url + 'store',
            {
                key: "Battleship" + self.vue.chosen_magic_word, 
                val: JSON.stringify(
                    {
                        'player_x': self.player_x,
                        'player_o': self.player_o,
                        'board_x': self.vue.board_x,
                        'board_o': self.vue.board_o,
                        'turn_count': self.vue.turn_count,
                        'game_count': self.vue.game_count
                    }
                )
            }
        );
    };          


    // Main place where we receive data and act on it.
    self.process_server_data = function (data) {
        // If data is null, we send our data.
        if (!data.result) {
            self.player_x = self.my_identity;
            self.player_o = null;
            // self.vue.board = self.null_board;
            self.vue.board_x = getBoard();
            self.vue.board_o = self.empty_board();
            // self.vue.is_my_turn = false;
            self.vue.turn_count = 0;
            self.vue.game_count = 0;
            self.send_state();
        } else {
            // I technically don't need to assign this to self, but it helps debug the code.
            // self.server_answer = JSON.parse(data.result);
            var server_answer = JSON.parse(data.result); //parse the JSON
            if (server_answer.player_o === null) {
                if (server_answer.player_x === self.my_identity) { //if server_answer looped back, wait.
                    self.vue.status_line = "Waiting for 2nd player";
                    return;
                }
                else if (server_answer.player_x === null) { 
                    self.vue.status_line = "Waiting for 2nd player.";
                    self.player_x = self.my_identity;
                    self.player_o = null;
                    self.vue.board_x = getBoard();
                    self.vue.board_o = self.empty_board();
                    self.vue.turn_count = 0;
                    self.vue.game_count = 0;
                    self.vue.is_my_turn = false;
                    self.send_state();
                }
                else {
                    self.vue.status_line = "Both players are present, game will begin soon";
                    self.player_x = server_answer.player_x;
                    self.player_o = self.my_identity;
                    self.vue.board_x = server_answer.board_x;
                    self.vue.board_o = getBoard();
                    self.vue.turn_count = server_answer.turn_count;
                    self.vue.game_count = server_answer.game_count;
                    self.send_state();
                    self.vue.is_my_turn = true;
                }
            }
            else {
                if (self.player_x !== self.my_identity && self.player_o !== self.my_identity) {
                    self.vue.status_line = "Cannot join this game, two players already present.";
                    self.vue.need_new_magic_word = true;
                }
                else {
                    self.vue.status_line = "Both Players are present and will begin playing.";
                    if (server_answer.turn_count >= self.vue.turn_count && server_answer.game_count === self.vue.game_count) 
                    {
                        if (server_answer.turn_count > self.vue.turn_count) 
                        {
                            self.vue.is_my_turn = !self.vue.is_my_turn;
                        }
                        self.vue.turn_count = server_answer.turn_count;
                        self.vue.board_x = server_answer.board_x;
                        self.vue.board_o = server_answer.board_o;
                        self.player_x = server_answer.player_x;
                        self.player_o = server_answer.player_o;
                        if (self.board_is_won(self.my_board())) 
                        {
                            self.vue.win_line = "You lost, better luck next time!";
                        }

                    }
                    else if (server_answer.game_count > self.vue.game_count) 
                    {
                        self.vue.status_line = "Starting New Game";
                        self.vue.win_line = "";
                        if (self.player_x === self.my_identity) 
                        {
                            self.vue.board_o = server_answer.board_o;
                            self.vue.board_x = getBoard();
                        }
                        else 
                        {
                            self.vue.board_x = server_answer.board_x;
                            self.vue.board_o = getBoard();
                        }
                        self.vue.turn_count = server_answer.turn_count;
                        self.vue.game_count = server_answer.game_count;
                        self.send_state();

                        self.vue.is_my_turn = true;
                    }
                }
            }
            }
    };


    self.update_local_vars = function (server_answer) {
        // First, figures out our role.
        if (server_answer.player_o === self.my_identity) {
            self.vue.my_role = 'o';
        } else if (server_answer.player_x === self.my_identity) {
            self.vue.my_role = 'x';
        } else {
            self.vue.my_role = ' ';
        }

        // Reconciles the board, and computes whose turn it is.
        for (var i = 0; i < 9; i++) {
            if (self.vue.board[i] === ' ' || server_answer.board[i] !== ' ') {
                // The server has new information for this board.
                Vue.set(self.vue.board, i, server_answer.board[i]);
            } else if (self.vue.board[i] !== server_answer.board[i] && self.vue.board[i] !== ' ' && server_answer.board[i] !== ' ')  {
                console.log("Board inconsistency at: " + i);
                console.log("Local:" + self.vue.board[i]);
                console.log("Server:" + server_answer.board[i]);
            }
        }

        // Compute whether it's my turn on the basis of the now reconciled board.
        self.vue.is_my_turn = (self.vue.board !== null) && (self.vue.my_role === whose_turn(self.vue.board));
    };

    function whose_turn(board) {
        num_x = 0;
        num_o = 0;
        for (var i = 0; i < 9; i++) {
            if (board[i] === 'x') num_x += 1;
            if (board[i] === 'o') num_o += 1;
        }
        if (num_o >= num_x) {
            return 'x';
        } else {
            return 'o';
        }
    }

    self.set_magic_word = function () {
        //2 IF statements to check magic words
        if(self.vue.chosen_magic_word = self.vue.magic_word) {
            return;
        }
        if (self.vue.chosen_magic_word !== null && self.player_x !== self.my_identity && self.player_o !== self.my_identity)
        { 
                self.player_x = null;
                self.player_o = null;
                self.vue.board_x = null;
                self.vue.board_o = null;
                self.vue.turn_count = null;
                self.vue.game_count = null;
                self.vue.need_new_magic_word = false;
                self.send_state();
        }
        self.vue.chosen_magic_word = self.vue.magic_word;
        self.vue.need_new_magic_word = false;
        // Resets board and turn.
        self.vue.board_x = self.empty_board();
        self.vue.board_o = self.empty_board();
        self.vue.is_my_turn = false;
        self.vue.my_role = "";
    };

    self.play = function (i, j) {
        //First set the opponnents board as well
        var opponent_board = self.opponent_board();
        // Check that the game is ongoing and that it's our turn to play.
        //KEY: H = HIT
        //W = WATER/MISS
        if (self.vue.is_my_turn && opponent_board[8 * i + j] !== 'h' && opponent_board[8 * i + j] !== 'w') {
            if (typeof(opponent_board[8 * i + j]) === "number") {
                var ship_count = 0;
                var ship_id = opponent_board[8 * i + j];
            for (var index = 0; index < opponent_board.length; index++) 
                {
                    if (opponent_board[index] === ship_id) 
                        { 
                            ship_count++; 
                        }
                }
                opponent_board[8 * i + j] = 'h';
                if (1 >= ship_count) 
                {   
                self.water(opponent_board, i, j);  
                }
            }
            else if (opponent_board[8 * i + j] === '') 
            { 
            opponent_board[8 * i + j] = 'w';
            } 
            self.vue.is_my_turn = false;
            self.vue.turn_count++;

            if (self.board_is_won(opponent_board)) 
                { 
                    self.vue.win_line = "You won!"; 
                }
            self.send_state();
        }                
    };
    self.set_the_board = function(board, x, y, val) {
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            board.splice(8 * x + y, 1, val);
        }
    };
    self.my_board = function() {
        if (self.vue === undefined) 
            { 
                return []; 
            }
        if (self.player_x === self.my_identity) 
            { 
                return self.vue.board_x; 
            }
        else 
            { 
                return self.vue.board_o; 
            }
    };
    self.opponent_board = function() {
        if (self.vue === undefined) 
            { 
                return []; 
            }
        if (self.player_x === self.my_identity) 
            { 
                return self.vue.board_o; 
            }
        else 
            { 
                return self.vue.board_x; 
            }
    };
    self.board_is_won = function(board) {
        for (i = 0; i < board.length; i++) {
            if (typeof(board[i]) === "number") {
                return false;
            }
        }
        return true;
    }
    self.addit = function(x1, y1, x2, y2) {
     return {x: (x1+x2), y: (y1+y2)}; 
 }
    self.flatten = function(x1, y1) {
        if (typeof(x1) === "object") 
            { 
                return 8 * x1.x + x1.y;
            }
        return 8 * x1 + y1;
    }    

self.water = function(board, x, y) {
        var direction_sets = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
        var direction;
        for (var i = 0; i < direction_sets.length; i++) {
            if (board[8*(x+direction_sets[i].x)+(y+direction_sets[i].y)] === 'h') {
                direction = direction_sets[i];
                break;
            }
        }
        if (direction === undefined) {
            for (var j = 0; j < direction_sets.length; j++) {
                var off = self.addit(x, y, direction_sets[j].x, direction_sets[j].y);
                if (board[self.flatten(off)] === '') {
                    self.set_the_board(board, off.x, off.y, 'w'); 
                }
            }
            return;
        }
        for (var i = 0; self.flatten(self.addit(x, y, i*direction.x, i*direction.y)) >= 0 && self.flatten(self.addit(x, y, i*direction.x, i*direction.y)) < 64; i++) {
                var center = self.addit(x, y, i*direction.x, i*direction.y);
                if (board[self.flatten(center)] !== 'h') 
                    { 
                        break; 
                    }
                for (var j = 0; j < direction_sets.length; j++) {
                    var off = self.addit(center.x, center.y, direction_sets[j].x, direction_sets[j].y);
                    if (board[self.flatten(off)] === '') {
                     self.set_the_board(board, off.x, off.y, 'w');
                    }
                }
        }
        for (var i = 0; self.flatten(self.addit(x, y, -1*i*direction.x, -1*i*direction.y)) >= 0 && self.flatten(self.addit(x, y, -1*i*direction.x, -1*i*direction.y)) < 64; i++) {
                var center = self.addit(x, y, -1*i*direction.x, -1*i*direction.y);
                if (board[self.flatten(center)] !== 'h') {
                    break;
                }
                for (var j = 0; j < direction_sets.length; j++) {
                    var off = self.addit(center.x, center.y, direction_sets[j].x, direction_sets[j].y);
                    if (board[self.flatten(off)] === '') {
                        self.set_the_board(board, off.x, off.y, 'w');
                    }
                }
        }
    };

    self.new_game = function() {
        if (self.vue.win_line === "") { return; }
        else {
            self.vue.status_line = "New Game will now being";
            self.vue.win_line = "";

            if (self.player_x === self.my_identity) {
                self.vue.board_x = getBoard();
                self.vue.board_o = self.empty_board(); 
            }
            else {                                      
                self.vue.board_o = getBoard();
                self.vue.board_x = self.empty_board();
            }
            self.vue.turn_count = 0;
            self.vue.game_count++;
            self.vue.is_my_turn = false;
            self.send_state();
        }
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            magic_word: "",
            chosen_magic_word: null,
            need_new_magic_word: false,
            my_role: "",
            // board: self.null_board,
            board_x: self.empty_board(),            
            board_o: self.empty_board(),
            is_other_present: false,
            is_my_turn: false,
            status_line: "No players here",
            win_line: "",
            turn_count: 0,
            game_count: 0
        },
        methods: {
            set_magic_word: self.set_magic_word,
            play: self.play,
            new_game: self.new_game,
            my_board: self.my_board,
            opponent_board: self.opponent_board
        }

    });

    call_server();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){
    APP = app();
    APP.initialize();
});
