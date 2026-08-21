import os
import glob
import re

html_files = glob.glob('*.html')

new_nav_links = '''        <div class="nav__links" id="navLinks">
          <a href="index.html" class="nav__link" data-nav="index">Start</a>
          <div class="nav__item--has-dropdown">
            <a href="products.html" class="nav__link" data-nav="products">Produkte</a>
            <div class="nav__dropdown">
              <a href="aufkleber.html" class="nav__dropdown-card" data-dropdown-nav="aufkleber">
                <img src="assets/aufkleber/rund.jpg" alt="Aufkleber" class="nav__dropdown-img">
                <div class="nav__dropdown-title">Aufkleber <span>→</span></div>
                <div class="nav__dropdown-desc">Individuelle Aufkleber in verschiedenen Formen und Materialien.</div>
              </a>
              <a href="etiketten.html" class="nav__dropdown-card" data-dropdown-nav="etiketten">
                <img src="assets/etiketten/flasche.jpg" alt="Etiketten" class="nav__dropdown-img">
                <div class="nav__dropdown-title">Etiketten <span>→</span></div>
                <div class="nav__dropdown-desc">Professionelle Etiketten für Produkte, Flaschen und Verpackungen.</div>
              </a>
            </div>
          </div>
          <a href="editor.html" class="nav__link" data-nav="editor">Editor</a>
        </div>'''

# Wir suchen per Regex den gesamten Block <div class="nav__links" id="navLinks">...</div>
# und ersetzen ihn durch new_nav_links

pattern = re.compile(r'<div class="nav__links" id="navLinks">.*?</div>\s*<div class="nav__actions">', re.DOTALL)

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Zuerst schauen ob wir die alte Version mit class="nav__links" (ohne ID) haben
    if '<div class="nav__links">' in content and 'id="navLinks"' not in content:
        content = content.replace('<div class="nav__links">', '<div class="nav__links" id="navLinks">')

    # Jetzt regex replacement
    new_content = pattern.sub(new_nav_links + '\n        <div class="nav__actions">', content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')
