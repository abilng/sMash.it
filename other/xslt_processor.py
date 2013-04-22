#!/usr/bin/python2

import sys
import libxml2
import libxslt
import urllib2

XSLT = "xslt"
ENCODING="UTF-8"
URL=""

def getXSLT(xsl_filename):
    # parse the stylesheet xml file into doc object
    styledoc = libxml2.parseFile(xsl_filename)
    # process the doc object as xslt
    style = libxslt.parseStylesheetDoc(styledoc)
    return style

def openHTML(url):
	usock = urllib2.urlopen(url)
	data = usock.read()
	usock.close()
	doc = libxml2.htmlParseDoc(data,ENCODING)
	return doc

if __name__ == '__main__':
    style = getXSLT(XSLT)
    doc = openHTML(URL)
    param = { "docurl": "'"+ URL +"'" }
    result = style.applyStylesheet(doc, param)
    print result
