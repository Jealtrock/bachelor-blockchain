# -*- coding: utf-8 -*-

#sonstige Utility imports
from __future__ import print_function
import time
import logging
import sys
sys.path.append("/home/pi/.local/lib/python2.7/site-packages")  #path muss hinzugefügt werden damit PyOta librarys gefunden werden können

from iota import Iota, ProposedTransaction, ProposedBundle, Address, Tag, TryteString       #importe Iota-Bibliothek um die API anzusprechen
from iota.crypto.addresses import AddressGenerator

# Reciever Seed: GCUKFZRLCTBGBDKQCQY9SMJPDPLFBDJJFTXZANHDJUTCZKIQQEUHSAVOYWKPTDDNEWRGBFWDMWYYRLRUR
# returned Address at index 0 for Security Level 2
reciever_address = "NNWCG9BJFPOCRBBSPAWZHVMWKFZOZVLNMQFUTITANXU9OOHZKGVETOEQLKGXEPRUWRZRBIUVTBGDQQXCY"

seed = "DSPOAXMVSC99IUIVJXTIBZFATVFKTCLLJYOLAGSMFJGFXAWEB9GNTQWEDVRYHKIOQF9T9IZY9IVPKTSZK"
url = "https://potato.iotasalad.org:14265" #fullnode url
api = Iota(url, seed) #erstelle Iota API
logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)
logger = logging.getLogger(__name__)
api.adapter.set_logger(logger)

proposedTrx = ProposedTransaction(
    address = Address(reciever_address),
    value = 0,
    tag = Tag("BACHELORTEST"),
    message = TryteString.from_string("This is a test transaction")
)

proposedBundle = ProposedBundle([proposedTrx])
preparedBundle = api.prepare_transfer(proposedBundle)
publishedBundle = api.send_transfer(depth = 3, transfers = proposedBundle)
