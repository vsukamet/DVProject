import requests
from bs4 import BeautifulSoup
import re

def main():
    URL = 'http://www.mayoclinic.org/diseases-conditions/index?letter=A'
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'html.parser')
    urlsList = []
    baseUrl = 'http://www.mayoclinic.org'
    elements = soup.select("div.holder ol li a")
    for element in elements:
        urlsList.append(baseUrl + element['href'])
        # print(urlsList[-1])
    diseasesList = []
    for url in urlsList:
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        elements = soup.select("div#index ol li a")
        for element in elements:
            spanElement = element.select('span')
            disease = ""
            if (len(spanElement) == 0):
                disease = element.getText()
            else:
                disease = element.getText().replace(spanElement[0].text, '')
            # disease = re.sub( "\(.*\)", "", disease).lower()
            # if disease not in diseasesList:
            #     diseasesList.append(disease)
            diseasesList.append(re.sub( "\(.*\)", "", disease).lower())
    diseasesList = list(set(diseasesList))
    diseasesList.sort()
    diseaseFile = open('../disease.txt', 'w')
    for disease in diseasesList:
        diseaseFile.write(disease.strip() + "\n")
    diseaseFile.close()

if __name__ == '__main__':
    main()

