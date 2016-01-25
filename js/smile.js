(function() {
    var //判断ie 
        ie = !!(window.attachEvent && !window.opera),
        //判断webkit内核
        wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525),
        fn = [],
        d = document,
        run = function() {
            for (var i = 0; i < fn.length; i++)
                fn[i]()
        }
    d.ready = function(f) {
        if (!ie && !wk && d.addEventListener) // addEventListener mozilla
            return d.addEventListener('DOMContentLoaded', f, false)
        if (fn.push(f) > 1) return;
        if (ie)(function() {
            try {
                d.documentElement.doScroll('left')
                run();
            } catch (err) {
                setTimeout(arguments.callee, 0)
            }
        })()
        else if (wk)
            var t = setInterval(function() {
                if (/^(loaded|complete)$/.test(d.readyState))
                    clearInterval(t), run()
            }, 0)
    }
})()
// 查询显示当前页所有文章的浏览数
function showAll(Counter) {
    var query = new AV.Query(Counter),
        entries = [],
        $visitors = document.querySelectorAll(".visitors")
    len = $visitors.length

    for (var i = 0; i < len; i++) {
        entries.push($visitors[i].getAttribute("id").trim())
    }
    query.containedIn('url', entries)
    query.find()
        .done(function(results) {
            if (results.length === 0) {
                document.querySelectorAll(".visitors >span").innerHTML = "0"
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
        $visitors = document.querySelectorAll(".visitors")[0],
        url = $visitors.getAttribute('id').trim(),
        title = $visitors.getAttribute('data-title').trim()

    query.equalTo("url", url)
    query.find({
        success: function(results) {
            if (results.length > 0) {
                var counter = results[0];
                counter.fetchWhenSave(true);
                counter.increment("time");
                counter.save(null, {
                    success: function(counter) {
                        var $element = document.getElementById(url);
                        $element.lastChild.innerHTML = counter.get('time');
                    },
                    error: function(counter, error) {
                        console.log(
                            'Failed to save Visitor num, with error message: ' + error.message
                        )
                    }
                })
            } else {
                var newcounter = new Counter();
                newcounter.set("title", title);
                newcounter.set("url", url);
                newcounter.set("time", 1);
                newcounter.save(null, {
                    success: function(newcounter) {
                        var $element = document.getElementById(url);
                        $element.lastChild.innerHTML = newcounter.get('time');
                    },
                    error: function(newcounter, error) {
                        console.log('Failed to create')
                    }
                })
            }
        },
        error: function(error) {
            console.log('Error:' + error.code + " " + error.message);
        }
    })
}
document.ready(function() {
    // initialize
    var Counter = AV.Object.extend("Counter")
    document.querySelectorAll('.visitors').length === 1 ? addCount(Counter) : showAll(Counter)
})