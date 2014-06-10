var pixlr = (function () {
    /*
     * IE only, size the size is only used when needed
     */
    function windowSize() {
        var w = 0,
        h = 0;
        if (document.documentElement.clientWidth !== 0) {
            w = document.documentElement.clientWidth;
            h = document.documentElement.clientHeight;
        } else {
            w = document.body.clientWidth;
            h = document.body.clientHeight;
        }
        return {
            width: w,
            height: h
        };
    }

    function extend(object, extender) {
        for (var attr in extender) {
            if (extender.hasOwnProperty(attr)) {
                object[attr] = extender[attr] || object[attr];
            }
        }
        return object;
    }

    function buildUrl(opt) {
        var url = 'http://pixlr.com/' + opt.service + '/?method=get', attr;
        for (attr in opt) {
            if (opt.hasOwnProperty(attr) && attr !== 'service') {
                url += "&" + attr + "=" + escape(opt[attr]);
            }
        }
        return url;
    }
    var bo = {
        ie: window.ActiveXObject,
        ie6: window.ActiveXObject && (document.implementation !== null) && (document.implementation.hasFeature !== null) && (window.XMLHttpRequest === null),
        quirks: document.compatMode === 'BackCompat'
    },
    return_obj = {
        settings: {
            'service': 'editor'
        },
        overlay: {
            show: function (options) {
                var opt = extend(return_obj.settings, options || {}),
                iframe =  pixlr.overlay.iframe = document.createElement('iframe'),
                div = pixlr.overlay.div = document.createElement('div'),
                idiv = pixlr.overlay.idiv = document.createElement('div');

                        
                PixlrEditor.debug(opt);

                div.style.background = '#696969';
                div.style.opacity = 0.8;
                div.style.filter = 'alpha(opacity=80)';

                if ((bo.ie && bo.quirks) || bo.ie6) {
                    var size = windowSize();
                    div.style.position = 'absolute';
                    div.style.width = size.width + 'px';
                    div.style.height = size.height + 'px';
                    div.style.setExpression('top', "(t=document.documentElement.scrollTop||document.body.scrollTop)+'px'");
                    div.style.setExpression('left', "(l=document.documentElement.scrollLeft||document.body.scrollLeft)+'px'");
                } else {
                    div.style.width = '100%';
                    div.style.height = '100%';
                    div.style.top = '0';
                    div.style.left = '0';
                    div.style.position = 'fixed';
                }
                div.style.zIndex = 99998;

                idiv.style.border = '0px solid #2c2c2c';
                if ((bo.ie && bo.quirks) || bo.ie6) {
                    idiv.style.position = 'absolute';
                    idiv.style.setExpression('top', "25+((t=document.documentElement.scrollTop||document.body.scrollTop))+'px'");
                    idiv.style.setExpression('left', "35+((l=document.documentElement.scrollLeft||document.body.scrollLeft))+'px'");
                } else {
                    idiv.style.position = 'fixed';
                    idiv.style.top = '25px';
                    idiv.style.left = '35px';
                }
                idiv.style.zIndex = 99999;

                document.body.appendChild(div);
                document.body.appendChild(idiv);

                iframe.style.width = (div.offsetWidth - 70) + 'px';
                iframe.style.height = (div.offsetHeight - 50) + 'px';
                iframe.style.border = '0px solid #b1b1b1';
                iframe.style.backgroundColor = '#606060';
                iframe.style.display = 'block';
                iframe.frameBorder = 0;
                iframe.id = "pixlriframe";
                iframe.src = buildUrl(opt);


                //close button
                var closeBtn = document.createElement('div');
                //closeBtn.style.height = "20px";
                //closeBtn.style.width = "20px";
                closeBtn.innerHTML = "exit";
                closeBtn.className = "pixlr-exit-btn";
                
                closeBtn.onclick = function()
                {
                    PixlrEditor.closeOverlay();
                }
                        

                idiv.appendChild(iframe);
                idiv.appendChild(closeBtn);

                $(window).resize(pixlr.overlay.resize);
            },
            hide: function (callback) {
                if (pixlr.overlay.idiv && pixlr.overlay.div) {
                    document.body.removeChild(pixlr.overlay.idiv);
                    document.body.removeChild(pixlr.overlay.div);
                }
                if (callback) {
                    eval(callback);
                }
                $(window).unbind("resize",pixlr.overlay.resize);
            },
            resize: function (e) {
                var iframe = pixlr.overlay.iframe;
                var size = windowSize();
                // var idiv = pixlr.overlay.idiv;
                // console.log(pixlr.overlay.iframe);
                iframe.style.width = (size.width - 70) + 'px';
                iframe.style.height = (size.height - 50) + 'px';

            }
        },
        url: function(options) {
            return buildUrl(extend(return_obj.settings, options || {}));
        },
        edit: function (options) {
            var opt = extend(return_obj.settings, options || {});
            location.href = buildUrl(opt);
        }
    };        
    return return_obj;
}());





PixlrEditor = {
    $ProcessPageEdit: null,
    target : null,
    $thImageLink : null,
    updatePixlrSettings:function(){
        pixlr.settings.locktitle = true;
        pixlr.settings.service = "express";
        pixlr.settings.locktype = true;
        pixlr.settings.quality = 95;
        pixlr.settings.exit = '';
    },//PixlrEditor.updatePixlrSettings

    init: function()
    {
        PixlrEditor.updatePixlrSettings();

        $ProcessPageEdit = $("#ProcessPageEdit");
        //PixlrEditor.debug("PixlrEditor.init");
                
                

        var $editButtons = $ProcessPageEdit.find(".pixlr-edit-button");
        var $editButtonsContainers = $ProcessPageEdit.find(".pixlr-menu-bar");
        //var $InputfieldFileList = $(".InputfieldImage  .InputfieldFileList");
        var $InputfieldFileList = $(".InputfieldImage  .InputfieldFileList, .InputfieldCropImage  .InputfieldFileList");

        $editButtonsContainers.fadeOut();
                
        $editButtons.button();
        
        //register events
        $InputfieldFileList.delegate(".pixlr-edit-button", "click", PixlrEditor.events.editClick);           
        $InputfieldFileList.delegate("li.InputfieldImage ", "mouseenter", PixlrEditor.events.hoverIn);
        $InputfieldFileList.delegate("li.InputfieldImage ", "mouseleave", PixlrEditor.events.hoverOut);
        $InputfieldFileList.delegate("li.InputfieldImage .crop", "mouseenter", PixlrEditor.events.hoverInCrop);
        $InputfieldFileList.delegate("li.InputfieldImage .crop", "mouseleave", PixlrEditor.events.hoverOutCrop);

        $InputfieldFileList.on('AjaxUploadDone', PixlrEditor.events.ajaxUploadDone);

        var n = 0;
        if ($("a[class=crop]").length) {
            // $menuBar = $(".pixlr-menu-bar:last");
            $.each($("a[class=crop]"), function(i,el) {
                var $m = $(this).closest('.InputfieldImage').find('.pixlr-menu-bar').first().clone().hide();
                $m.find('button').
                attr('id', $m.find('button:first').attr('id') + n).
                data('url', window.location.protocol + '//' + window.location.host + $(this).data('thumburl')).
                data('page_id', $(this).attr("href").match(/pages_id=(.+?)\&/i)[1] ).
                data('filename', $(this).attr("href").match(/filename=(.+?)\&/i)[1] ).
                data('prefix', $(el).attr("href").match(/prefix=(.+?)\&/i)[1] );
                // console.log($(el).attr("href").match(/prefix=(.+?)\&/i)[1]);
               // $m.css({'top': 'inherit', 'right': '0'});
               // $(this).css({'width': '100%', 'height': '40px'});
                $(this).prepend($m);
                n++;
            }); 
        }

    },
    closeOverlay: function(){
        window.parent.pixlr.overlay.hide();
        
        PixlrEditor.updateThImage();
            
    },
    updateThImage: function()
    {
        
        PixlrEditor.debug("close:"+ PixlrEditor.$thImageLink);
        if(PixlrEditor.$thImageLink)
        {
            var $img = PixlrEditor.$thImageLink;
            $img.fadeTo(200,.2);
            //Reload page. This regenerate thumbnails.
            $.get(window.location.href,function(){
                $img.attr('src', $img.attr('src').replace(/\?.+$/i,'')+"?"+ new Date().getTime() );
                $img.fadeTo(200,1);
            });
        }
        
           
        PixlrEditor.$thImageLink = null;
        
            
    },
       
    events: {
        ajaxUploadDone: function(){
            $editButtons = $ProcessPageEdit.find(".pixlr-edit-button");
            $editButtons.button();
        },
        editClick: function(e){
            e.preventDefault();
            var imgUrl = $(this).data("url");
            var filename = $(this).data("filename");
            var page_id = $(this).data("page_id");
            var field = $(this).data("field");
            var targetUrl = $(this).data("target");
            var service = $(this).data("service");
            var prefix = $(this).data("prefix");
                        
            var target = targetUrl + "?filename="+ filename +"&page_id="+ page_id +"&field="+ field +"&prefix="+ prefix +"&modal=1&" ;

            // Save link to image
            // We can refresh it later
            if ($(this).closest("a[class=crop]").length == 0) PixlrEditor.$thImageLink = $(this).closest("li").find(".InputfieldFileLink img");

            var params = {
                image:imgUrl, 
                service:service, 
                target:target, 
                title:filename, 
                exit: targetUrl+"?exit=true"
                };
            PixlrEditor.debug(params);
            pixlr.overlay.show(params);


        }//PixlrEditor.events.editClick
        ,
        hoverIn: function()
        {
            if ($(this).closest(".InputfieldImageGrid").length == 0) $(this).find(".InputfieldFileData > .pixlr-menu-bar").stop(true, true).fadeIn();
        },
        hoverOut: function()
        {
            $(this).find(".InputfieldFileData > .pixlr-menu-bar").stop(true, true).fadeOut();
        },
        hoverInCrop: function()
        {
            if ($(this).closest(".InputfieldImageGrid").length == 0) $(this).find(".pixlr-menu-bar").stop(true, true).fadeIn();
        },
        hoverOutCrop: function()
        {
            $(this).find(".pixlr-menu-bar").stop(true, true).fadeOut();
        }
    
    },
    debug: function(msg){
        if(window.debug) console.log(msg);
    }
}//PixlrEditor

$(document).ready(PixlrEditor.init);
