var socket = new WebSocket("ws://localhost:" + location.port + "/websocket");

function handle_data(method, msg) {
	console.log(`Handling request: ${method}`);
	if (method == "delete") {
		global_state.clear();
		update_charts(d3.select("#charts"), global_state.chart_list());
	} else if (method == "delete_series") {
		global_state.clear_series();
		update_charts(d3.select("#charts"), global_state.chart_list());
	} else if (method == "delete_charts") {
		global_state.clear_charts();
		update_charts(d3.select("#charts"), global_state.chart_list());
	} else if (method == "read") {
		socket.send(JSON.stringify({
			"method": "save",
			"filename": msg.filename,
			"data": JSON.stringify(global_state)
		}));
	} else if (method == "create_series") {
		Series.from_obj(msg.data);
	} else if (method == "create_chart") {
		global_state.add_chart(Chart.from_obj(msg.data));
		update_charts(d3.select("#charts"), global_state.chart_list());
	} else if (method == "extend_series") {
		console.log(msg);
		global_state.extend_series(msg.key, msg.data);
	} else if (method == "update") {
		update_charts(d3.select("#charts"), global_state.chart_list());
	} else {
		console.error(`unknown_method:${method}`)
	}
	window.localStorage.setItem("context", JSON.stringify(global_state));
}

socket.onopen = function() {
	console.log("connection established");
};

socket.onclose = function() {
	console.log("connection closed");
};

socket.onerror = function(error) {
	console.log("Error:");
	console.log(error);
};

socket.onmessage = function(e) {
	let data = JSON.parse(e.data)
	let method = data.method;
	delete data.method
	handle_data(method, data);
};

window.onload = function() {
	// Try loading data from local storage.	
	global_state = Context.from_obj(window.localStorage.getItem("context"));
	update_charts(d3.select("#charts"), global_state.chart_list());
};