#!/usr/bin/python2

import sys
import libxml2
from urllib import urlopen,splittag,basejoin
import json
from collections import OrderedDict

ENCODING="UTF-8"
URL=""


HRESOURCE_VERSION = "1.0"
XPATH_HROOT = "//div[contains(@class,'hresource')]"
XPATH_HNAME = "descendant::*[contains(@class,'name')]"
XPATH_HURI = "descendant::*[contains(@class,'uri')]|descendant::*[contains(@class,'url')]"
XPATH_HCOMMENT = "./*[contains(@class,'comment')]"
XPATH_H_ISA = "descendant::*[@rel='hresource-is-a']"

XPATH_HATTRIBUTE = "descendant::*[contains(@class,'attribute')]"

XPATH_H_ATTRIBUTE_COMMENT = "../*[contains(@class,'comment')]"
XPATH_H_ATTRIBUTE_CONSUMER = "../descendant::*[@rel='hresource-consumed-by']"
XPATH_H_ATTRIBUTE_PRODUCER = "../descendant::*[@rel='hresource-produced-by']"
#attrribute prperties:
XPATH_H_ATTRIBUTE_IS_READONLY = "contains(@class,'read-only')"
XPATH_H_ATTRIBUTE_IS_REQUIRED = "contains(@class,'required')"
XPATH_H_ATTRIBUTE_IS_WRITEONCE = "contains(@class,'write-once')"
XPATH_H_ATTRIBUTE_IS_QUERYABLE = "contains(@class,'queryable')"
XPATH_H_ATTRIBUTE_IS_GUID = "contains(@class,'guid')"

#extra
#new
XPATH_H_ATTRIBUTE_TYPE = "../descendant::*[contains(@class,'hresource-datatype')]"

XPATH_HOUTPUT_FORMAT = "./descendant::*[contains(@class,'hresource-opformat')]"

XPATH_H_ERROR_ROOT = "descendant::*[contains(@class,'hresource-error')]"
XPATH_H_ERROR_CODE = "descendant::*[contains(@class,'error-code')]"
XPATH_H_ERROR_COMMENT = "descendant::*[contains(@class,'comment')]"

XPATH_GENERATED = "//link[@rel='hresource-documentation']"

def openHTML(url):
	usock = urlopen(url)
	data = usock.read()
	usock.close()
	doc = libxml2.htmlParseDoc(data,ENCODING)
	return doc


def common_prefix(strings):
    """ Find the longest string that is a prefix of all the strings.
    """
    if not strings:
        return ''
    prefix = strings[0]
    for s in strings:
        if len(s) < len(prefix):
            prefix = prefix[:len(s)]
        if not prefix:
            return ''
        for i in range(len(prefix)):
            if prefix[i] != s[i]:
                prefix = prefix[:i]
                break
    return prefix



def attributeProp(attributeNode):
    result = OrderedDict()

    result["name"] = attributeNode.content.strip()
    result["read-only"] = (attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_IS_READONLY)!=0);
    result["write-once"] = (attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_IS_WRITEONCE)!=0);
    result["required"] = (attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_IS_REQUIRED)!=0);
    result["queryable"] = (attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_IS_QUERYABLE)!=0);
    result["guid"] = (attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_IS_GUID)!=0);
    
    commentNodes = attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_COMMENT)
    if len(commentNodes)!=0:
        comment = commentNodes[0].content.strip()
    else:
        comment = ""

    # consumers
    # link must be in format {uri}\#{attribute}
    #
    consumers = []
    for consumerNode in attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_CONSUMER):
        hreflink=consumerNode.prop('href')
        (url,attribute) = splittag(hreflink)
        if attribute == None:
            attribute =result["name"]
        api = consumerNode.content.strip()
        consumers.append({"attribute":attribute,"doc-url":url,"api":api})


    # producers
    # link must be in format {uri}\#{attribute}
    #
    producers = []
    for producerNode in attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_PRODUCER):
        hreflink=producerNode.prop('href')
        (url,attribute) = splittag(hreflink)
        if attribute == None:
            attribute =result["name"]
        api = producerNode.content.strip()
        producers.append({"attribute":attribute,"doc-url":url,"api":api})

    #type----
    typeNodes= attributeNode.xpathEval2(XPATH_H_ATTRIBUTE_TYPE)
    if len(typeNodes) == 0:
        datatype = None
    else :
        datatype = typeNodes[0].content.strip()

    result["type"] = datatype
    result["description"] = comment
    result["consumed-by"] = consumers
    result["producered-by"] = producers
    return result
def listErrors(root):
    errors = []
    for errorNode in root.xpathEval2(XPATH_H_ERROR_ROOT):
        code = errorNode.xpathEval2(XPATH_H_ERROR_CODE)[0].content.strip()
        comment = errorNode.xpathEval2(XPATH_H_ERROR_COMMENT)[0].content.strip()
        errors.append({"code":code,"comment":comment})

    if len(errors) == 0:
        return None
    else :
        return errors

def isGenerated(doc):
    links = doc.xpathEval2(XPATH_GENERATED)
    if len(links) ==0:
        return False
    elif(links[0].prop("type") == 'application/json'):
        return True
    else:
        return False

def getGeneratedJson(url,doc):
    link = doc.xpathEval2(XPATH_GENERATED)[0]
    jsonurl = link.prop("src")
    jsonurl = basejoin(url,jsonurl)
    usock = urlopen(jsonurl)
    data = usock.read()
    usock.close()
    return data


def applyHrestParser(doc):
    result = []
    for div in doc.xpathEval2(XPATH_HROOT):
        name = div.xpathEval(XPATH_HNAME)[0].content.strip()
        uri = div.xpathEval2(XPATH_HURI)[0].content.strip()
        
        #superclass
        superclassNodes = div.xpathEval2(XPATH_H_ISA)
        if len(superclassNodes)!=0:
            superurl = superclassNodes[0].prop('href')
            supername = superclassNodes[0].content.strip()
            superclass ={"name":supername,"doc-url":superurl}
        else:
            superclass = None

        #comment
        commentNodes = div.xpathEval2(XPATH_HCOMMENT)
        if len(commentNodes)!=0:
            comment = commentNodes[0].content.strip()
        else:
            comment = ""

        opformatNode = div.xpathEval2(XPATH_HOUTPUT_FORMAT)
        if len(opformatNode)!=0:
            opformat = opformatNode[0].content.strip()
        else :
            opformat = "json"

        attributes =[]
        for attributeNode in div.xpathEval2(XPATH_HATTRIBUTE):
            attributes.append(attributeProp(attributeNode))

        errors = listErrors(div)
        app = OrderedDict()
        app["name"] = name
        app["uri"] = uri
        app["is-a"] = superclass
        app["description"] = comment
        app["output-format"] = opformat
        app["attributes"] = attributes
        app["errors"] = errors
        result.append(app)
    return result



def parse(url):
    doc = openHTML(url)
    
    if isGenerated(doc):
        return getGeneratedJson(url,doc)

    restapis = applyHrestParser(doc)
    
    candiateBaseurls = [ api["uri"] for api in restapis ]
    baseurl = common_prefix(candiateBaseurls)
    
    result=OrderedDict()
    result["hresource"] = HRESOURCE_VERSION
    result["baseurl"] = baseurl
    result["doc-url"] = url
    result["apis"] = restapis
    jsonop =json.JSONEncoder(indent=4).encode(result)
    return jsonop

if __name__ == '__main__':
    print parse(URL)
