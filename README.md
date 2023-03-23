# A jsPsych implementation of the two-step task of Daw et al. (2011)

This task is meant to measure the contribution of model-based and model-free reinforcement learning strategies to human decision making. An example can be found [here](https://kinleyid.github.io/rsrch/jspsych-2st/example.html).

## Quick setup

To use all of the default settings as described in Daw et al. (2011), first source the script "2st.js".

```html
<script src="https://cdn.jsdelivr.net/gh/kinleyid/jspsych-2st@v0.6.0/2st.js"></script>
```

Then, a minimal script to run the two-step task with the default parameters is as follows:

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

`example_instructions()` returns a set of interactive instructions in which participants first become familiar with the second step, and then become familiar with the first step.

The `initialize_experiment()` trial randomizes reward probabilities, resets the trial count, and ensures the images have been loaded (and loads them if they haven't been).

Finally, `single_trial()` is a single trial during which the participant completes both steps of the task. This can be repeated for as many trials as there are in the experiment.

## Data produced

After a trial (including both steps of the task) is complete, the information about that trial is stored in an attribute called `two_step_task_info` (an example of this can be seen [here](example-data/data.csv)). An example R script to parse this data can be found [here](example-data/extract-data.R).
