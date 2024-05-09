from flask import Flask, request
from google_nest_sdm.device import DeviceManager
from google_nest_sdm.event import EventCallback
from google.auth.credentials import Credentials
import asyncio

app = Flask(__name__)

@app.route('/set_temperature', methods=['POST'])
def set_temperature():
    # Récupérer la température à définir depuis la requête
    data = request.json
    heat_temperature = data.get('heat_temperature')
    cool_temperature = data.get('cool_temperature')

    # Définir la température sur le thermostat
    asyncio.run(set_thermostat_temperature(heat_temperature, cool_temperature))

    return 'Temperature set successfully'

async def set_thermostat_temperature(heat_temperature, cool_temperature):
    #TODO: a changer pour le bon project id
    project_id = "your_project_id"
    credentials = Credentials.from_authorized_user_file("path_to_your_credentials_file.json")
    device_manager = DeviceManager(credentials)
    device_manager.add_event_callback(EventCallback())

    thermostat_id = "your_thermostat_id"
    thermostat = await device_manager.async_get_device(thermostat_id)
    if not thermostat:
        return "Thermostat with ID {thermostat_id} not found."

    await thermostat.async_set_temperature(heat_temperature, cool_temperature)

if __name__ == '__main__':
    app.run(debug=True)
