const form = document.querySelector('#ticket-form');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const emailInput = document.querySelector('#email');
const dateInput = document.querySelector('#event-date');
const typeSelect = document.querySelector('#attendee-type');
const credentialGroup = document.querySelector('#credential-group');
const credentialLabel = document.querySelector('#credential-label');
const credentialInput = document.querySelector('#credential');
const credentialHint = document.querySelector('#credential-hint');
const errors = document.querySelector('#form-errors');
const ticketResult = document.querySelector('#ticket-result');

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayString = today.toISOString().split('T')[0];
dateInput.min = todayString;

function updateCredentialField() {
  const type = typeSelect.value;
  const isVisible = type === 'student' || type === 'guest';
  credentialGroup.classList.toggle('hidden', !isVisible);
  credentialInput.required = isVisible;
  credentialInput.value = '';

  if (type === 'guest') {
    credentialLabel.textContent = 'Access Code';
    credentialHint.textContent = 'Enter the event access code.';
    credentialInput.inputMode = 'text';
  } else {
    credentialLabel.textContent = 'Student I#';
    credentialHint.textContent = 'Enter your 9 digit student I number.';
    credentialInput.inputMode = 'numeric';
  }
}

function showErrors(messages) {
  errors.innerHTML = `<ul>${messages.map((message) => `<li>${message}</li>`).join('')}</ul>`;
  errors.hidden = false;
  ticketResult.hidden = true;
}

typeSelect.addEventListener('change', updateCredentialField);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const messages = [];
  const selectedDate = new Date(`${dateInput.value}T00:00:00`);

  if (!firstNameInput.value.trim()) messages.push('Please enter your first name.');
  if (!lastNameInput.value.trim()) messages.push('Please enter your last name.');
  if (!emailInput.validity.valid || !emailInput.value.trim()) messages.push('Please enter a valid email address.');

  if (!dateInput.value || Number.isNaN(selectedDate.getTime()) || selectedDate <= today) {
    messages.push('Please choose a date later than today.');
  }

  if (!typeSelect.value) {
    messages.push('Please select whether you are a student or a guest.');
  }

  if (typeSelect.value === 'student' && !/^\d{9}$/.test(credentialInput.value.trim())) {
    messages.push('Student I# must be 9 digits.');
  }

  if (typeSelect.value === 'guest' && credentialInput.value.trim().toUpperCase() !== 'EVENT131') {
    messages.push('The guest access code must be EVENT131.');
  }

  if (messages.length) {
    showErrors(messages);
    return;
  }

  errors.hidden = true;
  const attendee = typeSelect.value === 'student' ? 'student' : 'guest';
  ticketResult.innerHTML = `<h2>Ticket Created</h2><p>${firstNameInput.value.trim()} ${lastNameInput.value.trim()}</p><p>${attendee}</p><p>${dateInput.value}</p>`;
  ticketResult.hidden = false;
});
