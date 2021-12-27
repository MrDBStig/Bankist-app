'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-11-23T07:42:02.383Z',
    '2021-11-28T09:15:04.904Z',
    '2021-12-01T10:17:24.185Z',
    '2021-12-24T14:11:59.604Z',
    '2021-12-25T17:01:17.194Z',
    '2021-12-26T23:36:17.929Z',
    '2021-12-27T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0),
    //   month = `${date.getMonth() + 1}`.padStart(2, 0),
    //   year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ''; // Clear movements in HTML

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b) // Sort items in movements window
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal',
      date = new Date(acc.movementsDates[i]),
      displayDate = formatMovementDate(date, acc.locale),
      formattedMov = formatCurrency(mov, acc.locale, acc.currency),
      html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
        i + 1
      } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);
// console.log(accounts);

const updateUI = function (acc) {
  displayMovements(acc); // Display movements
  calcDisplayBalance(acc); // Display balance
  calcDisplaySummary(acc); // Display summary
};

let currentAccount;

// Fake always log in
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100; // Displaying UI

// Event handler for login
btnLogin.addEventListener('click', e => {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`; // Display welcome message
    containerApp.style.opacity = 100; // Displaying UI
    inputLoginUsername.value = inputLoginPin.value = ''; // Clear input fields
    inputLoginPin.blur(); // Display out focus on pin pinput
    updateUI(currentAccount);
    // Create current date
    const now = new Date(),
      options = {
        hour: 'numeric',
        minute: 'numeric',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    //   day = `${now.getDate()}`.padStart(2, 0),
    //   month = `${now.getMonth() + 1}`.padStart(2, 0),
    //   year = now.getFullYear(),
    //   hours = `${now.getHours()}`.padStart(2, 0),
    //   minutes = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${minutes}`;
  }
});

// Event handler for transfer
btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputTransferAmount.value,
    recieverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  if (
    amount > 0 &&
    recieverAcc &&
    amount <= currentAccount.balance &&
    recieverAcc?.username !== currentAccount.username
  ) {
    // Doing transfer
    currentAccount.movements.push(-amount);
    recieverAcc.movements.push(amount);
    // Adding transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());
    // Updating UI
    updateUI(currentAccount);
  }
  // Clearing inputs
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
});

// Event handler for loan
btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(dep => dep >= loanAmount * 0.1)
  ) {
    setTimeout(() => {
      currentAccount.movements.push(loanAmount); // Add this movement
      currentAccount.movementsDates.push(new Date().toISOString()); // Add loan date
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
});

// Event handler for account closing (deleting)
btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1); // Delete account
    containerApp.style.opacity = 0; // Hiding UI
    // Clearing inputs
    inputClosePin.value = inputCloseUsername.value = '';
    inputClosePin.blur();
  }
});

// Event handler for sorting
let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(
    currentAccount.movements,
    sorted ? (sorted = false) : (sorted = true)
  );
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// Looping with forEach method
// movements.forEach((movement, index, array) => {
//   movement > 0
//     ? console.log(`Movement ${index}: You deposited ${movement}`)
//     : console.log(`Movement ${index}: You withdrew ${Math.abs(movement)}`);
//   // console.log(array);
// });

// the same on for of
// for (const movement of movements) {
//   movement > 0
//     ? console.log(`You deposited ${movement}`)
//     : console.log(`You withdrew ${Math.abs(movement)}`);
// }

/////////////////////////////////////////////////
// forEach method on maps and sets
// currencies.forEach((value, key, map) => console.log(`${key}: ${value}`));

// const currenciesUnique = new Set(['USD', 'GBP', 'EUR', 'EUR', 'USD']);
// console.log(currenciesUnique);
// currenciesUnique.forEach((value, key, map) => console.log(`${key}: ${value}`));

/////////////////////////////////////////////////
// Map method
// const eurToUsd = 1.1;
// const movementsToUsd = mov => Math.trunc(mov * eurToUsd);
// const movementsUSD = movements.map(movementsToUsd);
// console.log(movements);
// console.log(movementsUSD);

/////////////////////////////////////////////////
// Filter method
// const deposits = movements.filter(mov => mov > 0);
// console.log(movements);
// console.log(deposits);

// const withdrawals = movements.filter(mov => mov < 0);
// console.log(withdrawals);

/////////////////////////////////////////////////
// Reduce method
// const balance = movements.reduce((accu, curr) => accu + curr, 0);
// console.log(balance);
// // Maximum value
// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) return acc;
//   else return mov;
// }, movements[0]);
// console.log(max);

/////////////////////////////////////////////////
// Find method
// const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);

/////////////////////////////////////////////////
// flatMap method
// const allMovements = accounts
// .flatMap(acc => acc.movements)
// .reduce((acc, mov) => acc + mov);
// console.log(allMovements);

// Random number function
// const randInt = (max, min) => Math.trunc(Math.random() * (max - min) + 1) + min;
// console.log(randInt(0, 10));
