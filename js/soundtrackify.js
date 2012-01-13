var sp = getSpotifyApi(1);

/**
 * Our basic Soundtrackify app
 */
function Soundtrackify() {
    var self = this;

    // Set up spotify stuff
    self.m = sp.require( 'sp://import/scripts/api/models' );
    self.v = sp.require( 'sp://import/scripts/api/views' );
    self.player = this.m.player;

    // Rotten Tomatoes API stuff
    self.rtApiKey = 'pm2g5wfcdyfkafk4bb4bjajq';

    // Get the country from the user's session (special case because rotten tomatoes uses UK instead of GB
    self.country = (self.m.session.country == 'GB') ? 'UK' : self.m.session.country;

    // Last FM stuff
    self.lastFmApiKey = '0ca2faf151f9e7502d12c4ac2eca25dc';

    /**
     * Hook into our app
     */
    self.init = function() {
        self.getMovies();
    };

    /**
     * Get movies currently in cinema according to users country
     */
    self.getMovies = function() {
        var url = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?page_limit=16&page=1&country=' + self.country + '&apikey=' + self.rtApiKey;

        $.getJSON( url, function ( data ) {

            if (data.movies.length) {
                // Ensure movies listing is empty
                $('#movies').empty();

                for (var i = 0; i < data.movies.length; i++) {
                    var movie = data.movies[i];
                    var li = $('<li />');
                    $('#movies').append(li);
                    self.getAlbum(movie.title, li);
                }

                // Remove the throbber
                $('.throbber').remove();
            } else {
                $('#info').text('There are no movies in the cinema or something went wrong...');
            }

        } );
    };

    /**
     * Get the album for a movie and append it to the dom
     * @param title
     * @param li
     */
    self.getAlbum = function(title, li) {

        var spotifyUrl = 'http://ws.spotify.com/search/1/album.json?q=' + title;

        $.getJSON(spotifyUrl)
            .success(function (data) {
                var albums = [];

                // Narrow down albums to only albums available to the user
                data.albums.forEach(function (album) {
                    var territories = album.availability.territories;

                    if (territories == 'worldwide' ||
                        territories.split(' ').indexOf(sp.core.country) >= 0) {
                        albums.push(album);
                    }
                });

                // Just assume the top result for now
                var guessedAlbum = albums[0];

                if (guessedAlbum) {

                    self.m.Album.fromURI(guessedAlbum.href, function(album) {

                        var img =  $("<div class='cover'>"+
                                        "<a href='"+album.data.uri+"'>"+
                                            //"<span class='image' style='height:150px;width:150px;background:url("+album.data.cover+")'></span>"+
                                            '<img src="'+ album.data.cover+'" />'+
                                            "<span class='player'></span>"+
                                        "</a>"+
                                            "<span class='title'>"+title+"</span>"+
                                            "<span class='artist'>" + album.data.artist.name + "</span>"+
                                    "</div>");

                        // if the user clicks play rather than the album, play it
                        img.find('.player').click(function(e) {
                            self.playAlbum(album);
                            e.preventDefault();
                        });

                        li.append(img);
                    });
                }

            })
            .error(function (err) {
                console.log(err);
            });
    };

    /**
     * Play an album
     * @param album
     */
    self.playAlbum = function(album) {

        // play the track from it's uri, here you can pass the whole track object, but it will switch to album view away from the app
        self.m.player.play(album.data.uri);
    };
}

// Go!
$(function() {
    var oSoundtrackify = new Soundtrackify();
    oSoundtrackify.init();
});