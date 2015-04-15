var Pipe = function(){
	this.x = 0;
	this.y = 0;
	
	this.active = 0;
	
	// Up, Right, Down, Left
	this.connections = Array.apply(null, new Array(4)).map(Number.prototype.valueOf,0);
	
	this.isActive = function()
	{
		return this.active === 1;
	};
	
	this.setActive = function(active)
	{
		this.active = (active ? 1 : 0);
	};

    /**
     * Get the neighbouring pipe in the given direction
	 *
     * @param {grid.direction} direction
     */
    this.getNeighbour = function(direction) {
        var dx = 0;
        var dy = 0;

        if(direction == grid.direction.RIGHT) {
            dx = 1;
        } else if(direction == grid.direction.LEFT) {
            dx = -1;
        }

        if(direction == grid.direction.UP) {
            dy = 1;
        } else if(direction == grid.direction.DOWN) {
            dy = -1;
        }

        return grid.getPipe(this.x + dx, this.y + dy);
    };
	
	this.hasConnection = function(direction) 
	{
		return this.connections[direction] === 1;
	};
	
	this.rotate = function()
	{
		this.connections.splice(0, 0, this.connections.splice((this.connections.length-1), 1)[0]);
	}
};

/**
  * the grid
  */
var grid = {
	
	size: 0,
	
	pipes: [],

    direction: {
        DOWN: 2,
        LEFT: 3,
        RIGHT: 1,
        UP: 0
    },
	
	reverse_direction: {
		2: 0,
		3: 1,
		1: 3,
		0: 2
	},
	
	/**
	  * Grid initialization
	  */
	init: function(size) {
		if(size % 2 == false) {
			console.log("Cannot create grid with even number of rows/columns");
			return;
		}
		
		this.initPipes(size);
		this.buildPipes();
		this.scramblePipes();
		this.checkPipes();
		this.draw();
	},
	
	/**
	  * Get the pipe on the grid on the given X and Y
	  *
	  * @param {Number} x
	  * @param {Number} y
	  */
    getPipe: function(x, y) {
        if(typeof this.pipes[x] !== "undefined" && typeof this.pipes[x][y] !== "undefined") {
            return this.pipes[x][y];
        }
    },
	
	/**
	  * Get all pipes in the grid
	  */
	getPipes: function() {
		var pipes = [];
		for(x in this.pipes) {
			for(y in this.pipes[x]) {
				pipes.push(this.getPipe(x, y));
			}
		}
		return pipes;
	},
	
	/**
	  * Initialize all pipes in the grid
	  *
	  * @param {Number} size
	  */
    initPipes: function(size) {
		this.size = size;
		this.pipes = [];
        for(x = 1; x <= size; x++) {
            this.pipes[x] = [];
            for(y = 1; y <= size; y++) {
                pipe = new Pipe();
                pipe.x = x;
                pipe.y = y;

                this.pipes[x][y] = pipe;
            }
        }
    },
	
	/**
	  * Build the connections for all pipes
	  */
    buildPipes: function() {
        // Define variables
        var total_pipes = this.size * this.size;
        var connected_pipes = [];

        // Add a random first pipe
        var x = Math.ceil(this.size / 2);
        var y = Math.ceil(this.size / 2);

        pipe = this.getPipe(x, y);
        pipe.active = 1;

        connected_pipes.push(pipe);

        while (connected_pipes.length < total_pipes) {
            // Get a pipe in the set
            var pipe = connected_pipes[Math.floor(Math.random() * connected_pipes.length)];

            // Create a random direction
            var direction = Math.floor(Math.random() * 4);

			var neighbor = pipe.getNeighbour(direction);
			var reverse_direction = this.reverse_direction[direction];

            if (typeof neighbor != "undefined" && neighbor.connections.indexOf(1) == -1) {
                pipe.connections[direction] = 1;
                neighbor.connections[reverse_direction] = 1;

                connected_pipes.push(neighbor);
            }
        }
    },
	
	/**
	  * Scramble all pipes by rotating them a random amount of times
	  */
    scramblePipes: function() {
        for (x = 1; x < this.pipes.length; x++) {
            for (y = 1; y < this.pipes.length; y++) {
                var pipe = this.getPipe(x, y);
                var random = Math.floor(Math.random() * 4);

                for (i = 0; i < random; i++) {
                    pipe.rotate();
                }
            }
        }
    },
	
	/**
	  * Deactivate all pipes
	  */
    deactivatePipes: function() {
        for (x = 1; x < this.pipes.length; x++) {
            for (y = 1; y < this.pipes.length; y++) {
				this.getPipe(x, y).setActive(false);
            }
        }
    },
	
	/**
	  * Check all pipes to see if they are connected to an active pipe
	  */
    checkPipes: function() {
        connected_pipes = [];
        pipes_to_check = [];

        // Disable all pipes
        this.deactivatePipes();

        // Get the center pipe, set is to active, an add it to the set to be checked
        var center_pipe = this.getPipe(Math.ceil(this.size/2), Math.ceil(this.size/2));
        center_pipe.setActive(true);

        connected_pipes.push(center_pipe);
        pipes_to_check.push(center_pipe);

        // While there are still pipes left to be checked
        while(pipes_to_check.length > 0) {
            var pipe = pipes_to_check.pop();
            var x = pipe.x;
            var y = pipe.y

            // Check if this pipe has a connection up
            if(pipe.hasConnection(grid.direction.UP)) {
                var pipe_above = this.getPipe(x-1, y);
                if(typeof pipe_above !== "undefined" && pipe_above.hasConnection(grid.direction.DOWN) && !pipe_above.isActive()) {
                    pipe_above.setActive(true);

                    connected_pipes.push(pipe_above);
                    pipes_to_check.push(pipe_above);
                }
            }

            // Check if this pipe has a connection down
            if(pipe.hasConnection(grid.direction.DOWN)) {
                var pipe_below = this.getPipe(x+1, y);
                if(typeof pipe_below !== "undefined" && pipe_below.hasConnection(grid.direction.UP) && !pipe_below.isActive()) {
                    pipe_below.setActive(true);

                    connected_pipes.push(pipe_below);
                    pipes_to_check.push(pipe_below);
                }
            }

            // Check if this pipe has a connection right
            if(pipe.hasConnection(grid.direction.RIGHT)) {
                var pipe_next = this.getPipe(x, y+1);
                if(typeof pipe_next !== "undefined" && pipe_next.hasConnection(grid.direction.LEFT) && !pipe_next.isActive()) {
                    pipe_next.setActive(true);

                    connected_pipes.push(pipe_next);
                    pipes_to_check.push(pipe_next);
                }
            }

            // Check if the pipe has a connection left
            if(pipe.hasConnection(grid.direction.LEFT)) {
                var pipe_previous = this.getPipe(x, y-1);
                if(typeof pipe_previous !== "undefined" && pipe_previous.hasConnection(grid.direction.RIGHT) && !pipe_previous.isActive()) {
                    pipe_previous.setActive(true);

                    connected_pipes.push(pipe_previous);
                    pipes_to_check.push(pipe_previous);
                }
            }
        }

        // Check if the user has won
        if(connected_pipes.length == (this.size * this.size)) {
            console.log("Winner");
        }
    },
	
	/**
	  * Save the grid to a JSON string
	  */
	save: function() {
		var data = {};
		data.size = this.size;
		data.pipes = this.getPipes();
		
		save_data = JSON.stringify(data);
		
		if(typeof Storage !== "undefined") {
			localStorage.setItem("saved-game", save_data);
		}
	},
	
	/**
	  * Load a grid from a JSON string
	  */
	load: function() {
		var save_data;
		
		if(typeof Storage !== "undefined") {
			save_data = localStorage.getItem("saved-game");
		}
		
		if(save_data !== null) {
			data = JSON.parse(save_data);
			
			grid.size = data.size;
			grid.pipes = [];
			
			for(p in data.pipes) {
				var pipe = new Pipe();
				pipe.x = data.pipes[p].x;
				pipe.y = data.pipes[p].y;
				
				pipe.connections = data.pipes[p].connections;
				pipe.active = data.pipes[p].active;
		
				if(typeof grid.pipes[pipe.x] == "undefined") {
					grid.pipes[pipe.x] = [];
				}
				grid.pipes[pipe.x][pipe.y] = pipe;
			}
			
			grid.checkPipes();
			grid.draw();
		}
	},
	
	/**
	  * Draw the grid on the page
	  */
    draw: function() {
        var grid_div = document.getElementById("grid");
        grid_div.innerHTML = '';

        for(x in this.pipes) {
            var row = this.pipes[x];

            var row_div = document.createElement('div');
            row_div.className = "row";

            for(y in row) {
                var pipe = row[y];
                var pipe_div = document.createElement('div');

                pipe_div.className = "pipe";

                pipe_div.setAttribute('data-x', x);
                pipe_div.setAttribute('data-y', y);

                pipe_div.setAttribute('onClick', 'rotatePipe(this)');

                if(pipe.connections[0] === 1) {
                    pipe_div.className += " u";
                }

                if(pipe.connections[1] === 1) {
                    pipe_div.className += " r";
                }

                if(pipe.connections[2] === 1) {
                    pipe_div.className += " d";
                }

                if(pipe.connections[3] === 1) {
                    pipe_div.className += " l";
                }

                if(pipe.active == 1) {
                    pipe_div.className += " a";
                }

                row_div.appendChild(pipe_div);
            }

            grid_div.appendChild(row_div);
        }
    }
};

// Called when clicking a pipe
function rotatePipe(element)
{
	var x = element.dataset.x;
	var y = element.dataset.y;

    grid.getPipe(x,y).rotate();
    grid.checkPipes();
    grid.draw();
}

grid.init(5);