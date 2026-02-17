/**
 * jspsych-2afc-probreward-mm
 *
 */


jsPsych.plugins['2afc-probreward-mm'] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('2afc-probreward-mm', 'stimuli', 'image');

    plugin.info = {
        name: '2afc-probreward-mm',
        description: 'Present 2-AFC and give probabilistic reward afterwards.',
        parameters: {
            title: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'label/title',
                default: "",
                description: 'A title/label put over the stimuli.'
            },
            stimuli: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'list of 2 stimuli',
                default: {left: "A", right: "B"},
                description: 'an object containing fields "left" and "right" with any valid html'
            },
            fixcross_duration: {
                type: jsPsych.plugins.parameterType.Object,
                pretty_name: 'duration of fixation cross',
                default: [200, 500, 800],
                description: 'Duration the fixation cross (in ms); in case a list is provided, one of the elements is chosen randomly.'
            },
            fixation_cross: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'fixation cross',
                default: "<div style='font-size:100px; color:black;'>+</div>",
                description: 'Stimulus presented as fixation cross (HTML).'
            },
            feedback_stimuli: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'list of 3 stimuli',
                default: {positive: "good", negative: "bad", neutral: "missed"},
                description: 'an object containing fields "positive", "negative" and "neutral" with any valid html'
            },
            preward: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: "probability of reward",
                default: {left:0.7, right:0.3},
                description: "Probability to get a positive reward; object containing 'left' and 'right' with respective probabilities."
            },
            responses: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'list of 2 response buttons',
                default: {left: "f", right: "j"},
                description: 'an object containing fields "left" and "right" with any valid response button'
            },
            width: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'width of each stimulus',
                default: "100px",
                description: 'in HTML-compatible units (px, %).'
            },            
            distance: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'distance between stimuli',
                default: "300px",
                description: 'in HTML-compatible units (px, %).'
            },
            height: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Height of stimuli',
                default: "100px",
                description: 'Height of stimuli box in CSS style (e.g., 500px or 20%).'
            },
            highlight_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'duration highlighted stimulus',
                default: 200,
                description: 'Duration the selected stimulus is highlighted (in ms).'
            },
            feedback_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'duration feedback',
                default: 200,
                description: 'Duration the feedback/reward is presented (in ms).'
            },
            max_decision_time: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'max time for decision',
                default: 1700,
                description: 'Maximum time for making decision (in ms).'
            },
            total_trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Total duration of trial',
                default: 3300,
                description: 'Total trial duration (fixcross, decision, highlight, feedback, rest) in ms.'
            },
            border_style: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Style of border for highlighting',
                default: "2px solid black",
                description: 'given as CSS border-style "thickness style color".'
            }

        }
    }

    plugin.trial = function (display_element, trial) {
        var start_time = performance.now();
        var trial_data={
            preward_left: trial.preward.left,
            preward_right:trial.preward.right
        };
        var html = "";
        
        // placeholder so that size of stimulus does not change at highlighting
        let bord_style=trial.border_style.split(" ").slice(0,-1).concat("transparent").join(" ");

        html += `<div id="jspsych-2afc-probreward-stimulus-wrapper" 
                      style="display:flex;
                             align-items: center;
                             justify-content: center;">
                        <div id="jspsych-2afc-probreward-left-stimulus" 
                             class="jspsych-2afc-probreward-stimulus"
                             style="border:${ bord_style };
                                    visibility:hidden;">
                             ${ trial.stimuli.left }
                        </div>
                        <div id="jspsych-2afc-probreward-fixcross" 
                             style="width: ${ trial.distance }">
                             ${ trial.fixation_cross }
                        </div>
                        <div id="jspsych-2afc-probreward-right-stimulus" 
                             class="jspsych-2afc-probreward-stimulus"
                             style="border:${ bord_style };
                                    visibility:hidden;">
                             ${ trial.stimuli.right }
                        </div>
                </div>
            `          
        display_element.innerHTML = html;



        /* --------------- FIXATION CROSS ------------------ */
        var after_fixcross = function(){
            // after fixation cross, show the 2-AFC stimulus
            el=display_element.querySelector(`#jspsych-2afc-probreward-fixcross`);
            el.style["visibility"]="hidden";
            display_element.querySelectorAll(".jspsych-2afc-probreward-stimulus").forEach( (box) => {
                box.style["visibility"]="visible";
            })
            trial_data["stim_onset"]=performance.now()-start_time

            // start the response listener to make the 2-AFC decision
            jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: after_response_or_timeout,
                valid_responses: Object.values(trial.responses), //jsPsych.ALL_KEYS,
                rt_method: 'performance',
                persist: true,
                allow_held_key: false
            });

            jsPsych.pluginAPI.setTimeout(after_response_or_timeout, trial.max_decision_time);
        }
        
        var fixdur=trial.fixcross_duration;
        if( Array.isArray(trial.fixcross_duration) ){
            fixdur = trial.fixcross_duration[Math.floor(Math.random()*trial.fixcross_duration.length)];
        }
        trial_data["fixcross_duration"]=fixdur;
        setTimeout(after_fixcross, fixdur);


        /* --------------- END TRIAL ------------------ */
        var end_trial = function () {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            jsPsych.pluginAPI.cancelAllKeyboardResponses();

            // gather the data to store for the trial
            trial_data["trial_duration"]=performance.now()-start_time;


            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        }; // end_trial

        /* --------------- feedback ------------------ */

        var after_feedback = function(){
            // show blank screen until total duration is fulfilled
            display_element.innerHTML = '';
            var elapsed=performance.now() - start_time;
            var waitfor=trial.total_trial_duration-elapsed;
            jsPsych.pluginAPI.setTimeout(end_trial, waitfor);
        }

        var show_feedback = function(reward){
            console.log(reward);
            trial_data["feedback_onset"]=performance.now()-start_time;
            display_element.querySelectorAll(".jspsych-2afc-probreward-stimulus").forEach( (box) => {
                box.style["visibility"]="hidden";
            })
            el=display_element.querySelector(`#jspsych-2afc-probreward-fixcross`);
            el.style["visibility"]="visible";
            el.innerHTML=trial.feedback_stimuli[reward];
            jsPsych.pluginAPI.setTimeout(after_feedback, trial.feedback_duration);
        }

        /* --------------- 2-AFC ------------------ */
        var after_response_or_timeout = function(info) {
            if( typeof info == "undefined" ){
               // timeout!
               jsPsych.pluginAPI.cancelAllKeyboardResponses();

               feedback=trial.feedback_stimuli.neutral;
               trial_data["rt"]=NaN;
               trial_data["reward"]="neutral";
               trial_data["selected"]="none";
               show_feedback("neutral");
            } else {
                jsPsych.pluginAPI.clearAllTimeouts();
                jsPsych.pluginAPI.cancelAllKeyboardResponses();
                var key=info.key;
                var selected_side="right";
                trial_data["rt"]=info.rt;
                if( key == trial.responses.left ){
                    selected_side="left";
                }

                el=display_element.querySelector(`#jspsych-2afc-probreward-${ selected_side }-stimulus`);
                el.style["border"]=trial.border_style;

                var removeBorder = function(reward){
                    display_element.querySelectorAll(".jspsych-2afc-probreward-stimulus").forEach( (box) => {
                        box.style["border-color"]="transparent";
                    } )
                    show_feedback(reward);
                }

                trial_data["selected"]=selected_side;

                var prew=trial.preward[selected_side];
                var reward="negative";
                if( Math.random()<=prew ){
                    reward="positive";
                }
                trial_data["reward"]=reward;
                setTimeout(removeBorder, trial.highlight_duration, reward);
            }
        }; // after_response

    };


    return plugin;
})();
