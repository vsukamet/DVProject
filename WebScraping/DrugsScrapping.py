import requests
from bs4 import BeautifulSoup
import re

def main():
    baseUrl = 'https://www.drugs.com/alpha/'
    urlsList = []
    character  = 'a'
    for i in range(26):
        urlsList.append(baseUrl + chr(ord(character) + i) + '.html')
    drugsList = []
    for url in urlsList:
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        elements = soup.select(".ddc-list-column-2 li")
        for element in elements:
            spanElement = element.select('span')
            drug = ""
            if (len(spanElement) == 0):
                drug = element.getText()
            else:
                drug = element.getText().replace(spanElement[0].text, '')
            drugsList.append(re.sub( "\(.*\)", "", drug).lower())
                # diseasesList.append(disease)
    drugsList = list(set(drugsList))
    drugsList.sort()
    drugFile = open('../drug.txt', 'w')
    for drug in drugsList:
        drugFile.write(drug.strip() + "\n")
    drugFile.close()

if __name__ == '__main__':
    main()
