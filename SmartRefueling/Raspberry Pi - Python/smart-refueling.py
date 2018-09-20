# -*- coding: utf-8 -*-
from __future__ import print_function

#füge lokales Verzeichnis hinzu indem pyota installiert wurde
import sys
sys.path.append("/home/pi/.local/lib/python2.7/site-packages")

#importe Iota-Bibliothek um die API anzusprechen
from iota import Iota

#importe GPIO-Bibliothek für Ein-/Ausgaben von Inputs (Buttons/LEDs)
import RPi.GPIO as GPIO

#sonstige Utility imports
import time
import logging

#wait function
def wait():
    print("0%", "", end=" ")
    for i in range(3):
        time.sleep(0.333)
        print(".", " ", end="")
    print("100%")

#setup GPIO-Pins
BUTTON1 = 11
BUTTON2 = 22
LED = 10
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUTTON1, GPIO.IN)
GPIO.setup(BUTTON2, GPIO.IN)
GPIO.setup(LED, GPIO.OUT, initial = False)

#lokal gespeicherter seed
seed = "DSPOAXMVSC99IUIVJXTIBZFATVFKTCLLJYOLAGSMFJGFXAWEB9GNTQWEDVRYHKIOQF9T9IZY9IVPKTSZK"

#fullnode url
url = "https://test.com:443"

#iota api
api = Iota(url, seed)

try:
    print("Tanksäule wartet auf initialisierung!")
    while not GPIO.input(BUTTON1):
        pass
    while GPIO.input(BUTTON1):
        pass
    print("Tanksäule wird initialisiert...")
    wait()
    GPIO.output(LED, True)
    print("Tankvorgang kann nun gestartet werden!")
    while True:
        if GPIO.input(BUTTON2):
            #auftanken
            print("Tanke...")
            GPIO.output(LED, False)
        else:
            GPIO.output(LED, True)

        if GPIO.input(BUTTON1):
            #beende Tankvorgang
            break
finally:
    GPIO.cleanup()
    print("Tankvorgang beendet!")
