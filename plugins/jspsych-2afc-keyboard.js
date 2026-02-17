/**
 * jspsych-2afc-keyboard
 * plugin for forced-choice with keys
 * Tim Brady Dec 2020
  */

var fc_keyboard_css_added = false;

jsPsych.plugins['2afc-keyboard'] = (function() {

  var plugin = {};
  jsPsych.pluginAPI.registerPreload('2afc-keyboard', 'stimuli', 'image');
  plugin.info = {
    name: '2afc-keyboard',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'Images to be displayed and chosen between'
      },
      keys: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Array of length 2, left key and right key',
        default: undefined,
				array: true,
        description: 'The keys to indicate the correct response.'
      },
      which_correct: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Which is the correct answer',
        default: 0,
        description: 'Correct answer, 0 to stimuli.length-1'
      },			
			shuffle_order: {
        type: jsPsych.plugins.parameterType.Boolean,
        pretty_name: 'Shuffle spatial positions of the items?',
        default: true,
        description: 'If true, show in random positions. If false, show stimuli in order given.'				
			},
			feedback: {
        type: jsPsych.plugins.parameterType.Boolean,
        pretty_name: 'Give feedback?',
        default: false,
        description: 'Should we give feedback?'
			},		
			prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the options.'
      },
      stim_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: '(optional) Stimulus height',
        default: null,
        description: 'Height of images in pixels.'
      },
      stim_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: '(optional) Stimulus width',
        default: null,
        description: 'Width of images in pixels'
      },
    }
  }
	
  plugin.trial = function(display_element, trial) {

    /* Add CSS for classes just once when 
      plugin is first used: 
    --------------------------------*/
		if (!fc_keyboard_css_added) {			
			var curFile = document.querySelector('script[src*=jspsych-fc-mouse]');
			baseDir = curFile.src.match(/(.*)[\/\\]/)[1]||'';
			
			var cSound = document.createElement('audio');
			cSound.id       = 'fc_correct_sound';
			cSound.src      = `${baseDir}/win.mp3`;
			cSound.type     = 'audio/mpeg';
			document.body.appendChild(cSound);
			var eSound = document.createElement('audio');
			eSound.id       = 'fc_error_sound';
			eSound.src      = `${baseDir}/lose.mp3`;
			eSound.type     = 'audio/mpeg';
			document.body.appendChild(eSound);			
			
			fc_keyboard_css_added = true;
		}
		
		var order = [];
		for (var i=0; i<trial.stimuli.length;i++) {
			order.push(i);
		}
		if (trial.shuffle_order) {
			order = jsPsych.randomization.shuffle(order);
		}
		
		var html = "<div id='fcMouseReportDiv'>"
		for (var i=0; i<trial.stimuli.length; i++) {
			curItem = order[i];
			var width = (trial.stim_width==null)? "": `width="${trial.stim_width}"`;
			var height = (trial.stim_height==null)? "": `height="${trial.stim_height}"`;
			html+= `<img src="${trial.stimuli[curItem]}" isCorrect="${(trial.which_correct==curItem)?'1':'0'}" curItem="${curItem}" curPosition="${i}" class="fcChoice" ${width} ${height}> &nbsp;&nbsp;`;
		}
		html+=`</div><div id='prompt'>${(trial.prompt==null)?"":trial.prompt}</div>`;
		display_element.innerHTML = html;

		jsPsych.pluginAPI.getKeyboardResponse({
			callback_function: judge_response,
			valid_responses: trial.keys,
			rt_method: 'performance',
			persist: false
		});
		
		var rt;
		var correct;
		var keyResponse;
		function judge_response(info){ 
			rt = info.rt;
			correct = info.key == trial.keys[trial.which_correct];
			keyResponse = info.key;
			if (trial.feedback) {
				if (correct) {
					var audio = document.getElementById("fc_correct_sound");
					audio.volume = 0.6;
					audio.currentTime = 0;
					audio.play();
				} else {
					var audio = document.getElementById("fc_error_sound");
					audio.currentTime = 0;
					audio.volume = 0.4;
					audio.play();					
				}
				setTimeout(endTrial, 500);
			} else {		
				setTimeout(endTrial, 100);
			}
		}

		/* End trial and record information:  
		-------------------------------- */		
		var endTrial = function(){
			var trial_data = {
				"rt": rt,
				"order": order,
				"items": trial.stimuli,
				"key_response": keyResponse,
				"correct": 		correct,
			};
			display_element.innerHTML = '';
			jsPsych.finishTrial(trial_data);
		};
	
  };
  return plugin;
})();
