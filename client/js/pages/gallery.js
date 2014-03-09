
var Gallery = 
{
  Albums:
  {
    Get: function(parameters)
    {
      var p = inherit(parameters);

      var offset = p.offset || 0,
          count  = p.count  || 0,
          covers = p.covers || 1; // bool, 0 === false, 1 === true

      var result = [];

      var request = 'photos.getAlbums?owner_id=' + config['groupId'] + '&need_covers=' + covers + '&offset=' + offset + '&count=' + count;

      ajaxVK(request);

      var json = JSON.parse(localStorage.getItem(request));

      for (var i in json.response)
      {
        result.push([json.response[i]['aid'], json.response[i]['title'], json.response[i]['thumb_src']]);
      };

      return result;
    },

    Sort: function(albums, method)
    {
      var keys   = [],
          sorted = {};

      // Сортируем ключи

      for (var i in albums)
      {
        var key = albums[i][1].split(' | ')[sortAlbumMethod(method)];

        if (key != undefined) keys.push(key); // условие, кидать в Разное альбомы
      };

      keys = unique(keys);

      // Сортируем альбомы

      for (var a in keys)
      {
        sorted[keys[a]] = [];

        for (var b in albums) // .filter?
        {
          var key = albums[b][1].split(' | ')[sortAlbumMethod(method)];

          if (key == keys[a])
          {
            sorted[keys[a]].push(albums[b]);
          };
        };
      };

      return sorted;
    },

    Show: function(method)
    {
      $('.tabs nav, .tabs figure').empty();
      $('.dotted').removeClass('active');

      $('.dotted:eq(' + ((method == 'year') ? 0 : 1) + ')').addClass('active');

      var albums = Gallery.Albums.Sort(Gallery.Albums.Get(), method);

      for (var a in albums)
      {
        $('.tabs nav').append('<a>' + a + '</a>');

        $('.tabs figure').append('<div></div>');

        for (var b in albums[a])
        {
          $('.tabs figure div:last').append(compileText(templates['galleryAlbumLink'],
          {
            'id': albums[a][b][0],
            'title': albums[a][b][1].split(' | ')[(sortAlbumMethod(method) == 1) ? 0 : 1],
            'fullTitle': albums[a][b][1]
          }));
        };
      };

      $('.tabs').tabs();
    }
  },
  Photos:
  {
    ShowByAlbum: function(parameters)
    {
      var p = inherit(parameters);

      var id    = p.id,
          title = p.title || '',
          rev   = p.rev   || 0;

      $.ajax(
      { 
        url: 'https://api.vk.com/method/photos.get?owner_id=' + config['groupId'] + '&album_id=' + id + '&rev=' + rev, 
        dataType: 'jsonp',
        success: function(data)
        {
          Gallery.Close('fast');

          $('body').append(compileText(templates['gallery'],
          {
            'title': title
          }));

          for (var i in data.response)
          {
            var src = data.response[i]['src_xxbig']; // есть идеи, как по другому эту проверку реализовать?
            if (!data.response[i]['src_xxbig'])
            {
              var src = data.response[i]['src_xbig'];
              if (!data.response[i]['src_xbig']) 
              {
                var src = data.response[i]['src_big'];
                if (!data.response[i]['src_big']) 
                {
                  var src = data.response[i]['src'];
                };
              };
            };

            $('.gallery.photo').append('<img src="' + src + '">');
          };

          $('.gallery.photo').fotorama();

          log('Фотографий в album-' + id + ': ' + ++i);
        }
      });
    }
  },
  Close: function(speed)
  {
    $('.gallery, .fotorama--hidden').fadeOut(speed, function() {$(this).remove()});

    log('Закрыл галерею');
  },
};

Gallery.Albums.Show('year');