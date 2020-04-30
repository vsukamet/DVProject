import requests
from bs4 import BeautifulSoup
import re

def main():
    URL = 'https://symptomchecker.webmd.com/symptoms-a-z'
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'html.parser')
    symptomsList = []
    soup = BeautifulSoup(page.content, 'html.parser')
    elements = soup.select("#list_az .list ol li a")
    for element in elements:
        spanElement = element.select('span')
        symptom = ""
        if (len(spanElement) == 0):
            symptom = element.getText()
        else:
            symptom = element.getText().replace(spanElement[0].text, '')
        symptomsList.append(re.sub( "\(.*\)", "", symptom).lower())
            # diseasesList.append(disease)
    symptomsList = list(set(symptomsList))
    symptomsList.sort()
    symptomFile = open('../symptom.txt', 'w')
    for symptom in symptomsList:
        symptomFile.write(symptom.strip() + "\n")
    symptomFile.close()

if __name__ == '__main__':
    main()
