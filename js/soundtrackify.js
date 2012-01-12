var sp = getSpotifyApi(1);

function Soundtrackify() {  
    var self = this;
    
    // Set up spotify stuff
    self.m = sp.require( 'sp://import/scripts/api/models' );
    self.v = sp.require( 'sp://import/scripts/api/views' );
    self.player = this.m.player;

    // Rotten Tomatoes API stuff
    self.rtApiKey = 'pm2g5wfcdyfkafk4bb4bjajq';
    self.country = 'uk';

    // Last FM stuff
    self.lastFmApiKey = '0ca2faf151f9e7502d12c4ac2eca25dc';

    self.init = function() {
        self.getMovies();
    }

    /**
     * Get movies currently in cinema
     */
    self.getMovies = function() {
        var url = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?page_limit=16&page=1&country=' + self.country + '&apikey=' + self.rtApiKey;

        $.getJSON( url, function ( data ) {

            if (data.movies.length) {
                // Ensure movies listing is empty
                $('#movies').empty();

                for (var i = 0; i < data.movies.length; i++) {
                    var movie = data.movies[i];
                    var li = $('<li />').text(movie.title + ' ');
                    $('#movies').append(li);
                    self.getAlbum(movie.title, li);
                }
            } else {
                $('#info').text('There are no movies in the cinema or something went wrong...');
            }

        } );
    }

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
                var album = albums[0];
                
                if (album) {
                    li.append($('<a class="add-playlist button icon" href="' + album.href + '" />').html('<span class="plus"></span>Play'));  
                }

            })
            .error(function (err) {
                console.log(err);
            });
    }  
}

$(function() {
    var oSoundtrackify = new Soundtrackify();
    oSoundtrackify.init();
});