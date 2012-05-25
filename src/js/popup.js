/**
 * popup.js
 *
 * @requires  jquery.js
 * @requires  sha1.js
 */
(function($) {
  var ATROPA = {
    BASE: 'https://atropa.wurstcase.net',
    API: {
      CREATE: '/api/videos/create.json?'
    },
    ADMIN: {
      EDIT: '/admin/videos/{id}/edit'
    },
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

      (function(popup) {
        setTimeout(function() {
          popup.isLoading && popup.stopLoading(false);
        }, 7000);
      })(this);
    };

    this.stopLoading = function(success) {
      this.isLoading = false;
      this.submit.removeClass('load').text(success ? 'Submit Video' : 'Something\'s wrong');
    }

    this.considerSubmitButton();

    (function(popup) {
      popup.inputs.each(function() {
        $(this).data('old', $(this).val());

        $(this).bind('propertychange keyup input paste', function() {
          if ($(this).data('old') == $(this).val()) {
            return;
          }

          $(this).data('old', $(this).val());
          localStorage[$(this).attr('name')] = $(this).val().trim();
          popup.considerSubmitButton();
        }).val(localStorage[$(this).attr('name')]);
      });
    })(this);

    (function(popup) {
      $.ajaxSetup({
        dataType: 'jsonp',
        beforeSend: function(xhr, settings) {
          popup.startLoading();
          signature = CryptoJS.SHA1(settings.url.substr(28) + localStorage.apikey);
          settings.url += '&signature=' + signature.toString(CryptoJS.enc.HEX);
        },
        success: function(data) {
          popup.stopLoading(true);

          chrome.tabs.create({
            index: popup.tab.index + 1,
            url: ATROPA.BASE + ATROPA.ADMIN.EDIT.replace('{id}', data.id),
            active: true
          });
        }
      });
    })(this);

    (function(popup) {
      popup.submit.click(function() {
        if ( ! popup.isLoading) {
          var query = $.param({url: popup.tab.url, username: localStorage.username});
          $.ajax(ATROPA.BASE + ATROPA.API.CREATE + query);
        }
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
