window.onload = function() {
    var isScroll,
        pageNo = 1,
        pageSize = 30;


    var content = document.querySelector('.content'),
        scrollContent = document.querySelector('.scroll-content'),
        loadMore = document.querySelector('.load-more');

    function render(pageSize = 30, isMore) {
        for (var i = 0; i < 30; i++) {
            var div = document.createElement('div');
            div.className = 'list';
            div.innerHTML = '我是第' + (i + 1) + '个';
            content.appendChild(div)
        }
        setTimeout(() => {
            pageNo++;
            if (isMore) isScroll = false;
        }, 500)
    }

    render();

    scrollContent.addEventListener('scroll', function() {
        var Height = this.scrollHeight,
            top = this.scrollTop,
            height = this.offsetHeight;
        if ((Height - top - height) < 100 && !isScroll) {
            isScroll = true;
            console.log('要加载了')
            if (pageNo > 5) {
                loadMore.innerHTML = '已经全部加载完毕';
                return;
            }
            render(pageSize, true)
        }
    }, false)

}