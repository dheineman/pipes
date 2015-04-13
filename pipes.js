var Pipe = function(){
	this.x = 0;
	this.y = 0;
	
	this.active = 0;
	
	this.UP = 0;
	this.RIGHT = 1;
	this.DOWN = 2;
	this.LEFT = 3;
	
	// Up, Right, Down, Left
	this.connections = Array.apply(null, new Array(4)).map(Number.prototype.valueOf,0);
	
	this.isActive = function()
	{
		return (this.active === 1 ? true : false);
	}
	
	this.setActive = function(active)
	{
		this.active = (active ? 1 : 0);
	}
	
	this.hasConnection = function(direction) 
	{
		return (this.connections[direction] === 1 ? true : false);
	}
	
	this.rotate = function()
	{
		// TODO: Rotate once in clockwise direction instead of 3 times counter clockwise
		this.connections.splice(this.connections.length, 0, this.connections.splice(0, 1)[0]);
		this.connections.splice(this.connections.length, 0, this.connections.splice(0, 1)[0]);
		this.connections.splice(this.connections.length, 0, this.connections.splice(0, 1)[0]);
	}
}

var Grid = function(){
	
	this.pipes  = [];
	
	this.size = 0;

	/**
	  * Initialize the grid
	  */
	this.init = function(size)
	{
		this.initPipes(9);
		this.buildPipes();
		this.scramblePipes();
		this.checkPipes();
		this.draw();
	}
	
	this.getPipe = function(x, y)
	{
		var pipe;
		if(typeof this.pipes[x] !== "undefined") {
			if(typeof this.pipes[x][y] !== "undefined") {
				pipe = this.pipes[x][y];
			}
		}
		
		return pipe;
	}
	
	/**
	  *	Initialize the pipes array with pipes
	  */
	this.initPipes = function(size)
	{
		this.size = size;
		for(x = 1; x <= size; x++) {
			this.pipes[x] = [];
			for(y = 1; y <= size; y++) {
				pipe = new Pipe();
				pipe.x = x;
				pipe.y = y;
				
				this.pipes[x][y] = pipe;
			}
		}
	}
	
	/**
	  * Build the pipes starting with a random pipe
	  */
	this.buildPipes = function()
	{
		// Define variables
		var total_pipes = this.size*this.size;
		var connected_pipes = [];
		
		// Add a random first pipe
		var x = Math.ceil(this.size/2);
		var y = Math.ceil(this.size/2);
		
		pipe = this.pipes[x][y];
		pipe.active = 1;
		
		connected_pipes.push(pipe);
		
		while(connected_pipes.length < total_pipes) {
			// Get a pipe in the set
			var pipe = connected_pipes[Math.floor(Math.random() * connected_pipes.length)];

			// Create a random direction
			var direction =  Math.floor(Math.random() * 4);
			
			switch(direction) {
				case pipe.UP:
					previous_row = this.pipes[pipe.x-1];
					if(typeof previous_row !== "undefined") {
						pipe_2 = previous_row[pipe.y];
					}
					reverse_direction = pipe.DOWN;
				break
				case pipe.DOWN:
					next_row = this.pipes[pipe.x+1];
					if(typeof next_row !== "undefined") {
						pipe_2 = next_row[pipe.y];
					}
					reverse_direction = pipe.UP;
				break;
				case pipe.RIGHT:
					row = this.pipes[pipe.x];
					if(typeof row !== "undefined") {
						pipe_2 = row[pipe.y+1];
					}
					reverse_direction = pipe.LEFT;
				break;
				case pipe.LEFT:
					row = this.pipes[pipe.x];
					if(typeof row !== "undefined") {
						pipe_2 = row[pipe.y-1];
					}
					reverse_direction = pipe.RIGHT;
				break;
			}
					
			if(typeof pipe_2 != "undefined" && pipe_2.connections.indexOf(1) == -1) {
				pipe.connections[direction] = 1;
				pipe_2.connections[reverse_direction] = 1;
				
				connected_pipes.push(pipe_2);
			}
		}
	}
	
	/**
	  * Scramble the pipes with a random rotation
	  */
	this.scramblePipes = function()
	{
		for(x = 1; x < this.pipes.length; x++) {
			for(y = 1; y < this.pipes.length; y++) {
				var pipe = this.pipes[x][y];
				var random = Math.floor(Math.random() * 4);

				for(i=0; i < random; i++) {
					pipe.rotate();
				}
			}
		}
	}
	
	/**
	  * Set all pipes to active = 0
	  */
	this.disablePipes = function()
	{
		for(x = 1; x < this.pipes.length; x++) {
			for(y = 1; y < this.pipes.length; y++) {
				pipe = this.pipes[x][y];
				pipe.setActive(false);
			}
		}
	}
	
	/**
	  * Check all pipes to see if they need to be active
	  */
	this.checkPipes = function()
	{
		connected_pipes = [];
		pipes_to_check = [];
		
		// Disable all pipes
		this.disablePipes();
		
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
			if(pipe.hasConnection(pipe.UP)) {
				var pipe_above = this.getPipe(x-1, y);
				if(typeof pipe_above !== "undefined" && pipe_above.hasConnection(pipe.DOWN) && !pipe_above.isActive()) {
					pipe_above.setActive(true);
					
					connected_pipes.push(pipe_above);
					pipes_to_check.push(pipe_above);
				}
			}
			
			// Check if this pipe has a connection down
			if(pipe.hasConnection(pipe.DOWN)) {
				var pipe_below = this.getPipe(x+1, y);
				if(typeof pipe_below !== "undefined" && pipe_below.hasConnection(pipe.UP) && !pipe_below.isActive()) {
					pipe_below.setActive(true);
					
					connected_pipes.push(pipe_below);
					pipes_to_check.push(pipe_below);
				}
			}
			
			// Check if this pipe has a connection right
			if(pipe.hasConnection(pipe.RIGHT)) {
				var pipe_next = this.getPipe(x, y+1);
				if(typeof pipe_next !== "undefined" && pipe_next.hasConnection(pipe.LEFT) && !pipe_next.isActive()) {
					pipe_next.setActive(true);
					
					connected_pipes.push(pipe_next);
					pipes_to_check.push(pipe_next);
				}
			}
			
			// Check if the pipe has a connection left
			if(pipe.hasConnection(pipe.LEFT)) {
				var pipe_previous = this.getPipe(x, y-1);
				if(typeof pipe_previous !== "undefined" && pipe_previous.hasConnection(pipe.RIGHT) && !pipe_previous.isActive()) {
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
	}
	
	/**
	  * Draw the board and all pipes on the screen
	  */
	this.draw = function()
	{
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
}

// Called when clicking a pipe
function rotatePipe(element)
{
	var x = element.dataset.x;
	var y = element.dataset.y;

	window.grid.pipes[x][y].rotate();
	window.grid.checkPipes();
	window.grid.draw();
}

window.grid = new Grid();
grid.init();