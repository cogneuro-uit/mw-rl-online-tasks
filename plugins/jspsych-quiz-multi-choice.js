/**
 * jspsych-quiz-multi-choice
 * a jspsych plugin for multiple choice quiz questions
 *
 * Based on jspsych-survey-multi-choice by Shane Martin
 *
 *
 */


jsPsych.plugins['quiz-multi-choice'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'quiz-multi-choice',
    description: '',
    parameters: {
      question: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: false,
        pretty_name: 'Question',
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'The strings that will be associated with a group of options.'
          },
          options: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Options',
            array: true,
            default: undefined,
            description: 'Displays options for an individual question.'
          },
          horizontal: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Horizontal',
            default: false,
            description: 'If true, then questions are centered and options are displayed horizontally.'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          },
          correct: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Correct response',
            default: '',
            description: 'Indicates which response option is correct'
          },
          hint: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Hint',
            default: '',
            description: 'Hint that is displayed when an incorrect response is given'
          }

        }
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'Label of the button.'
      }
    }
  }
  plugin.trial = function(display_element, trial) {
    var plugin_id_name = "jspsych-quiz-multi-choice";

    var html = "";

    // inject CSS for trial
    html += '<style id="jspsych-quiz-multi-choice-css">';
    html += ".jspsych-quiz-multi-choice-question { margin-top: 2em; margin-bottom: 2em; text-align: center; }"+
      ".jspsych-quiz-multi-choice-horizontal .jspsych-quiz-multi-choice-text {  text-align: center;}"+
      ".jspsych-quiz-multi-choice-option { line-height: 2; }"+
      ".jspsych-quiz-multi-choice-horizontal .jspsych-quiz-multi-choice-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}"+
      "label.jspsych-quiz-multi-choice-text input[type='radio'] {margin-right: 1em;}";
    html += '</style>';

    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-quiz-multi-choice-preamble" class="jspsych-quiz-multi-choice-preamble">'+trial.preamble+'</div>';
    }

    // form element
    html += '<form id="jspsych-quiz-multi-choice-form">';
    
    // get question based on question_order
    var question = trial.question;
    var question_id = 0;
    
    // create question container
    var question_classes = ['jspsych-quiz-multi-choice-question'];
    if (question.horizontal) {
        question_classes.push('jspsych-quiz-multi-choice-horizontal');
    }

    html += '<div id="jspsych-quiz-multi-choice-'+question_id+'" class="'+question_classes.join(' ')+'"  data-name="'+question.name+'"'+' data-correct="'+question.correct+'">';

    // add question text
    html += '<p class="jspsych-quiz-multi-choice-text quiz-multi-choice">' + question.prompt 
    html += '</p>';

    // create option radio buttons
    for (var j = 0; j < question.options.length; j++) {
        // add label and question text
        var option_id_name = "jspsych-quiz-multi-choice-option-"+question_id+"-"+j;
        var input_name = 'jspsych-quiz-multi-choice-response-'+question_id;
        var input_id = 'jspsych-quiz-multi-choice-response-'+question_id+'-'+j;

        // add radio button container
        html += '<div id="'+option_id_name+'" class="jspsych-quiz-multi-choice-option">';
        html += '<label class="jspsych-quiz-multi-choice-text" for="'+input_id+'">'+question.options[j]+'</label>';
        html += '<input type="radio" name="'+input_name+'" id="'+input_id+'" value="'+question.options[j]+'" '+'required'+'></input>';
        html += '</div>';
    }
    html += '</div>';

    // add hint
    html += '<div id="jspsych-quiz-multi-choice-hint" style="visibility:hidden">'+question.hint+'</div>';

    
    // add submit button
    html += '<input type="submit" id="'+plugin_id_name+'-next" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '></input>';
    html += '</form>';

    // render
    display_element.innerHTML = html;

    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      
      var match = display_element.querySelector('#jspsych-quiz-multi-choice-0');
      var id = "Q";
      if(match.querySelector("input[type=radio]:checked") !== null){
          var val = match.querySelector("input[type=radio]:checked").value;
      } else {
          var val = "";
      }
      var obje = {};
      var name = id;
      if(match.attributes['data-name'].value !== ''){
          name = match.attributes['data-name'].value;
      }
      obje[name] = val;
      Object.assign(question_data, obje); 

      if(val!=match.attributes['data-correct'].value){
        hintmatch=display_element.querySelector('#jspsych-quiz-multi-choice-hint');
        hintmatch.style.visibility="visible";
      } else {

        // save data
        var trial_data = {
            "rt": response_time,
            "response": JSON.stringify(question_data)
        };
        display_element.innerHTML = '';

        // next trial
        jsPsych.finishTrial(trial_data);
    }
    });

    var startTime = performance.now();
  };

  return plugin;
})();
