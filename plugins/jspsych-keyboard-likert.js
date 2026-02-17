/**
 * jspsych-keyboard-likert
 *
 *
 */

jsPsych.plugins['keyboard-likert'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'keyboard-likert',
    description: '',
    parameters: {
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: undefined,
        description: 'Question that is associated with the slider.'
      },
      labels: {
        type: jsPsych.plugins.parameterType.STRING,
        array: true,
        pretty_name: 'Labels',
        default: undefined,
        description: 'Labels for the scale.'
      },
      keys: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Keys',
        default: jsPsych.ALL_KEYS,
        description: 'A list of keys that correspond to the labels of the Likert scale.'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'String to display at top of the page.'
      },
      wait_after_response: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Wait after response',
        default: 1000,
        description: 'Time in ms that the script pauses after the selection has been done by keyboard.'
      }
    }
  }

  plugin.trial = function (display_element, trial) {

    if (trial.labels.length != trial.keys.length) {
      console.error('Error in keyboard-likert plugin. The length of the labels array does not equal the length of the keys array');
    }
    var html = "";
    // inject CSS for trial
    html += '<style id="jspsych-keyboard-likert-css">';
    html += ".jspsych-keyboard-likert-statement { display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px; }" +
      ".jspsych-keyboard-likert-opts { list-style:none; width:100%; margin:0; padding:0 0 35px; display:block; font-size: 14px; line-height:1.1em; }" +
      ".jspsych-keyboard-likert-opt-label { line-height: 1.1em; color: #444; }" +
      ".jspsych-keyboard-likert-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:4px; width:100%; }" +
      ".jspsych-keyboard-likert-opts:last-of-type { border-bottom: 0; }" +
      ".jspsych-keyboard-likert-opts li { display:inline-block; /*width:19%;*/ text-align:center; vertical-align: top; }" +
      ".jspsych-keyboard-likert-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }"
    html += '</style>';

    // show preamble text
    if (trial.preamble !== null) {
      html += '<div id="jspsych-keyboard-likert-preamble" class="jspsych-keyboard-likert-preamble">' + trial.preamble + '</div>';
    }

    // add likert scale questions
    html += '<label class="jspsych-keyboard-likert-statement">' + trial.prompt + '</label>';
    // add options
    var width = 100 / trial.labels.length;
    var options_string = '<ul class="jspsych-keyboard-likert-opts" data-radio-group="Q">';
    for (var j = 0; j < trial.labels.length; j++) {
      options_string += '<li style="width:' + width + '%"><input id="jspsych-keyboard-likert-item-' + j + '" type="radio" disabled name="Q" value="' + j + '">';
      options_string += '<label class="jspsych-keyboard-likert-opt-label">' + trial.labels[j] + '</label></li>';
    }
    options_string += '</ul>';
    html += options_string;

    display_element.innerHTML = html;

    // store response
    var response = {
      rt: null,
      key: null
    };


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
        "rt": response.rt,
        "scale_index": trial.keys.indexOf(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key)),
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function (info) {
      console.log(info);
      checkix = trial.keys.indexOf(info.key);
      var rbtn = display_element.querySelector('#jspsych-keyboard-likert-item-' + checkix)
      rbtn.checked = true;
      rbtn.disabled = false;

      // only record the first response
      if (response.key == null) {
        response = info;
      }
      setTimeout(end_trial, trial.wait_after_response);
    };


    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.keys,
      rt_method: 'performance',
      persist: false,
      allow_held_key: false
    });
  };
  return plugin;
})();
