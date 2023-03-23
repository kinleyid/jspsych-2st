
require(rjson)

all_data <- read.csv('data.csv')
# Get only trials where two step task data is recorded
trial_data <- subset(all_data, two_step_task_data != '')
# Parse JSON to list of lists
parsed_json <- lapply(trial_data$two_step_task_data, fromJSON)
# Convert to list of data frames
df_list <- lapply(parsed_json, data.frame)
# Combine data frames
trials <- do.call(rbind, df_list)
# Record last transition, reward, and step 1 action
for (v in c('transition', 'reward', 'step_1_action')) {
  trials[[sprintf('last_%s', v)]] <- c(NA, trials[[v]][-nrow(trials)])
}
# Model stay probability with logistic regression
trials$stay <- trials$step_1_action == trials$last_step_1_action
logistic_model <- glm(stay ~ last_reward * last_transition, data = trials, family = binomial(link='logit'))
