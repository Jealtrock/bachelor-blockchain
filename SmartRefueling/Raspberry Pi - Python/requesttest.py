# -*- coding: utf-8 -*-

#füge lokales Verzeichnis hinzu indem pyota installiert wurde
import sys
sys.path.append("/home/pi/.local/lib/python2.7/site-packages")

#import iota
from iota import Iota
import logging

seed = "DSPOAXMVSC99IUIVJXTIBZFATVFKTCLLJYOLAGSMFJGFXAWEB9GNTQWEDVRYHKIOQF9T9IZY9IVPKTSZ"
#url = "http://iota.bitfinex.com:80"
url = "https://field.deviota.com:443"

api = Iota(url, seed)
logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.setLevel(10)
api.adapter.set_logger(logger)

gna_result = api.get_new_addresses(count = 4)
addresses = gna_result['addresses']
print(addresses)

print("Check Balance...")
gb_result = api.get_balances(addresses)
