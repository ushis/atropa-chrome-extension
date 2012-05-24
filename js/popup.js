/**
 * popup.js
 *
 * @requires  jquery.js
 * @requires  sha1.js
 */
(function($) {
  $(document).ready(function() {
    var atropa = {
      uri: 'https://atropa.wurstcase.net',
      api: '/api/videos/create.json?',
      edit: '/admin/videos/{id}/edit'
    };

    var isLoading = false;
    var submit = $('#submit');
    var inputs = $('#auth-form input');

    submit.considerVisibility = function() {
      if (localStorage.username && localStorage.apikey) {
        submit.show();
      } else {
        submit.hide();
      }

      return this;
    };

    submit.considerVisibility().bind('submitting', function() {
      isLoading = true;
      $(this).text('Submitting..').addClass('load');
    }).bind('submittingEnd', function(e, error) {
      $(this).removeClass('load').text(error ? 'Something\'s wrong' : 'Submit Video');
      isLoading = false;
    }).click(function() {
      if (isLoading) {
        return false;
      }

      submit.trigger('submitting');

      chrome.tabs.getSelected(function(tab) {
        var path = atropa.api + $.param({
          username: localStorage.username,
          url: tab.url,
        });

        $.ajax({
          url: atropa.uri + path,
          dataType: 'jsonp',
          beforeSend: function(xhr, settings) {
            signature = CryptoJS.SHA1(settings.url.substr(28) + localStorage.apikey);
            settings.url += '&signature=' + signature.toString(CryptoJS.enc.HEX);
          },
          success: function(data) {
            chrome.tabs.create({
              index: tab.index + 1,
              url: atropa.uri + atropa.edit.replace('{id}', data.id),
              active: true
            });

            submit.trigger('submittingEnd');
          },
        });

        setTimeout(function() {
          isLoading && submit.trigger('submittingEnd', true);
        }, 7000);
      });
    });

    inputs.each(function() {
      $(this).change(function() {
        localStorage[$(this).attr('name')] = $(this).val().trim();
        submit.considerVisibility();
      }).val(localStorage[$(this).attr('name')]);
    });
  });
})(jQuery);

// vim:ts=2:sw=2:expandtab
