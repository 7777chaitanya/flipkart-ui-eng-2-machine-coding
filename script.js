import { MESSAGE_SEEN_SVG, OPTION_MESSAGE_MAPPER } from "./constants.js";
import { formatDate, getTimeFromDate } from "./utils.js";

const SELECTED_CHAT_BACKGROUND_COLOR = "#f0f3f6";
const parser = new DOMParser();
let data = [];
let selectedChat = null;
let selectedChatElement = null;
const chatName = document.getElementById("chatName");
const chatMessages = document.getElementById("chatMessages");
const chatSearchInputField = document.getElementById("chatSearchInputField");
const messageListElement = document.getElementById("messageList");
const singleChat = document.querySelector(".singleChat");

const chatInputForm = document.getElementById("chatInputForm");
const messageField = document.getElementById("chatInputFormInputField");
const TODAY = formatDate(new Date());
const messageSendButton = document.getElementById("messageSendButton");



const revertCurrentSelectedChatStyles = () => {
  if (selectedChatElement) {
    selectedChatElement.style.backgroundColor = "white";
  }
};

const createHtmlFromHtmlString = (
  htmlString,
  parent,
  eventName,
  eventHandler
) => {
  const html = parser.parseFromString(htmlString, "text/html");
  Array.from(html.body.children).forEach((each) => {
    if (!eventName) {
      parent.appendChild(each);
    } else {
      each.addEventListener(eventName, eventHandler);
      parent.appendChild(each);
    }
  });
};

const createProductListItemHtmlString = (
  productDetails,
  parent,
  eventName,
  eventHandler
) => {
  const {
    title,
    orderId,
    messageList = [],
    latestMessageTimestamp,
    imageURL,
  } = productDetails;
  const eventListener = createHtmlFromHtmlString(
    `
    <div class="eachMessageContainer" id='${orderId}'>
    <div class="orderImageContainer ${
      selectedChat ? "flexOrderImageContainer" : ""
    }">
    <img
      src=${imageURL}
      alt=${title}
      class="orderImage"
    />
    </div>
    <div class="messageDetails">
      <div class="messageTitle">${title}</div>
      <div class="messageOrderNumber">${orderId}</div>
      <div class="lastMessage">${
        messageList[0]?.message || "No messages yet"
      }</div>
    </div>
    <div class="lastMessageDate">
      ${formatDate(new Date(latestMessageTimestamp))}
    </div>
  </div>
    `,
    parent,
    eventName,
    eventHandler
  );
};

const createChatHeadingHtmlStringAndAppend = () => {
  const { imageURL, title } = selectedChat;

  const chatHeader = `<div class="chatHeadingImageContainer"><img src=${imageURL} alt=${title} class="chatHeadingImage"></div>
    <div class="chatNameHeading">
          ${title}
    </div>`;
  const headerHtml = createHtmlFromHtmlString(chatHeader, chatName);
};

const optionClicked = (option) => {
  const messageText = OPTION_MESSAGE_MAPPER[option];
  return messageText
    ? addNewMessageAndRender(messageText, new Date().getTime())
    : null;
};

const createMessagesHtmlStringAndAppend = () => {
  if (selectedChat.messageList.length) {
    let lastMessageDate = null;
    let getMessageDate = (timeStamp) => {
      let currentMessageDate = formatDate(new Date(timeStamp));
      if (lastMessageDate === currentMessageDate) {
        return "";
      } else {
        lastMessageDate = currentMessageDate;
        return `<div class='messageDateHeading'>${
          lastMessageDate === TODAY ? "Today" : lastMessageDate
        }</div>`;
      }
    };
    selectedChat.messageList.map((eachMessage, messageIndex) => {
      const lastMessage = messageIndex + 1 === selectedChat.messageList.length;
      let messageHtmlString = getMessageDate(eachMessage.timestamp);
      if (eachMessage.messageType === "optionedMessage") {
        const createOptionElements = () => {
          return eachMessage.options.reduce((acc, curr) => {
            return (
              acc +
              `<div class='eachOption ${!lastMessage && "disableOption"}'>
            <div class='optionText'>${curr.optionText}</div>
            <div class='optionSubText ${
              !curr.optionSubText && "hideSubText"
            }'>${curr.optionSubText}</div>
            </div>`
            );
          }, "");
        };
        messageHtmlString += `<div class='eachMessage ${
          eachMessage.sender === "USER" ? "toRight" : "toLeft"
        }'>
        <div class='eachMessageText'>
                       <div>${eachMessage.message}</div>
                       <div class='messageTime'>${getTimeFromDate(
                         eachMessage.timestamp
                       )}</div>
                       </div>
                       ${createOptionElements()}
                </div>
                `;
      } else {
        messageHtmlString += `<div class='eachMessage ${
          eachMessage.sender === "USER" ? "toRight" : "toLeft"
        }'>
        <div class='eachMessageText'>

                       <div>${eachMessage.message}</div>
                       <div class='messageTime'>${getTimeFromDate(
                         eachMessage.timestamp
                       )}
                       ${MESSAGE_SEEN_SVG}
                       </div>
                       </div>
                </div>
                `;
      }

      createHtmlFromHtmlString(messageHtmlString, chatMessages); // second argument is the container to which the children of the string has to be appended
    });
  } else {
    const messageHtmlString = `<div id='noMessagesNote'>Send a message to start chatting</div>`;
    createHtmlFromHtmlString(messageHtmlString, chatMessages);
  }
  document.querySelectorAll(".eachOption").forEach((each) => {
    if (each.classList.contains("disableOption")) {
      each.addEventListener("click", (e) => {
        console.dir(e.target);
        optionClicked(e.target.innerText);
      });
      each.style.cursor = "pointer";
    }
  });
};

const onMessageListItemClick = (event) => {
  chatName.innerHTML = "";
  chatMessages.innerHTML = "";
  const allOrderImageContainers = document.querySelectorAll(
    ".orderImageContainer"
  );
  allOrderImageContainers.forEach((each) => (each.style.flex = 3));
  singleChat.classList.add("showSingleChat");
  selectedChatElement = document.getElementById(`${selectedChat.orderId}`);
  selectedChatElement.style.backgroundColor = SELECTED_CHAT_BACKGROUND_COLOR;
  selectedChatElement.style.borderRightColor = SELECTED_CHAT_BACKGROUND_COLOR;

  createChatHeadingHtmlStringAndAppend();
  createMessagesHtmlStringAndAppend();
};

const renderChatList = (data) => {
  const list = data.forEach((eachProduct) => {
    const eachMessageItemNode = createProductListItemHtmlString(
      eachProduct,
      messageListElement,
      "click",
      (event) => {
        revertCurrentSelectedChatStyles();
        selectedChat = eachProduct;
        onMessageListItemClick(event);
      }
    );
  });
};

window.addEventListener("load", () => {
  fetch("https://my-json-server.typicode.com/codebuds-fk/chat/chats")
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      data = res;
      renderChatList(data);
    })
    .catch((err) => {
      console.error(err);
    });
});

const filterProductsFromList = (e) => {
  messageListElement.innerHTML = "";

  const filteredData = data.filter((eachChat) => {
    if (
      eachChat.title.includes(e.target.value) ||
      eachChat.orderId.includes(e.target.value)
    ) {
      return true;
    }
  });
  if (filteredData.length) {
    renderChatList(filteredData);
    return;
  } else {
    singleChat.classList.remove("showSingleChat");
    messageListElement.innerHTML =
      "<h3 id='noMessagesWarning'>No items matching your search text.</h3>";
  }
};

chatSearchInputField.oninput = filterProductsFromList;

const addNewMessageAndRender = (messageText, messageTime) => {
  const newMessageObject = {
    messageId: "msg1",
    message: messageText,
    timestamp: messageTime,
    sender: "USER",
    messageType: "text",
  };
  selectedChat.messageList.push({ ...newMessageObject });
  chatMessages.innerHTML = "";
  createMessagesHtmlStringAndAppend();
};

const handleChatInput = (e) => {
  e.preventDefault();
  const newMessageText = messageField.value;
  const newMessageTimestamp = new Date().getTime();
  messageField.value = "";
  if (newMessageText.length) {
    addNewMessageAndRender(newMessageText, newMessageTimestamp);
  }
};
chatInputForm.onsubmit = handleChatInput;



// messageSendButton.innerHTML = '<svg viewBox="0 0 16px 16px" class="svg"><g><path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.183H10v2H5.981z"></path></g></svg>'
