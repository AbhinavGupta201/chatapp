window.addEventListener("load", Ready());

function Ready() {

  let chat_area = document.getElementById("chat_room");
  let info = document.getElementById("info");

  //  hide the chat and message box
  chat_area.style.visibility = "hidden";

  let join_chat = document.getElementById("join-chat");
  join_chat.addEventListener("click", Start_Conversation);

  // typing event handler
  t=0;
  let typing = document.getElementById("message");
  typing.addEventListener("keydown", User_Typing);
  typing.addEventListener("keyup", (e) => {
    clearTimeout(t);
    t=setTimeout(()=>{
      socket.emit("stopped_typing");
    },5000)
  });
}

// user is typing
function User_Typing() {
  clearTimeout(t);
  socket.emit("typing");
}


// create a card to show
function createCard(data) {
  let div = document.createElement("div");
  let p = document.createElement("p");
  if (data.type == "info") {
    p.style.textAlign = "center";
    p.innerHTML = data.message;
    p.style.color = color[Math.floor(Math.random() * (color.length - 1))];
  } else {
    p.innerHTML = `<h6 style="color:${
      color[Math.floor(Math.random() * (color.length - 1))]
    };">${data.username} </h6>
                ${data.message} <br/>
                <h6 style="color:${
                  color[Math.floor(Math.random() * (color.length - 1))]
                };">${data.time}</h6>`;
    if (data.type == "new_message") {
      div.style.alignSelf = "flex-start";
    } else {
      div.style.alignSelf = "flex-end";
    }

    div.style.boxShadow = "5px 3px 10px black";
    div.style.width = "fit-content";
    div.style.padding = "10px";
    div.style.maxWidth = "45%";
    div.style.padding = "10px";
    div.style.margin = "5px";
    // div.style.backgroundColor="black"
  }
  div.appendChild(p);
  return div;
}

// event function to execute
function Start_Conversation() {
  let username = document.getElementById("username").value;
  let info = document.getElementById("info");
  let chat_area = document.getElementById("chat_room");
  sendBtn = document.getElementById("send");
  message = document.getElementById("message");

  chat_area.style.visibility = "visible";
  // remove the username and join-chat feild:
  info.remove();

  // socket events
  socket = io("https://fast-ravine-16774.herokuapp.com", {
    autoconnect: false,
  });
  // append the username in the auth object
  socket.auth = { username };
  socket.connect();

  // add a event listener to the leave-chat 
  let leave=document.getElementById("leave_chat")
  leave.addEventListener("click",()=>{
    socket.on("want_to_disconnect")
    location.replace('logout.html');
  })

  // add username to the server data
  socket.emit("User_Info", { username });

  // message and private messaging socket emit 
  sendBtn.addEventListener("click", function () {
    let message_div = document.getElementById("chat");
    let req = {};
    req.message = message.value;

    let sendto=document.getElementById("send-to").value
    if(sendto=="All")
    {
      socket.emit("message", req);
    }
    else
    {
      req.to=sendto;
      socket.emit("private_message",req)
    }
    message.value = ""; // clear the message box
  });

  // greeting from the server
  socket.on("greeting", (data) => {
    let message_div = document.getElementById("chat");
    let p = createCard(data);
    message_div.appendChild(p);
  });

  // user disconnection info
  socket.on("user_disconnected", (data) => {
    let message_div = document.getElementById("chat");
    let p = createCard(data);
    message_div.appendChild(p);
  });

  // message from the server
  socket.on("message", (data) => {
    let li = document.getElementById("typing");
    li.innerHTML = "";
    let message_div = document.getElementById("chat");
    let p = createCard(data);
    message_div.appendChild(p);
  });

  // active user
  socket.on("active_users", (data) => {
    let li = document.getElementById("active_users");
    li.innerHTML = `<span style="font-size:10px;">🟢 </span>${data} Online`;
    li.style.color = "green"
  });

  // user typing
  socket.on("typing", (data) => {
    let li = document.getElementById("typing");
    li.style.marginLeft = "20px";
    li.innerHTML = `....${data.username} is typing`;
    // li.style.color = color[Math.floor(Math.random() * (color.length - 1))];
  });

  // stopped_typing
  socket.on("stopped_typing",()=>{
    let li = document.getElementById("typing");
    li.style.marginLeft = "20px";
    li.innerHTML = ``;
  })

  // user-list socket event
  socket.on("users_list", (users) => {
    users.forEach((user) => {
      user.self = user.userID === socket.id;
    });
    // put the current user first, and then sort by username
    this.users = users.sort((a, b) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
    //clear the existing user:List in the list
    document.getElementById("users_list").innerHTML=""
    document.getElementById("send-to").innerHTML=`
    <option value="All" >All</option>`

    for (let i = 0; i < users.length; i++) {

      let div = document.createElement("div");
      div.id = users[i].userID;
      let p = document.createElement("p");
      if(users[i].self)
         p.innerHTML = `${users[i].username} (You)`;
      else
         p.innerHTML = users[i].username;
      div.appendChild(p);
      let q = document.createElement("p");
      q.innerHTML = "🟢 Online";
      q.style.color = "#1d803c";
      q.style.paddingLeft="10px"
      q.style.fontWeight="bold"
     // div.appendChild(q);
      div.style.padding = "0px 10px";
      div.style.borderBottom = "1px solid black";
      div.style.color = "white";
      document.getElementById("users_list").appendChild(div);
      if(users[i].self==false)
      {

        let option=document.createElement("option")
        option.innerHTML=`${users[i].username}`
        option.value=`${users[i].username}`;
        document.getElementById("send-to").appendChild(option)
      }
 
  
    }
  });
}
