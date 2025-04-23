$(document).ready(function (){

    $('#next-btn').click(function(){
        const currentNum = parseInt($(this).data('num'));
        const nextNum = currentNum + 1;
        window.location.href = `/quiz/${nextNum}`;    
    })


    $('#prev-btn').click(function(){
        const currentNum = parseInt($(this).data('num'));
        const nextNum = currentNum - 1;
        if(nextNum > 0){
            window.location.href = `/quiz/${nextNum}`;    
        }   
    })
});