!(function() {

  function Plugin(options) {
      this.playCallBack = options.playCallBack;
      this.$context = options.context;
      this.$Audio = this.$context.children('.media');
      this.Audio = this.$Audio[0];
      this.$audio_area = this.$context.find('.audio_play_area');
      this.$audio_playtime = this.$context.find('.audio_playtime');
      this.$audio_length = this.$context.find('.audio_length');
      this.$audio_progress = this.$context.find('.audio_progress');
      this.$audio_progress_bar = this.$context.find('.progress_bar');
      this.$audio_progress_handle = this.$context.find('.audio_progress_handle');
      this.currentState = 'pause';
      this.touch = {
        startFlag:false,
        startX:0,
        x:0,
        start:'ontouchstart' in window ? 'touchstart':'mousedown',
        move:'ontouchmove' in window ? 'touchmove':'mousemove',
        end:'ontouchend' in window ? 'touchend':'mouseup',
        offset:{
          left:0
        }
      }
      this.init();
    }
  Plugin.prototype = {
    init: function() {
      var _this = this;
      _this.events();

    },
    play: function() {
      var _this = this;

        $(this.$audio_area).css("background-image","url(../img/pause_btn.png)");
      if (_this.currentState === "play") {
        _this.pause();
          $(this.$audio_area).css("background-image","url(../img/play_btn.png)");
        return;
      }
      _this.Audio.play();
      clearInterval(_this.timer);
      _this.timer = setInterval(_this.run.bind(_this), 50);
      _this.playCallBack();
      _this.currentState = "play";
      _this.$audio_area.addClass('playing');

    },
    pause: function() {
      var _this = this;
      _this.Audio.pause();
      _this.currentState = "pause";
      clearInterval(_this.timer);
      _this.$audio_area.removeClass('playing');
        $(this.$audio_area ).css("background-image","url(../img/pause_btn.png)");
    },
    stop:function(){


    },
    events: function() {
      var _this = this,
          updateTime;
      _this.$audio_area.on('click', function() {
        _this.play();

         // console.log($(this.$audio_area))

        if (!updateTime) {
          _this.updateTotalTime();
          updateTime = true;
        }
      });
      _this.$Audio.on('canplay', function () {
          _this.updateTotalTime();
      });
      
      _this.$audio_progress_handle.on(_this.touch.start,function(e){
        _this.pause();
        _this.touch.startFlag = true;
        _this.touch.startX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX:e.pageX;
        _this.touch.offset.left = _this.$audio_progress_handle.position().left;
        
      });
      $(document).on(_this.touch.move,function(e){
        if(!_this.touch.startFlag) return;
        _this.touch.x = e.originalEvent.touches ? e.originalEvent.touches[0].pageX:e.pageX;
        _this.dragAudioProgressBar(_this.touch.offset.left,_this.touch.x-_this.touch.startX);
      });
      $(document).on(_this.touch.end,function(e){
        if(_this.touch.startFlag){
          _this.touch.startFlag = false;
          _this.play();
        }
      });
    },
 
    run: function() {
      var _this = this;
      _this.animateProgressBarPosition();
      if (_this.Audio.ended) {
        _this.pause();
          $(this.$audio_area ).css("background-image","url(../img/play_btn.png)");
          // console.log(this.$context)

      }
    },

    animateProgressBarPosition: function() {
      var _this = this,
        percentage = (_this.Audio.currentTime * 100 / _this.Audio.duration) + '%';
      if (percentage === "NaN%") {
        percentage = 0 + '%';
      }
      var styles = {
        "width": percentage
      };
      _this.$audio_progress.css(styles);
      _this.$audio_progress_handle.css({left:percentage});
      _this.updatePlayTime();
    },
    
    dragAudioProgressBar: function(left,x){
      var _this = this,
          percentage = 0;
      percentage = left + x;
      percentage = (percentage/_this.$audio_progress_bar.width()) * 100;
      percentage = Math.max(0,percentage);
      percentage = Math.min(100,percentage);
      _this.$audio_progress_handle.css({left:percentage+'%'});
      _this.Audio.currentTime = _this.Audio.duration*(percentage/100);
      _this.animateProgressBarPosition();
    },
    
    getAudioCurrentTime: function(){
      var _this = this,
        currentTime = _this.Audio.currentTime;
      return currentTime < 60 ? '00:'+_this.getAudioSeconds(_this.Audio.currentTime):_this.getAudioMinutes(_this.Audio.currentTime)+':'+_this.getAudioSeconds(_this.Audio.currentTime)
    },

    getAudioSeconds: function(string) {
      var _this = this,
        string = string % 60;
      string = _this.addZero(Math.floor(string), 2);
      (string < 60) ? string = string: string = "00";
      return string;
    },

    getAudioMinutes: function(string) {
      var _this = this,
        string = string / 60;
      string = _this.addZero(Math.floor(string), 2);
      (string < 60) ? string = string: string = "00";
      return string;
    },

    addZero: function(word, howManyZero) {
      var word = String(word);
      while (word.length < howManyZero) word = "0" + word;
      return word;
    },
    
    updatePlayTime: function(){
      var _this = this;
      _this.$audio_playtime.text(_this.getAudioCurrentTime());
    },
    
    updateTotalTime: function() {
      var _this = this,
        time = _this.Audio.duration,
        minutes = _this.getAudioMinutes(time),
        seconds = _this.getAudioSeconds(time),
        audioTime = minutes + ":" + seconds;
      _this.$audio_length.text(audioTime);
    },
  };
  
  $.fn.weixinAudio = function(audioOpt) {
    var $this = $(this),
        audioPlugs = {},
        defaultoptions = {
          title: audioOpt.title || '默认标题',
          audioList: audioOpt.audioList || [] ,
          replace: audioOpt.replace || 'audio'
        },
        audioTemplateHtml = ''+
        '<div class="weixinAudio">'+
          '<audio src="{{#audioSrc}}" class="media" width="1" height="1" preload></audio>' +
          '<div class="audio_area">' +
          
            '<div class="audio_play_area">' +
              // '<i class="icon_audio_default"></i>' +
              // '<i class="icon_audio_playing"></i>' +

            '</div>' +
            
            '<div class="audio_info_area">' +
              '<div class="audio_title"><img src="../img/title'+'{{#title}}'+'.png" width="100%"></div>' +
              '<div class="progress_bar">' +
                '<span class="audio_progress " style="width: 0%;"></span>' +
                '<span class="audio_progress_handle"></span>' +
              '</div>' +
              // '<div class="audio_desc">' +
              //   '<span class="audio_playtime">00:00</span>' +
              //   '<span class="audio_length">-</span>' +
              // '</div>' +
            '</div>' +
            
          '</div>' +
        '<div>'
    if(defaultoptions.replace!==''){
      $this.find(defaultoptions.replace).each(function(){
        var _audioData = {
          title:$(this).attr('title') || defaultoptions.title,
          src:_src = $(this).attr('src') || $(this).find('source').attr('src')

        };
        $(this).replaceWith(renderAudioHtml(audioTemplateHtml,_audioData));
      });
    }
    for(audio of defaultoptions.audioList){
      $this.append(renderAudioHtml(audioTemplateHtml,audio));
    }
    $this.find('.weixinAudio').each(function(index,element){
      audioPlugs['weixinAudio'+index] = new Plugin({
        context:$(this),
        playCallBack :function(){
          for(var item in audioPlugs){
            if(audioPlugs[item].currentState=='play'){
              audioPlugs[item].pause();
                $(audioPlugs[item].$audio_area).css("background-image","url(../img/play_btn.png)");

            }
          }
        }
      });
    });
    return audioPlugs;
    
    function renderAudioHtml(templateHtml,audioData){
      return templateHtml.replace('{{#audioSrc}}',audioData.src).replace('{{#title}}',audioData.title);
    }
  };
})(jQuery);