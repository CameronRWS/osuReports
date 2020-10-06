export function hmsToString(h, m, s) {
  var time = "";
  if (h != 0) {
    time = time + h + "h ";
    if (m != 0) {
      time = time + m + "m ";
      if (s != 0) {
        time = time + s + "s";
      }
    }
  } else if (m != 0) {
    time = time + m + "m ";
    if (s != 0) {
      time = time + s + "s";
    }
  } else if (s != 0) {
    time = time + s + "s";
  }
  return time;
}

export function secondsToDHMS(seconds) {
  let days = Math.floor(seconds / (3600 * 24));
  seconds = seconds - days * 3600 * 24;
  let hours = Math.floor(seconds / 3600);
  seconds = seconds - hours * 3600;
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds - minutes * 60);
  return [days, hours, minutes, seconds];
}
