
var two_step_task = {
	// ------------------------------------------
	// ------------------------------------------
	// Random utilities -------------------------
	// ------------------------------------------
	// ------------------------------------------
	utils: {
		deepcopy: function(x) {
			var y;
			if (typeof(x) == 'object' && x != null) {
				y = {};
				var k;
				for (k in x) {
					y[k] = two_step_task.utils.deepcopy(x[k])
				}
			} else {
				y = x;
			}
			return(y);
		}
	},
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
			var path = 'https://cdn.jsdelivr.net/gh/kinleyid/jspsych-2st/img/';
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
		load: function(on_finish) {
			var k;
			for (k in two_step_task.images.filenames) {
				var curr_img = new Image();
				curr_img.onload = function() {
					two_step_task.images.n_loaded++;
					if (two_step_task.images.n_loaded == two_step_task.images.n_to_load) {
						on_finish();
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
	// Data -------------------------------------
	// ------------------------------------------
	// ------------------------------------------
	data: {
		// Information about the trial is recorded here and then transferred to jsPsych.data during a record_data trial
		trial_n: null,
		reward_probs: null,
		stage_1_action: null,
		stage_2: null,
		transition: null,
		stage_2_action: null,
		reward: null
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
				probs[a] = p;
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
		get_choice_idx(key) { // 0 for left, 1 for right
			var choice_idx;
			if (key == two_step_task.interaction.choice_keys[0]) {
				choice_idx = 0;
			} else {
				choice_idx = 1;
			}
			return(choice_idx);
		},
		get_choice_name(key) { // 1a/1b/2aa/2ab etc.
			var choice_idx = two_step_task.interaction.get_choice_idx(key);
			var choice_name = two_step_task.interaction.choice_names[choice_idx];
			return(choice_name);
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
		}
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
		prepare: function(last_keypress) {
			var choice_idx = two_step_task.interaction.get_choice_idx(last_keypress);
			two_step_task.animation.source_coords = two_step_task.interaction.choice_coordinates[choice_idx];
			var choice_name = two_step_task.interaction.get_choice_name(last_keypress);
			two_step_task.animation.img = two_step_task.images.data[choice_name];
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
		initialize_experiment: function() {
			var trial = {
				type: jsPsychCallFunction,
				async: true,
				func: function(on_finish) {
					// Ensure images are loaded
					if (two_step_task.images.n_loaded == 0) {
						two_step_task.images.load(on_finish);
					}
					// Reset info
					two_step_task.reward.initialize_probs();
					two_step_task.data.trial_n = 0;
				}
			}
			return(trial);
		},
		initialize_trial: function() {
			var trial = {
				type: jsPsychCallFunction,
				func: function() {
					// Set dimensions of canvas
					var side_len = 0.9 * Math.min(window.innerHeight, window.innerWidth);
					two_step_task.animation.canv_dims = [side_len, side_len];
					// Set coordinates of images representing choices based on canvas dimensions
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
					// Reset trial data
					var trial_n = two_step_task.data.trial_n;
					var k;
					for (k in two_step_task.data) {
						two_step_task.data[k] = null;
					}
					two_step_task.data.trial_n = trial_n + 1;
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
					// Record response
					var choice_name = two_step_task.interaction.get_choice_name(data.response);
					two_step_task.data.stage_1_action = choice_name;
					// Set up animation
					two_step_task.animation.prepare(data.response);
				}
			}
			return(trial);
		},
		transition: function() {
			var trial = {
				type: jsPsychCallFunction,
				func: function() {
					// Determine transition
					var choice_name = two_step_task.interaction.get_choice_name();
					var transition = Math.random() < two_step_task.transition.common_prob ? 'common' : 'rare';
					var stage_2 = two_step_task.transition.structure[choice_name][transition];
					// Figure out next choices
					two_step_task.interaction.choice_names = [
						stage_2 + 'a',
						stage_2 + 'b'
					];
					// Record transition
					two_step_task.data.transition = transition;
					two_step_task.data.stage_2 = stage_2;
				}
			}
			return(trial);
		},
		animation: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
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
				stimulus: function(canv) {
					// Draw last-animated image at the top of the screen
					two_step_task.animation.draw_final_frame(canv);
					// Draw choices
					two_step_task.interaction.draw_choices(canv);
				},
				choices: two_step_task.interaction.choice_keys,
				on_finish: function(data) {
					// Record response
					var choice_name = two_step_task.interaction.get_choice_name(data.response);
					two_step_task.data.stage_2_action = choice_name;
					// Set up animation
					two_step_task.animation.prepare(data.response);
				}
			}
			return(trial);
		},
		reward: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
				stimulus: function(canv) {
					two_step_task.animation.draw_final_frame(canv);
					var choice_idx = two_step_task.interaction.get_choice_idx();
					var choice = two_step_task.interaction.choice_names[choice_idx];
					var p_reward = two_step_task.reward.probs[choice]
					// Is a reward received?
					var reward = Math.random() < p_reward;
					// Draw image based on reward
					var img;
					if (reward) {
						img = two_step_task.images.data['reward'];
					} else {
						img = two_step_task.images.data['no_reward'];
					}
					var ctx = canv.getContext('2d');
					ctx.drawImage(
						img,
						canv.width*(0.5 - two_step_task.images.proportional_dims.width/2),
						canv.height*(0.5 - two_step_task.images.proportional_dims.height/2),
						two_step_task.images.absolute_dims.width,
						two_step_task.images.absolute_dims.height
					);
					// Record data
					two_step_task.data.reward = reward;
					two_step_task.data.reward_probs = {};
					var k;
					for (k in two_step_task.reward.probs) {
						two_step_task.data.reward_probs[k] = two_step_task.reward.probs[k];
					}
				},
				choices: 'NO_KEYS',
				trial_duration: two_step_task.reward.display_duration,
				on_finish: function(data) {
					data
				}
			}
			return(trial);
		},
		update_reward_probs: function() {
			var trial = {
				type: jsPsychCallFunction,
				func: function() {
					two_step_task.reward.update_probs();
				}
			}
			return(trial);
		},
		record_data: function() {
			var trial = {
				type: jsPsychCallFunction,
				func: function() {
					// Create copy of data
					var two_step_task_data = two_step_task.utils.deepcopy(two_step_task.data);
					jsPsych.getCurrentTrial().data = {two_step_task_data: two_step_task_data};
				}
			}
			return(trial);
		},
		single_trial: function() {
			var trial = {
				timeline: [
					two_step_task.trials.initialize_trial(),
					two_step_task.trials.stage_1(),
					two_step_task.trials.transition(),
					two_step_task.trials.animation(),
					two_step_task.trials.stage_2(),
					two_step_task.trials.animation(),
					two_step_task.trials.reward(),
					two_step_task.trials.update_reward_probs(),
					two_step_task.trials.record_data()
				]
			}
			return(trial);
		}
	}
}
