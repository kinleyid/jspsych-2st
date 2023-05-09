
var two_step_task = {
	default_setup: function() {
		two_step_task.transition.randomize();
		two_step_task.images.set_files_to_default();
	},
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
			'1A':			null,
			'1B':			null,
			'2AA':			null,
			'2AB':			null,
			'2BA':			null,
			'2BB':			null,
			'reward':		null,
			'no_reward':	null,
			'timeout':		null
		},
		data: { // Container for actual Image() objects
			'1A':			null,
			'1B':			null,
			'2AA':			null,
			'2AB':			null,
			'2BA':			null,
			'2BB':			null,
			'reward':		null,
			'no_reward':	null,
			'timeout':		null
		},
		set_files_to_default: function() {
			var path = 'https://cdn.jsdelivr.net/gh/kinleyid/jspsych-2st@v1.0.0/img/';
			var img_name;
			for (img_name in two_step_task.images.filenames) {
				two_step_task.images.filenames[img_name] = path + img_name + '.svg';
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
		n_to_load: 9,
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
		step_1_action: null,
		step_2: null,
		transition: null,
		step_2_action: null,
		reward: null,
		timeout: false
	},
	// ------------------------------------------
	// ------------------------------------------
	// Rewards ----------------------------------
	// ------------------------------------------
	// ------------------------------------------
	reward: {
		probs: { // Probabilities
			'2AA': null,
			'2AB': null,
			'2BA': null,
			'2BB': null
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
		display_ms: 1000 // How long the reward outcome is displayed
	},
	// ------------------------------------------
	// ------------------------------------------
	// User interaction -------------------------
	// ------------------------------------------
	// ------------------------------------------
	interaction: {
		choice_keys: ['z', 'm'], // Available keys: [left, right]
		last_response: null, // Container to persist beyond a single trial
		choice_names: [], // Names of choices, e.g., ['1A', '1B']
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
		get_choice_name(key) { // 1A/1B/2AA/2BB etc.
			var choice_idx = two_step_task.interaction.get_choice_idx(key);
			var choice_name = two_step_task.interaction.choice_names[choice_idx];
			return(choice_name);
		},
		timeout_ms: 2000, // How long before a trial times out?
		timeout_display_ms: 1000, // How long to show the timeout screen if a trial does time out?
	},
	// ------------------------------------------
	// ------------------------------------------
	// Transitions ------------------------------
	// ------------------------------------------
	// ------------------------------------------
	transition: {
		common_prob: 0.7,
		structure: {
			'1A': {
				common: '2A',
				rare: '2B'
			},
			'1B': {
				common: '2B',
				rare: '2A'
			}
		},
		randomize: function() {
			var T = two_step_task.transition.structure;
			var k, tmp;
			if (Math.random() < 0.5) {
				// Switch common and rare
				for (k in T) {
					tmp = T[k].common;
					T[k].common = T[k].rare;
					T[k].rare = tmp;
				}
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
					// Reset info
					two_step_task.reward.initialize_probs();
					two_step_task.data.trial_n = 0;
					// Ensure images are loaded
					if (two_step_task.images.n_loaded == 0) {
						two_step_task.images.load(on_finish);
					} else {
						on_finish();
					}
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
					// first reset all to null...
					var k;
					for (k in two_step_task.data) {
						two_step_task.data[k] = null;
					}
					// ...then set values that should not be reset to null
					two_step_task.data.trial_n = trial_n + 1;
					two_step_task.data.timeout = false;
				}
			}
			return(trial);
		},
		step_1: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
				on_start: function(trial) {
					two_step_task.interaction.choice_names = jsPsych.randomization.repeat(['1A', '1B'], 1);
				},
				stimulus: function(canv) {
					two_step_task.interaction.draw_choices(canv);
				},
				choices: two_step_task.interaction.choice_keys,
				trial_duration: function() {return(two_step_task.interaction.timeout_ms)},
				on_finish: function(data) {
					if (data.response) {
						// Record response
						var choice_name = two_step_task.interaction.get_choice_name(data.response);
						two_step_task.data.step_1_action = choice_name;
						two_step_task.data.step_1_rt = data.rt;
						// Set up animation
						two_step_task.animation.prepare(data.response);
					} else {
						two_step_task.data.timeout = true;
					}
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
					var step_2 = two_step_task.transition.structure[choice_name][transition];
					// Record transition
					two_step_task.data.transition = transition;
					two_step_task.data.step_2 = step_2;
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
		step_2: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
				on_start: function() {
					two_step_task.interaction.choice_names = jsPsych.randomization.repeat(
						[
							two_step_task.data.step_2 + 'A',
							two_step_task.data.step_2 + 'B',
						],
						1);
				},
				stimulus: function(canv) {
					// Draw last-animated image, if any, at the top of the screen
					if (two_step_task.data.step_1_action) {
						two_step_task.animation.draw_final_frame(canv);
					}
					// Draw choices
					two_step_task.interaction.draw_choices(canv);
				},
				choices: two_step_task.interaction.choice_keys,
				trial_duration: function() {return(two_step_task.interaction.timeout_ms)},
				on_finish: function(data) {
					if (data.response) {
						// Record response
						var choice_name = two_step_task.interaction.get_choice_name(data.response);
						two_step_task.data.step_2_action = choice_name;
						two_step_task.data.step_2_rt = data.rt;
						// Set up animation
						two_step_task.animation.prepare(data.response);
					} else {
						two_step_task.data.timeout = true;
					}
				}
			}
			return(trial);
		},
		reward: function() {
			var trial = {
				type: jsPsychCanvasKeyboardResponse,
				canvas_size: function() {return(two_step_task.animation.canv_dims)},
				on_start: function() {
					// Is a reward received?
					var choice_idx = two_step_task.interaction.get_choice_idx();
					var choice = two_step_task.interaction.choice_names[choice_idx];
					var p_reward = two_step_task.reward.probs[choice]
					var reward = Math.random() < p_reward;
					// Record reward and probabilities
					two_step_task.data.reward = reward;
					two_step_task.data.reward_probs = {};
					var k;
					for (k in two_step_task.reward.probs) {
						two_step_task.data.reward_probs[k] = two_step_task.reward.probs[k];
					}
				},
				stimulus: function(canv) {
					two_step_task.animation.draw_final_frame(canv);
					// Draw image based on reward
					var img;
					if (two_step_task.data.reward) {
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
				},
				choices: 'NO_KEYS',
				trial_duration: two_step_task.reward.display_ms
			}
			return(trial);
		},
		subtrials_with_response_dependence: function() {
			// Add a conditional function so that the appropriate sub-trials are response-contingent
			var response_dependents = [
				two_step_task.trials.step_1(),
				two_step_task.trials.transition(),
				two_step_task.trials.animation(),
				two_step_task.trials.step_2(),
				two_step_task.trials.animation(),
				two_step_task.trials.reward(),
			];
			var i;
			for (i = 0; i < response_dependents.length; i++) {
				response_dependents[i] = {
					timeline: [response_dependents[i]],
					conditional_function: function() {
						return(!two_step_task.data.timeout);
					}
				}
			}
			// Put them all in a single trial
			var trial = {
				timeline: response_dependents
			}
			return(trial)
		},
		show_timeout: function() {
			var trial = {
				timeline: [
					{
						type: jsPsychCanvasKeyboardResponse,
						stimulus: function(canv) {
							var ctx = canv.getContext('2d');
							ctx.drawImage(
								two_step_task.images.data['timeout'],
								canv.width*(0.5 - two_step_task.images.proportional_dims.width/2),
								canv.height*(0.5 - two_step_task.images.proportional_dims.height/2),
								two_step_task.images.absolute_dims.width,
								two_step_task.images.absolute_dims.height
							);
						},
						choices: 'NO_KEYS',
						trial_duration: two_step_task.interaction.timeout_display_ms
					}
				],
				conditional_function: function() {
					return(two_step_task.data.timeout);
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
					two_step_task.trials.subtrials_with_response_dependence(),
					two_step_task.trials.show_timeout(),
					two_step_task.trials.update_reward_probs(),
					two_step_task.trials.record_data()
				]
			}
			return(trial);
		},
		interactive_instructions: function() {
			var instr_1 = {
				type: jsPsychInstructions,
				pages: [
					'In this game, you are opening boxes to find as many coins as you can.',
					'There is a red pair of boxes and a blue pair of boxes. Each individual box has a certain chance of containing a coin. For example, one box might have a 50% chance while another might have a 60% chance. The aim is to find a box with a high chance of containing a coin and choose it.',
					'On the next screen, you can try choosing boxes to try to find coins. Use the "z" key to select the box on the left and the "m" key to select the box on the right. See if you can figure out which boxes have a high chance of giving you a coin.',
					'Click "Next" to begin the practice.'
				],
				show_clickable_nav: true
			}
			
			var timeout_ms_tmp;
			var initialize_step_2_practice = {
				type: jsPsychCallFunction,
				func: function() {
					two_step_task.reward.probs = { // Deterministic for practice--they will be randomized later
						'2AA': 0.25,
						'2AB': 0.5,
						'2BA': 0.5,
						'2BB': 0.75
					};
					// Time limits will be temporarily disabled by setting the timing parameter to undefined; It will be reset later, so store it in a temporary variable in the meantime
					timeout_ms_tmp = two_step_task.interaction.timeout_ms;
					two_step_task.interaction.timeout_ms = undefined;
				}
			}
			
			var step_2_practice = {
				timeline: [
					two_step_task.trials.initialize_trial(),
					{ // Randomize which second step state is shown
						type: jsPsychCallFunction,
						func: function() {two_step_task.data.step_2 = Math.random() < 0.5 ? '2A' : '2B'}
					},
					two_step_task.trials.step_2(),
					two_step_task.trials.animation(),
					two_step_task.trials.reward()
				],
				repetitions: 10
			}
			
			var instr_2 = {
				type: jsPsychInstructions,
				pages: [
					'You may have noticed that this box had the lowest chance of containing a coin...' +
						'<br><br>' +
						'<img src="' + two_step_task.images.filenames['2AA'] + '" height=100</img>',
					'...these two boxes had the same chance of containing a coin...' +
						'<br><br>' +
						'<img src="' + two_step_task.images.filenames['2AB'] + '" height=100</img>' +
						'<img src="' + two_step_task.images.filenames['2BA'] + '" height=100</img>',
					'...and this one had the highest chance.' +
						'<br><br>' +
						'<img src="' + two_step_task.images.filenames['2BB'] + '" height=100</img>',
					"Note that your chance of finding a coin in a box depends only on its symbol, not which side of the screen it's on.",
					"In fact, there are <i>no</i> special patterns to when you win a coin. When you pick a box with a 60% chance of containing a coin, the computer simply gives you a 60% chance of winning a coin that round. The chance has nothing to do with any of the other boxes or your past wins or losses.",
					"This was just practice. The real game will use different boxes with different probabilities of containing coins, but the rules will stay the same.",
					"Also, in the real game, each box's chance of containing a coin will change slowly over time. A box that starts out better can turn worse later, or a worse one can turn better, so finding the current best box requires continual concentration.",
					"How each box changes is completely random and independent of each other box's probability of containing a coin. There are no special patterns in how the probabilities change.",
					"Because the probabilities change slowly, they will probably stay similar in the short term but probably change in the long term.",
					"While the red and blue boxes will potentially contain coins, there are also two green boxes that will contain either the red pair or the blue pair of boxes:" +
						'<br><br>' +
						'<img src="' + two_step_task.images.filenames['1A'] + '" height=100</img>' +
						'<img src="' + two_step_task.images.filenames['1B'] + '" height=100</img>',
					"One green box will usually (but not always) give you the red boxes, and the other green box will usually (but not always) give you the blue boxes. After choosing a green box, you choose between the red or blue boxes it gives you like before.",
					"Unlike the chances of finding coins in the red or blue boxes, the chance that a green box will lead to a particular pair of boxes will not change.",
					"For example, if a green box has a 70% chance of giving you the red boxes and a 30% chance of giving you the blue boxes, these probabilities will always be the same.",
					'On the next screen, you can try a practice version of the full game. Use the "z" key to select the box on the left and the "m" key to select the box on the right. First choose a green box, then a red or blue box.',
					'If you take too long to make a choice, the trial will end. In this case, you will see a red X on the screen...' +
						'<br>' +
						'<img src="' + two_step_task.images.filenames['timeout'] + '" height=100</img>' +
						'<br>' +
						'...and a new trial will start.' + " Don't" + ' feel rushed, but please try to enter a choice on every trial. Click "Next" to begin.'
				],
				show_clickable_nav: true
			}
			
			var initialize_full_task_practice = {
				type: jsPsychCallFunction,
				func: function() {
					two_step_task.interaction.timeout_ms = timeout_ms_tmp;
				}
			}
			
			var full_task_practice = {
				timeline: [two_step_task.trials.single_trial()],
				repetitions: 10
			}
			
			var final_instr = {
				type: jsPsychInstructions,
				pages: [
					'Note that when you choose a red or blue box, your chance of finding a coin depends only on its symbol, not which green box you chose to get there.',
					'The choice you make between the green boxes is still important because it can help you get whichever pair of boxes are most likely to contain coins.',
					'The practice round is now over. The real game will take about 20 minutes, with breaks every 5 minutes. The real game will begin when you click "Next".'
				],
				show_clickable_nav: true
			}

			var instructions = {
				timeline: [
					instr_1,
					initialize_step_2_practice,
					step_2_practice,
					instr_2,
					initialize_full_task_practice,
					full_task_practice,
					final_instr
				]
			}
			return(instructions);
		}
	}
}

two_step_task.default_setup();
