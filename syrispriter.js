var globalSprites = []

/**
 * Declare element as a sprite to animate
 * @param {int} first - First frame of the animation
 * @param {int} last - Last frame of the animation
 * @param {int} speed - Time between two frames (in milliseconds, default 500)
 * @param {bool} type - Type of animation - normal (default), random (random frame), reverse (play forward then backward)
 * @param {function} callback
 */
jQuery.fn.sprite = function(anim,first,last,speed,type,callback) {
    // If first or last isn't defined, do nothing and show error in logs
    if (first==0 || first==undefined || first=="" || first==null || last==0 || last==undefined || last=="" || last==null){
        console.log("Sprite not loaded - missing params");
        return this;
    }
    // If speed isn't defined, set it to 1000 by default
    if (speed==0 || speed==undefined || speed=="" || speed==null){
        speed=1000;
    }
    var me = $(this[0]);
    var spriteHeight = me.height();
    var spriteWidth = me.width();

    // Calculate width and height of the image
    var img = new Image;
    src = me.css('background-image').replace(/url\(|\)$/ig, "");
    var pattern = /^"file:\/\/\//gm;
    if(pattern.test(src)===true){
        // Local file
        var location = window.location.href;
        location = location.replace(/(.*\/)(.*\..*)/,"$1");
        src=src.replace(location,"").replace(/"/g,"");
        img.src=src;
    }else{
        // Distant file
        src=src.replace(/"/g,"");
        img.src=src;
    }

    var bgImgWidth = img.width;
    var bgImgHeight = img.height;

    tilesWidth = bgImgWidth/spriteWidth;
    tilesHeight = bgImgHeight/spriteHeight;

    var currentFrame = first;
    if(anim==null || anim=="" || anim==undefined){
        anim="default";
    }

    // Push the sprite in the globalSprites and run animation
    if(me.attr("sprite-id")==null || me.attr("sprite-id")==undefined || me.attr("sprite-id")==""){
        me.attr("sprite-id",globalSprites.length);
    }else{
        me.spriteStop();
    }
    if(anim==null || anim=="" || anim==undefined){
        anim="default";
    }
    if(globalSprites[me.attr("sprite-id")]==undefined || globalSprites[me.attr("sprite-id")]==null || globalSprites[me.attr("sprite-id")]==""){
        globalSprites[me.attr("sprite-id")]={};
    }
    globalSprites[me.attr("sprite-id")]["currentAnim"]=anim;
    globalSprites[me.attr("sprite-id")][anim]={
        on:true,
        currentFrame:currentFrame,
        first:first,
        last:last,
        speed:speed,
        type:type,
        tilesWidth:tilesWidth,
        spriteWidth:spriteWidth,
        spriteHeight:spriteHeight,
        callback:callback,
        timer:setInterval(function(){me.spriteNextFrame()},speed)
    }

    me.spriteNextFrame();

    return this;
};


jQuery.fn.spriteNextFrame = function() {
    var me = $(this[0]);
    var currentAnim = globalSprites[me.attr("sprite-id")].currentAnim;
    if(currentAnim == null || currentAnim == undefined || currentAnim == ""){
        currentAnim = "default";
    }
    var d = globalSprites[me.attr("sprite-id")][currentAnim];

    var tilePos = tablePosition(d.currentFrame,d.tilesWidth);
    me.css("background-position",-1*(d.spriteWidth*(tilePos.x-1))+"px "+-1*(d.spriteHeight*(tilePos.y-1))+"px");

    switch(d.type){
        case "random":
            d.currentFrame=Math.floor(Math.random() * d.last) + d.first;  
        break;
        case "reverse":
            if(d.backward){
                d.currentFrame--;
                if(d.currentFrame < d.first){
                    d.currentFrame=d.first;
                    d.currentFrame++;
                    d.backward=false;
                }
            }else{
                d.currentFrame++;
                if(d.currentFrame > d.last){
                    d.currentFrame=d.last;
                    d.currentFrame--;
                    d.backward=true;
                }
            }
        break;
        default:
            d.currentFrame++;
            if(d.currentFrame > d.last){
                d.currentFrame=d.first;
            }
        break;
    }

    globalSprites[me.attr("sprite-id")][currentAnim]=d;
    
    if(typeof d.callback == "function"){
        d.callback();
    }

    return this;
};

jQuery.fn.spritePlay = function(anim) {
    var me = $(this[0]);
    me.spriteStop();
    var currentAnim = globalSprites[me.attr("sprite-id")].currentAnim;
    if(anim == null || anim == undefined || anim == ""){
        if(currentAnim == null || currentAnim == undefined || currentAnim == ""){
            currentAnim = "default";
        }
    }else{
        currentAnim = anim;
    }
    //anim ici
    globalSprites[me.attr("sprite-id")]["currentAnim"]=currentAnim;
    if(!globalSprites[me.attr("sprite-id")][currentAnim].on){
        globalSprites[me.attr("sprite-id")][currentAnim].on=true;
        globalSprites[me.attr("sprite-id")][currentAnim].timer=setInterval(function(){me.spriteNextFrame()},globalSprites[me.attr("sprite-id")][currentAnim].speed);
    }
    return this;
};
jQuery.fn.spritePause = function() {
    var me = $(this[0]);
    var currentAnim = globalSprites[me.attr("sprite-id")].currentAnim;
    if(currentAnim == null || currentAnim == undefined || currentAnim == ""){
        currentAnim = "default";
    }
    if(globalSprites[me.attr("sprite-id")][currentAnim].on){
        globalSprites[me.attr("sprite-id")][currentAnim].on=false;
        clearInterval(globalSprites[me.attr("sprite-id")][currentAnim].timer);
        globalSprites[me.attr("sprite-id")][currentAnim].timer=null;
    }
    return this;
};

jQuery.fn.spriteStop = function() {
    var me = $(this[0]);
    var currentAnim = globalSprites[me.attr("sprite-id")].currentAnim;
    if(currentAnim == null || currentAnim == undefined || currentAnim == ""){
        currentAnim = "default";
    }
    if(globalSprites[me.attr("sprite-id")][currentAnim].on){
        globalSprites[me.attr("sprite-id")][currentAnim].on=false;
        clearInterval(globalSprites[me.attr("sprite-id")][currentAnim].timer);
        globalSprites[me.attr("sprite-id")][currentAnim].timer=null;
        globalSprites[me.attr("sprite-id")][currentAnim].currentFrame=globalSprites[me.attr("sprite-id")][currentAnim].first;
    }
    return this;
};

jQuery.fn.spriteRemove = function() {
    var me = $(this[0]);
    var currentAnim = globalSprites[me.attr("sprite-id")].currentAnim;
    if(currentAnim == null || currentAnim == undefined || currentAnim == ""){
        currentAnim = "default";
    }
    clearInterval(globalSprites[me.attr("sprite-id")][currentAnim].timer);
    globalSprites.splice(me.attr("sprite-id"),1);
    me.removeAttr("sprite-id");
    return this;
};

jQuery.fn.spriteAnims = function() {
    var me = $(this[0]); 
    return Object.keys(globalSprites[me.attr("sprite-id")]);
};

/**
 * Return position {x,y} of a cell in a table
 * @param {*} cellNumber - number of the cell  
 * @param {*} columns - number of columns in the table
 */
function tablePosition(cellNumber,columns){
    return {
        x: ((cellNumber-1)%columns)+1,
        y: Math.floor(((cellNumber-1)/columns)+1)
    }
}