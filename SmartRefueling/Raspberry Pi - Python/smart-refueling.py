# -*- coding: utf-8 -*-

#utility imports
from __future__ import print_function
import time
import logging
import sys
sys.path.append("/home/pi/.local/lib/python2.7/site-packages")  #path muss hinzugefügt werden damit
                                                                #PyOta librarys gefunden werden

#importiere iota-Bibliotheken um die API anzusprechen und eine Transaktion erstellen zu können
from iota import Iota, ProposedTransaction, ProposedBundle, Address, Tag, TryteString
import requests             #importiere requests-Bibliothek um HTTP-Anfragen zu machen
import RPi.GPIO as GPIO     #importiere GPIO-Bibliothek für Ein-/Ausgaben von Inputs (Buttons/LEDs)

#globale Variablen
BUTTON1 = 11
BUTTON2 = 22
LED = 10

seed = "DSPOAXMVSC99IUIVJXTIBZFATVFKTCLLJYOLAGSMFJGFXAWEB9GNTQWEDVRYHKIOQF9T9IZY9IVPKTSZK"  
fullnode_url = "https://potato.iotasalad.org:14265"
api = Iota(fullnode_url, seed)
logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)
logger = logging.getLogger(__name__)
api.adapter.set_logger(logger)

fueling_url = "http://ownhomebasenode.ddns.net:1717/fueling/"

def main():
    try:
        #setup GPIO-Pins
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(BUTTON1, GPIO.IN)
        GPIO.setup(BUTTON2, GPIO.IN)
        GPIO.setup(LED, GPIO.OUT, initial = False)

        print("IOTA Kontostand wird abgefragt")
        balance = check_balance()
        print("%s IOTA befinden sich in der Wallet" % (balance))
        
        print("Daten der Tankstelle werden abgerufen...")
        stationData = get_station_info()
        print("Super %s" %(stationData["Super"]))
        
        print("Führen Sie den Zapfhahn ein...")
        wait_for_button_click(BUTTON1)          #manuell muss der Zapfhahn in das Auto gesteckt werden
        pumpData = get_pump_info()
        print("Tanksäule %s wurde in den Tank geführt!"
              " Sprittyp %s ausgewählt" %(pumpData["ZapfId"], pumpData["FuelType"]))
        print("Tanksäule wird initialisiert...")
        carId = initialize_fueling(pumpData["ZapfId"], pumpData["FuelType"])

        print("Tankvorgang kann nun gestartet werden!")
        GPIO.output(LED, True)

        fueling = False
        startTime = time.time()
        while not GPIO.input(BUTTON1):
            if GPIO.input(BUTTON2) and not fueling:
                fueling = True
                GPIO.output(LED, False)
                call_api("startFueling", carId)

            if not GPIO.input(BUTTON2) and fueling:
                fueling = False
                GPIO.output(LED, True)
                call_api("pauseFueling", carId)

            if fueling:
                currentTime = time.time()
                if currentTime - startTime > 0.1:
                    startTime = currentTime
                    fuelingData = call_api("getFueling", carId)
                    print("fueling timestamp: %s" %(currentTime))

        endFuelingData = call_api("endFueling", carId)
        amount = endFuelingData["amount"]
        cost = endFuelingData["cost"]
        address = endFuelingData["address"]
        print("Sie haben %s liter getankt, die Rechnung beläuft sich auf %s IOTAs" %(menge, preis))
        
    finally:
        GPIO.cleanup()

#warte auf button click
def wait_for_button_click(button):
    while not GPIO.input(button):
        pass
    while GPIO.input(button):
        pass

#checke Kontostand der Wallet
def check_balance():
    balance = 10237
    return balance

#fordere daten der tankstelle an
def get_station_info():
    response = requests.get(fueling_url + "getStationInfo")
    return response.json()

#fordere daten des Zapfhahns an (z.B. über NFC-Chip), hardcoded implementiert
def get_pump_info():
    data = {
        "ZapfId": 1,
        "FuelType": "Super"
    }
    return data

#initialisiere Tanksäule und erhalte eine eindeutige ID zur Kennung
def initialize_fueling(zapfId, fuelType):
    params = {
        "station": zapfId,
        "fuel_type": fuelType
    }
    response = requests.get(fueling_url + "initializeFueling", params)
    return response.json()["id"]

def call_api(route, carId):
    params = {
        "id": carId
    }
    response = requests.get(fueling_url + route, params)
    return response.json()

#bezahle mit iota, return bundlehash
def pay(amount, reciever, message):
    return

main()
