import sys

def modify_products():
    filepath = '/Users/emrekocak/.gemini/antigravity/scratch/stickiverse/js/products.js'
    with open(filepath, 'r') as f:
        content = f.read()

    eckig_base = "baseLink: 'https://www.onlineprinters.de/p/eckige-aufkleber-im-freiformat?depvar_index_setparent=%3cP7AFFXX%3e%3cP7AFFXX.AK3.1X10%3e&depvar_qty=10&depvar_index_set_1=%3cZ7AFFA3S%3e%3cZ7AFFA3SX99%3e&depvar_index_set_2=%3cZXXXX93N%3e%3cZXXXX93NN90%3e&depvar_index_set_3=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_4=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e',\n    opCode: 'P7AFFXX',"

    # Square (Quadratische Sticker)
    target_quadrat = """    prices: {
      '3x3':   { 50: 8.90,  100: 13.90, 250: 22.90, 500: 36.90, 1000: 59.90 },
      '5x5':   { 50: 11.90, 100: 17.90, 250: 30.90, 500: 52.90, 1000: 89.90 },
      '7x7':   { 50: 14.90, 100: 22.90, 250: 40.90, 500: 68.90, 1000: 114.90 },
      '10x10': { 50: 17.90, 100: 27.90, 250: 49.90, 500: 84.90, 1000: 144.90 },
    },"""
    content = content.replace(target_quadrat, target_quadrat + "\n    " + eckig_base)

    # Rectangle (Rechteckige Sticker)
    target_rechteck = """    prices: {
      '5x3':  { 50: 10.90, 100: 16.90, 250: 28.90, 500: 46.90, 1000: 76.90 },
      '7x4':  { 50: 13.90, 100: 21.90, 250: 37.90, 500: 62.90, 1000: 104.90 },
      '10x5': { 50: 16.90, 100: 26.90, 250: 47.90, 500: 79.90, 1000: 134.90 },
      '15x7': { 50: 21.90, 100: 34.90, 250: 62.90, 500: 104.90, 1000: 174.90 },
    },"""
    content = content.replace(target_rechteck, target_rechteck + "\n    " + eckig_base)

    # Kontur (Freigestanzte Sticker)
    kontur_base = "baseLink: 'https://www.onlineprinters.de/p/aufkleber-mit-konturschnitt?depvar_index_setparent=%3cP9AFFXX%3e%3cP9AFFXX.AK3.1X10%3e&depvar_qty=10&depvar_index_set_1=%3cZ7AFFA3S%3e%3cZ7AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e',\n    opCode: 'P9AFFXX',"
    
    target_freigestanzt = """    prices: {
      '5x5':   { 50: 18.90, 100: 27.90, 250: 49.90, 500: 84.90, 1000: 139.90 },
      '7x7':   { 50: 22.90, 100: 34.90, 250: 62.90, 500: 104.90, 1000: 174.90 },
      '10x10': { 50: 28.90, 100: 44.90, 250: 82.90, 500: 139.90, 1000: 229.90 },
    },"""
    content = content.replace(target_freigestanzt, target_freigestanzt + "\n    " + kontur_base)

    with open(filepath, 'w') as f:
        f.write(content)

modify_products()
