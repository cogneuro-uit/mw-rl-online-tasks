/**
 * jspsych-gradient-feedback-mm
 *
 */


jsPsych.plugins['gradient-feedback-mm'] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('gradient-feedback-mm', 'stimuli', 'image');

    plugin.info = {
        name: 'gradient-feedback-mm',
        description: '',
        parameters: {
            start_color: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Start color',
                default: "black",
                description: 'Color for starting the gradient.'
            },
            end_color: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'End color',
                default: "red",
                description: 'Color to end the gradient.'
            },
            value: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Value for feedback',
                default: 0,
                description: 'Value for feedback as number between 0 and 100.'
            },
            width: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Width of feedback box',
                default: 500,
                description: 'Width of feedback box in pixels.'
            },
            height: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Height of feedback box',
                default: "100px",
                description: 'Height of feedback box in CSS style (e.g., 500px or 20%).'
            },
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Continue',
                description: 'The text that appears on the button to continue to the next trial.'
            }
        }
    }

    plugin.trial = function (display_element, trial) {
        var start_time = performance.now();

        var html = "";

        html += '<p style="margin-bottom:80px">'+
            '<div id="gradient-box" class="jspsych-gradient-box" style="'+
            'width:'+trial.width+'px;height:'+trial.height+';'+
            'margin:auto;'+
            'background:linear-gradient(to right,'+trial.start_color+','+trial.end_color+');'+
            '">'+
            '<div id="gradient-box-val" class="jspsych-gradient-box-val" style="'+
            'background:#00000055;'+
            'height:'+trial.height+';'+
            'width:'+(trial.value/100.)*trial.width+'px;'+
            'font-color:white;font-size:40px;text-align: center;'+
            'line-height:'+trial.height+';'+
            '">'+
            trial.value+
            '</div>'+
            '</div><p>';


        display_element.innerHTML = html;
        // add button
        display_element.innerHTML += '<button id="jspsych-gradient-continue-btn" class="jspsych-btn">' + trial.button_label + '</button>';

        // clicking the button will stop training
        display_element.querySelector('#jspsych-gradient-continue-btn').addEventListener('click', function (e) {
            end_trial();
        })

        var target=display_element.querySelector('#jspsych-gradient-box');

        // function to end trial when it is time
        var end_trial = function () {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            // gather the data to store for the trial
            var trial_data = {
                "training_type": trial.training_type,
                "rt": performance.now()-start_time
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };

        // function to highlight box corresponding to each key
        var after_response = function (info) {
            var keypressed=jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(info.key)
        };


        // start the response listener that highlights individual rectangles
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: jsPsych.ALL_KEYS,
            rt_method: 'performance',
            persist: true,
            allow_held_key: false
        });
    };


    return plugin;
})();
