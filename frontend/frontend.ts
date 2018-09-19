import io from "socket.io-client";
import { random } from "lodash";

function connectUser(username: string) {
  const socket = io("http://localhost:3555", {
    query: {
      name: username,
    },
  });
  const div = document.createElement("div");
  div.style.fontSize = "22px";
  document.body.appendChild(div);

  const sendButton = document.createElement("button");
  sendButton.innerHTML = "Send card";

  socket.on("connect", console.log.bind(console, "connected", username));
  socket.on("newData", (data: any) => {
    div.innerHTML = `
      ${username}
      Updated ${new Date().toLocaleTimeString()}: ${JSON.stringify(data)}`;

    sendButton.onclick = () => {
      socket.emit("deal", data[random(0, data.length - 1, false)]);
    };
    div.appendChild(sendButton);
  });
}

Array.from(Array(4), (_, i) => "User" + (i + 1))
  .concat("$DEBUG")
  .forEach(connectUser);

declare const module: any;
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
    throw "whatever";
  });
}
