
var two_step_task = {
	// ------------------------------------------
	// ------------------------------------------
	// Images -----------------------------------
	// ------------------------------------------
	// ------------------------------------------
	images: {
		filenames: {
			'1a':			null,
			'1b':			null,
			'2aa':			null,
			'2ab':			null,
			'2ba':			null,
			'2bb':			null,
			'reward':		null,
			'no_reward':	null,
			'timeout':		null
		},
		data: {
			'1a':			null,
			'1b':			null,
			'2aa':			null,
			'2ab':			null,
			'2ba':			null,
			'2bb':			null,
			'reward':		null,
			'no_reward':	null,
			'timeout':		null
		},
		set_files_to_default: function() {
			var path = 'img/';
			var img = two_step_task.images.filenames;
			var k;
			for (k in img) {
				img[k] = path + k + '.svg';
			}
		},
		list_filenames: function() { // E.g., for preloading
			var imgs = two_step_task.images.filenames;
			var file_list = [];
			var k;
			for (k in imgs) {
				file_list.push(imgs[k]);
			}
			return(file_list);
		},
		n_loaded: 0,
		n_to_load: 9, // Will be set
		load: function(on_update, on_finish) {
			var k;
			for (k in two_step_task.images.filenames) {
				var curr_img = new Image();
				curr_img.onload = function() {
					two_step_task.images.n_loaded++;
					if (on_update) on_update();
					if (two_step_task.images.n_loaded == two_step_task.images.n_to_load) {
						if (on_finish) on_finish();
					}
				}
				curr_img.src = two_step_task.images.filenames[k];
				two_step_task.images.data[k] = curr_img;
			}
		},
		proportional_dims: { // Image dimensions as a proportion of canvas dimensions
			width:	0.2,
			height:	0.2
		},
		absolute_dims: { // Image dimensions in pixels
			width:	null,
			height:	null
		}
	},
	// ------------------------------------------
	// ------------------------------------------
	// Rewards ----------------------------------
	// ------------------------------------------
	// ------------------------------------------
	reward: {
		probs: { // Probabilities
			'2aa': null,
			'2ab': null,
			'2ba': null,
			'2bb': null
		},
		prob_lims: [0.25, 0.75], // Limits to probabilities
		initialize_probs: function() {
			// For brevity:
			var lims = two_step_task.reward.prob_lims;
			var probs = two_step_task.reward.probs;
			var a;
			for (a in probs) {
				probs[a] = lims[0] + Math.random()*(lims[1] - lims[0]);
			}
		},
		drift_variance: 0.025,
		update_probs: function() {
			// For brevity:
			var probs = two_step_task.reward.probs;
			var variance = two_step_task.reward.drift_variance;
			function randn_bm() { // From https://stackoverflow.com/a/49434653
			    var u = 0, v = 0;
			    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
			    while(v === 0) v = Math.random();
			    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
			}
			var a, p;
			for (a in probs) {
				var p = probs[a] + variance*randn_bm();
				if (p > 0.75) {
					p = 1.5 - p;
				}
				if (p < 0.25) {
					p = 0.5 - p;
				}
				reward_probs[k] = p;
			}
		},
		display_duration: 1000 // How long the reward outcome is displayed
	},
	// ------------------------------------------
	// ------------------------------------------
	// User interaction -------------------------
	// ------------------------------------------
	// ------------------------------------------
	interaction: {
		choice_keys: ['z', 'm'], // Available keys: [left, right]
		last_response: null, // Container to persist beyond a single trial
		choice_names: [], // Names of choices, e.g., ['1a', '1b']
		choice_coordinates: [], // Coordinates on canvas of choices
		draw_choices: function(canv) {
			var ctx = canv.getContext('2d');
			var img_dims = two_step_task.images.absolute_dims;
			var names = two_step_task.interaction.choice_names;
			var coords = two_step_task.interaction.choice_coordinates;
			var i;
			for (i = 0; i < 2; i++) {
				ctx.drawImage(
					two_step_task.images.data[names[i]],
					coords[i].x,
					coords[i].y,
					img_dims.width,
					img_dims.height
				);
			}
		},
		get_choice_idx(response) { // 0 for left, 1 for right
			var choice_idx;
			if (two_step_task.interaction.last_response == two_step_task.interaction.choice_keys[0]) {
				choice_idx = 0;
			} else {
				choice_idx = 1;
			}
			return(choice_idx);
		}
	},
	// ------------------------------------------
	// ------------------------------------------
	// Transitions ------------------------------
	// ------------------------------------------
	// ------------------------------------------
	transition: {
		curr_state: null,
		common_prob: 0.7,
		structure: {
			'1a': {
				common: '2a',
				rare: '2b'
			},
			'1b': {
				common: '2b',
				rare: '2a'
			}
		},
		to_stage_2: function() {
			// Which choice?
			var choice_idx = two_step_task.interaction.get_choice_idx();
			var choice = two_step_task.interaction.choice_names[choice_idx];
			// Which transition?
			var transition = Math.random() < two_step_task.transition.common_prob ? 'common' : 'rare';
			// Which next state?
			var next_state = two_step_task.transition.structure[choice][transition];
			two_step_task.transition.curr_state = next_state;
		},
		last: null
	},
	// ------------------------------------------
	// ------------------------------------------
	// Animation --------------------------------
	// ------------------------------------------
	// ------------------------------------------
	animation: {
		canv: null, // Container for current canvas
		canv_dims: [null, null], // Canvas dimensions container
		img: null, // Container for current (moving) image
		length_ms: 500, // Length of animation
		raf_id: null, // requestAnimationFrame ID to cancel animation when the trial ends
		source_coords: { // Where is the animated image coming from?
			x: null,
			y: null
		},
		destination_coords: { // Where is the animated image going?
			x: null,
			y: null
		},
		easing_function: function(ppn_t) {
			return(1 - 1 / ( Math.exp(6*ppn_t) ) );
		},
		initiate_loop: function() {
			var canv = two_step_task.animation.canv;
			two_step_task.animation.destination_coords = {
				x: 0.5*canv.width - 0.5*canv.width*two_step_task.images.proportional_dims.width,
				y: canv.height * 0.05
			}
			two_step_task.animation.raf_id = requestAnimationFrame(
				function() {
					two_step_task.animation.loop(
						two_step_task.animation.canv,
						two_step_task.animation.img,
						two_step_task.animation.source_coords.x,
						two_step_task.animation.source_coords.y,
						two_step_task.animation.destination_coords.x,
						two_step_task.animation.destination_coords.y,
						Date.now(),
						two_step_task.animation.length_ms,
					);
				}
			);
		},
		loop: function(canv, img, x0, y0, x1, y1, t_start, t_total) {
			var ctx = canv.getContext('2d');
			var t_elapsed = Date.now() - t_start;
			var ppn_t = t_elapsed / t_total; // Proportion time elapsed
			var ppn_mvmt = two_step_task.animation.easing_function(ppn_t);
			ctx.clearRect(0, 0, canv.width, canv.height);
			ctx.drawImage(
				img,
				(1-ppn_mvmt)*x0 + ppn_mvmt*x1,
				(1-ppn_mvmt)*y0 + ppn_mvmt*y1,
				two_step_task.images.absolute_dims.width,
				two_step_task.images.absolute_dims.height
			);
			if (t_elapsed < t_total) {
				two_step_task.animation.raf_id = requestAnimationFrame(
					function() {
						two_step_task.animation.loop(canv, img, x0, y0, x1, y1, t_start, t_total);
					}
				);
			}
		},
		draw_final_frame: function(canv) {
			var ctx = canv.getContext('2d');
			ctx.drawImage(
				two_step_task.animation.img,
				two_step_task.animation.destination_coords.x,
				two_step_task.animation.destination_coords.y,
				two_step_task.images.absolute_dims.width,
				two_step_task.images.absolute_dims.height
			);
		}
	},
	// ------------------------------------------
	// ------------------------------------------
	// Trials -----------------------------------
	// ------------------------------------------
	// ------------------------------------------
	trials: {
		load_images: function() {
			var trial = {
				type: jsPsychHtmlKeyboardResponse,
				stimulus: 'Loading... 0%',
				on_start: function() {
					two_step_task.images.load(
						function() { // On update, draw
							var pct_loaded = Math.round(100*two_step_task.images.n_loaded/two_step_task.images.n_to_load);
							var display_el = document.getElementById('jspsych-html-keyboard-response-stimulus');
							display_el.innerHTML = 'Loading... ' + pct_loaded + '%';
						},
						function() { // On end, continue experiment
							jsPsych.finishTrial();
						}
					)
				},
				choices: 'NO_KEYS'
			}
			return(trial);
		},
		initialize_probs: function() {
			var trial = {
				type: jsPsychCallFunction,
				func: function() {
					two_step_task.reward.initialize_probs();
				}
			}
		},
		initialize: function() {
			var trial = {
				type: jsPsychCallFunction,
				func: function() {
					// Set dimensions of canvases
					var side_len = 0.9 * Math.min(window.innerHeight, window.innerWidth);
					two_step_task.animation.canv_dims = [side_len, side_len];
					// Set coordinates of images representing choices
					var ppn_dims = two_step_task.images.proportional_dims;
					two_step_task.interaction.choice_coordinates = [
						{
							x: (0.25 - 0.5*ppn_dims.width)*side_len,
							y: (0.5 - 0.5*ppn_dims.height)*side_len
						}, {
							x: (0.75 - 0.5*ppn_dims.width)*side_len,
							y: (0.5 - 0.5*ppn_dims.height)*side_len
						}
					];
					// Compute absolute image dimensions
					var k;
					for (k in ppn_dims) {
						two_step_task.images.absolute_dims[k] = side_len * ppn_dims[k];
					}
				}
			}
			return(trial);
		},
		stage_1: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
				on_start: function(trial) {
					two_step_task.interaction.choice_names = ['1a', '1b'];
				},
				stimulus: function(canv) {
					two_step_task.interaction.draw_choices(canv);
				},
				choices: two_step_task.interaction.choice_keys,
				on_finish: function(data) {
					two_step_task.interaction.last_response = data.response; // Record for subsequent animation
				}
			}
			return(trial);
		},
		choice_animation: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
				on_start: function() {
					// Which key was last pressed? This will determine which image to animate and from where
					var choice_idx = two_step_task.interaction.get_choice_idx();
					var choice_name = two_step_task.interaction.choice_names[choice_idx];
					two_step_task.animation.img = two_step_task.images.data[choice_name];
					two_step_task.animation.source_coords = two_step_task.interaction.choice_coordinates[choice_idx];
				},
				stimulus: function(canv) {
					two_step_task.animation.canv = canv;
					two_step_task.animation.initiate_loop();
				},
				trial_duration: two_step_task.animation.length_ms,
				on_finish: function() {
					cancelAnimationFrame(two_step_task.animation.raf_id);
				},
				choices: 'NO_KEYS'
			}
			return(trial);
		},
		stage_2: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
				on_start: function(trial) {
					// Update current state
					two_step_task.transition.to_stage_2();
					two_step_task.interaction.choice_names = [
						two_step_task.transition.curr_state + 'a',
						two_step_task.transition.curr_state + 'b'
					]; // [2aa, 2ab] or [2ba, 2bb]
				},
				stimulus: function(canv) {
					// Draw last-animated image at the top of the screen
					two_step_task.animation.draw_final_frame(canv);
					// Draw choices
					two_step_task.interaction.draw_choices(canv);
				},
				choices: two_step_task.interaction.choice_keys,
				on_finish: function(data) {
					two_step_task.interaction.last_response = data.response; // Record for subsequent animation
				}
			}
			return(trial);
		},
		show_reward: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
				stimulus: function(canv) {
					two_step_task.animation.draw_final_frame(canv);
					var choice_idx = two_step_task.interaction.get_choice_idx();
					var choice = two_step_task.interaction.choice_names[choice_idx];
					// Is a reward received?
					var img;
					if (Math.random() < two_step_task.reward.probs[choice]) {
						img = two_step_task.images.data['reward'];
					} else {
						img = two_step_task.images.data['no_reward'];
					}
					// Draw image based on reward
					var ctx = canv.getContext('2d');
					ctx.drawImage(
						img,
						canv.width*(0.5 - two_step_task.images.proportional_dims.width/2),
						canv.height*(0.5 - two_step_task.images.proportional_dims.height/2),
						two_step_task.images.absolute_dims.width,
						two_step_task.images.absolute_dims.height
					);
				},
				choices: 'NO_KEYS',
				trial_duration: two_step_task.reward.display_duration
			}
			return(trial);
		},
		timeline: function() {
			var timeline = [
				two_step_task.trials.initialize(),
				two_step_task.trials.stage_1(),
				two_step_task.trials.choice_animation(),
				two_step_task.trials.stage_2(),
				two_step_task.trials.choice_animation(),
				two_step_task.trials.show_reward()
			];
			return(timeline);
		}
	}
}
