var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
if (!/norecommend/.exec(location.hash)) {
    new Ten.Observer(Ten.DOM, 'DOMContentLoaded', function(){
        var temp = new Hatena.UgoMemo.Recommendation('/movies.recommendation.json');
        temp.requestRecommendations();
    });
}

Hatena.UgoMemo.Recommendation = new Ten.Class({
    initialize: function(path) {
        this.path = path;
    }
}, {
    requestRecommendations: function(){
        new Ten.JSONP(this.path, this, 'receiveRecommendations');
    },
    receiveRecommendations: function(res){
        var recommendations = res.recommended_movies;
        if(recommendations.length == 0){
            return;
        }
        document.getElementById("recommended_movies").style.display = "block";
        for(var i = 0; i < res.num_recommendation; i++){
            var thumbBoxContainer = document.getElementById("thumb_box_" + i);
            if(i < recommendations.length){
                this.showRecommendation(recommendations[i], thumbBoxContainer);
            } else {
                thumbBoxContainer.style.display = "none";
            }
        }
    },
    showRecommendation: function(movie, container){
        if(movie.is_special){
            container.className = container.className + " official";
        }
        var thumbContainer = container.firstChild.firstChild;
        thumbContainer.href = movie.path + '?in=movies&sort=recommendation';
        thumbContainer.firstChild.src = movie.thumbnail_path;

        var usernameContainer = thumbContainer.nextSibling.firstChild;
        var username_link = new Ten.Element('a',{
            href: movie.author.path
        });
        username_link.innerHTML = movie.author.html_name;
        usernameContainer.appendChild(username_link);

        var starContainer = Ten.DOM.nextElement(usernameContainer);
        starContainer.appendChild(document.createTextNode("" + Hatena.Locale.number(parseInt(movie.star_count))));

        var timestampContainer = Ten.DOM.nextElement(starContainer);
        timestampContainer.innerHTML =  Hatena.Locale.datetimeHTML(new Date(movie.created_on.epoch * 1000));

        var viewsContainer = Ten.DOM.nextElement(timestampContainer);
        viewsContainer.appendChild(document.createTextNode("" + Hatena.Locale.number(parseInt(movie.play_count))));
    }
});

}
