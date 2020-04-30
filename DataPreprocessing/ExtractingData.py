import json
import pandas as pd

def getAllItems(allAnswers, extractingIds, extractingItems, keyName, presentItem):
    returnExtractItems = {}
    for id  in extractingIds:
        answer = allAnswers[id]
        for item in extractingItems:
            if item != presentItem:
                if item in answer:
                    if item in returnExtractItems:
                        returnExtractItems[item] = returnExtractItems[item] + 1
                    else:
                        returnExtractItems[item] = 1
    returnExtractItems = sorted(returnExtractItems.items(), key = lambda x:(x[1],x[0]), reverse=True)
    returnValues = []
    for (key, value) in returnExtractItems:
        valuePresent = {}
        valuePresent[keyName] = key
        valuePresent['value'] = value
        returnValues.append(valuePresent)
    print(returnValues)
    return returnValues


def extractDates(allDates, extractingIds=None):
    #print(len(allDates))
    if extractingIds is None:
        extractingIds = range(len(allDates))
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    datesFormatted = {}
    for id in extractingIds:
        dateSplitted = allDates[id].split('-')
        try:
            month = months[int(dateSplitted[1])-1]
            if month in datesFormatted:
                datesFormatted[month] = datesFormatted[month] + 1
            else:
                datesFormatted[month] = 1
        except:
            pass
    return datesFormatted




def extractData(presentItem, allAnswers, allDates, diseasesList, drugsList, symptomsList):
    extractingIds = []
    print(presentItem)
    for id in range(len(allAnswers)):
        if presentItem in allAnswers[id]:
            extractingIds.append(id)
    returnValues = {}
    if (len(extractingIds) != 0):
        returnValues['count'] = len(extractingIds)
        returnValues['datesExtracted'] = extractDates(allDates, extractingIds)
        returnValues['diseasesPresent'] = getAllItems(allAnswers, extractingIds, diseasesList, 'disease', presentItem)
        returnValues['symptomsPresent'] = getAllItems(allAnswers, extractingIds, symptomsList, 'symptom', presentItem)
        returnValues['drugsPresent'] = getAllItems(allAnswers, extractingIds, drugsList, 'drug', presentItem)
    # print(diseasesPresent)
    # print(symptomsPresent)
    # print(drugsPresent)
    return returnValues

def extractTopicData(qTopics,allQuestions,allAnswers, allDates,topic,diseasesList, drugsList, symptomsList):
    extractingIds = []
    for i in range(len(allQuestions)):
        if  allQuestions[i] in qTopics and topic in qTopics[allQuestions[i]]:
            extractingIds.append(i)

    returnValues = {}
    if (len(extractingIds) != 0):
        returnValues['count'] = len(extractingIds)
        returnValues['datesExtracted'] = extractDates(allDates, extractingIds)
        returnValues['diseasesPresent'] = getAllItems(allAnswers, extractingIds, diseasesList, 'disease', topic)
        returnValues['symptomsPresent'] = getAllItems(  allAnswers, extractingIds, symptomsList, 'symptom', topic)
        returnValues['drugsPresent'] = getAllItems( allAnswers, extractingIds, drugsList, 'drug', topic)
    return returnValues

def main():
    with open('../WebmdData/webmd-answer.json') as json_file:
        jsonData = json.load(json_file, strict=False, )
        allAnswers = []
        allDates = []
        allQuestions=[]
        for data in jsonData:
            allAnswers.append(data['answerContent'].lower())
            allDates.append(data['answerPostDate'])
            allQuestions.append(data['questionId'])
    extractDates(allDates)
    symptomsList = []
    diseasesList = []
    drugsList = []
    for line in open("../symptom.txt"):
        symptomsList.append(line.rstrip())
    for line in open("../disease.txt", encoding = "ISO-8859-1"):
        diseasesList.append(line.rstrip())
    for line in open("../drug.txt"):
        drugsList.append(line.rstrip())
    writtenDataToFile = []
    # symptomBubbleChart = {}
    totalCountDiameter = 0
    for symptom in symptomsList:
        getResult = extractData(symptom, allAnswers, allDates, diseasesList, drugsList, symptomsList)
        if len(getResult) !=0:
            presentValue = {}
            presentValue['symptom'] = symptom
            presentValue['value'] = getResult
            writtenDataToFile.append(presentValue)
            # symptomBubbleChart[symptom] = getResult['count']
            totalCountDiameter += getResult['count']
    with open('../symptomData.json', 'w') as outfile:
        json.dump(writtenDataToFile, outfile, sort_keys=True)

    writtenDataToFile=[]
    for disease in diseasesList:
        getResult = extractData(disease, allAnswers, allDates, diseasesList, drugsList, symptomsList)
        if len(getResult) !=0:
            presentValue = {}
            presentValue['disease'] = disease
            presentValue['value'] = getResult
            writtenDataToFile.append(presentValue)
            # symptomBubbleChart[symptom] = getResult['count']
            totalCountDiameter += getResult['count']
    with open('../diseaseData.json', 'w') as outfile:
        json.dump(writtenDataToFile, outfile, sort_keys=True)

    data=json.load(open('../WebmdData/webmd-related_topic.json'))
    df= pd.DataFrame.from_dict(data, orient='columns')
    data_topics=json.load(open('../WebmdData/webmd-topics.json'))
    dfTopics= pd.DataFrame.from_dict(data_topics, orient='columns')
    topicList= dfTopics['topicName'].astype(str)
    df= df.merge(dfTopics, how='left', left_on='topicId', right_on='topicId')
    qTopics={}
    for index,row in df.iterrows():
        if (row['questionId'] in qTopics):
            qTopics[row['questionId']].append(row['topicName'])
        else:
            qTopics[row['questionId']] =[row['topicName']]

    print(qTopics["648785"])


    finaldata=[]
    for topic in topicList:
        result= extractTopicData(qTopics, allQuestions,allAnswers,allDates,topic,diseasesList, drugsList, symptomsList)
        print(result)
        if len(result) !=0:
            presentValue = {}
            presentValue['topic'] = topic
            presentValue['value'] = result
            finaldata.append(presentValue)
    with open('../topicData.json', 'w') as outfile:
        json.dump(finaldata, outfile, sort_keys=True)

if __name__ == '__main__':
    main()
