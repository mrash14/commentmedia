(function ($, undefined) {
    $.fn.commentmedia = function(param, args) {
        this.options = {
            // These are the defaults.
            rtl: false,
            text_comment: "Add Comment ...",
            text_phone: "Phone",
            text_name: "Name",
            text_download: "Download"
        };
        if (param instanceof Object){
            this.options = $.extend(this.options, param );
        } else {
            try {
                return this[param](args);
            } catch(err) {}
        }

        var plugin = this;
        
        // Methods
        this.likeThis = function(that, url, item){
            var loadStamp = new Date().getTime(),
                $this = $(that);
            $this.addClass("loading").data("likeStamp", loadStamp);
            liked = $.cookie('liked_'+ item) == "1";
            $.ajax({
                url: url,
                data: {item: item, like: liked}, // csrf token may needed
                method: "post",
                success: function(data){
                    if($this.data("likeStamp") == loadStamp){
                        if (data.indexOf(":")>1)
                            data = data.split(':');
                        else
                            return alert(data);
                        if (data[0] == "like"){
                            $this.addClass("liked");
                            $.cookie('liked_'+ item, "1", { expires:7,
                                                            path:'/' });
                        } else {
                            $this.removeClass("liked");
                            $.cookie('liked_'+ item, "0", { expires:7,
                                                            path:'/' });
                        }
                        $this.closest('a').find('.data').html(data[1]);
                    }
                },
                error: function(){
                    if($this.data("likeStamp") == loadStamp)
                        alert("متاسفانه در ثبت درخواست شما خطایی رخداده.");
                },
                complete: function(){
                    if($this.data("likeStamp") == loadStamp)
                        $this.removeClass("loading");
                }
            });
        };
        this.updateArrows = function(){
            $('.commentmedia-navigate').removeClass('disabled');
            var curIndex = $(this).index($(this).filter('.active'));
            nbrOfItems = this.length -1;

            if (plugin.options.rtl){
                curIndex === nbrOfItems && $('.commentmedia-navigate.arrow-left').addClass('disabled');
                curIndex === 0 && $('.commentmedia-navigate.arrow-right').addClass('disabled');
            } else {
                curIndex === nbrOfItems && $('.commentmedia-navigate.arrow-right').addClass('disabled');
                curIndex === 0 && $('.commentmedia-navigate.arrow-left').addClass('disabled');
            }
        };
        this.imageLoaded = function() {
            maxHeight = $(window).height()-52;
            defWidth = $(".commentmedia-modal").width();
            //TODO: change defWidth and compatible with css of page size
            height = this.height;
            width = this.width;
            if (height > width) {
                wid = (width * maxHeight) / height;
                if (wid <= (defWidth - $(".commentmedia-modal-text").width()))
                    $('.commentmedia-modal .container').width(Math.abs(wid+ $(".commentmedia-modal-text").width())+ "px");
            }
            if ($(this).data("main"))
                $(".commentmedia-modal-image").css("background-image", "");
        };
        this.showModal = function(that){
            var imagetext = that.find('.info').html(),
                item = that.data('item'),
                likes = that.data('likes'),
                type = that.data('filetype'),
                liked = $.cookie('liked_'+ item) == "1",
                likeurl =  that.data('likeurl'),
                comments = that.data('comments'),
                commentload = that.data('comment-load'),
                commentform = that.data('comment-form'),
                filepath = that.data('filepath'),
                thumburl = that.find('img').attr('src'),
                maxHeight = $(window).height()-52;
            window.location.hash = "item-"+ item;
            $(".active").removeClass("active");
            that.addClass('active');

            if ($('.commentmedia-wrapper').length === 0) {
                if(typeof filepath !== 'undefined') {
                    modalHtml =  "<div class='commentmedia-wrapper"+ (plugin.options.rtl? " rtl": "")+ "'>";
                    modalHtml += " <div class='commentmedia-modal'>"
                    modalHtml += "  <span class='commentmedia-navigate arrow-left'><span class='icons icon-arrow-left6'></span></span>";
                    modalHtml += "  <span class='commentmedia-navigate arrow-right'><span class='icons icon-arrow-right6'></span></span>";
                    modalHtml += "  <div class='container'>";
                    modalHtml += "   <span class='icons iconscircle-cross close-icon'></span>";
                    modalHtml += "   <div class='commentmedia-scrollbox' style='height:"+maxHeight+"px'><div class='commentmedia-modal-image' style='background-image: url("+thumburl+")'>";
                    if (type == "image")
                        modalHtml += "    <span class='img' style='background-image: url("+filepath+")'>";
                    else {
                        modalHtml += "    <span class='img' style='background-image: url("+thumburl+")'>";
                        if (type == "video"){
                            modalHtml += "    <video class='video' controls><source src='"+filepath+"'>";
                            modalHtml += "     Your browser does not support the video tag.</video>";
                        }
                        else if (type == "audio"){
                            modalHtml += "    <div class='audio-seek'></div>";
                            modalHtml += "    <audio class='audio' controls><source src='"+filepath+"'>";
                            modalHtml += "     Your browser does not support the audio tag.</audio>";
                        }
                    }
                    modalHtml += "   </div>";
                    modalHtml += "   <div class='commentmedia-modal-text'>";
                    modalHtml += "    <div class='commentmedia-modal-text-wrapper'>";
                    modalHtml += imagetext;
                    modalHtml += "      <div class='commentmedia-modal-text-comments'></div></div>";
                    modalHtml += "    <div class='commentmedia-item-slide'>";
                    if(!["", undefined].indexOf(comments) >= 0){
                        modalHtml += "     <form class='commentmedia-item-modal-comments' action=''>";
                        modalHtml += "      <a href='#' class='icons icon-arrow-"+ (plugin.options.rtl? "left": "right")+ "6 submit-comment'></a>";
                        modalHtml += "      <textarea rows='1' name='comment-text' id='post-comment' placeholder='"+ plugin.options.text_comment+ "' />";
                        modalHtml += "      <input name='comment-name' placeholder='"+ plugin.options.text_name+ "' />";
                        modalHtml += "      <input name='comment-number' placeholder='"+ plugin.options.text_phone+ "' />";
                        modalHtml += "      <input name='item' type='hidden' value='"+item+"' />";
                        modalHtml += "      <input name='csrfmiddlewaretoken' type='hidden' value='"+$.cookie('csrftoken')+"' />";
                        modalHtml += "     </form>";
                    }
                    modalHtml += "     <span class='commentmedia-item-modal-likes'>";
                    modalHtml += "      <div class='commentmedia-item-chip'><a href='"+likeurl+"'>";
                    modalHtml += "      <span class='icons icon-heart"+ (liked? " liked": "")+ "'></span><b class='data'>"+likes+"</b></a></div>";
                    modalHtml += "      <div class='commentmedia-item-chip'><a href='#post-comment'>";
                    modalHtml += "      <span class='icons icon-comment'></span>"+comments+"</a></div>";
                    modalHtml += "      <div class='commentmedia-item-chip'><a download href='"+filepath+"'>";
                    modalHtml += "      <span class='icons icon-download'></span>"+ plugin.options.text_download+ "</a></div>";
                    modalHtml += "     </span>";
                    modalHtml += "    </div>";
                    modalHtml += "    <span class='commentmedia-modal-imagetext'>";
                    modalHtml += "    </span>";
                    modalHtml += "</div></div></div></div></div>";
                    $('body').append(modalHtml).fadeIn(2500);
                    if (type == "image") {
                        var tImg = that.find('img').data("main", false)
                                       .bind('load', plugin.imageLoaded);
                        if(tImg.data('load'))
                            tImg.trigger('load');

                        var bgImg = $('<img />').data("main", true)
                                                .bind('load', plugin.imageLoaded);
                        bgImg.attr('src', filepath);
                    }
                    $('.commentmedia-modal-text, .commentmedia-modal-image .img').on("swapleft", function(){
                        $(".commentmedia-navigate.arrow-left").trigger("click");
                    });
                    $('.commentmedia-modal-text, .commentmedia-modal-image .img').on("swapright", function(){
                        $(".commentmedia-navigate.arrow-right").trigger("click");
                    });
                    if (type == "video"){
                        media = $.media(".commentmedia-wrapper video");//.play();
                    }
                    if (type == "audio"){
                        media = $.media(".commentmedia-wrapper audio")
                            .on('timeupdate', function(e){
                                value = (100 / e.currentTarget.duration) * e.currentTarget.currentTime;
                                $(this.element).siblings(".audio-seek").css("width", value+"%");
                            });//.play();
                    }
                    if (["0", "", undefined].indexOf(comments) >= 0){
                        var loadStamp = new Date().getTime();
                        $(".commentmedia-modal-text-comments").addClass("loading").data("loadStamp", loadStamp);
                        $.ajax({
                            url: commentload,
                            success: function(data){
                                if($(".commentmedia-modal-text-comments.loading").data("loadStamp") == loadStamp){
                                    $(".commentmedia-modal-text-comments.loading").html(data);
                                }
                            },
                            error: function(){
                                if($(".commentmedia-modal-text-comments.loading").data("loadStamp") == loadStamp)
                                    alert("متاسفانه در بارگزاری نظرات خطایی رخداده.");
                            },
                            complete: function(){
                                if($(".commentmedia-modal-text-comments.loading").data("loadStamp") == loadStamp){
                                    $(".commentmedia-modal-text-comments.loading").removeClass("loading");
                                }
                            }
                        });
                    }
                    $(".icon-heart").click(function(){
                        likeThis(this, likeurl, item);
                        return false;
                    });
                    $(".icon-comment").click(function(){
                        $("#post-comment").first().focus();
                        return false;
                    });
                    $(".submit-comment").click(function(){
                        var loadStamp = new Date().getTime(),
                            $this = $(this);
                        $(this).addClass("loading").data("timeStamp", loadStamp);
                        $.ajax({
                            url: commentform,
                            data: $this.closest("form").serialize(),
                            method: "post",
                            success: function(data){
                                if($this.data("timeStamp") == loadStamp){
                                    if(data == "ok"){
                                        $(".commentmedia-item-modal-comments input:visible, .commentmedia-item-modal-comments textarea:visible").val("")
                                        $(".commentmedia-item-modal-comments").prepend($("<b class='remove-"+ loadStamp+ "' style='color: red'>").html("نظر شما با موفقیت ثبت شد."));
                                        setTimeout(function(){ $(".remove-"+loadStamp).slideUp("slow", function(){$(this).remove();}); }, 5000);
                                    }
                                }
                            },
                            error: function(){
                                if($this.data("timeStamp") == loadStamp)
                                    alert("متاسفانه در ثبت نظر شما خطایی رخداده.");
                            },
                            complete: function(){
                                if($this.data("timeStamp") == loadStamp)
                                    $this.removeClass("loading");
                            }
                        });
                        return false;
                    });
                    $("#post-comment").on("keyup", function(){
                        var ta = $(this).get(0);
                        var maxrows = 4;
                        var lh = ta.clientHeight / ta.rows;
                        if (ta.scrollHeight <= ta.clientHeight) {
                            while (ta.scrollHeight <= ta.clientHeight && !window.opera && ta.rows > 1) {
                                ta.style.overflow = 'hidden';
                                ta.rows -= 1;
                            }
                        }
                        if (ta.scrollHeight > ta.clientHeight){
                            while (ta.scrollHeight > ta.clientHeight && !window.opera && ta.rows < maxrows) {
                                ta.style.overflow = 'hidden';
                                ta.rows += 1;
                            }
                        }
                        if (ta.scrollHeight > ta.clientHeight) ta.style.overflow = 'auto';
                    });
                    $(".commentmedia-item-modal-comments input, .commentmedia-item-modal-comments textarea").on("keyup", function(e){
                        if(e.which == 13){
                            $(this).closest("form").find("a.submit-comment").trigger("click");
                            return false;
                        }
                    });
                }
            }
        };
        this.removeModal = function(){
            $('body').find('.commentmedia-wrapper').remove();
            $('body').removeClass('noscroll');
            $('body').css('position', 'static');
            $('body').animate({scrollTop: scrollTo}, 0);
            plugin.find(".active").removeClass("active");
            window.location.hash = "";
        };
        // Avoid break on small devices
        this.scrollMaxHeight = function() {
            if ($('.commentmedia-scrollbox').length) {
                maxHeight = $(window).height()-52;
                $('.commentmedia-scrollbox').css('height',maxHeight+'px');
                $('.instagram-carousel.active').find("img").trigger("load");
            }
        };


        // Actions
        $('body').on('click', '.commentmedia-navigate', function(e){
            if($(this).hasClass('disabled')) return;
            var curIndex = plugin.index(plugin.filter('.active'));
            var nextItemIndex = parseInt(curIndex+1);
            if((plugin.options.rtl && $(this).hasClass('arrow-right')) ||
               (!plugin.options.rtl && $(this).hasClass('arrow-left'))){
                nextItemIndex-=2;
            }
            var nextItem = plugin.eq(nextItemIndex);
            if(nextItem.length > 0){
                $('body').find('.commentmedia-wrapper').remove();
                plugin.showModal(nextItem.first());
            }
            plugin.updateArrows();
        }).on( 'click','.commentmedia-wrapper', function(e) {
            if($(e.target).hasClass('commentmedia-wrapper')){
                plugin.removeModal();
            }
        }).on('click', '.commentmedia-modal .iconscircle-cross', function(e){
            plugin.removeModal();
        });
        $(window).resize(function() { // set event on resize
            clearTimeout(this.commentmedia_id);
            this.commentmedia_id = setTimeout(plugin.scrollMaxHeight, 100);
        });
        window.onhashchange = function(e){
            hash = e.newURL.split("#")[1]
            if(hash == "")
                return plugin.removeModal();
            if(hash.indexOf("item-")==0) {
                item = hash.split('-')[1];
                item = $("[data-item='"+ item+ "']");
                if (!item.hasClass("active") && item.length>0){
                    $('body').find('.commentmedia-wrapper').remove();
                    plugin.showModal(item);
                    plugin.updateArrows();
                }
            }
        };
        $(document).keydown(function(e) {
            if ($('.commentmedia-wrapper').length > 0){
                switch(e.which) {
                    case 37: // left
                        $(".commentmedia-navigate.arrow-"+ (plugin.options.rtl? "right": "left")).trigger("click");
                        break;
                        
                    case 39: // right
                        $(".commentmedia-navigate.arrow-"+ (plugin.options.rtl? "left": "right")).trigger("click");
                        break;
                        
                    case 27: // esc
                        plugin.removeModal();
                        break;
                        
                    default: return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            }
        });
        if (window.location.hash) {
            a = window.location.hash;
            window.location.hash = "new";
            window.location.hash = a;
        }

        return this.each(function() {
            item = $(this).data('item');
            liked = $.cookie('liked_'+ $(this).data('item')) == "1";
            if(liked)
                $(this).find('.icon-heart').addClass('liked');
            else
                $(this).find('.icon-heart').removeClass('liked');

            $(this).find('img').on('load', function(e){
                $(this).data("load", true);
            });
            $(this).on("click", function(e){
                //scrollTo = $('body').scrollTop();
                $('body').addClass('noscroll')
                         .css('position', 'fixed');
                plugin.showModal($(this));
                plugin.updateArrows();
                return false;
            }).on('dblclick', function(e){
                plugin.likeThis($(this).find(".icon-heart"),
                                $(this).data('likeurl'),
                                $(this).data('item'));
                return false;
            }).find(".icon-heart").click(function(){
                plugin.likeThis(this, $(this).closest(".instagram-carousel")
                      .data('likeurl'), $(this).closest(".instagram-carousel")
                      .data('item'));
                return false;
            });
        });
    };
}( jQuery ));
