// 查询显示当前页所有文章的浏览数
function showAll(Counter) {
    var query = new AV.Query(Counter),
        entries = [],
        $visitors = $(".visitors")
    len = $visitors.length

    for (var i = 0; i < len; i++) {
        entries.push($visitors[i].getAttribute("id").trim())
    }
    query.containedIn('url', entries)
    query.find()
        .done(function(results) {
            if (results.length === 0) {
                $(".visitors >span").html("0")
                return;
            }

            for (var i = 0; i < results.length; i++) {
                var item = results[i]
                var url = item.get('url')
                var time = item.get('time')
                document.getElementById(url).lastChild.innerHTML = time
            }
        })
        .fail(function(object, error) {
            console.log("Error: " + error.code + " " + error.message)
        });
}
// 添加一次文章的浏览数
function addCount(Counter) {
    var query = new AV.Query(Counter),
        $visitors = $(".visitors"),
        url = $visitors.attr('id').trim(),
        title = $visitors.data('title').trim()

    query.equalTo("url", url)
    query.find({
        success: function(results) {
            if (results.length > 0) {
                var counter = results[0]
                counter.fetchWhenSave(true)
                counter.increment("time")
                counter.save(null, {
                    success: function(counter) {
                        var $element = document.getElementById(url)
                        $element.lastChild.innerHTML = counter.get('time')
                    },
                    error: function(counter, error) {
                        console.log(
                            'Failed to save Visitor num, with error message: ' + error.message
                        )
                    }
                })
            } else {
                var newcounter = new Counter()
                newcounter.set("title", title)
                newcounter.set("url", url)
                newcounter.set("time", 1)
                newcounter.save(null, {
                    success: function(newcounter) {
                        var $element = document.getElementById(url)
                        $element.lastChild.innerHTML = newcounter.get('time')
                    },
                    error: function(newcounter, error) {
                        console.log('Failed to create')
                    }
                })
            }
        },
        error: function(error) {
            console.log('Error:' + error.code + " " + error.message)
        }
    })
}
$(function() {
    // lazyload
    if ($.lazyload === true)
        $("img.lazy").lazyload({
            data_attribute: "src",
            effect: "fadeIn"
        })
    // initialize
    var Counter = AV.Object.extend("Counter")
    $('.visitors').length === 1 ? addCount(Counter) : showAll(Counter)

    //Back-To-Top
    if ($(window).scrollTop() !== 0){
        $('.back-to-top').stop().fadeIn()
    }
    $(window).scroll(function() {
        /* Act on the event */
        if ($(this).scrollTop() === 0){
            $('.back-to-top').stop().fadeOut()
        }
        if ($(this).scrollTop() !== 0){
            $('.back-to-top').stop().fadeIn()
        }
    })
    // click
    $('.back-to-top').click(function(){
        $("html,body").stop().animate({scrollTop:"0px"})
    })
    $('.show-menu').click(function(){
        $(this).off('hover').removeClass('hover')
        $('.show-menu, .menu-container').toggleClass('open')
        $('body').toggleClass('scroll open')

        var bodyWidth = $('body').width(),
            movePlus = $('.menu-container').width() + $('.menu-container').width()/2
        if($('body').is('.open') && bodyWidth > movePlus){
            $('body').css('left', -(bodyWidth - movePlus)/2)
        }else{
             $('body').css('left', 0)
        }
        if($(window).scrollTop() !== 0){
            $('.back-to-top').stop().fadeToggle()
        }
    }).hover(function(){
        $(this).addClass('hover')
    }, function(){
        $(this).removeClass('hover')
    })
})