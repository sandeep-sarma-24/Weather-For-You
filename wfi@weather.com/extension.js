const St = imports.gi.St;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Soup = imports.gi.Soup;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;


let panelButton, panelButtonText, refreshButton, weatherMenu;
let _httpSession;
let weatherItems = [];

const key = "c45d803484f5486391b192220231905";
const locations = ['Phagwara', 'Hyderabad', 'New York'];

function makeRequest(url, locationItem) {
    let request = Soup.Message.new('GET', url);
    _httpSession.queue_message(request, function (_httpSession, message) {
        if (message.status_code !== 200) return;
        let data = JSON.parse(message.response_body.data);
        let temperature = data.current.temp_c;
        let condition = data.current.condition.text
        let pressure = data.current.precip_in
        let humidity = data.current.humidity
        let precip = data.current.precip_mm
        let feels_like = data.current.feelslike_c
        let icon = data.current.condition.icon
        icons = "https:" + icon
        let wind= data.current.wind_kph
        locationItem.label.set_text(`Location : ${data.location.name}\nTemperature : ${temperature}°C\nCondition : ${condition}\nHumidity : ${humidity}%\nPressure : ${pressure}mb\nPrecipitation : ${precip}mm\nWind : ${wind}kph \nFeels like : ${feels_like}°C`);
    });
}

function init() {
    _httpSession = new Soup.Session();

    panelButton = new St.Bin({
        style_class: "panel-button1",
        reactive: true,
        can_focus: true,
        track_hover: true
    });

    panelButtonText = new St.Label({
        style_class: "examplePanelText1",
        text: "Weather"
    });

    panelButton.set_child(panelButtonText);

    weatherMenu = new PopupMenu.PopupMenu(panelButton, 0.5, St.Side.TOP);
    Main.uiGroup.add_actor(weatherMenu.actor);
    weatherMenu.actor.hide();

    locations.forEach((location, index) => {
        let locationItem = new PopupMenu.PopupMenuItem(`${location}...`, { style_class: 'popup-menu-item1' });
        weatherMenu.addMenuItem(locationItem);
        weatherItems.push(locationItem);

        let baseUrl = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${location}`;
        makeRequest(baseUrl, locationItem);
    });

    refreshButton = new PopupMenu.PopupMenuItem("Refresh", { style_class: 'popup-menu-item1' });
    refreshButton.connect('activate', () => {
        weatherItems.forEach((locationItem, index) => {
            let location = locations[index];
            let baseUrl = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${location}`;
            makeRequest(baseUrl, locationItem);
        });

        // Reopen the menu after it gets closed
        Mainloop.idle_add(() => {
            if (!weatherMenu.isOpen) {
                weatherMenu.open(true);
            }
        });
    });
    weatherMenu.addMenuItem(refreshButton);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(panelButton, 0);
    panelButton.connect('button-press-event', () => {
        weatherMenu.toggle();
    });
}

function disable() {
    Main.panel._rightBox.remove_child(panelButton);
    weatherMenu.destroy();
}

