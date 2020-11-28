

const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
    dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
    inputCities = formSearch.querySelector('.input__cities-to'),
    dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
    inputDateDepart = formSearch.querySelector('.input__date-depart'),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets'),
    body = document.getElementById('forevent');


const MAX_COUNT = 10;
let city = [];
const citiesApi = 'DB/cities.json',
proxy = 'https://cors-anywhere.herokuapp.com/'
API_KEY = 'f58db6e4b28f46af8689cf3b7c2d6459',
calendar = 'http://min-prices.aviasales.ru/calendar_preload';



    //взаимодействие с API
const getData = (url, callback, errFunc = console.error) => {
    
        const request = new XMLHttpRequest();
        request.open('GET', url);
        request.addEventListener('readystatechange', () => {
           if (request.readyState !== 4) return;
           if (request.status === 200) {
            callback(request.response);
           } else {
            errFunc(request.status);
           }
        });
        
            request.send();
       
};
    
const showCity = (input, list) => {
        list.textContent = '';
    
        if (input.value === '') return;
    
        const filterCity = city.filter((item) => {
            const fixItem = item.name.toLowerCase();
            return fixItem.startsWith(input.value.toLowerCase());
         });
        filterCity.forEach((item) => {
            const li = document.createElement('li');
            li.classList.add('dropdown__city');
            li.textContent = item.name;
            list.append(li);
        }); 
};

const selectCity = (event,input, list) => {
        const target = event.target;
            if (target.tagName.toLowerCase() === 'li') {
            input.value = target.textContent;
           list.textContent = '';
        }
    }
const getNameCity = (code) => {
    const objCity = city.find((item) => item.code == code);
    return objCity.name;
};

const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'С одной пересадкой': 'С двумя пересадками';
    } else return 'Без пересадок';
};
const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getLinkAviasales = (data) => {
    let link = 'https://www.aviasales.ru/search/' + data.origin;
    const date = new Date(data.depart_date);
    const day = date.getDate();
    link += day < 10 ? '0' + day : day;
    const month = date.getMonth() + 1;
    link += month <10 ? '0' + month : month;
    link += data.destination + '1';
    console.log(link);
    return link;
};

const showMessage = (str) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = `<h2>${str}</h2>`;
    otherCheapTickets.style.display = 'none';
}

const createCard = (data) => {
    console.log(data);
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');
    
    let deep = '';
    if (data) {
        deep = `
                <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href="${getLinkAviasales(data)}" target="_blank"  class="button button__buy">Купить
                    за ${data.value} ₽</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)}</div>
                </div>

                <div class="block-right">
                    <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    } else {
        deep = '<h3>К сожалению, на текущую датов билетов нет.</h3>';
    }
    ticket.insertAdjacentHTML('afterbegin', deep);
    return ticket;
};

const renderCheapDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
   
   const ticket = createCard(cheapTicket[0]);
   cheapestTicket.append(ticket);
};
const renderCheapTickets = (cheapTickets) => {
    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
    cheapTickets.sort((a, b) => a.value - b.value);
    
    for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
        console.log('i: ', i);
        const ticket = createCard(cheapTickets[i]);
        otherCheapTickets.append(ticket);
    }
};

const renderCheap = (data, date) => {
    const cheapTickets = JSON.parse(data).best_prices;
    const cheapTicketDay = cheapTickets.filter(item => item.depart_date === date);
       
    renderCheapDay(cheapTicketDay);
    renderCheapTickets(cheapTickets);
};

// подсказки в инпуте
inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCities.addEventListener('input', () => {
    showCity(inputCities, dropdownCitiesTo);
});
//clicks on cities
dropdownCitiesFrom.addEventListener('click', (event) => {
    selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', (event) => {
    selectCity(event, inputCities, dropdownCitiesTo);
});

formSearch.addEventListener('submit', (event) => {
    event.preventDefault();

    const origin = city.find((item) => inputCitiesFrom.value === item.name);
    const destination = city.find((item) => inputCities.value === item.name);
    const formData = {
        
        from: origin,
        to: destination,
        depDate: inputDateDepart.value,
    }
    if (formData.from && formData.to) {
        const requestData = `?depart_date=${formData.depDate}&origin=${formData.from.code}`+
        `&destination=${formData.to.code}&one_way=true&token=${API_KEY}`;
        
        getData(calendar + requestData, (response) => {
            renderCheap(response, formData.depDate);
        },(e) => { showMessage(`В этом направлении рейсов нет ¯\\_(ツ)_/¯`)}); 
    }  else { showMessage('Некорректный ввод');}    
});

document.body.addEventListener('click', (event) => {
    dropdownCitiesFrom.textContent = '';
    dropdownCitiesTo.textContent = '';
});

getData(citiesApi, (data) => {
    city = JSON.parse(data).filter(item => item.name);
    
    city.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        // a должно быть равным b
        return 0;
      });
    
});

//полный запрос
/* getData(proxy + calendar + 
    '?depart_date=2020-05-29&origin=SVX&destination=KGD&one_way=true&token=' + API_KEY, (data) => {
    const cheapTicket = JSON.parse(data).best_prices.filter(item => item.depart_date === '2020-05-29');
    console.log(cheapTicket); 
});
*/