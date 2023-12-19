function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
  export function formatDate(date) {
    return [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/');
  }


  export const getTimeFromDate = timestamp => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return padTo2Digits(hours) + ":" + padTo2Digits(minutes)
  }