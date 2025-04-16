export function setupClock(element) {
  function updateClock() {
    const now = new Date();
    element.textContent = now.toLocaleTimeString();
  }

  updateClock();
  setInterval(updateClock, 1000);
}
