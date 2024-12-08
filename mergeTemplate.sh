#!/bin/bash

#기본경로
mainPath="./component"
layout="$mainPath/layout"
testPath="$mainPath/test"

#test
test00="$testPath/00-test.tpl"
cat $test00 > ./src/template/menu/test.html
echo "test.html merge completed"

timestamp=`date +%Y%m%d%H%M`
releaseVersion='1.08.3509'
sed 's/#PREVENT_CASHING/version='$timestamp'/gi' ./component/index_origin.html > index.html
sed -i 's/#RELEASE_VERSION/ _'$releaseVersion'/gi' index.html