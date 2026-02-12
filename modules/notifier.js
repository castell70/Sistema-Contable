let queue = [];
let showing = false;
const defaultDuration = 3500;

function showModal(message, duration = defaultDuration) {
  const modal = document.getElementById('notificationModal');
  const backdrop = document.getElementById('notificationBackdrop');
  if (!modal || !backdrop) return;

  // Ensure highest z-index for notifications
  modal.style.zIndex = 99999;
  backdrop.style.zIndex = 99998;

  document.getElementById('notificationContent').textContent = message;
  modal.style.display = 'block';
  backdrop.style.display = 'block';

  showing = true;

  setTimeout(() => {
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
    showing = false;
    // show next in queue
    if (queue.length) {
      const next = queue.shift();
      showModal(next.message, next.duration);
    }
  }, duration);
}

export function enqueueNotification(message, duration) {
  if (showing) {
    queue.push({ message, duration });
  } else {
    showModal(message, duration);
  }
}

export function clearNotifications() {
  queue = [];
  const modal = document.getElementById('notificationModal');
  const backdrop = document.getElementById('notificationBackdrop');
  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
  showing = false;
}