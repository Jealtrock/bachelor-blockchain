# -*- coding: utf-8 -*-
# This is a POC code to generate IOTA transaction and bundle
#
# Note: You will need to implement getTransactionsToApprove

import iota
import pearldiver

SEED = 'GENERATE_YORU_SELF'

tag = iota.Tag('TESTINGPYTHON')
pt = iota.ProposedTransaction(
    address=iota.Address('9TPHVCFLAZTZSDUWFBLCJOZICJKKPVDMAASWJZNFFBKRDDTEOUJHR9JVGTJNI9IYNVISZVXARWJFKUZWC'),
    value=90,
    tag=tag,
    message=iota.TryteString('HELLO')
)

pb = iota.ProposedBundle([pt])

# pb.add_inputs([list])
#  pb._create_input_transaction(addy)

addy = iota.Address('INDTKDAH9GGWDAJDWQLWUKCIHSYNEFQUGVHOYWLZRYPEZIZYQHQJNDLDPCLWMMO9UAEZUWPHMWZRLWGOB')
addy.balance = 100
addy.key_index = 2
addy.security_level = 2
inputs = [
    iota.ProposedTransaction(
        address=addy,
        tag=tag,
        value=-addy.balance
    )
]
for input in inputs:
    pb._transactions.append(input)
    for _ in range(addy.security_level - 1):
        pb._transactions.append(iota.ProposedTransaction(
            address=addy,
            tag=tag,
            value=0
        ))

# send unspent inputs to
unspent = iota.Address('HWFZCLVY9RPTAWC9OIOSHXSWFIYMSYSYBHZER9BYZ9KUPUJTRUOLKSGISILWFCWJO9LNZOLWRCJMVDJGD')
pb.send_unspent_inputs_to(unspent)

# This will get the bundle hash
pb.finalize()

# If the transaction need sign, it will then sign-up the transaction
# to fill up signature fragements
kg = iota.crypto.signing.KeyGenerator(SEED)

# pb.sign_inputs(kg)
i = 0
while i < len(pb):
    txn = pb[i]
    if txn.value < 0:
        if txn.address.key_index is None or txn.address.security_level is None:
            raise ValueError
        # pb.sign_input_at(i, kg.get_key_for(txn.address))
        address_priv_key = kg.get_key_for(txn.address)

        # Fill in signature fragement
        # address_priv_key.sign_input_transactions(pb, i)
        from iota.crypto.signing import SignatureFragmentGenerator
        sfg = SignatureFragmentGenerator(address_priv_key, pb.hash)
        for j in range(address_priv_key.security_level):
            txn = pb[i + j]
            txn.signature_message_fragment = next(sfg)
        i += txn.address.security_level
    else:
        i += 1

# Now each transaction have their signature into bundle
# this is the end of the transaction construction.
# We can now propose the transaction to tangle
# At this moment, tips still not inside each transaction,
# and each transaction hash is not yet generated
trytes = pb.as_tryte_strings()

# Get tips by getTransactionsToApprove
# tips = getTransactionsToApprove()
trunk_hash = iota.Hash('')
branch_hash = iota.Hash('')

# Do PoW (attach to tangle)
prev_tx = None

for tx_tryte in trytes:
    txn = iota.Transaction.from_tryte_string(tx_tryte)
    txn.trunk_transaction_hash = trunk_hash if prev_tx is None else prev_tx.hash
    txn.branch_transaction_hash = branch_hash if prev_tx is None else trunk_hash

    # Copy obsolete tag if tag field is empty
    if not txn.tag:
        txn.tag = txn.obsolete_tag

    # Copy timestamp
    txn.timestamp = None
    txn.timestamp_lower_bound = None
    txn.timestamp_upper_bound = None

    # Do the PoW for this transaction
    diver = pearldiver.PearlDiver()
    trits = txn.trits()
    diver.search(trits, min_weight_magniude, -1)

    # Validate PoW
    # transactionValidator.validate(txn.as_trits())
