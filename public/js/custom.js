

/**
 * Calculates the Twitter time since the tweet was created
 * @param datetime returned by Twitter API in created_at
 * @return time since in html
 */


//functions....

function sortChange() {
  var idsInOrder = $("#sortable").sortable("toArray");
  console.log(idsInOrder);
  setOrderValue('#' + idsInOrder[0], "#inputOrder0");
  setOrderValue('#' + idsInOrder[1], "#inputOrder1");
  setOrderValue('#' + idsInOrder[2], "#inputOrder2");

}
function setOrderValue(dataId, inputid) {
  var o = $(dataId).data('order');
  $(inputid).val(o);
}
function stopSortable() {
  $('#sortable').sortable('disable');
  $("#sortable").enableSelection();
}

function startSortable() {
  $("#sortable").sortable({
    update: function () {

      sortChange();
    }
  });
  $("#sortable").disableSelection();
}


function calculateSince(datetime) {

  var tTime = new Date(datetime);

  // return moment(datetime).format('hh:mm:ss, MMM DD, YYYY');

  var cTime = new Date();
  var sinceMin = Math.round((cTime - tTime) / 60000);

  if (sinceMin == 0) {
    var sinceSec = Math.round((cTime - tTime) / 1000);
    //  if(sinceSec<30)
    //    var since='20s';
    //  else
    var since = 'Just Now';
  }
  else if (sinceMin == 1) {

    var sinceSec = Math.round((cTime - tTime) / 1000);
    //  if(sinceSec==30)
    //    var since='half a minute ago';
    //  else if(sinceSec<60)
    //    var since='less than a minute ago';
    //  else
    //    var since='1 minute ago';
    var since = '1m';
  }
  else if (sinceMin < 60) {
    var since = sinceMin + 'm';
    //  else if(sinceMin>44&&sinceMin<60)
    //      var since='about 1 hour ago';
  }
  else if (sinceMin < 1440) {
    var sinceHr = Math.round(sinceMin / 60);
    // if (sinceHr == 1)
    //   var since = 'about 1 hour ago';
    // else
    var since = sinceHr + 'h';
  }
  else if (sinceMin > 1439 && sinceMin < 2880) {

    var since = '1d';
  }
  else {
    // var sinceDay = Math.round(sinceMin / 1440);
    // var since = sinceDay + ' days ago';
    var since = moment(datetime).format('MMM DD, YYYY');
  }

  return since;
};


function loadTweets(screen_name, count, fromDate, element) {

  var jsonUrl = "http://localhost:7890/1.1/statuses/user_timeline.json?count=" + count + "&screen_name=" + screen_name;

  $.getJSON(jsonUrl, function (data) {
    var items = [];
    $.each(data, function (key, val) {

      var user, tweet_body, tweet_link, user_link, user_name, user_screen_name, user_pp, retweet_tag, tweet, itemDate;

      itemDate = val.created_at;
      fromDate = moment(fromDate);
      if (moment(itemDate).isBefore(fromDate)) {
        return;
      }

      if (!val.retweeted_status) {
        user = val.user;
        tweet_body = val.text;
        retweet_tag = "";
      } else {
        user = val.retweeted_status.user;
        tweet_body = val.retweeted_status.text;
        retweet_tag = '<div class="retweet_tag">' +
          '   <div class="retweet_tag_icon"> <i class="fas fa-retweet"></i></div>' +
          val.user.name + ' Retweeted' +
          '</div>';
      }

      tweet_link = 'https://twitter.com/' + user.screen_name + '/status/' + val.id_str;
      user_link = 'https://twitter.com/' + user.screen_name;
      user_name = user.name;
      user_screen_name = user.screen_name;
      user_pp = user.profile_image_url;

      if (val.entities.user_mentions[0]) {
        var m = val.entities.user_mentions;
        $.each(m, function (m_key, m_val) {
          var link = '<a href="https://twitter.com/' + m_val.screen_name + '">@' + m_val.screen_name + '</a>'
          tweet_body = tweet_body.replace('@' + m_val.screen_name, link);

        })
      }

      if (val.entities.hashtags[0]) {
        var h = val.entities.hashtags;
        $.each(h, function (h_key, h_val) {
          var link = ' <a href="https://twitter.com/hashtag/' + h_val.text + '?src=hash">#' + h_val.text + '</a>'
          tweet_body = tweet_body.replace('#' + h_val.text, link);

        })
      }

      if (val.entities.urls[0]) {
        var u = val.entities.urls;
        $.each(u, function (u_key, u_val) {
          var link = ' <a href="' + u_val.url + '">' + u_val.url + '</a>'
          tweet_body = tweet_body.replace(u_val.url, link);

        })
      }

      tweet = '<li  class="tweet-list-item ">' +
        '<div class="Tweet"  >' +
        '  <div class="twitter-icon float-right" >' +
        '      <a href="' + tweet_link + '"><i class="fab fa-twitter"></i></a>' +
        '  </div >' +
        retweet_tag +
        '  <div class="Tweet-author  ">' +
        '      <a class="author-avatar" href="' + user_link + '" aria-label="' + user_name + ' (screen name: ' + user_screen_name + ')"><img' +
        '          class="avatar" alt="MakeSchool" src="' + user_pp + '"></a>' +

        '          <div class="author-head ">' +
        '              <a class="author-link " href="' + user_link + '">' +
        '                  <div class="Name-container">' +
        '                      <span class="Name" title="' + user_name + '">' + user_name + '</span><br />' +
        '                      <span class="ScreenName" title="@' + user_screen_name + '">@' + user_screen_name + '</span>' +
        '                  </div>' +
        '              </a>' +
        '          </div>' +
        '              </div>' +
        '      <p class="Tweet-text">' + tweet_body + '</p>' +
        '      <div class="Tweet-metadata">' +
        '          <a href="' + tweet_link + '" class="Tweet-timestamp float-right">' + calculateSince(val.created_at) + '</a>' +
        '      </div>' +
        '      <br clear="both">' +
        '          </div>' +
        '      </li>';

      items.push(tweet);
    });
    var all_tweets = items.join("");

    var container = '<div class="title-container">' +
      '                    <h1 class="title">Tweet <span class="subscript">by <a href="https://twitter.com/' + data[0].user.screen_name + '">' + data[0].user.name + '</a></span></h1></div>' +
      '                <ol class="tweets">' + all_tweets + '</ol> </div>';

    $(element).html(container);

  });

}


