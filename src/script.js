//--------------------------------------------show a gif when charging-----------------------------------------------------------------
let charging = $("<img class='charging-image absolute--center'"+
" src=https://66.media.tumblr.com/0d29a110bbd89fface87d17f6dade085/tumblr_oof0gkLGUY1wnofxjo1_500.gifv>")
$("body").append(charging)

//-----------------------A button only visible below 600px get click event, shows the side nav-----------------------------------------
$(document).ready(()=>{$(".header .chapters-button").first().click(function(){
    console.log("hol")
    $(".aside").toggleClass("show")
})})

//------------------------------------------variables to show the episodes in the side nav---------------------------------------------
let firstPage = []
let secondPage = []
let secondPageURL

//------------------get first page of the episodes and store them in firstPage variable, then call next function-----------------------
axios.get("https://rickandmortyapi.com/api/episode").then(function(response){
    secondPageURL = response.data.info.next
    $.each(response.data.results,function(index,episode){
        let chapter = {data:episode.air_date+" "+episode.episode,characters:episode.characters}
        firstPage.push(chapter)
    })
}).then(function(){
    getSecondPage()
})


//------------------------------get the second page and store the episodes in the secondPage variable----------------------------------
function getSecondPage(){
    axios.get(secondPageURL).then(function(response){
        $.each(response.data.results,function(index,episode){
            let chapter = {data:episode.air_date+" "+episode.episode,characters:episode.characters}
        secondPage.push(chapter)
        })
    })
}

//----------------remove the charging gif, create and append a button with click event to show the first page chapters-----------------
$(document).ready(function (){
    $("body img").first().remove();
    let chaptersButton = $("<li class=aside-nav__item chapters-button>Chapters</li>")
    chaptersButton.click(function(){
        $(this).fadeOut()
        appendArray(".aside-nav__list",firstPage,function(){
            moreEpisodes(".aside-nav__list",secondPage)
        })
    })
    $(".aside-nav__list").append(chaptersButton)
    setTimeout(function(){
        chaptersButton.animate({marginTop:"40%"},{easing:"linear",duration:1500})
    })
})

//------------------------create and append buttons for the chapters of the first page with an animation-------------------------------
function appendArray(querySelector,array,callback){
    let i = 0
    setTimeout(appendElement,500)

    function appendElement(){
        let element=createNavItem(array[i].data.substr(array[i].data.length-6),array[i].characters)
        $(querySelector).append(element)
        i++
        setTimeout(function(){
            animateNavItem(element)
        },500)
        if(i<array.length) setTimeout(appendElement,500)
        else callback()
    }
    
}

//----------------------------------------------create the html buttons of a chapter---------------------------------------------------
function createNavItem(text,characters){
    return $("<li class=aside-nav__item>").text(text).attr("data-characters",JSON.stringify(characters)).click(function(){
        showCharacters($(this))
    })
}

//-------------------------------------------------animate the chapter button----------------------------------------------------------
function animateNavItem(item){
    item.animate({marginTop:"10%"},{easing:"linear",duration:1500})
}

//--------------------------------------click event of the button to show the second page of chapters----------------------------------
function moreEpisodes(querySelector,array){
    let item = $("<button class=aside-nav__item chapters-button>").text("More")
    .click(function(){
        $(this).fadeOut()
        appendArray(querySelector,secondPage)
    })
    $(querySelector).append(item)
    setTimeout(function(){animateNavItem(item)},500)
}

//---------------click event per chapter button on side bar, append a card for each character of the chapter to main-------------------

function showCharacters(episode){
    $(".main").empty()
    let characters = JSON.parse(episode.attr("data-characters"))
    characters.forEach(function(characterURL){
        axios.get(characterURL).then(function(response){
            let character = response.data
            $(".main").append(createCard(character))
            }   
        )
    });
}

//------------------------Creation of the character card, returns it with attributes and children elements-----------------------------
function createCard(character){
    let card=$("<div class=card></div>")
    .append($("<img src="+character.image+" width=100%>"),$("<h2>"+character.name+"</h2>"),
    $("<h3>"+character.status+" | "+character.species+"</h3>"))
    .attr("data-episodes",JSON.stringify(character.episode))
    .attr("data-origin",character.origin.name)
    .attr("data-gender",character.gender)
    .attr("data-url",character.origin.url)
    .click(function(){
        showEpisodes($(this))
    })
    return card
}

//Show a bigger card of the clicked with a link (click event) for origin and change character cards per episodes where the selected appear
function showEpisodes(character){
    character.find("h3").html(character.find("h3").text()+" | "+character.attr("data-gender")+" | "
    +"<a>"+character.attr("data-origin")+"</a>")
    let clone = character.clone()
    clone.css("width","100%").find("a").click(function(){
        showLocation(character.attr("data-url"))
    })
    $(".main").empty()
    $(".main").append(clone)
    let episodes = JSON.parse(character.attr("data-episodes"))
    episodes.forEach(function(episodeURL){
        axios.get(episodeURL).then(function(response){
            let episode = response.data
            $(".main").append(createEpisode(episode))
            }   
        )
    });
}

//----Create a card with the properties of the argument object, actually a card to show an episode, returns it with a click event-------
function createEpisode(episode,url){
    
    let card=$("<div class=card></div>")
    .append($("<img src=https://i.redd.it/5pr2d6fopii31.jpg width=100%>"),
    $("<h2>"+episode.name+"</h2>"),
    $("<h3>"+episode.episode+" | "+episode.air_date+"</h3>"))
    .attr("data-characters",JSON.stringify(episode.characters))
    .click(function(){
        showCharacters($(this))
    })
    
    return card
}

//---------------------Change episodes cards per residents of the location selected as when a chapter is clicked------------------------
function showLocation(location){
    $(".main").empty()
    axios.get(location).then(function(response){
        response.data.residents.forEach(function(resident){
            axios.get(resident).then(function(response){
                let character = response.data
                $(".main").append(createCard(character))
                }   
            )
        })
    })
}