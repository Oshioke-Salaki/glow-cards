import sys
for file in ['dapp/app/page.tsx', 'dapp/app/claim/[id]/page.tsx']:
    c = open(file).read()
    c = c.replace('import GlowCards from 0x2515004a5408a7f0', 'import GlowCardsV2 from 0x2515004a5408a7f0')
    c = c.replace('<&GlowCards.EscrowManager>(/public/GlowCardsEscrowManager)', '<&GlowCardsV2.EscrowManager>(/public/GlowCardsV2EscrowManager)')
    c = c.replace('e.type.includes("GlowCards.GiftCreated")', 'e.type.includes("GlowCardsV2.GiftCreated")')
    open(file, 'w').write(c)
