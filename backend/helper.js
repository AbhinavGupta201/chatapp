// get the current date and time object in utc format 

function getTime()
{
    let today=new Date()
    let d=today.getDate()
    let m=today.getMonth()+1 // return between the 0 and 11 
    let y=today.getFullYear()
    
    let h=today.getHours() // 0 to 23 format
    let min=today.getMinutes() // 0 to 59
    let sec=today.getSeconds()
    
    let time="";
    if(h<12)
        time+=`${h.toString().padStart(2,"0")}:${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")} AM`;
    else if(h==12)
         time+=`${h.toString().padStart(2,"0")}:${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")} PM`;
    else
       time+=`${(h-12).toString().padStart(2,"0")}:${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")} PM`;
    return time;
}

module.exports={getTime}


