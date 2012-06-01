/**
 * popup.js
 *
 * @requires  jquery.js
 * @requires  sha1.js
 */
(function($) {
  var Atropa = {
    BASE: 'https://atropa.wurstcase.net',
    API: {
      VIDEOS: '/api/videos.json?',
      VIDEO: '/api/videos/{id}.json?'
    },
    ADMIN: {
      VIDEOS: '/admin/videos',
      VIDEO: '/admin/videos/{id}/edit'
    }
  };

  function Popup(tab, submit, inputs) {
    this.isLoading = false;
    this.submit = submit;
    this.inputs = inputs;
    this.tab = tab;

    this.considerSubmitButton = function() {
      if ( ! this.tab.isAtropa() && localStorage.username && localStorage.apikey) {
        this.submit.show();
      } else {
        this.submit.hide();
      }
    };

    this.startLoading = function() {
      this.isLoading = true;
      this.submit.addClass('load').text('Submitting..');
    };

    this.stopLoading = function(message) {
      this.isLoading = false;
      this.submit.removeClass('load').text(message || 'Submit Video');
    }

    this.sign = function(s) {
      return CryptoJS.SHA1(s + localStorage.apikey).toString(CryptoJS.enc.HEX);
    };

    this.considerSubmitButton();

    (function(popup) {
      popup.inputs.each(function() {
        var name = $(this).attr('name');

        $(this).bind('propertychange keyup input paste', function() {
          var val = $(this).val().trim();

          if (localStorage[name] !== val) {
            localStorage[name] = val;
            popup.considerSubmitButton();
          }
        }).val(localStorage[name]);
      });
    })(this);

    (function(popup) {
      $.ajaxSetup({
        type: 'post',
        dataType: 'json',
        beforeSend: function(xhr, settings) {
          popup.startLoading();
          settings.url += settings.data;
          settings.data = $.param({
            signature: popup.sign(settings.url),
            username: localStorage.username
          });
          settings.url = Atropa.BASE + settings.url;
        },
        success: function(data) {
          popup.stopLoading();

          chrome.tabs.create({
            index: popup.tab.index + 1,
            url: Atropa.BASE + Atropa.ADMIN.VIDEO.replace('{id}', data.id),
            active: true
          });
        },
        error: function(xhr, stat, error) {
          popup.stopLoading(xhr.responseText);
        }
      });
    })(this);

    (function(popup) {
      popup.submit.click(function() {
        popup.isLoading || $.ajax({url: Atropa.API.VIDEOS, data: {url: popup.tab.url}});
      });
    })(this);
  }

  $(document).ready(function() {
    chrome.tabs.getSelected(function(tab) {
      tab.isAtropa = function() {
        return Boolean(this.url.match(/http(?:s)?:\/\/atropa.wurstcase.net[^\n]*/))
      };

      var popup = new Popup(tab, $('#submit'), $('#auth-form input'));
    });
  });
})(jQuery);

// vim:ts=2:sw=2:expandtab
