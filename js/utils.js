function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

export function formatDate(date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join("/");
}

export const getTimeFromDate = (timestamp) => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  if (hours > 12) {
    return padTo2Digits(hours) + ":" + padTo2Digits(minutes) + " pm";
  } else {
    return padTo2Digits(hours) + ":" + padTo2Digits(minutes) + " am";
  }
};

const parser = new DOMParser();

export const createHtmlNodesFromHtmlString = (
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
