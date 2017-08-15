
var app = function() {
  var black_Array, black_value, black_Coordinate;

  var self = {};
  self.is_configured = false;

  Vue.config.silent = false; // show all warnings

  // Extends an array
  self.extend = function(a, b) {
    for (var i = 0; i < b.length; i++) {
      a.push(b[i]);
    }
  };

  // Enumerates an array.
  var enumerate = function(v) {
    var k = 0;
    v.map(function(e) {
      e._idx = k++;
    });
  };
  // Initializes an attribute of an array of objects.
  var set_array_attribute = function(v, attr, x) {
    v.map(function(e) {
      e[attr] = x;
    });
  };

  self.initialize = function() {
    document.addEventListener("deviceready", self.ondeviceready, false);
    black_value = "";
    blackTile = "3,3";
  };

  self.ondeviceready = function() {
    // This callback is called once Cordova has finished
    // its own initialization.
    console.log("The device is ready");
    $("#vue-div").show(); // This is jQuery.
    self.is_configured = true;
  };

  self.reset = function() {
    self.vue.board = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, ""];

    for (var i = 0; i < 15; i++){
      document.getElementsByTagName("td")[i].innerHTML= i + 1;
    }
     document.getElementsByTagName("td")[15].innerHTML= ""
     for (var i = 0; i < 4; i++) {
          for (var j = 0; j < 4; j++) {
            if(4 * i + j != 15 && (j + i) % 2 != 0){
              document.getElementById(i+ ','+ j).classList.remove("black");
              document.getElementById(i+ ','+ j).classList.remove('red');
              document.getElementById(i+ ','+ j).classList.add('white');
            }
            if((j+i)%2 == 0){
              document.getElementById(i+ ','+ j).classList.remove("white");
              document.getElementById(i+ ','+ j).classList.remove("black");
              document.getElementById(i+ ','+ j).classList.add('red');
            }
            if(4*i+j == 15){
              document.getElementById(i+ ','+ j).classList.remove("white");
              document.getElementById(i+ ','+ j).classList.remove('red');
              document.getElementById(i+ ','+ j).classList.add('black');
            }
          };
        };

    black_value = "";
    black_Array = "16";
    black_Coordinate = "3,3";

  };


self.shuffle = function(clicked , i , j) {
    var value_c = document.getElementById(clicked).innerText;
  var position_x = [0, 1, 0, -1];
  var position_y = [1, 0, -1, 0];

      for (var a = 0; a < position_x.length; a++) {
      if (black_Coordinate == ((i+position_x[a])+','+(j+position_y[a])))
      {
       //Swap
        var temp = value_c;
        document.getElementById(clicked).innerText = black_value;
        document.getElementById(black_Coordinate).innerText = temp;

        if (document.getElementById(clicked).classList.contains('white'))
        {
            document.getElementById(black_Coordinate).classList.add('white');
            document.getElementById(black_Coordinate).classList.remove("black");
            document.getElementById(clicked).classList.add("black");
            document.getElementById(clicked).classList.remove("white");
        }

        if (document.getElementById(clicked).classList.contains('red'))
        {
            document.getElementById(black_Coordinate).classList.add('red');
            document.getElementById(black_Coordinate).classList.remove("black");
            document.getElementById(clicked).classList.add("black");
            document.getElementById(clicked).classList.remove("red");
        }

        black_Coordinate = clicked;
        break;
      }
  };
};

self.scramble = function(row,column) {
   for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if(4*i+j != 15 && (j+i)%2!=0){
        document.getElementById(i+ ','+ j).classList.remove("black");
        document.getElementById(i+ ','+ j).classList.remove('red');
        document.getElementById(i+ ','+ j).classList.add('white');

      }
      if((j+i)%2 == 0){
        document.getElementById(i+ ','+ j).classList.remove("black");
        document.getElementById(i+ ','+ j).classList.remove("white");
        document.getElementById(i+ ','+ j).classList.add('red');
      }
    };
  };

var new_array = new Array();
for (var i = 0; i < row * column-1; i++)
{
  new_array[i] = i;
}

for (var i = 0; i <= row * column-1; i++)
{
 var random_number = Math.floor(Math.random() * new_array.length);
 var temp = new_array[random_number];
 new_array[random_number] = new_array[i];
 new_array[i] = temp;
}

var checker = 0;
for (var i = 0; i <= row * column-1; i++) {
 for (var j = i; j <= row * column-1; j++) {
    if (new_array[j] < new_array[i])
    {
       checker++;
    }
 }
}

if (Math.floor(checker/2) != checker/2)
{
 self.scramble(row, column);
}
else
{
 for (var i = 0; i < row*column; i++)
 {

    document.getElementsByTagName("td")[i].innerHTML = new_array[i]+1;
      if(isNaN(new_array[i]))
      {
        document.getElementsByTagName("td")[i].innerHTML = "";
        document.getElementsByTagName("td")[i].classList.remove('white');
        document.getElementsByTagName("td")[i].classList.remove('red');
        document.getElementsByTagName("td")[i].classList.add('black');
        black_Coordinate = document.getElementsByTagName("td")[i].id;
        black_Array = i;
      }
      /*
      if(document.getElementsByTagName("td")[i].innerText== 1 || 3 || 6 || 8 || 9 || 11 || 14)
        {
        document.getElementsByTagName("td")[i].classList.remove("white");
        document.getElementsByTagName("td")[i].classList.remove("black");
        document.getElementsByTagName("td")[i].classList.add('red');
      }
      if(document.getElementsByTagName("td")[i].innerText== 2 || 4 || 5 || 7 || 10 || 12 || 13 || 15)
        {
        document.getElementsByTagName("td")[i].classList.remove("red");
        document.getElementsByTagName("td")[i].classList.remove("black");
        document.getElementsByTagName("td")[i].classList.add('white');
      }
      */
      if(document.getElementsByTagName("td")[i]==1 ||
           document.getElementsByTagName("td")[i]==3 ||
           document.getElementsByTagName("td")[i]==6 ||
          document.getElementsByTagName("td")[i]==8 ||
          document.getElementsByTagName("td")[i]==9 ||
          document.getElementsByTagName("td")[i]== 11 ||
          document.getElementsByTagName("td")[i]==14)
          {
          document.getElementsByTagName("td")[i].classList.add('red');
          document.getElementsByTagName("td")[i].classList.remove("black");
          document.getElementsByTagName("td")[i].classList.remove("white");
        }

 }

}
};

  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ["${", "}"],
    unsafeDelimiters: ["!{", "}"],
    data: {
      board: []
    },
    methods: {
      reset: self.reset,
      shuffle: self.shuffle,
      scramble: self.scramble
    }
  });

  self.reset();

  return self;
};

var APP = null;
class Game {
}

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function() {
  APP = app();
  APP.initialize();
});
