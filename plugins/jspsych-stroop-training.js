/**
 * jspsych-stroop-training
 *
 */


jsPsych.plugins['stroop-training'] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('stroop-training', 'stimuli', 'image');

    plugin.info = {
        name: 'stroop-training',
        description: '',
        parameters: {
            training_type: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Training Type',
                default: 1,
                description: 'Number between 1 and 4 indicating which training is supposed to be shown.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'It can be used to provide a reminder about the action the subject is supposed to take.'
            },
            prompt_location: {
                type: jsPsych.plugins.parameterType.SELECT,
                pretty_name: 'Prompt location',
                options: ['above', 'below'],
                default: 'above',
                description: 'Indicates whether to show prompt "above" or "below" the sorting area.'
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
        var keytocolor={
            'd':"red",
            "f":"green",
            "j":"blue",
            "k":"yellow"
        };
        var colorlabels=["RØD","GRØNN", "BLÅ","GUL"];

        var html = "";
        // check if there is a prompt and if it is shown above
        if (trial.prompt !== null && trial.prompt_location == "above") {
            html += trial.prompt;
        }

        html += '<p style="margin-bottom:80px">'+
            '<div id="jspsych-stroop-training-box-target" class="jspsych-stroop-target-box" style="margin:auto;background-color: grey;"></div><p style="margin-bottom:80px">'+
            '<div id="jspsych-stroop-training-area"  class="jspsych-stroop-training-area">' +
            '<div id="jspsych-stroop-training-box-d" class="jspsych-stroop-training-box" style="background-color: red;"><strong>d</strong></div>' +
            '<div id="jspsych-stroop-training-box-f" class="jspsych-stroop-training-box" style="background-color: green;"><strong>f</strong></div>' +
            '<div id="jspsych-stroop-training-box-j" class="jspsych-stroop-training-box" style="background-color: blue;"><strong>j</strong></div>' +
            '<div id="jspsych-stroop-training-box-k" class="jspsych-stroop-training-box" style="background-color: yellow;"><strong>k</strong></div>' +
            '</div><p>';

        // check if prompt exists and if it is shown below
        if (trial.prompt !== null && trial.prompt_location == "below") {
            html += trial.prompt;
        }

        display_element.innerHTML = html;

        // add button
        display_element.innerHTML += '<button id="jspsych-stroop-training-done-btn" class="jspsych-btn">' + trial.button_label + '</button>';

        // clicking the button will stop training
        display_element.querySelector('#jspsych-stroop-training-done-btn').addEventListener('click', function (e) {
            end_trial();
        })

        var currentcolor=jsPsych.randomization.sampleWithReplacement(["red","green","blue","yellow"], 1)[0];
        var target=display_element.querySelector('#jspsych-stroop-training-box-target');

        if(trial.training_type==1 || trial.training_type==4){ // first training without, 4th with color word
            target.style["background-color"]="transparent";
        } else {
            target.style["background-color"]=currentcolor;
        }

        if(trial.training_type>3){ // training 3 and 4 with grey, labeled help-boxes
            var boxes=display_element.querySelectorAll('.jspsych-stroop-training-box')
            for(var i=0; i<boxes.length; ++i){
                boxes[i].style["background-color"]="lightgrey";
                boxes[i].innerHTML=colorlabels[i];
            }
        }

        if(trial.training_type==4){ // training 4 has color words
            lab=jsPsych.randomization.sampleWithReplacement(colorlabels.concat(["XXXXX"]),1);
            target.innerHTML=lab;
            target.style["color"]=currentcolor;
            target.style["font-size"]="60px";
            // do not allow to continue until 10 corrects
            display_element.querySelector('#jspsych-stroop-training-done-btn').disabled=true;
        }

        var ncorrect=0; // counter for allowing to continue after 10 correct successive answers

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

            if(["d","f","j","k"].includes(keypressed)){
                el=display_element.querySelector('#jspsych-stroop-training-box-'+keypressed)
                el.style["border-color"]="black"

                if(trial.training_type>=2){ // target is colored rect for training 2 and 3
                    ncorrect++;
                    if(currentcolor==keytocolor[keypressed]){
                        currentcolor=jsPsych.randomization.sampleWithReplacement(["red","green","blue","yellow"], 1)[0];
                        if(trial.training_type<=3){
                            target.style["background-color"]=currentcolor
                        } else {
                            lab=jsPsych.randomization.sampleWithReplacement(colorlabels.concat(["XXXXX"]),1);
                            target.innerHTML=lab;
                            target.style["color"]=currentcolor;                
                            if(ncorrect>=10){
                                display_element.querySelector('#jspsych-stroop-training-done-btn').disabled=false;
                            }
                        }
                    } else {
                        ncorrect=0;
                    }
                }

                var removeBorder = function(){
                    display_element.querySelectorAll(".jspsych-stroop-training-box").forEach( (box) => {
                        box.style["border-color"]="transparent";
                    } )
                }

                setTimeout(removeBorder, 300);
            } else {
            }
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
