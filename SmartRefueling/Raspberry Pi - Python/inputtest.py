# -*- coding: utf-8 -*-
from __future__ import print_function
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(22, GPIO.IN)

liter = 0
preis = 1.48

def wait():
    for i in range(3):
        time.sleep(0.333)
        print(".", " ", end="")
    print("100%\n")

print("Initialisiere Tanksäule...")
wait()
print("Zugang zum Benzintank wird geschaffen...")
wait()
print("Sie können Ihren Wagen nun Tanken!")

try:
    while GPIO.input(22) == 0:
        pass
    
    while GPIO.input(22) == 1:
        liter += 0.01
        print("Tanke... (Liter im Tank: %s)" % liter);

    print("Fertig getankt (Liter: %s), Preis: %s€" % (liter, liter * preis))
    
finally:
    GPIO.cleanup()
    print("Cleaned up")
