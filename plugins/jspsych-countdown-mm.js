/**
 * jspsych-countdown-mm
 *
 */


jsPsych.plugins['countdown-mm'] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('countdown-mm', 'stimuli', 'image');

    plugin.info = {
        name: 'countdown-mm',
        description: 'Display countdown in center of screen and finish once it is done.',
        parameters: {
            countdown_max: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Countdown',
                default: 3,
                description: 'Number to start counting down from.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Text to display along with the countdown.'
            },
            prompt_location: {
                type: jsPsych.plugins.parameterType.SELECT,
                pretty_name: 'Prompt location',
                options: ['above', 'below'],
                default: 'above',
                description: 'Indicates whether to show prompt "above" or "below" the countdown area.'
            },
            
            duration: {
                type: jsPsych.plugins.parameterType.int,
                pretty_name: 'Duration',
                default: '1000', // = 1 second
                description: 'Duration of each number of the countdown in milliseconds.'
            }
        }
    }

    plugin.trial = function (display_element, trial) {
        var start_time = performance.now();
        var countdown=trial.countdown_max;
        var html = "";
        // check if there is a prompt and if it is shown above
        if (trial.prompt !== null && trial.prompt_location == "above") {
            html += trial.prompt;
        }

        html += "<div id='jspsych-countdown-mm-target' class='jspsych-countdown-mm-digit'>"+countdown+"</div>"

        // check if prompt exists and if it is shown below
        if (trial.prompt !== null && trial.prompt_location == "below") {
            html += trial.prompt;
        }

        display_element.innerHTML = html;

        var countdown_function = function() {
            var el=display_element.querySelector('#jspsych-countdown-mm-target')
            //console.log(el)
            countdown -= 1;
            el.innerHTML=countdown;

            if(countdown<=0){
                // kill any remaining setTimeout handlers
                jsPsych.pluginAPI.clearAllTimeouts();

                // kill keyboard listeners
                if (typeof keyboardListener !== 'undefined') {
                    jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                }

                // gather the data to store for the trial
                var trial_data = {
                    "rt": performance.now()-start_time
                };

                // clear the display
                display_element.innerHTML = '';

                // move on to the next trial
                jsPsych.finishTrial(trial_data);

            } else {
                setTimeout(countdown_function, trial.duration);
            }
        }
        setTimeout(countdown_function, trial.duration);
        };



    return plugin;
})();
