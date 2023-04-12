# A jsPsych implementation of the two-step task of Daw et al. (2011)

This task (also known as the two-stage task) is meant to measure the contribution of model-based and model-free reinforcement learning strategies to human decision making. The code here allows you to easily integrate this task into your online study. To see how the trials look, click [here](https://kinleyid.github.io/rsrch/jspsych-2st/short-example.html). A full example with detailed instructions for participants can be found [here](https://kinleyid.github.io/rsrch/jspsych-2st/full-example.html).

## Contents of this overview:
1. [Quick setup](#quick-setup)
2. [Creating trials](#creating-trials)
3. [Data produced](#data-produced)
4. [Parameters](#parameters)
---

## Quick setup

First, source the script "2st.js":

```html
<script src="https://cdn.jsdelivr.net/gh/kinleyid/jspsych-2st@v0.6.0/2st.js"></script>
```

Then, a minimal script to run the two-step task with the default parameters as described in Daw et al. (2011) is as follows:

```javascript
var jsPsych = initJsPsych();
two_step_task.default_setup();
var timeline = [
  { // Preload images
    type: jsPsychPreload,
    images: two_step_task.images.list_filenames()
  },
  two_step_task.trials.initialize_experiment(),
  two_step_task.trials.example_instructions(),
  // Reset reward probabilities:
  two_step_task.trials.initialize_experiment(),
  { // full experiment
    timeline: [two_step_task.trials.single_trial()],
    repetitions: 100
  },
];
jsPsych.run(timeline);
```

The `default_setup()` function sets the task to use the default images (which can be found [here](img/)). This ensures that the `images.list_filenames()` function returns the correct list of filenames for the jsPsych preload plugin.

## Creating trials

`two_step_task.trials` contains a set of functions to create jsPsych trial objects that can be pushed to the timeline. An "initialization" trial that is created using `two_step_task.trials.initialize_experiment()` must be pushed to the timeline before any two-step task trials. This trial ensures the necessary images are loaded, (re-)randomizes reward probabilities, and (re)sets an internal trial count to 0. A single two-step task trial can then be created using `two_step_task.trials.single_trial()` and consists of the following "sub-trials":

```javascript
[ // Timeline of a single two-step task trial:
  two_step_task.trials.initialize_trial(), // Set and reset important info passed between trials
  two_step_task.trials.step_1(), // Solicit response to step 1
  two_step_task.trials.transition(), // Compute transition to step 2 state
  two_step_task.trials.animation(), // Animate step 1 selection
  two_step_task.trials.step_2(), // Solicit response to step 2
  two_step_task.trials.animation(), // Animate step 2 selection
  two_step_task.trials.reward(), // Show reward or lack
  two_step_task.trials.show_timeout(), // Show time-out screen, if applicable
  two_step_task.trials.update_reward_probs(), // Drift reward probabilities
  two_step_task.trials.record_data() // Record data from the entire trial
]
```

These sub-trials can be recombined to modify the task. NB: in the trial timeline produced by `two_step_task.trials.single_trial()`, the trials from `step_1()` to `reward()` are contained within a sub-timeline that can be aborted in case the participant doesn't make a response quickly enough.

`two_step_task.trials.example_instructions()` can be used to create a set of interactive instruction in which participants first become familiar with the second stage, then the first.

## Data produced

After a trial (including both steps of the task) is complete, the information about that trial is stored in a `jsPsych.data` property called `two_step_task_info`. An example of how this property looks can be seen [here](example-data/data.csv) along with an example data extraction R script [here](example-data/extract-data.R). `two_step_task_info` is an object with the following attributes:

| Attribute | Description |
| --- | --- |
| `trial_n` | Trial number |
| `reward_probs` | Object mapping each terminal state to its associated reward probability. E.g. `{2AA: 0.33, 2AB: 0.27, 2BA: 0.60, 2BB: 0.35}` |
| `step_1_action` | Action taken during step 1 ( `'1A'` or  `'1B'`). |
| `step_2` | The state reached to enter step 2 (`'2A'` or `'2B'`). |
| `transition` | Specifies whether the step one-to-step two transition was `'common'` or `'rare'`. |
| `step_2_action` | Action taken during step 2 (`'2AA'`, `'2AB'`, `'2BA'`, or `'2BB'`). |
| `reward` | Specifies whether a reward was received (Boolean)
| `timeout` | Specifies whether the participant took to long to make a response, thus ending the trial early (Boolean) |

## Parameters

### Timing

Various aspects of the timing of trials are controlled by the following set of parameters:

| Parameter | Description | Default value (in milliseconds) |
|------|------|------|
| `two_step_task.interaction.timeout_ms` | Length of time allowed for a response, after which a trial "times out" | 2000 |
| `two_step_task.interaction.timeout_display_ms` | Duration of feedback indicating a trial has "timed out" | 1000 |
| `two_step_task.animation.length_ms` | Length of animation in which icons representing actions move from one side of the screen to the top middle | 500 |
| `two_step_task.reward.display_ms` | Duration of feedback indicating reward or lack thereof | 1000 |

### Keyboard input

The parameter `two_step_task.interaction.choice_keys` specifies which keys are available to participants to make their responses. It has a default value of `['z', 'm']`.

### Images

Image filenames are attached to a set of attributes of `two_step_task.images.filenames`. The paths to the default images, as shown below, are set using `two_step_task.images.set_files_to_default`.

| Image | Description | Default |
|------|------|------|
| `two_step_task.images.filenames.1A` | Image associated with action 1A | ![img/1A.svg](img/1A.svg) |
| `two_step_task.images.filenames.1B` | Image associated with action 1B | ![img/1B.svg](img/1B.svg) |
| `two_step_task.images.filenames.2AA` | Image associated with action 2AA | ![img/2AA.svg](img/2AA.svg) |
| `two_step_task.images.filenames.2AB` | Image associated with action 2AB | ![img/2AB.svg](img/2AB.svg) |
| `two_step_task.images.filenames.2BA` | Image associated with action 2BA | ![img/2BA.svg](img/2BA.svg) |
| `two_step_task.images.filenames.2BB` | Image associated with action 2BB | ![img/2BB.svg](img/2BB.svg) |
| `two_step_task.images.filenames.reward` | Image shown when a reward is received | ![img/reward.svg](img/reward.svg) |
| `two_step_task.images.filenames.no_reward` | Image shown when a reward is not received | ![img/no_reward.svg](img/no_reward.svg) |
| `two_step_task.images.filenames.timeout` | Image shown when a participant takes too long to make a response | ![img/timeout.svg](img/timeout.svg) |
